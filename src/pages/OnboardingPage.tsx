import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'Freelancer');
  const [businessDescription, setBusinessDescription] = useState(user?.businessDescription || '');
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency || 'USD');
  const [saving, setSaving] = useState(false);
  const [paypalConfigured, setPaypalConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/payments/config')
      .then(r => r.json())
      .then(d => setPaypalConfigured(Boolean(d.paypal?.configured)))
      .catch(() => setPaypalConfigured(false));
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile({
        businessName: businessName.trim() || `${user?.name || 'My'} Studio`,
        businessType,
        businessDescription: businessDescription.trim(),
        defaultCurrency,
        onboardingCompleted: true,
      });
      navigate('/dashboard', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] bg-fintech-grid flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size="lg" className="justify-center" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF] text-xs font-semibold mt-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {step} of 2 • Workspace Setup</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#101C3A]">
            Configure your business profile
          </h1>
          <p className="text-sm text-[#68758C]">
            This information appears on your shareable PayPal Sandbox payment requests.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1.5">
                  Business or Studio Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Northstar Web Studio"
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1.5">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="Freelancer">Freelancer</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Agency">Agency</option>
                    <option value="Small business">Small business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={e => setDefaultCurrency(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1.5">
                  Short Service Description
                </label>
                <textarea
                  rows={3}
                  value={businessDescription}
                  onChange={e => setBusinessDescription(e.target.value)}
                  placeholder="Describe the services you provide to clients..."
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#EAF1FF] border border-[#315CFF]/20 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#101C3A]">
                  <ShieldCheck className="w-5 h-5 text-[#315CFF]" />
                  <span>PayPal Sandbox Readiness</span>
                </div>
                <p className="text-xs text-[#68758C] leading-relaxed">
                  {paypalConfigured
                    ? 'PayPal Sandbox credentials are configured on the server. Clients can complete full Sandbox checkout on your payment links.'
                    : 'You can create AI payment requests, manage clients, and preview shareable checkout pages right away. To capture live PayPal Sandbox orders, set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your backend .env file.'}
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#68758C]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                  <span>AI Payment Agent ready at /ai-agent</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                  <span>Client Directory & CSV Reports ready</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-[#68758C] hover:bg-slate-100 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Saving workspace...' : 'Launch Dashboard'}</span>
                  {!saving && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
