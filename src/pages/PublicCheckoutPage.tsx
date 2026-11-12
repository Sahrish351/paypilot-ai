import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Lock,
  ExternalLink,
  Calendar,
  ArrowLeft,
  Receipt,
  XCircle,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';

declare global {
  interface Window {
    paypal?: any;
  }
}

type CheckoutResultState = 'checkout' | 'processing' | 'success' | 'cancelled' | 'failed';

export const PublicCheckoutPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<any>(null);
  const [paypalConfig, setPaypalConfig] = useState<{
    configured: boolean;
    clientId: string | null;
  }>({ configured: false, clientId: null });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutResultState>('checkout');
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [sdkLoadWarning, setSdkLoadWarning] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [transactionRecord, setTransactionRecord] = useState<any>(null);
  const [copiedCapture, setCopiedCapture] = useState(false);

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const selectedFundingRef = useRef<string>('paypal');
  const captureAttemptedRef = useRef<string | null>(null);

  const loadCheckoutData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
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
        if (reqJson.transaction) {
          setTransactionRecord(reqJson.transaction);
        }
        setCheckoutState('success');
      }
    } catch (err: any) {
      setLoadError(err.message || 'Could not load payment request.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  const captureApprovedOrder = useCallback(
    async (orderId: string, paymentMethodHint?: string) => {
      setCheckoutState('processing');
      setFailureMessage(null);
      try {
        const res = await fetch('/api/payments/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicToken: token,
            paymentRequestId: requestData?.id,
            orderId,
            paymentMethod: paymentMethodHint || selectedFundingRef.current,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'PayPal capture verification failed. No payment was recorded.');
        }

        setTransactionRecord(data.transaction);
        if (data.paymentRequest) {
          setRequestData((prev: any) => ({ ...prev, ...data.paymentRequest, status: 'COMPLETED' }));
        } else {
          setRequestData((prev: any) => (prev ? { ...prev, status: 'COMPLETED' } : prev));
        }
        setCheckoutState('success');

        try {
          const fire = typeof confetti === 'function' ? confetti : (confetti as any)?.default;
          if (typeof fire === 'function') {
            fire({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
          }
        } catch {
          // ignore confetti failure
        }
      } catch (err: any) {
        setFailureMessage(
          err.message || 'We could not verify your PayPal payment. Your request remains open for retry.'
        );
        setCheckoutState('failed');
      }
    },
    [token, requestData?.id]
  );

  // Handle PayPal approval/cancel redirect return
  useEffect(() => {
    const status = searchParams.get('paypalStatus');
    const orderToken = searchParams.get('token');

    if (status === 'cancelled') {
      setCheckoutState('cancelled');
      return;
    }

    if (
      status === 'success' &&
      orderToken &&
      requestData &&
      requestData.status !== 'COMPLETED' &&
      captureAttemptedRef.current !== orderToken
    ) {
      captureAttemptedRef.current = orderToken;
      captureApprovedOrder(orderToken);
    }
  }, [searchParams, requestData, captureApprovedOrder]);

  // Load official PayPal JS SDK when configured and in checkout state
  useEffect(() => {
    if (
      !paypalConfig.configured ||
      !paypalConfig.clientId ||
      !requestData ||
      checkoutState !== 'checkout' ||
      requestData.status === 'COMPLETED' ||
      requestData.status === 'CANCELLED'
    ) {
      return;
    }

    setSdkLoadWarning(null);
    const scriptId = 'paypal-sandbox-js-sdk';

    const renderButtons = () => {
      if (!window.paypal || !paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = '';
      try {
        window.paypal
          .Buttons({
            style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
            onClick: (data: { fundingSource?: string }) => {
              if (data?.fundingSource) {
                selectedFundingRef.current = data.fundingSource;
              }
            },
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
              await captureApprovedOrder(data.orderID, selectedFundingRef.current);
            },
            onCancel: () => {
              setCheckoutState('cancelled');
            },
            onError: (err: any) => {
              setFailureMessage(
                err?.message ||
                  'PayPal checkout encountered an error before completion. Please try again or use the Sandbox Redirect option.'
              );
              setCheckoutState('failed');
            },
          })
          .render(paypalContainerRef.current)
          .catch(() => {
            setSdkLoadWarning(
              'Some PayPal inline payment buttons are unavailable for this browser or Sandbox currency. Use Approve via PayPal Sandbox Redirect below.'
            );
          });
      } catch {
        setSdkLoadWarning(
          'PayPal inline buttons could not be initialized. Use Approve via PayPal Sandbox Redirect below.'
        );
      }
    };

    if (window.paypal) {
      renderButtons();
      return;
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', renderButtons);
      return () => existing.removeEventListener('load', renderButtons);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      paypalConfig.clientId
    )}&currency=${encodeURIComponent(
      requestData.currency || 'USD'
    )}&intent=capture&enable-funding=paylater,card`;
    script.async = true;
    script.onload = renderButtons;
    script.onerror = () => {
      setSdkLoadWarning(
        'Could not load PayPal inline buttons (blocked or offline). You can still complete payment via Approve via PayPal Sandbox Redirect below.'
      );
    };
    document.body.appendChild(script);
  }, [paypalConfig, requestData, checkoutState, token, captureApprovedOrder]);

  const handleServerOrderRedirect = async () => {
    setRedirecting(true);
    setFailureMessage(null);
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
      } else {
        throw new Error('PayPal did not return an approval URL for this order.');
      }
    } catch (err: any) {
      setFailureMessage(err.message || 'Unable to start PayPal Sandbox redirect.');
      setCheckoutState('failed');
    } finally {
      setRedirecting(false);
    }
  };

  const handleRetryPayment = () => {
    captureAttemptedRef.current = null;
    setFailureMessage(null);
    setCheckoutState('checkout');
    if (searchParams.has('paypalStatus') || searchParams.has('token') || searchParams.has('PayerID')) {
      setSearchParams({});
    }
  };

  const handleCopyCaptureId = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedCapture(true);
    setTimeout(() => setCopiedCapture(false), 2000);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return new Date().toLocaleString();
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF1FF]/70 via-[#FAFBFF] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-8 max-w-sm w-full text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#315CFF] mx-auto" />
          <div className="text-sm font-bold text-[#101C3A]">Loading payment request...</div>
          <p className="text-xs text-[#68758C]">Fetching verified invoice details from PayPilot AI.</p>
        </div>
      </div>
    );
  }

  if (loadError || !requestData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF1FF]/70 via-[#FAFBFF] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D94C57]/10 text-[#D94C57] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[#101C3A]">Payment Request Not Found</h1>
          <p className="text-xs text-[#68758C] leading-relaxed">{loadError}</p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <button
              type="button"
              onClick={loadCheckoutData}
              className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#E7EAF1] hover:bg-[#EAF1FF] text-[#101C3A] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
            >
              Go to PayPilot AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Payment Processing State
  if (checkoutState === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF1FF]/80 via-[#FAFBFF] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-8 sm:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center mx-auto">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-[#101C3A]">Processing Your Payment</h1>
            <p className="text-xs sm:text-sm text-[#68758C] leading-relaxed">
              We are verifying and capturing your PayPal Sandbox order on our server. Please do not close this window.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1] text-xs text-[#68758C] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#315CFF]" />
            <span>Verifying amount, currency, and capture status...</span>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Payment Success Page
  if (checkoutState === 'success') {
    const paidAmount = Number(transactionRecord?.amount ?? requestData.totalAmount ?? 0).toFixed(2);
    const paidCurrency = transactionRecord?.currency || requestData.currency || 'USD';
    const captureId = transactionRecord?.paypalCaptureId || 'Verified';
    const orderId = transactionRecord?.paypalOrderId || requestData.paypalOrderId || '—';
    const paymentMethod = transactionRecord?.paymentMethod || 'PayPal';
    const paidAt = formatDateTime(transactionRecord?.capturedAt || requestData.updatedAt);

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF1FF] via-[#FAFBFF] to-white py-8 sm:py-12 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/">
              <BrandLogo size="md" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#16845B]/10 text-[#16845B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Capture</span>
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#EAF1FF] via-white to-[#EAF1FF]/40 px-6 sm:px-8 pt-8 pb-6 text-center border-b border-[#E7EAF1]">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-[#16845B]/15 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-[#16845B] text-white flex items-center justify-center shadow-lg shadow-[#16845B]/25">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-xs sm:text-sm text-[#68758C] mt-1.5">
                Your payment has been completed successfully.
              </p>

              <div className="mt-5 inline-flex flex-col items-center px-6 py-3.5 rounded-2xl bg-white border border-[#315CFF]/15 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68758C]">
                  Amount Paid
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#101C3A] tabular-nums mt-0.5">
                  ${paidAmount}{' '}
                  <span className="text-base font-bold text-[#315CFF]">{paidCurrency}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1]">
                  <div className="text-[#68758C] text-[11px]">Service Name</div>
                  <div className="font-bold text-[#101C3A] mt-0.5">{requestData.title}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1]">
                  <div className="text-[#68758C] text-[11px]">Client Name</div>
                  <div className="font-bold text-[#101C3A] mt-0.5">{requestData.clientName}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1]">
                  <div className="text-[#68758C] text-[11px]">Payment Request ID</div>
                  <div className="font-bold text-[#101C3A] mt-0.5 font-mono">
                    {requestData.requestNumber}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1]">
                  <div className="text-[#68758C] text-[11px]">Payment Status</div>
                  <div className="mt-1">
                    <StatusBadge status="COMPLETED" />
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1]">
                  <div className="text-[#68758C] text-[11px]">Payment Date & Time</div>
                  <div className="font-semibold text-[#101C3A] mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#315CFF]" />
                    <span>{paidAt}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1]">
                  <div className="text-[#68758C] text-[11px]">Payment Method</div>
                  <div className="font-semibold text-[#101C3A] mt-0.5">{paymentMethod} (Sandbox)</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF1FF]/60 border border-[#315CFF]/15 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#68758C]">PayPal Capture ID</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono font-bold text-[#101C3A]">{captureId}</code>
                    {transactionRecord?.paypalCaptureId && (
                      <button
                        type="button"
                        onClick={() => handleCopyCaptureId(transactionRecord.paypalCaptureId)}
                        className="p-1 rounded-lg hover:bg-white text-[#315CFF] cursor-pointer"
                        title="Copy Capture ID"
                      >
                        {copiedCapture ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#68758C]">PayPal Order ID</span>
                  <code className="font-mono text-[#18243A]">{orderId}</code>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/transactions')}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF1FF] text-[#101C3A] border border-[#E7EAF1] text-xs sm:text-sm font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  <Receipt className="w-4 h-4 text-[#315CFF]" />
                  <span>View Transaction</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#68758C]">
            Independent hackathon project • PayPal Sandbox test environment only • Not affiliated with PayPal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF1FF]/60 via-[#FAFBFF] to-white py-8 sm:py-10 px-4">
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

        {/* Payment Cancelled Result Card */}
        {checkoutState === 'cancelled' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-lg p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#101C3A]">Payment Cancelled</h2>
              <p className="text-xs sm:text-sm text-[#68758C] max-w-md mx-auto leading-relaxed">
                You cancelled the PayPal checkout before approving the payment. No funds were captured and this payment request remains open.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
              <button
                type="button"
                onClick={handleRetryPayment}
                className="inline-flex items-center justify-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF1FF] text-[#101C3A] border border-[#E7EAF1] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* Payment Failed Result Card */}
        {checkoutState === 'failed' && (
          <div className="bg-white rounded-3xl border border-[#D94C57]/30 shadow-lg p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D94C57]/10 text-[#D94C57] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#101C3A]">Payment Could Not Be Completed</h2>
              <p className="text-xs sm:text-sm text-[#68758C] max-w-md mx-auto leading-relaxed">
                {failureMessage ||
                  'Your payment was not captured and this request has not been marked as completed.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
              <button
                type="button"
                onClick={handleRetryPayment}
                className="inline-flex items-center justify-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF1FF] text-[#101C3A] border border-[#E7EAF1] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* Main Checkout Invoice Card */}
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
              <StatusBadge status={requestData.status} />
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

            {requestData.status === 'CANCELLED' ? (
              <div className="p-5 rounded-2xl bg-slate-100 text-center text-xs text-[#68758C]">
                This payment request was cancelled by the merchant and can no longer be paid.
              </div>
            ) : requestData.status === 'DRAFT' ? (
              <div className="p-5 rounded-2xl bg-slate-100 text-center text-xs text-[#68758C]">
                This payment request is still a draft. The merchant must publish it before payment can be made.
              </div>
            ) : checkoutState === 'checkout' && paypalConfig.configured ? (
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#101C3A]">Choose Payment Method</div>

                {sdkLoadWarning && (
                  <div className="p-3.5 rounded-2xl bg-[#EAF1FF] border border-[#315CFF]/20 text-xs text-[#18243A]">
                    {sdkLoadWarning}
                  </div>
                )}

                <div ref={paypalContainerRef} />

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-[#E7EAF1]" />
                  <span className="px-3 text-[11px] font-medium text-[#68758C]">
                    Or approve via hosted PayPal Sandbox page
                  </span>
                  <div className="flex-grow border-t border-[#E7EAF1]" />
                </div>

                <button
                  type="button"
                  onClick={handleServerOrderRedirect}
                  disabled={redirecting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-bold py-3 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {redirecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Approve via PayPal Sandbox Redirect</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : checkoutState === 'checkout' ? (
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
            ) : null}
          </div>
        </div>

        <p className="text-center text-[11px] text-[#68758C]">
          Independent hackathon project • PayPal Sandbox test environment only • Not affiliated with PayPal.
        </p>
      </div>
    </div>
  );
};
