import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo.tsx';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed.');
      setInfoMessage(data.message);
      if (data.devResetToken) {
        setToken(data.devResetToken);
      }
      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] bg-fintech-grid flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <BrandLogo size="lg" className="justify-center" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#101C3A] pt-2">Reset your password</h1>
          <p className="text-sm text-[#68758C]">
            Recover access to your PayPilot AI workspace.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#D94C57]/10 border border-[#D94C57]/25 text-[#D94C57] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && step === 'reset' && (
            <div className="p-3.5 rounded-xl bg-[#EAF1FF] border border-[#315CFF]/20 text-[#101C3A] text-xs leading-relaxed">
              {infoMessage}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Generate Reset Token</span>
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Reset Token</label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Paste reset token"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#16845B]/12 text-[#16845B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#101C3A]">Password updated</h2>
              <p className="text-xs text-[#68758C]">You can now sign in with your new password.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#315CFF] text-white text-sm font-semibold py-3 rounded-xl"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <p className="text-center text-xs text-[#68758C]">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-[#315CFF] hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
