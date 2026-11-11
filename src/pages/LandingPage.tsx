import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileSpreadsheet,
  Lock,
  MessageSquareText,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Briefcase,
  Laptop,
  Building2,
  UserCheck,
  AlertCircle,
  Check,
  Layers,
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../components/layout/PublicFooter.tsx';
import { Reveal, StaggerContainer, StaggerItem } from '../components/ui/MotionPrimitives.tsx';

const INTERACTIVE_SAMPLES = [
  {
    prompt: 'Create a payment request for John for $250 for website development due next Friday.',
    proposal: {
      client: 'John',
      email: 'Missing — AI will ask to confirm',
      service: 'Website Development',
      amount: '$250.00 USD',
      due: 'Next Friday',
      status: 'Awaiting User Approval',
    },
    aiReply:
      'I prepared a $250.00 USD payment proposal for John (Website Development). Before generating the PayPal link, please confirm John’s email address.',
  },
  {
    prompt: 'Bill Sarah Chen (sarah@luminahealth.com) $850 for UX Design System Sprint due 2026-11-25.',
    proposal: {
      client: 'Sarah Chen',
      email: 'sarah@luminahealth.com',
      service: 'UX Design System Sprint',
      amount: '$850.00 USD',
      due: '2026-11-25',
      status: 'Ready for Approval',
    },
    aiReply:
      'All required details extracted. Review the $850.00 USD proposal for Sarah Chen and click Approve & Create Request to activate PayPal Sandbox checkout.',
  },
  {
    prompt: 'Invoice Marcus Vance $1,200 for API integration milestone due in 14 days.',
    proposal: {
      client: 'Marcus Vance',
      email: 'marcus@vancecapital.co (Matched)',
      service: 'API Integration Milestone',
      amount: '$1,200.00 USD',
      due: 'In 14 days',
      status: 'Ready for Approval',
    },
    aiReply:
      'Matched existing client Marcus Vance. Structured $1,200.00 USD milestone proposal ready for your review and approval.',
  },
];

const FAQS = [
  {
    q: 'What is PayPilot AI?',
    a: 'PayPilot AI is an AI-powered payment management platform built for freelancers, consultants, and small businesses. It converts plain-English payment instructions into structured, human-approved payment requests connected to PayPal Sandbox checkout.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'You describe who you want to bill, for what service, and the amount. The backend sends your instruction to Gemini (with strict JSON schema validation and safety rules) to extract client, amount, currency, description, and due date. If details are missing, the assistant asks clarifying questions before you approve anything.',
  },
  {
    q: 'How are PayPal payments processed?',
    a: 'After you review and approve a payment request, your client opens a shareable checkout link. The backend creates an order via PayPal Orders API v2, the client approves payment through PayPal Sandbox, and our backend captures and verifies the amount and currency before recording the transaction.',
  },
  {
    q: 'Is this a real-money payment platform?',
    a: 'No. PayPilot AI is an independent hackathon project configured exclusively for PayPal Sandbox testing. It is not affiliated with or endorsed by PayPal, and no real-money funds are transferred.',
  },
  {
    q: 'Can I track clients and transactions?',
    a: 'Yes. PayPilot AI separates open payment requests from verified completed transactions. You can manage client profiles, inspect individual client billing histories, filter transactions, export CSV reports, and generate AI-assisted insights grounded in your real ledger.',
  },
  {
    q: 'How is payment information protected?',
    a: 'All Gemini API keys, PayPal client secrets, and session signing keys remain strictly on the backend server. Authentication uses scrypt password hashing and signed HttpOnly session cookies, and the AI can never autonomously execute or capture a payment without explicit user approval.',
  },
];

export const LandingPage: React.FC = () => {
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const activeSample = INTERACTIVE_SAMPLES[selectedSampleIdx];

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#18243A] flex flex-col">
      <PublicNavbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-fintech-grid">
        {/* Subtle animated glow */}
        <motion.div
          animate={{ opacity: [0.45, 0.7, 0.45], scale: [1, 1.05, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 right-0 w-[560px] h-[560px] rounded-full bg-[#315CFF]/10 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 -left-24 w-[420px] h-[420px] rounded-full bg-[#38C6D9]/12 blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FF] border border-[#315CFF]/20 text-[#315CFF] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Independent Hackathon Project • PayPal Sandbox Ready</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-[#101C3A] leading-[1.1]">
                Your AI Payment Agent.{' '}
                <span className="text-[#315CFF]">From Conversation to Completed Payment.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#68758C] leading-relaxed max-w-xl">
                Describe payment requirements in plain English. PayPilot AI extracts structured invoice details, asks for missing information, awaits your explicit approval, and powers verified PayPal Sandbox checkout.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md shadow-[#315CFF]/20 hover:shadow-lg transition-all"
                >
                  <span>Start Free Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#EAF1FF]/60 text-[#101C3A] border border-[#E7EAF1] font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
                >
                  <span>Try Demo Account</span>
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#315CFF] hover:underline px-2 py-2"
                >
                  <span>See workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#68758C]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                  Human-in-the-loop approval
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                  Server-side PayPal capture verification
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                  Backend-protected API keys
                </span>
              </div>
            </motion.div>

            {/* Right Visual Composition: Product + AI Payment Agent Preview */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6"
            >
              <div className="relative bg-white rounded-3xl border border-[#E7EAF1] shadow-2xl shadow-[#101C3A]/8 p-5 sm:p-6 space-y-4">
                {/* Window Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF1]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#101C3A]">PayPilot AI Payment Agent</div>
                      <div className="text-[11px] text-[#68758C]">Structured Proposal Preview</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38C6D9]" />
                    Approval Required
                  </span>
                </div>

                {/* User Prompt Bubble */}
                <div className="bg-[#101C3A] text-white rounded-2xl rounded-tr-sm p-3.5 text-xs leading-relaxed ml-8">
                  “Create a payment request for Alex Morgan for $450 for website milestone due in 7 days.”
                </div>

                {/* Structured Proposal Card */}
                <div className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF]">
                      Extracted Payment Proposal
                    </span>
                    <span className="text-[11px] font-mono text-[#68758C]">USD • Sandbox</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#E7EAF1]">
                      <div className="text-[10px] text-[#68758C]">Client</div>
                      <div className="font-bold text-[#18243A] mt-0.5">Alex Morgan</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#E7EAF1]">
                      <div className="text-[10px] text-[#68758C]">Amount</div>
                      <div className="font-extrabold text-[#315CFF] tabular-nums mt-0.5">$450.00 USD</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#E7EAF1] col-span-2">
                      <div className="text-[10px] text-[#68758C]">Deliverable & Due Date</div>
                      <div className="font-semibold text-[#18243A] mt-0.5">
                        Website Milestone • Due in 7 days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E7EAF1]">
                    <span className="text-[11px] text-[#68758C]">PayPal Order created only after approval</span>
                    <span className="inline-flex items-center gap-1 bg-[#315CFF] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      Approve & Create
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Trust and Value Proposition Section (Honest, no fabricated customer metrics) */}
      <section className="py-16 bg-white border-y border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
              Why PayPilot AI Exists
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A]">
              Billing shouldn’t require juggling spreadsheets, invoice forms, and chat threads
            </h2>
            <p className="text-sm sm:text-base text-[#68758C] leading-relaxed">
              Independent professionals lose time switching between client messages, manual invoice builders, payment gateways, and revenue spreadsheets. PayPilot AI unifies the entire cycle around one verified workflow.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquareText,
                title: 'Natural Language First',
                desc: 'Write a single sentence describing the client, deliverable, and fee—instead of filling ten repetitive form fields.',
              },
              {
                icon: ShieldCheck,
                title: 'Strict Approval Guardrails',
                desc: 'AI proposes and validates; you always inspect, edit, and approve before any payment link or PayPal order is generated.',
              },
              {
                icon: Receipt,
                title: 'Verified Ledger Separation',
                desc: 'Open payment requests are tracked separately from server-verified completed PayPal captures—no ambiguous statuses.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={i}>
                  <div className="h-full bg-[#FAFBFF] rounded-2xl border border-[#E7EAF1] p-6 hover:border-[#315CFF]/30 transition-all">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#101C3A]">{item.title}</h3>
                    <p className="text-sm text-[#68758C] mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 4. Problem & Solution Section */}
      <section className="py-20 bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
                Problem & Solution
              </span>
              <h2 className="text-3xl font-extrabold text-[#101C3A] mt-2">
                Four everyday payment bottlenecks, solved cleanly
              </h2>
            </div>
            <Link
              to="/features"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#315CFF] hover:underline"
            >
              <span>Explore all features</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                problem: 'Manual Payment Creation',
                pain: 'Recreating line items, due dates, and descriptions manually for every client project wastes billable time.',
                solution: 'Describe the milestone in plain language; Gemini extracts structured line items, totals, and dates for review.',
              },
              {
                problem: 'Payment Tracking Difficulties',
                pain: 'Mixing draft requests, pending links, and settled funds makes it hard to know who has actually paid.',
                solution: 'Dedicated Payment Requests and verified Transactions ledgers keep open receivables and captured payouts distinct.',
              },
              {
                problem: 'Client Communication Friction',
                pain: 'Writing polite or urgent follow-up reminders for overdue invoices feels awkward and time-consuming.',
                solution: 'Generate tone-matched follow-up messages with direct PayPal checkout links in one click.',
              },
              {
                problem: 'Unclear Financial Performance',
                pain: 'Raw transaction logs rarely tell you which clients drive revenue or which invoices need immediate action.',
                solution: 'Backend-calculated revenue analytics paired with AI explanations highlight cashflow trends accurately.',
              },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 0.06}>
                <div className="bg-white rounded-2xl border border-[#E7EAF1] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D94C57] bg-[#D94C57]/8 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Problem: {item.problem}</span>
                    </div>
                    <p className="text-sm text-[#68758C] leading-relaxed">{item.pain}</p>
                  </div>
                  <div className="pt-4 border-t border-[#E7EAF1] space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16845B]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>PayPilot AI Solution</span>
                    </div>
                    <p className="text-sm font-medium text-[#18243A] leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Core Features Section */}
      <section id="features" className="py-20 bg-white border-y border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
              Core Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101C3A]">
              Everything needed for modern payment operations
            </h2>
            <p className="text-sm sm:text-base text-[#68758C]">
              Six integrated workspaces connected to one unified backend and database.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: 'AI Payment Agent',
                desc: 'Interprets natural-language billing instructions, asks clarifying questions for missing details, and drafts structured proposals.',
                tag: 'Gemini Powered',
              },
              {
                icon: Layers,
                title: 'Smart Payment Requests',
                desc: 'Manage drafts, pending links, overdue milestones, and cancellations with clean status transitions and shareable URLs.',
                tag: 'Full Lifecycle',
              },
              {
                icon: CreditCard,
                title: 'PayPal Sandbox Checkout',
                desc: 'Creates PayPal Orders API v2 orders and verifies captures server-side before marking any request completed.',
                tag: 'Orders API v2',
              },
              {
                icon: FileSpreadsheet,
                title: 'Transaction Management',
                desc: 'Inspect captured PayPal Order IDs, capture references, timestamps, and export audit-ready CSV reports.',
                tag: 'Verified Ledger',
              },
              {
                icon: Users,
                title: 'Client Management',
                desc: 'Store client contacts, notes, lifetime paid amounts, outstanding balances, and client-specific payment histories.',
                tag: 'CRM Directory',
              },
              {
                icon: TrendingUp,
                title: 'AI Business Insights',
                desc: 'Backend calculates exact metrics from authorized records before AI explains trends and suggests follow-ups.',
                tag: 'Grounded Analytics',
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={idx}>
                  <div className="bg-[#FAFBFF] hover:bg-white rounded-2xl border border-[#E7EAF1] hover:border-[#315CFF]/35 p-6 transition-all hover:shadow-lg h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#315CFF] text-white flex items-center justify-center shadow-xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF]">
                          {f.tag}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#101C3A]">{f.title}</h3>
                      <p className="text-sm text-[#68758C] mt-2 leading-relaxed">{f.desc}</p>
                    </div>
                    <Link
                      to="/features"
                      className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#315CFF] hover:underline"
                    >
                      <span>Learn how it works</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
                5-Step Payment Lifecycle
              </span>
              <h2 className="text-3xl font-extrabold text-[#101C3A] mt-2">
                From a single prompt to a verified transaction
              </h2>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#315CFF] hover:underline"
            >
              <span>View detailed lifecycle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Describe Payment', desc: 'Type client, amount, and service in plain English.' },
              { step: '02', title: 'AI Interprets', desc: 'Gemini extracts JSON fields and flags missing info.' },
              { step: '03', title: 'Review & Approve', desc: 'You edit or confirm the proposal before link creation.' },
              { step: '04', title: 'PayPal Checkout', desc: 'Client approves payment via PayPal Sandbox link.' },
              { step: '05', title: 'Track & Analyze', desc: 'Backend verifies capture and updates your ledger.' },
            ].map((s, idx) => (
              <Reveal key={s.step} delay={idx * 0.07}>
                <div className="bg-white rounded-2xl border border-[#E7EAF1] p-5 h-full relative hover:border-[#315CFF]/35 transition-all">
                  <span className="inline-block font-mono text-xs font-bold text-[#315CFF] bg-[#EAF1FF] px-2.5 py-1 rounded-lg mb-3">
                    Step {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-[#101C3A]">{s.title}</h3>
                  <p className="text-xs text-[#68758C] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Interactive AI Assistant Showcase */}
      <section className="py-20 bg-white border-y border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
                Interactive AI Showcase
              </span>
              <h2 className="text-3xl font-extrabold text-[#101C3A]">
                See how natural language turns into structured billing data
              </h2>
              <p className="text-sm text-[#68758C] leading-relaxed">
                Select an instruction below to preview how PayPilot AI extracts payment entities, catches missing fields, and prepares a review card.
              </p>

              <div className="space-y-2.5 pt-2">
                {INTERACTIVE_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSampleIdx(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                      selectedSampleIdx === idx
                        ? 'bg-[#EAF1FF] border-[#315CFF] text-[#101C3A] font-semibold shadow-xs'
                        : 'bg-[#FAFBFF] border-[#E7EAF1] text-[#68758C] hover:border-[#315CFF]/40'
                    }`}
                  >
                    “{sample.prompt}”
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSampleIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#FAFBFF] rounded-3xl border border-[#E7EAF1] p-6 sm:p-8 shadow-sm space-y-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#315CFF] text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-[#E7EAF1] rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-[#18243A] leading-relaxed shadow-2xs">
                      {activeSample.aiReply}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E7EAF1] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E7EAF1] pb-3">
                      <span className="text-xs font-bold text-[#101C3A]">Structured Proposal Output</span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF1FF] text-[#315CFF]">
                        {activeSample.proposal.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#68758C]">Client Name:</span>{' '}
                        <span className="font-bold text-[#18243A]">{activeSample.proposal.client}</span>
                      </div>
                      <div>
                        <span className="text-[#68758C]">Amount:</span>{' '}
                        <span className="font-bold text-[#315CFF]">{activeSample.proposal.amount}</span>
                      </div>
                      <div>
                        <span className="text-[#68758C]">Client Email:</span>{' '}
                        <span className="font-semibold text-[#18243A]">{activeSample.proposal.email}</span>
                      </div>
                      <div>
                        <span className="text-[#68758C]">Due Date:</span>{' '}
                        <span className="font-semibold text-[#18243A]">{activeSample.proposal.due}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#68758C]">Service:</span>{' '}
                        <span className="font-semibold text-[#18243A]">{activeSample.proposal.service}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. PayPal Sandbox Integration Section (Midnight Navy Contrast) */}
      <section className="py-20 bg-[#101C3A] text-white bg-navy-grid relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#7ADCF0] text-xs font-semibold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PayPal Orders API v2 • Sandbox Environment</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Real Sandbox verification, zero fake payment confirmations
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                PayPilot AI keeps PayPal Sandbox credentials securely on the Express backend. We never treat frontend redirects as proof of payment—every transaction is captured and verified for currency and amount match before recording.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Sandbox Testing Notice:</strong> This platform runs strictly in PayPal Developer Sandbox mode for hackathon evaluation. No real-money payments are processed.
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-6">
              <div className="bg-[#16254C] border border-white/10 rounded-3xl p-6 space-y-4">
                {[
                  {
                    step: '1. Server-Side Order Creation',
                    detail: 'Backend authenticates via OAuth2 and calls POST /v2/checkout/orders using stored request amounts.',
                  },
                  {
                    step: '2. Customer Sandbox Approval',
                    detail: 'Client reviews the invoice at /pay/:token and approves via PayPal Sandbox checkout.',
                  },
                  {
                    step: '3. Idempotent Capture & Verification',
                    detail: 'Backend calls /capture, verifies COMPLETED status, currency, and amount before saving a Transaction.',
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#101C3A]/70 border border-white/10 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#38C6D9] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-white">{row.step}</div>
                      <div className="text-xs text-slate-300 mt-1 leading-relaxed">{row.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. Dashboard Preview Section */}
      <section className="py-20 bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
              Financial Command Center
            </span>
            <h2 className="text-3xl font-extrabold text-[#101C3A]">
              A complete SaaS dashboard built for clarity
            </h2>
            <p className="text-sm text-[#68758C]">
              Monitor received payments, open receivables, revenue curves, AI insights, and recent verified transactions in one workspace.
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-xl overflow-hidden">
              <div className="bg-[#101C3A] px-6 py-3.5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D94C57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D99027]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16845B]" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">paypilot.app/dashboard (Demo Preview)</span>
                </div>
                <span className="text-[11px] bg-[#315CFF]/30 text-[#7ADCF0] px-2.5 py-0.5 rounded-full font-semibold">
                  Sample Sandbox Data
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6 bg-[#FAFBFF]">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Received (Demo)', val: '$12,870.00', sub: '6 verified captures' },
                    { label: 'Pending Requests', val: '$2,320.00', sub: '3 open invoices' },
                    { label: 'Completed Requests', val: '1', sub: 'PayPal Sandbox settled' },
                    { label: 'Active Clients', val: '4', sub: 'Synced CRM records' },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#E7EAF1] p-4">
                      <div className="text-[11px] text-[#68758C] font-medium">{card.label}</div>
                      <div className="text-xl font-extrabold text-[#101C3A] tabular-nums mt-1">{card.val}</div>
                      <div className="text-[11px] text-[#315CFF] mt-1">{card.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7EAF1] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-[#101C3A]">Cumulative Revenue Curve</span>
                      <span className="text-[11px] text-[#68758C]">Verified Transactions</span>
                    </div>
                    <svg viewBox="0 0 420 110" className="w-full h-32">
                      <defs>
                        <linearGradient id="previewBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#315CFF" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#315CFF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 10 92 L 75 76 L 140 60 L 205 55 L 270 38 L 335 24 L 410 12 L 410 105 L 10 105 Z"
                        fill="url(#previewBlue)"
                      />
                      <path
                        d="M 10 92 L 75 76 L 140 60 L 205 55 L 270 38 L 335 24 L 410 12"
                        fill="none"
                        stroke="#315CFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7EAF1] p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#101C3A]">
                      <Sparkles className="w-4 h-4 text-[#315CFF]" />
                      <span>AI Financial Insight</span>
                    </div>
                    <p className="text-xs text-[#68758C] leading-relaxed">
                      “1 payment request ($1,020.00) is past due. Prioritize sending a polite PayPal checkout reminder to Marcus Vance.”
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315CFF] hover:underline pt-1"
                    >
                      <span>Open live dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. Security and Transparency Section */}
      <section className="py-20 bg-white border-y border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
              Security & Governance
            </span>
            <h2 className="text-3xl font-extrabold text-[#101C3A]">
              Built with fintech safeguards from the ground up
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Lock,
                title: 'Signed Session Auth',
                desc: 'Passwords hashed with scrypt and random salts; sessions protected via HMAC-SHA256 HttpOnly cookies.',
              },
              {
                icon: UserCheck,
                title: 'Explicit User Approval',
                desc: 'AI can only draft proposals. Users must review and approve before a payment request becomes active.',
              },
              {
                icon: ShieldCheck,
                title: 'Server-Only Secrets',
                desc: 'Gemini API keys and PayPal Sandbox secrets never touch browser bundles or client-side storage.',
              },
              {
                icon: Wallet,
                title: 'Idempotent Verification',
                desc: 'Every capture validates currency, amount, and status server-side and prevents duplicate ledger entries.',
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <Reveal key={idx} delay={idx * 0.06}>
                  <div className="p-6 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1] h-full">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#101C3A]">{s.title}</h3>
                    <p className="text-xs text-[#68758C] mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. Use Cases Section */}
      <section className="py-20 bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">
              Who It’s Built For
            </span>
            <h2 className="text-3xl font-extrabold text-[#101C3A] mt-2">
              Tailored for independent professionals & lean teams
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Laptop,
                role: 'Freelancers',
                desc: 'Turn project milestone chats into structured PayPal payment links in seconds.',
              },
              {
                icon: Briefcase,
                role: 'Consultants',
                desc: 'Manage advisory retainers, track pending balances, and send polite follow-ups.',
              },
              {
                icon: Building2,
                role: 'Small Businesses',
                desc: 'Keep client directories, receipts, and exportable transaction CSVs organized.',
              },
              {
                icon: Users,
                role: 'Service Providers',
                desc: 'Share clean, branded public checkout pages with transparent line items.',
              },
            ].map((u, i) => {
              const Icon = u.icon;
              return (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="bg-white rounded-2xl border border-[#E7EAF1] p-6 hover:border-[#315CFF]/35 transition-all h-full">
                    <div className="w-10 h-10 rounded-xl bg-[#101C3A] text-white flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#101C3A]">{u.role}</h3>
                    <p className="text-xs text-[#68758C] mt-2 leading-relaxed">{u.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-[#E7EAF1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF]">FAQ</span>
            <h2 className="text-3xl font-extrabold text-[#101C3A]">Frequently Asked Questions</h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FAFBFF] rounded-2xl border border-[#E7EAF1] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-[#101C3A]">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#68758C] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#315CFF]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-sm text-[#68758C] leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. Final CTA Section */}
      <section className="py-20 bg-[#FAFBFF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="bg-gradient-to-br from-[#101C3A] via-[#152856] to-[#315CFF] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                Ready to test PayPilot AI?
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
                Create your own workspace or sign in with the pre-seeded Demo Account to test natural-language payment creation, client tracking, and PayPal Sandbox workflows.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white text-[#101C3A] hover:bg-[#EAF1FF] font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
                >
                  <span>Sign In to Demo</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
