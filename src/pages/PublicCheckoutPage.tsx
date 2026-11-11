import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Lock,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PublicCheckoutPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<any>(null);
  const [paypalConfig, setPaypalConfig] = useState<{
    configured: boolean;
    clientId: string | null;
  }>({ configured: false, clientId: null });
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionRecord, setTransactionRecord] = useState<any>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reqRes, cfgRes] = await Promise.all([
          fetch(`/api/payment-requests/public/${encodeURIComponent(token)}`),
          fetch('/api/payments/config'),
        ]);
        if (!reqRes.ok) {
          throw new Error('Payment request not found or link has expired.');
        }
        const reqJson = await reqRes.json();
        const cfgJson = await cfgRes.json();
        setRequestData(reqJson);
        setPaypalConfig(cfgJson.paypal || { configured: false, clientId: null });
        if (reqJson.status === 'COMPLETED') {
          setPaymentSuccess(true);
        }
      } catch (err: any) {
        setError(err.message || 'Could not load payment request.');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  // Handle PayPal approval/cancel redirect return
  useEffect(() => {
    const status = searchParams.get('paypalStatus');
    const orderToken = searchParams.get('token');
    if (status === 'cancelled') {
      setCheckoutError('PayPal checkout was cancelled. You can review the details and try again below.');
      return;
    }
    if (status === 'success' && orderToken && requestData && requestData.status !== 'COMPLETED') {
      captureApprovedOrder(orderToken);
    }
  }, [searchParams, requestData?.id]);

  const captureApprovedOrder = async (orderId: string) => {
    setProcessing(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/payments/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicToken: token,
          paymentRequestId: requestData?.id,
          orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'PayPal capture verification failed.');
      }
      setTransactionRecord(data.transaction);
      setPaymentSuccess(true);
      try {
        const fire = typeof confetti === 'function' ? confetti : (confetti as any)?.default;
        if (typeof fire === 'function') {
          fire({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Load official PayPal JS SDK when configured
  useEffect(() => {
    if (
      !paypalConfig.configured ||
      !paypalConfig.clientId ||
      !requestData ||
      paymentSuccess ||
      requestData.status === 'CANCELLED'
    ) {
      return;
    }

    const scriptId = 'paypal-sandbox-js-sdk';
    const renderButtons = () => {
      if (!window.paypal || !paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = '';
      window.paypal
        .Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
          createOrder: async () => {
            const res = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicToken: token }),
            });
            const data = await res.json();
            if (!res.ok || !data.orderId) {
              throw new Error(data.error || 'Failed to create PayPal order.');
            }
            return data.orderId;
          },
          onApprove: async (data: { orderID: string }) => {
            await captureApprovedOrder(data.orderID);
          },
          onError: (err: any) => {
            setCheckoutError(err?.message || 'PayPal checkout encountered an error.');
          },
        })
        .render(paypalContainerRef.current);
    };

    if (window.paypal) {
      renderButtons();
      return;
    }

    const existing = document.getElementById(scriptId);
    if (existing) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      paypalConfig.clientId
    )}&currency=${encodeURIComponent(requestData.currency || 'USD')}&intent=capture`;
    script.async = true;
    script.onload = renderButtons;
    document.body.appendChild(script);
  }, [paypalConfig, requestData, paymentSuccess, token]);

  const handleServerOrderRedirect = async () => {
    setProcessing(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not initiate PayPal Sandbox order.');
      }
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#315CFF] mx-auto" />
          <div className="text-sm font-semibold text-[#18243A]">Loading payment request...</div>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D94C57] mx-auto" />
          <h1 className="text-xl font-extrabold text-[#101C3A]">Payment Request Not Found</h1>
          <p className="text-xs text-[#68758C]">{error}</p>
          <Link
            to="/"
            className="inline-block bg-[#315CFF] text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
          >
            Go to PayPilot AI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF]">
            <Lock className="w-3.5 h-3.5" />
            <span>PayPal Sandbox Checkout</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl overflow-hidden">
          <div className="bg-[#101C3A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#7ADCF0] font-bold">
                Payment Request from {requestData.business?.name}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{requestData.title}</h1>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                <span>{requestData.requestNumber}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due {requestData.dueDate}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[11px] text-slate-300">Amount Due</div>
              <div className="text-3xl font-extrabold tabular-nums">
                ${Number(requestData.totalAmount).toFixed(2)}{' '}
                <span className="text-sm font-bold text-[#7ADCF0]">{requestData.currency}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[#68758C]">Billed To:</span>{' '}
                <strong className="text-[#101C3A]">{requestData.clientName}</strong>
                {requestData.clientEmail ? ` (${requestData.clientEmail})` : ''}
              </div>
              <StatusBadge status={paymentSuccess ? 'COMPLETED' : requestData.status} />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#101C3A]">Itemized Breakdown</div>
              {(requestData.lineItems || []).map((li: any) => (
                <div
                  key={li.id}
                  className="p-3.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF1] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#18243A]">{li.name}</div>
                    <div className="text-[11px] text-[#68758C]">{li.description}</div>
                  </div>
                  <div className="font-bold text-[#101C3A] tabular-nums">
                    ${Number(li.lineTotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {checkoutError && (
              <div className="p-4 rounded-2xl bg-[#D94C57]/10 border border-[#D94C57]/25 text-xs text-[#D94C57] font-medium">
                {checkoutError}
              </div>
            )}

            {paymentSuccess ? (
              <div className="p-6 rounded-2xl bg-[#16845B]/10 border border-[#16845B]/25 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#16845B] mx-auto" />
                <h2 className="text-lg font-extrabold text-[#101C3A]">
                  Payment Verified & Completed
                </h2>
                <p className="text-xs text-[#68758C]">
                  This payment request has been verified by the backend via PayPal Sandbox Orders API v2.
                </p>
                {transactionRecord && (
                  <div className="text-[11px] font-mono text-[#16845B] pt-1">
                    Capture ID: {transactionRecord.paypalCaptureId}
                  </div>
                )}
              </div>
            ) : requestData.status === 'CANCELLED' ? (
              <div className="p-5 rounded-2xl bg-slate-100 text-center text-xs text-[#68758C]">
                This payment request was cancelled by the merchant and can no longer be paid.
              </div>
            ) : paypalConfig.configured ? (
              <div className="space-y-4">
                <div ref={paypalContainerRef} />
                <button
                  type="button"
                  onClick={handleServerOrderRedirect}
                  disabled={processing}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-bold py-3 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  <span>Approve via PayPal Sandbox Redirect</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#EAF1FF] border border-[#315CFF]/20 space-y-2 text-xs">
                <div className="font-bold text-[#101C3A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#315CFF]" />
                  <span>PayPal Sandbox Credentials Required for Live Capture</span>
                </div>
                <p className="text-[#68758C] leading-relaxed">
                  To process a real PayPal Sandbox approval and server-side capture here, configure{' '}
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded">PAYPAL_CLIENT_ID</code> and{' '}
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded">PAYPAL_CLIENT_SECRET</code> in your backend{' '}
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded">.env</code> file. PayPilot AI never fabricates fake payment completions.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-[#68758C]">
          Independent hackathon project • PayPal Sandbox test environment only • Not affiliated with PayPal.
        </p>
      </div>
    </div>
  );
};
