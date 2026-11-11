import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  type: 'login' | 'register' | 'onboarding';
  onClose: () => void;
  onSuccess: (userData: any) => void;
  onSwitchType: (type: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  type,
  onClose,
  onSuccess,
  onSwitchType,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('John Doe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Onboarding states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [businessName, setBusinessName] = useState('Apex Design & AI Systems');
  const [businessType, setBusinessType] = useState('Agency');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = type === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = type === 'register' ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingFinish = () => {
    onSuccess({
      name,
      businessName,
      businessType,
      onboardingCompleted: true,
    });
  };

  if (type === 'onboarding') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-[#CCE2D2] space-y-5 animate-in fade-in">
          <div className="text-center space-y-2">
            <BrandLogo size="md" className="justify-center" />
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Let's get your business ready
            </h2>
            <p className="text-xs text-slate-500">
              Step {onboardingStep} of 2: Set up your payment workspace
            </p>
          </div>

          {onboardingStep === 1 ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Business or Professional Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-[#174B38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-[#174B38] focus:outline-none"
                >
                  <option>Freelancer</option>
                  <option>Agency</option>
                  <option>Small business</option>
                  <option>Consultant</option>
                  <option>Other</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="w-full bg-[#174B38] hover:bg-[#11382A] text-white py-3 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to PayPal Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#E6F0FA] rounded-2xl border border-[#B8D7FA] text-slate-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-[#003087]">
                  <ShieldCheck className="w-4 h-4 text-[#0079C1]" />
                  <span>PayPal Developer Sandbox Ready</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Your account is automatically provisioned for testing with PayPal Developer Sandbox. You can create payment requests and test client checkout right away!
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleOnboardingFinish}
                  className="flex-1 bg-[#174B38] hover:bg-[#11382A] text-white py-3 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Go to Dashboard →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl relative border border-[#CCE2D2] space-y-5 animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <BrandLogo size="md" className="justify-center" />
          <h2 className="text-xl font-bold text-slate-900 mt-3">
            {type === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {type === 'login'
              ? 'Sign in to access your PayPilot AI dashboard'
              : 'Start managing payments with your AI assistant'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {type === 'register' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-[#174B38] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-[#174B38] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-[#174B38] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#174B38] hover:bg-[#11382A] text-white py-3 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : type === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          {type === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchType('register')}
                className="text-[#174B38] font-bold hover:underline"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchType('login')}
                className="text-[#174B38] font-bold hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
