import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  MessageSquareText,
  FileCheck2,
  CreditCard,
  Users,
  Receipt,
  TrendingUp,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../components/layout/PublicFooter.tsx';
import { Reveal } from '../components/ui/MotionPrimitives.tsx';

interface FeatureDetail {
  id: string;
  icon: any;
  badge: string;
  title: string;
  whatItDoes: string;
  whyItMatters: string;
  howUsersInteract: string;
  problemSolved: string;
  previewLines: string[];
}

const FEATURES: FeatureDetail[] = [
  {
    id: 'ai-creation',
    icon: Bot,
    badge: 'Gemini AI + Validation',
    title: 'AI-Powered Payment Creation & NLU',
    whatItDoes:
      'Interprets plain-English payment instructions and extracts client name, email, service title, description, quantity, unit price, currency, and due date.',
    whyItMatters:
      'Eliminates tedious form entry while preserving structured invoice accuracy through server-side schema validation.',
    howUsersInteract:
      'Type or click a suggested prompt in /ai-agent, answer any missing-detail prompts, and inspect the live proposal card.',
    problemSolved: 'Slow manual invoice creation and forgotten billing details.',
    previewLines: [
      'Input: "Bill Alex $450 for website milestone due next Friday"',
      'Extracted: Client=Alex, Amount=$450.00 USD, Service=Website Milestone',
      'Missing Check: Prompts if client email is unrecorded',
    ],
  },
  {
    id: 'proposals',
    icon: FileCheck2,
    badge: 'Human-in-the-Loop',
    title: 'Structured Payment Proposals & Approval',
    whatItDoes:
      'Builds an editable, transparent proposal card displaying line items, recalculated totals, and missing-information warnings.',
    whyItMatters:
      'AI models must never autonomously charge clients or invent amounts. Every number is verified and approved by you.',
    howUsersInteract:
      'Edit fields directly inside the proposal card, cancel drafts anytime, or click Approve & Create Payment Request.',
    problemSolved: 'Risk of unverified AI actions or inaccurate invoice totals.',
    previewLines: [
      'Server Recalculation: quantity × unit_price = total_amount',
      'Guardrail: Rejects zero, negative, or non-finite values',
      'Approval: Only creates active link after explicit click',
    ],
  },
  {
    id: 'requests',
    icon: Sparkles,
    badge: 'Lifecycle Management',
    title: 'Smart Payment Requests & Public Checkout Links',
    whatItDoes:
      'Tracks every payment request across DRAFT, PENDING, OVERDUE, COMPLETED, and CANCELLED states with unique shareable /pay/:token links.',
    whyItMatters:
      'Clients can review itemized deliverables and pay without creating an account, while you monitor status changes in real time.',
    howUsersInteract:
      'Filter requests by status or date, copy shareable links in one click, or cancel open requests.',
    problemSolved: 'Lost invoice PDFs and unclear payment link statuses.',
    previewLines: [
      'Auto-Overdue Detection: Flags PENDING requests past dueDate',
      'Shareable Link: /pay/<publicToken> with business branding',
      'Safe State Machine: Completed requests lock against edits',
    ],
  },
  {
    id: 'paypal',
    icon: CreditCard,
    badge: 'Orders API v2',
    title: 'PayPal Sandbox Checkout & Capture Verification',
    whatItDoes:
      'Creates PayPal Orders v2 server-side, loads the PayPal Sandbox JS SDK or approval URL on checkout, and captures & verifies payments.',
    whyItMatters:
      'Frontend redirects alone can be spoofed. Backend capture verification ensures currency, amount, and order status match before completion.',
    howUsersInteract:
      'Client clicks PayPal checkout on /pay/:token; server verifies capture and issues a confirmed receipt.',
    problemSolved: 'Fake payment confirmations and duplicate capture bugs.',
    previewLines: [
      'POST /api/payments/create-order (PayPal-Request-Id idempotency)',
      'POST /api/payments/capture-order (Verifies COMPLETED + amount)',
      'Honest Config Check: Never fakes success if keys are absent',
    ],
  },
  {
    id: 'clients',
    icon: Users,
    badge: 'CRM Directory',
    title: 'Client Management & Billing History',
    whatItDoes:
      'Maintains client profiles with email, company, notes, total paid, pending balance, and linked payment requests/transactions.',
    whyItMatters:
      'Gives freelancers a single view of each client’s payment reliability and open balance without external spreadsheets.',
    howUsersInteract:
      'Add, edit, search, or inspect any client drawer on /clients, or launch a payment request directly for that client.',
    problemSolved: 'Scattered client contact info and untracked outstanding balances.',
    previewLines: [
      'Ownership Enforcement: Every client scoped to authenticated ownerId',
      'Live Aggregation: Updates totalPaid and pendingAmount on capture',
      'Safe Deletion: Blocks deleting clients with active open requests',
    ],
  },
  {
    id: 'transactions',
    icon: Receipt,
    badge: 'Verified Ledger',
    title: 'Transaction Tracking & CSV Exports',
    whatItDoes:
      'Maintains a dedicated ledger of verified PayPal Sandbox captures, refunds, Order IDs, and Capture IDs separate from open requests.',
    whyItMatters:
      'Keeps accounting clean—a pending payment request is never confused with settled revenue.',
    howUsersInteract:
      'Search, filter by status or date range, inspect capture references in modal view, and export CSV reports on /transactions and /reports.',
    problemSolved: 'Mixing unpaid invoices with actual collected revenue.',
    previewLines: [
      'Strict Separation: PaymentRequest ≠ verified Transaction',
      'Traceability: Stores paypalOrderId, paypalCaptureId, capturedAt',
      'CSV Export: Download Transactions, Requests, or Clients CSVs',
    ],
  },
  {
    id: 'insights',
    icon: TrendingUp,
    badge: 'Grounded Analytics',
    title: 'AI Business Insights & Follow-Up Assistance',
    whatItDoes:
      'Calculates revenue, average ticket, overdue totals, and client counts on the backend, then asks Gemini to explain trends and draft reminders.',
    whyItMatters:
      'Prevents AI hallucinations by feeding strictly verified numbers into the model, and helps recover overdue invoices politely.',
    howUsersInteract:
      'Visit /insights to regenerate executive summaries or generate tone-customized follow-up messages for pending requests.',
    problemSolved: 'Fabricated AI metrics and awkward overdue payment follow-ups.',
    previewLines: [
      'Backend-First Math: Exact revenue & overdue sums computed first',
      'Follow-Up Tones: Friendly, Polite, Professional, Urgent',
      'Includes direct /pay/:token link inside generated reminder',
    ],
  },
];

export const FeaturesPage: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(FEATURES[0].id);
  const activeFeature = FEATURES.find(f => f.id === selectedFeatureId) || FEATURES[0];

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#18243A] flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-14 pb-16 bg-fintech-grid border-b border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FF] text-[#315CFF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Capabilities</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#101C3A] mt-4 max-w-3xl mx-auto leading-tight">
              Every tool required to turn conversations into verified PayPal payments
            </h1>
            <p className="text-base text-[#68758C] max-w-2xl mx-auto mt-4 leading-relaxed">
              Explore what each module in PayPilot AI does, why it matters for your workflow, and how the backend enforces strict security and validation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive Feature Inspector */}
      <section className="py-16 bg-white border-b border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#315CFF] mb-3">
                Interactive Feature Explorer
              </h2>
              {FEATURES.map(f => {
                const Icon = f.icon;
                const active = f.id === activeFeature.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeatureId(f.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                      active
                        ? 'bg-[#EAF1FF] border-[#315CFF] shadow-xs'
                        : 'bg-[#FAFBFF] border-[#E7EAF1] hover:border-[#315CFF]/35'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        active ? 'bg-[#315CFF] text-white' : 'bg-white text-[#315CFF] border border-[#E7EAF1]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#101C3A]">{f.title}</div>
                      <div className="text-[11px] text-[#68758C]">{f.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 bg-[#FAFBFF] rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 space-y-6 sticky top-24">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#E7EAF1]">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF]">
                  {activeFeature.badge}
                </span>
                <span className="text-xs font-medium text-[#16845B] inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Implemented & Active
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#101C3A]">{activeFeature.title}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF] mb-1">
                    What It Does
                  </div>
                  <p className="text-xs text-[#68758C] leading-relaxed">{activeFeature.whatItDoes}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF] mb-1">
                    Why It Matters
                  </div>
                  <p className="text-xs text-[#68758C] leading-relaxed">{activeFeature.whyItMatters}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF] mb-1">
                    How Users Interact
                  </div>
                  <p className="text-xs text-[#68758C] leading-relaxed">{activeFeature.howUsersInteract}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF] mb-1">
                    Problem Solved
                  </div>
                  <p className="text-xs text-[#68758C] leading-relaxed">{activeFeature.problemSolved}</p>
                </div>
              </div>

              <div className="bg-[#101C3A] text-white rounded-2xl p-5 space-y-2.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#38C6D9]">
                  Implementation Architecture Notes
                </div>
                {activeFeature.previewLines.map((line, i) => (
                  <div key={i} className="text-xs font-mono text-slate-200 flex items-start gap-2">
                    <span className="text-[#38C6D9]">→</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Comparison */}
      <section className="py-16 bg-[#FAFBFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A]">
              Traditional Invoicing vs. PayPilot AI
            </h2>
          </Reveal>

          <div className="bg-white rounded-3xl border border-[#E7EAF1] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#101C3A] text-white text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Workflow Step</th>
                    <th className="p-4 font-semibold">Manual Process</th>
                    <th className="p-4 font-semibold text-[#7ADCF0]">PayPilot AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF1] text-xs sm:text-sm">
                  {[
                    ['Drafting Request', 'Copy-paste templates & calculate totals manually', 'Natural-language prompt → validated structured JSON proposal'],
                    ['Missing Info Check', 'Realize email or due date is missing after sending', 'AI detects missing fields and asks before approval'],
                    ['Checkout Creation', 'Log into gateway separately to build payment link', 'One-click PayPal Orders API v2 Sandbox order creation'],
                    ['Verification', 'Manually match bank/PayPal emails to spreadsheets', 'Server verifies capture status, currency, and amount automatically'],
                    ['Follow-Ups & Insights', 'Write awkward emails and manually sum columns', 'Backend-computed metrics + tone-matched AI reminder drafts'],
                  ].map(([step, manual, ai], idx) => (
                    <tr key={idx} className="hover:bg-[#FAFBFF]">
                      <td className="p-4 font-bold text-[#101C3A]">{step}</td>
                      <td className="p-4 text-[#68758C]">{manual}</td>
                      <td className="p-4 font-medium text-[#315CFF]">{ai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Security & CTA */}
      <section className="py-16 bg-white border-t border-[#E7EAF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#EAF1FF] rounded-3xl p-8 sm:p-10 border border-[#315CFF]/15">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#315CFF]">
              <ShieldCheck className="w-4 h-4" />
              <span>Ready to explore the live workspace?</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#101C3A]">
              Try the AI Payment Agent & PayPal Sandbox workflow
            </h2>
            <p className="text-xs sm:text-sm text-[#68758C]">
              Sign in with the demo account or create your own workspace in seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 bg-white text-[#101C3A] border border-[#E7EAF1] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 transition-all"
            >
              <span>How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
