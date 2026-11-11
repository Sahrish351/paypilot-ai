import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  CreditCard,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  FileSpreadsheet,
  Send,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { StatCard } from '../components/ui/StatCard.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  DashboardStats,
  TransactionItem,
  PaymentRequestItem,
  ClientItem,
} from '../types.ts';

interface DashboardPageProps {
  onOpenCreatePayment: () => void;
  refreshSignal: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreatePayment,
  refreshSignal,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueTimeline, setRevenueTimeline] = useState<Array<{ date: string; amount: number; value: number }>>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [insightsSummary, setInsightsSummary] = useState<string>('');
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Embedded AI assistant shortcut state
  const [quickPrompt, setQuickPrompt] = useState('');
  const [quickReply, setQuickReply] = useState<string | null>(null);
  const [quickSending, setQuickSending] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, revRes, txnRes, reqRes, cliRes] = await Promise.all([
        fetch('/api/dashboard/stats', { credentials: 'include' }),
        fetch(`/api/dashboard/revenue?range=${dateRange}`, { credentials: 'include' }),
        fetch('/api/payments', { credentials: 'include' }),
        fetch('/api/payment-requests', { credentials: 'include' }),
        fetch('/api/clients', { credentials: 'include' }),
      ]);

      if (!statsRes.ok) throw new Error('Failed to load dashboard data.');

      const [s, r, t, reqData, c] = await Promise.all([
        statsRes.json(),
        revRes.json(),
        txnRes.json(),
        reqRes.json(),
        cliRes.json(),
      ]);

      setStats(s);
      setRevenueTimeline(r.data || []);
      setTransactions(t.transactions || []);
      setRequests(reqData.requests || []);
      setClients(c.clients || []);
    } catch (err: any) {
      setError(err.message || 'Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setInsightsSummary(data.summary || '');
      }
    } catch {
      // ignore
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, refreshSignal]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights, refreshSignal]);

  const filteredTransactions = useMemo(() => {
    if (dateRange === 'all') return transactions;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoff = Date.now() - days * 86400000;
    const inWindow = transactions.filter(t => new Date(t.capturedAt || t.createdAt).getTime() >= cutoff);
    // For seeded 2025 demo transactions, show all if window returns empty while demo user is inspecting
    return inWindow.length > 0 ? inWindow : transactions;
  }, [transactions, dateRange]);

  const statusBreakdown = useMemo(() => {
    const counts = {
      COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
      PENDING: requests.filter(r => r.status === 'PENDING').length,
      OVERDUE: requests.filter(r => r.status === 'OVERDUE').length,
      CANCELLED: requests.filter(r => r.status === 'CANCELLED').length,
      DRAFT: requests.filter(r => r.status === 'DRAFT').length,
    };
    const total = Math.max(1, requests.length);
    return { counts, total };
  }, [requests]);

  const openRequests = useMemo(
    () => requests.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE').slice(0, 4),
    [requests]
  );

  const handleQuickAISend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || quickSending) return;
    setQuickSending(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: quickPrompt }),
      });
      const data = await res.json();
      setQuickReply(data.message || 'Ready! Open the AI Agent to review your proposal.');
      if (data.proposal) {
        navigate('/ai-agent');
      }
    } finally {
      setQuickSending(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-white rounded-2xl border border-[#D94C57]/30 p-8 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#D94C57] mx-auto" />
        <h2 className="text-lg font-bold text-[#101C3A]">Unable to load dashboard</h2>
        <p className="text-xs text-[#68758C]">{error}</p>
        <button
          onClick={fetchAll}
          className="bg-[#315CFF] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Build SVG path for revenue chart
  const renderRevenueChart = () => {
    if (revenueTimeline.length === 0) {
      return (
        <div className="h-52 flex flex-col items-center justify-center text-center border border-dashed border-[#E7EAF1] rounded-2xl bg-[#FAFBFF] p-6">
          <CreditCard className="w-7 h-7 text-[#315CFF] mb-2" />
          <div className="text-xs font-bold text-[#101C3A]">No completed captures yet</div>
          <p className="text-[11px] text-[#68758C] max-w-xs mt-1">
            Revenue plots automatically once a payment request is verified through PayPal Sandbox.
          </p>
        </div>
      );
    }

    const width = 620;
    const height = 190;
    const padX = 24;
    const padY = 20;
    const values = revenueTimeline.map(p => p.value);
    const maxVal = Math.max(...values, 1);
    const minVal = 0;

    const coords = revenueTimeline.map((pt, i) => {
      const x =
        revenueTimeline.length === 1
          ? width / 2
          : padX + (i / (revenueTimeline.length - 1)) * (width - padX * 2);
      const y =
        height - padY - ((pt.value - minVal) / (maxVal - minVal || 1)) * (height - padY * 2);
      return { ...pt, x, y };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;

    return (
      <div className="space-y-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="dashBlueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#315CFF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#315CFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map(frac => {
            const y = height - padY - frac * (height - padY * 2);
            return (
              <line
                key={frac}
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="#E7EAF1"
                strokeDasharray="4 4"
              />
            );
          })}

          {coords.length > 1 && <path d={areaPath} fill="url(#dashBlueFill)" />}
          {coords.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="#315CFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {coords.map((c, idx) => (
            <g key={idx}>
              <circle cx={c.x} cy={c.y} r="4.5" fill="#FFFFFF" stroke="#315CFF" strokeWidth="2.5" />
              <title>{`${c.date}: $${c.value.toLocaleString()} cumulative`}</title>
            </g>
          ))}
        </svg>

        <div className="flex items-center justify-between text-[11px] text-[#68758C] px-2">
          {coords.map((c, i) => (
            <span key={i}>{c.date}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Personalized Welcome Banner & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            {stats?.isDemoData && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF] border border-[#315CFF]/15">
                Demo Sandbox Dataset
              </span>
            )}
          </div>
          <p className="text-sm text-[#68758C] mt-0.5">
            {user?.businessName} • Overview of verified PayPal Sandbox collections and open requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex bg-white border border-[#E7EAF1] rounded-xl p-1">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateRange === range
                    ? 'bg-[#315CFF] text-white shadow-2xs'
                    : 'text-[#68758C] hover:text-[#18243A]'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreatePayment}
            className="inline-flex items-center gap-1.5 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Payment</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Received Payments"
          value={`$${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          sublabel={`${stats?.totalTransactions || 0} verified completed transactions`}
          icon={DollarSign}
          accent="cobalt"
          trendBadge="Verified"
        />
        <StatCard
          label="Outstanding / Pending"
          value={`$${(stats?.pendingPayments || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          sublabel={`${stats?.overdueRequests || 0} overdue request(s) needing follow-up`}
          icon={Clock}
          accent="warning"
        />
        <StatCard
          label="Completed Payment Requests"
          value={stats?.completedRequests || 0}
          sublabel={`Out of ${requests.length} total created requests`}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Managed Clients"
          value={stats?.activeClients || 0}
          sublabel="Linked to payment requests & ledger"
          icon={Users}
          accent="cyan"
        />
      </div>

      {/* 3. Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ask AI Payment Agent', to: '/ai-agent', icon: Bot, color: 'text-[#315CFF] bg-[#EAF1FF]' },
          { label: 'Manage Requests', to: '/payments', icon: CreditCard, color: 'text-[#101C3A] bg-slate-100' },
          { label: 'View Clients CRM', to: '/clients', icon: Users, color: 'text-[#0E8CA0] bg-[#38C6D9]/15' },
          { label: 'Reports & CSV', to: '/reports', icon: FileSpreadsheet, color: 'text-[#16845B] bg-[#16845B]/12' },
        ].map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white rounded-2xl border border-[#E7EAF1] p-3.5 hover:border-[#315CFF]/35 hover:shadow-xs transition-all flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#18243A]">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 4. Revenue Chart + AI Shortcut & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E7EAF1] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#101C3A]">Cumulative Revenue Analytics</h2>
              <p className="text-xs text-[#68758C]">
                Plotted from verified PayPal Sandbox completed transactions
              </p>
            </div>
            <Link
              to="/insights"
              className="text-xs font-semibold text-[#315CFF] hover:underline inline-flex items-center gap-1"
            >
              <span>Deep Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {renderRevenueChart()}

          {/* Payment Status Breakdown */}
          <div className="pt-4 border-t border-[#E7EAF1] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#101C3A]">Payment Request Status Breakdown</span>
              <span className="text-[#68758C]">{requests.length} total requests</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              {(
                [
                  ['Completed', statusBreakdown.counts.COMPLETED, 'bg-[#16845B]'],
                  ['Pending', statusBreakdown.counts.PENDING, 'bg-[#D99027]'],
                  ['Overdue', statusBreakdown.counts.OVERDUE, 'bg-[#D94C57]'],
                  ['Draft', statusBreakdown.counts.DRAFT, 'bg-[#315CFF]'],
                  ['Cancelled', statusBreakdown.counts.CANCELLED, 'bg-[#68758C]'],
                ] as const
              ).map(([label, count, color]) => (
                <div key={label} className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#68758C]">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span>{label}</span>
                  </div>
                  <div className="text-base font-extrabold text-[#101C3A] mt-0.5 tabular-nums">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights + AI Shortcut */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#101C3A] text-white rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38C6D9]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#7ADCF0]">
                  AI Business Insights
                </span>
              </div>
              <button
                onClick={fetchInsights}
                disabled={insightsLoading}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Refresh insights"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {insightsSummary || 'Calculating real-time insights from your payment records...'}
            </p>
            <Link
              to="/insights"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ADCF0] hover:underline"
            >
              <span>View full AI breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7EAF1] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#315CFF]" />
                <span className="text-sm font-bold text-[#101C3A]">Quick AI Payment Agent</span>
              </div>
              <Link to="/ai-agent" className="text-[11px] font-semibold text-[#315CFF] hover:underline">
                Full Workspace
              </Link>
            </div>
            <p className="text-[11px] text-[#68758C]">
              Describe a new payment request or ask about your latest collections.
            </p>
            <form onSubmit={handleQuickAISend} className="flex gap-2">
              <input
                type="text"
                value={quickPrompt}
                onChange={e => setQuickPrompt(e.target.value)}
                placeholder="Bill John $250 for web dev..."
                className="flex-1 bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={quickSending || !quickPrompt.trim()}
                className="bg-[#315CFF] hover:bg-[#2347d6] text-white p-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                aria-label="Send to AI Agent"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            {quickReply && (
              <div className="p-3 rounded-xl bg-[#EAF1FF] text-[11px] text-[#101C3A] leading-relaxed">
                {quickReply}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions + Upcoming/Overdue Requests + Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Verified Transactions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7EAF1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#101C3A]">Recent Verified Transactions</h2>
              <p className="text-xs text-[#68758C]">Confirmed PayPal Sandbox captures</p>
            </div>
            <Link to="/transactions" className="text-xs font-semibold text-[#315CFF] hover:underline">
              View All →
            </Link>
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No transactions yet"
              description="Once a client completes checkout through a PayPal Sandbox link, verified transactions will appear here."
              actionLabel="Create Payment Request"
              onAction={onOpenCreatePayment}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E7EAF1] text-[#68758C]">
                    <th className="py-2.5 font-semibold">Client</th>
                    <th className="py-2.5 font-semibold">Description</th>
                    <th className="py-2.5 font-semibold">Amount</th>
                    <th className="py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF1]">
                  {filteredTransactions.slice(0, 6).map(t => (
                    <tr
                      key={t.id}
                      onClick={() => navigate('/transactions')}
                      className="hover:bg-[#FAFBFF] cursor-pointer transition-colors"
                    >
                      <td className="py-3 font-semibold text-[#18243A]">{t.clientName}</td>
                      <td className="py-3 text-[#68758C] truncate max-w-[180px]">{t.description}</td>
                      <td className="py-3 font-bold text-[#101C3A] tabular-nums">
                        {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `$${t.amount.toFixed(2)}`}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming / Overdue Requests & Recent Clients */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7EAF1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#101C3A]">Open & Overdue Requests</h2>
              <Link to="/payments" className="text-xs font-semibold text-[#315CFF] hover:underline">
                Manage →
              </Link>
            </div>

            {openRequests.length === 0 ? (
              <p className="text-xs text-[#68758C] py-4 text-center">
                No pending or overdue requests right now.
              </p>
            ) : (
              <div className="space-y-2.5">
                {openRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-[#FAFBFF] border border-[#E7EAF1] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#18243A] truncate">
                          {req.clientName}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="text-[11px] text-[#68758C] truncate mt-0.5">
                        {req.title} • Due {req.dueDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-[#101C3A] tabular-nums">
                        ${req.totalAmount.toFixed(2)}
                      </span>
                      <a
                        href={`/pay/${req.publicToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#EAF1FF] text-[#315CFF] hover:bg-[#dce7ff]"
                        title="Open public checkout"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E7EAF1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#101C3A]">Recent Clients</h2>
              <Link to="/clients" className="text-xs font-semibold text-[#315CFF] hover:underline">
                All Clients →
              </Link>
            </div>

            {clients.length === 0 ? (
              <p className="text-xs text-[#68758C] py-3 text-center">No clients added yet.</p>
            ) : (
              <div className="divide-y divide-[#E7EAF1]">
                {clients.slice(0, 4).map(c => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#18243A]">{c.name}</div>
                      <div className="text-[11px] text-[#68758C]">{c.email}</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#16845B]">${c.totalPaid.toFixed(2)} paid</div>
                      {c.pendingAmount > 0 && (
                        <div className="text-[11px] text-[#D99027]">
                          ${c.pendingAmount.toFixed(2)} pending
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
