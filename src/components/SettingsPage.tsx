import React, { useState } from 'react';
import {
  User,
  Building,
  CreditCard,
  Bot,
  Shield,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  Save,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface SettingsPageProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUpdateUser,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'paypal' | 'ai' | 'security'>('paypal');
  const [formData, setFormData] = useState({
    name: user.name || 'John Doe',
    email: user.email || 'john@example.com',
    businessName: user.businessName || 'Apex Design & AI Systems',
    businessType: user.businessType || 'Agency',
    businessDescription: user.businessDescription || 'Full-stack AI solutions and custom web development.',
    defaultCurrency: user.defaultCurrency || 'USD',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateUser(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.warn(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-sm text-[#55635B] mt-0.5">
          Manage your business identity, PayPal Sandbox integration, and AI assistant rules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-[#E8EAE5] overflow-x-auto">
        {[
          { id: 'paypal', label: 'PayPal Sandbox', icon: CreditCard },
          { id: 'profile', label: 'Business Profile', icon: Building },
          { id: 'ai', label: 'AI Preferences', icon: Bot },
          { id: 'security', label: 'Security & Auth', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#174B38] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: PayPal Sandbox */}
      {activeTab === 'paypal' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAE5] shadow-xs space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center font-black italic text-xl">
                  P
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    PayPal Developer Sandbox Connection
                  </h2>
                  <div className="text-xs text-slate-500">
                    Orders API v2 & Checkout JavaScript SDK
                  </div>
                </div>
              </div>

              <span className="bg-[#E7F1E9] text-[#174B38] border border-[#CCE2D2] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Sandbox Operational</span>
              </span>
            </div>

            {/* Sandbox Connection status details */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Environment:</span>
                <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 font-bold text-[#0079C1]">
                  SANDBOX (api-m.sandbox.paypal.com)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Supported Intent:</span>
                <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-800">
                  CAPTURE (Orders API v2)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Capture Currency:</span>
                <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-800">
                  USD ($)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Server Verification:</span>
                <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 font-bold text-emerald-700">
                  Idempotent Server-Side Capture
                </span>
              </div>
            </div>

            {/* Instructions box */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Testing Checkout with PayPal Sandbox Accounts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When testing public customer payment checkout (`/pay/:token`), you can use test sandbox credentials provided in your PayPal Developer dashboard at <a href="https://developer.paypal.com/dashboard/accounts" target="_blank" rel="noreferrer" className="text-[#0079C1] font-semibold underline inline-flex items-center gap-0.5">developer.paypal.com <ExternalLink className="w-3 h-3" /></a>.
              </p>
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Security & Zero Secret Exposure</span>
                </div>
                <p className="leading-relaxed">
                  In compliance with fintech security standards, PayPal Client Secrets and server keys are never exposed in frontend code. All order creation and captures happen safely through server-side authenticated proxies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAE5] shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img
              src="/src/assets/images/avatar_john_doe_1794391937937.jpg"
              alt="John Doe"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{formData.name}</h2>
              <div className="text-xs text-slate-500">{formData.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Your Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-[#174B38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-[#174B38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Business Type</label>
              <select
                value={formData.businessType}
                onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-[#174B38] focus:outline-none"
              >
                <option>Freelancer</option>
                <option>Agency</option>
                <option>Small business</option>
                <option>Consultant</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Default Settlement Currency</label>
              <input
                type="text"
                disabled
                value="USD ($) - PayPal Sandbox"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Business Description</label>
              <textarea
                rows={3}
                value={formData.businessDescription}
                onChange={e => setFormData({ ...formData, businessDescription: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-[#174B38] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
              </span>
            ) : <div />}

            <button
              type="submit"
              disabled={saving}
              className="bg-[#174B38] hover:bg-[#11382A] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: AI Preferences */}
      {activeTab === 'ai' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAE5] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Gemini 3.8 Flash AI Model Settings
              </h2>
              <div className="text-xs text-slate-500">
                Official Google Gen AI SDK Server-side Integration
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Model Engine:</span>
                <span className="font-mono text-[#174B38] bg-white px-2 py-0.5 rounded border border-slate-200">
                  models/gemini-3.8-flash
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Optimized for low-latency financial natural-language extraction, structured invoice JSON proposals, and business insights.
              </p>
            </div>

            <div className="p-4 bg-[#E7F1E9] rounded-2xl border border-[#CCE2D2] text-[#174B38] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span>Autonomous Action Guardrail</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Enforced rule: PayPilot AI operates strictly in "Proposal Mode". The AI model cannot autonomously charge credit cards or issue unauthorized refunds without explicit human verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAE5] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Sessions</h2>
              <div className="text-xs text-slate-500">Account protection and session management</div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Active Session</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Authenticated via secure token header</div>
              </div>
              <button
                onClick={onSignOut}
                className="text-rose-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
