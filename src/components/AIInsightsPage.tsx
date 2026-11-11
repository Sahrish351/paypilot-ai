import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart,
  RefreshCw,
  Copy,
  Check,
  Bot,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DashboardStats, TransactionItem } from '../types.ts';

interface AIInsightsPageProps {
  stats: DashboardStats;
  transactions: TransactionItem[];
  onOpenFollowUps: () => void;
}

export const AIInsightsPage: React.FC<AIInsightsPageProps> = ({
  stats,
  transactions,
  onOpenFollowUps,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [insights, setInsights] = useState<{
    summary: string;
    keyInsights: string[];
    recommendations: string[];
  }>({
    summary: `Your business collected $${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} across ${stats.totalTransactions} transactions this month with strong 78% invoice fulfillment rate.`,
    keyInsights: [
      `Collection velocity is accelerating: Average settlement window decreased from 8 to 4.2 days.`,
      `Client retention is strong, with Northstar Digital and Lumina Health driving 62% of monthly billings.`,
      `Pending payments of $${stats.pendingPayments.toFixed(2)} represent immediate collection opportunities before net-30 expiry.`,
    ],
    recommendations: [
      `Send automated follow-up reminders to Alex Morgan for the $450 milestone due next week.`,
      `Offer a 3% early-pay discount for invoices exceeding $2,000 to compress Days Sales Outstanding (DSO).`,
      `Set up automated monthly retainer payment links via PayPilot AI to lock in recurring baseline cashflow.`,
    ],
  });

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.summary) {
        setInsights(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = `${insights.summary}\n\nKey Insights:\n${insights.keyInsights.join('\n')}\n\nRecommendations:\n${insights.recommendations.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1E9] text-[#174B38] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Executive Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
            Understand Your Business with AI
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Turn raw PayPal transaction records into clear executive summaries and actionable revenue tips.
          </p>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading}
          className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing Transactions...' : 'Regenerate Insights'}</span>
        </button>
      </div>

      {/* AI Analysis Master Box */}
      <div className="bg-gradient-to-br from-[#174B38] to-[#0A2E22] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#287052] flex items-center justify-center text-[#A7F3D0]">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide text-emerald-200">
                Gemini 3.8 Flash Financial Summary
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Executive Overview */}
          <div className="text-base sm:text-lg leading-relaxed text-emerald-50 font-medium">
            "{insights.summary}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/15">
            {/* Key Observations */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Key Financial Observations</span>
              </h3>
              <ul className="space-y-2 text-xs text-emerald-100">
                {insights.keyInsights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#34D399] font-bold">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Recommendations */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Strategic Action Items</span>
              </h3>
              <ul className="space-y-2 text-xs text-emerald-100">
                {insights.recommendations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-300 font-bold">→</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onOpenFollowUps}
              className="bg-[#10B981] hover:bg-[#059669] text-[#064E3B] font-bold text-xs px-5 py-2.5 rounded-full shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Act on Insights in Follow-Up Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Payment Fulfillment Ratio</div>
          <div className="text-3xl font-extrabold text-[#174B38] tabular-nums mt-1">
            92.4%
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Percentage of issued invoice requests paid within standard net-30 terms.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Average Days to Settle</div>
          <div className="text-3xl font-extrabold text-blue-600 tabular-nums mt-1">
            3.8 Days
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Speed of client checkout completion via PayPal direct public link.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Monthly Revenue Growth</div>
          <div className="text-3xl font-extrabold text-emerald-600 tabular-nums mt-1">
            +12.5%
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Sequential growth compared to prior calendar billing period.
          </p>
        </div>
      </div>
    </div>
  );
};
