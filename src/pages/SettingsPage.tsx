import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'profile' | 'notifications' | 'integrations' | 'security'>('profile');

  // Profile & Currency state
  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'Freelancer');
  const [businessDescription, setBusinessDescription] = useState(user?.businessDescription || '');
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency || 'USD');

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailReceipts: user?.notificationPreferences?.emailReceipts ?? true,
    overdueReminders: user?.notificationPreferences?.overdueReminders ?? true,
    aiInsightsDigest: user?.notificationPreferences?.aiInsightsDigest ?? true,
    paymentAlerts: user?.notificationPreferences?.paymentAlerts ?? true,
  });

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Integration status
  const [configStatus, setConfigStatus] = useState<{
    paypalConfigured: boolean;
    geminiConfigured: boolean;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    fetch('/api/payments/config')
      .then(r => r.json())
      .then(d =>
        setConfigStatus({
          paypalConfigured: Boolean(d.paypal?.configured),
          geminiConfigured: Boolean(d.geminiConfigured),
        })
      )
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      await updateProfile({
        name,
        businessName,
        businessType,
        businessDescription,
        defaultCurrency,
      });
      setStatusMessage({ type: 'success', text: 'Profile and currency preferences saved.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      await updateProfile({ notificationPreferences: notifPrefs });
      setStatusMessage({ type: 'success', text: 'Notification preferences saved.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setCurrentPassword('');
      setNewPassword('');
      setStatusMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    navigate('/', { replace: true });
    await logout();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#68758C] mt-0.5">
          Manage your profile, business information, currency, notifications, and security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E7EAF1] overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Currency', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'integrations', label: 'PayPal & Gemini Status', icon: CreditCard },
          { id: 'security', label: 'Password & Security', icon: Shield },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as any);
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                active ? 'bg-[#315CFF] text-white shadow-xs' : 'text-[#68758C] hover:text-[#101C3A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-[#16845B]/10 border-[#16845B]/25 text-[#16845B]'
              : 'bg-[#D94C57]/10 border-[#D94C57]/25 text-[#D94C57]'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {tab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#18243A] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18243A] mb-1">Email (Account ID)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-[#E7EAF1] rounded-xl px-3.5 py-2.5 text-[#68758C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-[#18243A] mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18243A] mb-1">Business Type</label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
              >
                <option value="Freelancer">Freelancer</option>
                <option value="Consultant">Consultant</option>
                <option value="Agency">Agency</option>
                <option value="Small business">Small business</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#18243A] mb-1">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
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
            <label className="block font-semibold text-[#18243A] mb-1">Business Description</label>
            <textarea
              rows={3}
              value={businessDescription}
              onChange={e => setBusinessDescription(e.target.value)}
              className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {tab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 space-y-5 text-xs">
          <div className="p-3.5 rounded-xl bg-[#EAF1FF] text-[#101C3A]">
            Preferences are saved to your account profile. In-app notifications appear in the top header bell; external SMTP email delivery is not configured in this hackathon build.
          </div>

          {(
            [
              ['paymentAlerts', 'In-App Payment Capture Alerts', 'Show notification when a PayPal Sandbox capture succeeds.'],
              ['overdueReminders', 'Overdue Payment Indicators', 'Highlight payment requests that pass their due date.'],
              ['aiInsightsDigest', 'AI Business Insights Refresh', 'Include fresh ledger summaries on your dashboard.'],
              ['emailReceipts', 'Customer Email Receipts (Requires SMTP — Disabled)', 'Marked unsupported until an SMTP provider is connected.'],
            ] as const
          ).map(([key, title, desc]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#E7EAF1] cursor-pointer"
            >
              <div>
                <div className="font-bold text-[#101C3A]">{title}</div>
                <div className="text-[#68758C] mt-0.5">{desc}</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs[key]}
                onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                className="w-4 h-4 accent-[#315CFF]"
              />
            </label>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#315CFF] text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-[#E7EAF1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#101C3A]">PayPal Sandbox API</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    configStatus?.paypalConfigured
                      ? 'bg-[#16845B]/12 text-[#16845B]'
                      : 'bg-[#D99027]/12 text-[#B47315]'
                  }`}
                >
                  {configStatus?.paypalConfigured ? 'Configured' : 'Credentials Missing'}
                </span>
              </div>
              <p className="text-[#68758C] leading-relaxed">
                {configStatus?.paypalConfigured
                  ? 'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are loaded on the server for Orders API v2.'
                  : 'Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env to enable live PayPal Sandbox checkout.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E7EAF1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#101C3A]">Google Gemini AI</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    configStatus?.geminiConfigured
                      ? 'bg-[#16845B]/12 text-[#16845B]'
                      : 'bg-[#D99027]/12 text-[#B47315]'
                  }`}
                >
                  {configStatus?.geminiConfigured ? 'Connected' : 'Fallback Mode'}
                </span>
              </div>
              <p className="text-[#68758C] leading-relaxed">
                {configStatus?.geminiConfigured
                  ? 'GEMINI_API_KEY is active on the backend.'
                  : 'Set GEMINI_API_KEY in .env to enable live Gemini model inference; deterministic fallback parser is active.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-5">
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 space-y-4 text-xs"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#101C3A]">
              <Lock className="w-4 h-4 text-[#315CFF]" />
              <span>Change Password</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#18243A] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#18243A] mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3.5 py-2.5"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#315CFF] text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Update Password
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-[#E7EAF1] p-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#101C3A]">Sign Out of Workspace</div>
              <div className="text-xs text-[#68758C]">Clears your signed HttpOnly session cookie.</div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D94C57]/30 text-[#D94C57] hover:bg-[#D94C57]/10 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
