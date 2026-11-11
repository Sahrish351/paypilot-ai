import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-[#D94C57]', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-[#D99027]', width: '55%' };
    if (score === 3) return { label: 'Good', color: 'bg-[#315CFF]', width: '80%' };
    return { label: 'Strong', color: 'bg-[#16845B]', width: '100%' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
          <h1 className="text-2xl font-extrabold text-[#101C3A] pt-2">Create your workspace</h1>
          <p className="text-sm text-[#68758C]">
            Start generating AI-assisted PayPal Sandbox payment requests.
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
              <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18243A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@studio.io"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18243A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-10 pr-11 py-2.5 text-sm text-[#18243A] focus:outline-none"
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

              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-[#EAF1FF] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#68758C]">
                    <span>Password strength: {strength.label}</span>
                    <span>Min 8 chars</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1.5">Confirm Password</label>
              <div className="relative">
                <CheckCircle2 className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18243A] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-[#68758C]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#315CFF] hover:underline">
              Sign in
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
