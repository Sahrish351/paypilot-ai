import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  HelpCircle,
  MessageSquare,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar.tsx';
import { PublicFooter } from '../components/layout/PublicFooter.tsx';
import { Reveal } from '../components/ui/MotionPrimitives.tsx';

const LIFECYCLE_STEPS = [
  {
    num: '01',
    icon: MessageSquare,
    title: 'User Instruction',
    short: 'Natural language input',
    detail:
      'You type a plain-English request such as: "Create a payment request for John for $250 for website development due next Friday."',
  },
  {
    num: '02',
    icon: Bot,
    title: 'AI Interpretation & Validation',
    short: 'Structured JSON extraction',
    detail:
      'The backend sends your instruction to Gemini with strict schema rules, sanitizes strings, validates positive amounts, and recalculates quantity × unit price.',
  },
  {
    num: '03',
    icon: HelpCircle,
    title: 'Missing-Info Clarification',
    short: 'Smart follow-up questions',
    detail:
      'If essential fields like client email or due date are missing, the AI lists them and asks targeted questions before you proceed.',
  },
  {
    num: '04',
    icon: FileCheck2,
    title: 'Proposal Review & User Approval',
    short: 'Explicit human control',
    detail:
      'You inspect and optionally edit the structured Payment Proposal card. Only when you click Approve & Create Request is a public link generated.',
  },
  {
    num: '05',
    icon: CreditCard,
    title: 'PayPal Sandbox Checkout',
    short: 'Orders API v2 approval',
    detail:
      'Your client opens /pay/:token. The backend creates a PayPal Sandbox order, and the client authorizes payment via PayPal Sandbox.',
  },
  {
    num: '06',
    icon: ShieldCheck,
    title: 'Verified Payment Confirmation',
    short: 'Server-side capture check',
    detail:
      'The backend captures the approved order, verifies COMPLETED status, currency, and exact amount match, and enforces idempotency.',
  },
  {
    num: '07',
    icon: Receipt,
    title: 'Transaction History & AI Insights',
    short: 'Audited ledger & analytics',
    detail:
      'The verified capture is stored as a Transaction, client balances update, and AI Insights explains real backend-computed performance.',
  },
];

export const HowItWorksPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#18243A] flex flex-col">
      <PublicNavbar />

      {/* Introduction */}
      <section className="pt-14 pb-16 bg-fintech-grid border-b border-[#E7EAF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-[#315CFF] bg-[#EAF1FF] px-3.5 py-1.5 rounded-full">
              Complete Payment Lifecycle
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#101C3A] mt-4">
              How PayPilot AI Turns Prompts Into Verified Payments
            </h1>
            <p className="text-base text-[#68758C] max-w-2xl mx-auto mt-3 leading-relaxed">
              Every stage combines AI speed with human approval and server-side PayPal Sandbox verification—so nothing is ever left to guesswork.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive 7-Stage Pipeline Diagram */}
      <section className="py-16 bg-white border-b border-[#E7EAF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-[#101C3A]">
              Interactive End-to-End Architecture Flow
            </h2>
            <p className="text-xs text-[#68758C] mt-1">
              Click any step below to inspect the exact data and security checks at that stage.
            </p>
          </Reveal>

          {/* Horizontal Flow Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'bg-[#315CFF] text-white border-[#315CFF] shadow-lg shadow-[#315CFF]/20 -translate-y-0.5'
                      : 'bg-[#FAFBFF] text-[#18243A] border-[#E7EAF1] hover:border-[#315CFF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isActive ? 'text-[#7ADCF0]' : 'text-[#315CFF]'
                      }`}
                    >
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-snug">{step.title}</div>
                    <div
                      className={`text-[10px] mt-1 ${
                        isActive ? 'text-blue-100' : 'text-[#68758C]'
                      }`}
                    >
                      {step.short}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Details */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#101C3A] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono text-[#38C6D9]">
                STAGE {LIFECYCLE_STEPS[activeStep].num} • {LIFECYCLE_STEPS[activeStep].short.toUpperCase()}
              </div>
              <h3 className="text-2xl font-extrabold">{LIFECYCLE_STEPS[activeStep].title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {LIFECYCLE_STEPS[activeStep].detail}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveStep(prev => (prev - 1 + LIFECYCLE_STEPS.length) % LIFECYCLE_STEPS.length)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveStep(prev => (prev + 1) % LIFECYCLE_STEPS.length)}
                className="px-4 py-2 rounded-xl bg-[#315CFF] hover:bg-[#5278FF] text-xs font-semibold cursor-pointer"
              >
                Next Stage →
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Walkthrough Cards */}
      <section className="py-16 bg-[#FAFBFF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A]">
              Step-by-Step Breakdown
            </h2>
          </Reveal>

          {LIFECYCLE_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.num} delay={idx * 0.04}>
                <div className="bg-white rounded-2xl border border-[#E7EAF1] p-6 flex flex-col sm:flex-row items-start gap-5 hover:border-[#315CFF]/35 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#315CFF]">Step {s.num}</span>
                      <span className="text-xs text-[#68758C]">• {s.short}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#101C3A]">{s.title}</h3>
                    <p className="text-sm text-[#68758C] leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Workflow FAQ + CTA */}
      <section className="py-16 bg-white border-t border-[#E7EAF1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-[#EAF1FF] rounded-3xl p-8 border border-[#315CFF]/15 text-center space-y-4">
            <TrendingUp className="w-8 h-8 text-[#315CFF] mx-auto" />
            <h2 className="text-2xl font-extrabold text-[#101C3A]">
              Experience the AI Payment Agent Live
            </h2>
            <p className="text-sm text-[#68758C] max-w-xl mx-auto">
              Sign in with the Demo Account or register your own workspace to test natural-language payment extraction and PayPal Sandbox links.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-sm font-semibold px-6 py-3 rounded-xl"
              >
                <span>Sign In & Try Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 bg-white text-[#101C3A] border border-[#E7EAF1] text-sm font-semibold px-6 py-3 rounded-xl"
              >
                <span>View Features</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
