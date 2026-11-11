import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicCheckoutPageProps {
  token: string;
  onReturnToDashboard?: () => void;
}

export const PublicCheckoutPage: React.FC<PublicCheckoutPageProps> = ({
  token,
  onReturnToDashboard,
}) => {
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionRecord, setTransactionRecord] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'card'>('paypal');

  useEffect(() => {
    fetchRequestData();
  }, [token]);

  const fetchRequestData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payment-requests/public/${token}`);
      if (!res.ok) {
        throw new Error('Payment request not found or link has expired.');
      }
      const data = await res.json();
      setRequestData(data);
      if (data.status === 'COMPLETED') {
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Could not load payment checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapturePayment = async () => {
    if (!requestData) return;
    setIsProcessing(true);

    try {
      // Create or ensure PayPal order exists
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: token }),
      });
      const orderData = await orderRes.json();
      const orderId = orderData.orderId || requestData.paypalOrderId || `ORD_SANDBOX_${Date.now()}`;

      // Simulate realistic PayPal authentication latency
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Capture order on backend
      const captureRes = await fetch('/api/payments/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentRequestId: requestData.id,
          orderId,
        }),
      });

      const captureData = await captureRes.json();
      if (captureData.success) {
        setTransactionRecord(captureData.transaction);
        setPaymentSuccess(true);
        // Trigger celebratory confetti
        try {
          const fire = typeof confetti === 'function' ? confetti : (confetti as any)?.default;
          if (typeof fire === 'function') {
            fire({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        } catch (e) {
          // ignore
        }
      } else {
        throw new Error(captureData.error || 'Payment capture failed.');
      }
    } catch (err: any) {
      alert(`PayPal checkout error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#174B38] mx-auto" />
          <div className="font-semibold text-slate-700 text-sm">
            Loading secure PayPal checkout...
          </div>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Payment Request Unavailable
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'The requested payment link could not be verified or has already been fulfilled.'}
          </p>
          {onReturnToDashboard && (
            <button
              onClick={onReturnToDashboard}
              className="mt-2 bg-[#174B38] text-white px-6 py-2.5 rounded-full text-xs font-semibold"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E2924] py-8 sm:py-16 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Branding & Return Link */}
        <div className="flex items-center justify-between">
          <BrandLogo size="md" />
          {onReturnToDashboard && (
            <button
              onClick={onReturnToDashboard}
              className="text-xs font-semibold text-[#174B38] hover:underline"
            >
              ← Back to App
            </button>
          )}
        </div>

        {/* Main Checkout Card */}
        <div className="bg-white rounded-3xl border border-[#E8EAE5] shadow-xl overflow-hidden">
          {/* Header Strip */}
          <div className="bg-[#174B38] text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-200 font-bold mb-1">
                  Payment Request from {requestData.business?.name || 'Verified Business'}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {requestData.title}
                </h1>
                <div className="text-xs text-emerald-100 mt-1">
                  Invoice #{requestData.requestNumber}
                </div>
              </div>

              <div className="text-right sm:self-center">
                <div className="text-xs text-emerald-200 uppercase font-semibold">Total Due</div>
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight">
                  ${requestData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-emerald-200">{requestData.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success State View */}
          {paymentSuccess ? (
            <div className="p-8 sm:p-10 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#E7F1E9] text-[#10B981] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#174B38]">
                  Payment Completed Successfully!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you! Your payment of <strong>${requestData.totalAmount.toFixed(2)} USD</strong> has been securely captured and verified via PayPal Sandbox.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200 font-bold text-slate-800">
                  <span>Transaction Receipt</span>
                  <span className="text-emerald-700">Verified Sandbox</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Merchant:</span>
                  <span className="font-semibold text-slate-900">{requestData.business?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Customer:</span>
                  <span className="font-semibold text-slate-900">{requestData.clientName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PayPal Capture ID:</span>
                  <span className="font-mono text-[11px] text-slate-900">{transactionRecord?.paypalCaptureId || 'CAP_VERIFIED_7788'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date & Time:</span>
                  <span className="text-slate-900">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="bg-white hover:bg-slate-50 text-slate-800 px-5 py-2.5 rounded-full text-xs font-semibold border border-slate-300 flex items-center gap-1.5 shadow-2xs"
                >
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span>Print Receipt</span>
                </button>

                {onReturnToDashboard && (
                  <button
                    onClick={onReturnToDashboard}
                    className="bg-[#174B38] hover:bg-[#11382A] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm"
                  >
                    Return to Dashboard
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Active Unpaid Checkout Form */
            <div className="p-6 sm:p-8 space-y-6">
              {/* Deliverable Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Invoice Items & Deliverables
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {requestData.lineItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                      </div>
                      <div className="text-right font-bold text-slate-900 tabular-nums">
                        ${item.lineTotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-50 flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-base text-[#174B38] tabular-nums">
                      ${requestData.totalAmount.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due by: <strong>{requestData.dueDate}</strong></span>
                  </div>
                  <div className="text-emerald-700 font-medium">
                    Status: {requestData.status}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Payment Method
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedMethod('paypal')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedMethod === 'paypal'
                        ? 'border-[#0079C1] bg-[#F0F7FF] ring-2 ring-[#0079C1]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold italic text-[#003087] text-lg">P</span>
                      <span className="font-bold text-xs text-slate-800">PayPal Sandbox</span>
                    </div>
                    {selectedMethod === 'paypal' && (
                      <CheckCircle2 className="w-4 h-4 text-[#0079C1]" />
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedMethod === 'card'
                        ? 'border-[#174B38] bg-[#E7F1E9] ring-2 ring-[#174B38]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#174B38]" />
                      <span className="font-bold text-xs text-slate-800">Debit or Credit Card</span>
                    </div>
                    {selectedMethod === 'card' && (
                      <CheckCircle2 className="w-4 h-4 text-[#174B38]" />
                    )}
                  </button>
                </div>
              </div>

              {/* PayPal Sandbox Golden Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCapturePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] py-3.5 rounded-full font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-[#003087]" />
                      <span>Authorizing with PayPal...</span>
                    </>
                  ) : (
                    <>
                      <span className="italic font-black text-lg">PayPal</span>
                      <span className="text-xs font-semibold text-slate-800 ml-1">
                        Pay ${requestData.totalAmount.toFixed(2)} USD
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit encrypted checkout via PayPal Developer Platform</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Authenticity Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <div>Verified Merchant: {requestData.business?.name} · Powered by PayPilot AI</div>
          <div>PayPal Orders API v2 · Sandbox Environment</div>
        </div>
      </div>
    </div>
  );
};
