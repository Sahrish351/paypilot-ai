import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bot,
  TrendingUp,
  Lightbulb,
  Send,
  Users,
  Clock,
  DollarSign,
} from 'lucide-react';
import { PaymentRequestItem, ClientItem } from '../types.ts';
import { StatCard } from '../components/ui/StatCard.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';

interface InsightsResponse {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  aiMode: 'gemini-live' | 'heuristic-fallback';
  metrics: {
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    overdueCount: number;
    completedCount: number;
    averageTicket: number;
    clientCount: number;
  };
}

export const InsightsPage: React.FC = () => {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [tone, setTone] = useState<'friendly' | 'polite' | 'professional' | 'urgent'>('polite');
  const [reminderDraft, setReminderDraft] = useState('');
  const [generatingReminder, setGeneratingReminder] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      const [insRes, reqRes, cliRes] = await Promise.all([
        fetch('/api/ai/insights', { method: 'POST', credentials: 'include' }),
        fetch('/api/payment-requests', { credentials: 'include' }),
        fetch('/api/clients', { credentials: 'include' }),
      ]);
      if (insRes.ok) {
        setData(await insRes.json());
      }
      if (reqRes.ok) {
        const r = await reqRes.json();
        const open = (r.requests || []).filter(
          (x: PaymentRequestItem) => x.status === 'PENDING' || x.status === 'OVERDUE'
        );
        setRequests(open);
        if (open.length > 0 && !selectedReqId) {
          setSelectedReqId(open[0].id);
        }
      }
      if (cliRes.ok) {
        const c = await cliRes.json();
        setClients(c.clients || []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedReqId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleGenerateReminder = async () => {
    const req = requests.find(r => r.id === selectedReqId);
    if (!req) return;
    setGeneratingReminder(true);
    try {
      const res = await fetch('/api/ai/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientName: req.clientName,
          amount: req.totalAmount,
          dueDate: req.dueDate,
          tone,
        }),
      });
      const out = await res.json();
      if (out.reminder) {
        const link = `${window.location.origin}/pay/${req.publicToken}`;
        setReminderDraft(out.reminder.replace(/\{\{PAYMENT_LINK\}\}/g, link));
      }
    } finally {
      setGeneratingReminder(false);
    }
  };

  useEffect(() => {
    if (selectedReqId) {
      handleGenerateReminder();
    }
  }, [selectedReqId, tone]);

  const copySummary = () => {
    if (!data) return;
    const text = `${data.summary}\n\nKey Insights:\n${data.keyInsights.join('\n')}\n\nRecommendations:\n${data.recommendations.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const copyReminder = () => {
    navigator.clipboard.writeText(reminderDraft);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF] text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Backend-Calculated Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
            AI Business Insights
          </h1>
          <p className="text-sm text-[#68758C] mt-0.5">
            Exact metrics calculated from your authorized ledger before AI generates explanations and follow-ups.
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Refresh Insights'}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Captured Revenue"
            value={`$${data.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sublabel={`${data.metrics.completedCount} completed payment(s)`}
            icon={DollarSign}
            accent="cobalt"
          />
          <StatCard
            label="Pending Receivables"
            value={`$${data.metrics.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sublabel={`${data.metrics.overdueCount} overdue request(s)`}
            icon={Clock}
            accent="warning"
          />
          <StatCard
            label="Average Ticket"
            value={`$${data.metrics.averageTicket.toFixed(2)}`}
            sublabel="Per completed capture"
            icon={TrendingUp}
            accent="success"
          />
          <StatCard
            label="Active Clients"
            value={data.metrics.clientCount}
            sublabel="Tracked in CRM"
            icon={Users}
            accent="cyan"
          />
        </div>
      )}

      {/* Executive Summary Banner */}
      {data && (
        <div className="bg-gradient-to-br from-[#101C3A] via-[#152754] to-[#2347d6] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#7ADCF0]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Executive Performance Summary</div>
                <div className="text-[11px] text-slate-300 font-mono">Mode: {data.aiMode}</div>
              </div>
            </div>

            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-[#38C6D9]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed">{data.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7ADCF0]">
                <TrendingUp className="w-4 h-4" />
                <span>Key Observations</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                {data.keyInsights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#38C6D9]">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7ADCF0]">
                <Lightbulb className="w-4 h-4" />
                <span>Recommended Next Actions</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#38C6D9]">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Client Payment Behavior + AI Follow-Up Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7EAF1] p-6 space-y-4">
          <h2 className="text-base font-bold text-[#101C3A]">Client Payment Behavior</h2>
          <p className="text-xs text-[#68758C]">
            Breakdown of paid vs. pending amounts per client from your database.
          </p>
          {clients.length === 0 ? (
            <p className="text-xs text-[#68758C] py-6 text-center">No client billing data yet.</p>
          ) : (
            <div className="space-y-3">
              {clients.map(c => {
                const total = c.totalPaid + c.pendingAmount || 1;
                const paidPct = Math.round((c.totalPaid / total) * 100);
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#18243A]">{c.name}</span>
                      <span className="text-[#68758C] tabular-nums">
                        ${c.totalPaid.toFixed(0)} paid / ${c.pendingAmount.toFixed(0)} open
                      </span>
                    </div>
                    <div className="h-2 bg-[#EAF1FF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#315CFF] rounded-full"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Follow-Up Assistant */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7EAF1] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#101C3A]">AI Payment Follow-Up Assistant</h2>
              <p className="text-xs text-[#68758C]">
                Draft polite or urgent reminders for pending and overdue requests.
              </p>
            </div>
            <Send className="w-5 h-5 text-[#315CFF]" />
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-[#68758C] py-8 text-center">
              You have no pending or overdue payment requests to follow up on.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Select Open Request</label>
                  <select
                    value={selectedReqId}
                    onChange={e => setSelectedReqId(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2.5"
                  >
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.requestNumber} — {r.clientName} (${r.totalAmount.toFixed(2)} • {r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Message Tone</label>
                  <div className="grid grid-cols-4 gap-1 bg-[#FAFBFF] p-1 rounded-xl border border-[#E7EAF1]">
                    {(['friendly', 'polite', 'professional', 'urgent'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize cursor-pointer ${
                          tone === t ? 'bg-[#315CFF] text-white' : 'text-[#68758C]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedReqId && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#68758C]">Selected status:</span>
                  <StatusBadge
                    status={requests.find(r => r.id === selectedReqId)?.status || 'PENDING'}
                  />
                </div>
              )}

              <textarea
                rows={6}
                value={generatingReminder ? 'Generating personalized reminder...' : reminderDraft}
                onChange={e => setReminderDraft(e.target.value)}
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-2xl p-4 text-xs text-[#18243A] leading-relaxed focus:outline-none focus:border-[#315CFF]"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleGenerateReminder}
                  disabled={generatingReminder}
                  className="px-4 py-2 rounded-xl border border-[#E7EAF1] text-xs font-semibold text-[#18243A] hover:bg-slate-50 cursor-pointer"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={copyReminder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs font-semibold cursor-pointer"
                >
                  {copiedReminder ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReminder ? 'Copied Message' : 'Copy Follow-Up'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
