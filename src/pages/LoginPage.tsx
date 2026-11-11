import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string })?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (!user.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setEmail('john@example.com');
    setPassword('demo1234');
    setLoading(true);
    try {
      await login('john@example.com', 'demo1234');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
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
          <h1 className="text-2xl font-extrabold text-[#101C3A] pt-2">Sign in to PayPilot AI</h1>
          <p className="text-sm text-[#68758C]">
            Access your AI Payment Agent, clients, and PayPal Sandbox ledger.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#D94C57]/10 border border-[#D94C57]/25 text-[#D94C57] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18243A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#18243A]">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#315CFF] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-10 pr-11 py-2.5 text-sm text-[#18243A] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68758C] hover:text-[#18243A] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E7EAF1]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-[#68758C] font-semibold">Hackathon Demo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full bg-[#EAF1FF] hover:bg-[#dce7ff] text-[#315CFF] border border-[#315CFF]/20 font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In with Demo Account (john@example.com)</span>
          </button>

          <p className="text-center text-xs text-[#68758C] pt-1">
            New to PayPilot AI?{' '}
            <Link to="/register" className="font-semibold text-[#315CFF] hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#68758C]">
          <Link to="/" className="hover:text-[#101C3A] transition-colors">
            ← Back to PayPilot AI Home
          </Link>
        </p>
      </div>
    </div>
  );
};
