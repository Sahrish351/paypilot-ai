import React, { useState } from 'react';
import {
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Bot,
  Send,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { DashboardStats, TransactionItem, PaymentRequestItem } from '../types.ts';

interface DashboardViewProps {
  stats: DashboardStats;
  transactions: TransactionItem[];
  paymentRequests: PaymentRequestItem[];
  onNavigateToAI: (initialPrompt?: string) => void;
  onNavigateToPayments: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToAnalytics: () => void;
  onSelectTransaction: (txn: TransactionItem) => void;
  onOpenCreatePayment: () => void;
  onSendChatMessage: (msg: string) => Promise<any>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  transactions,
  paymentRequests,
  onNavigateToAI,
  onNavigateToPayments,
  onNavigateToTransactions,
  onNavigateToAnalytics,
  onSelectTransaction,
  onOpenCreatePayment,
  onSendChatMessage,
}) => {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [revenueRange, setRevenueRange] = useState('This Month');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [widgetMessages, setWidgetMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string; proposal?: any }>>([
    {
      role: 'assistant',
      text: "Hello! I'm your PayPilot AI assistant. How can I help you today?",
    },
  ]);

  const handleWidgetSend = async (messageToSend?: string) => {
    const text = messageToSend || chatInput;
    if (!text.trim() || isSending) return;

    setWidgetMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsSending(true);

    try {
      const res = await onSendChatMessage(text);
      if (res && res.message) {
        setWidgetMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: res.message,
            proposal: res.proposal,
          },
        ]);
      }
    } catch (e) {
      setWidgetMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I've noted that! You can review and finalize your payment requests in the full AI Assistant workspace.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Sparkline SVG helper
  const renderSparkline = (points: number[], strokeColor: string, fillColor: string) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 120;
    const height = 36;

    const pathData = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 8) - 4;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const fillData = `${pathData} L ${width} ${height} L 0 ${height} Z`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path d={fillData} fill={fillColor} />
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome Header Banner matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight flex items-center gap-2">
            <span>Welcome back, John!</span>
            <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Date filter dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-[#E8EAE5] text-xs font-semibold text-[#1E2924] pl-3.5 pr-8 py-2 rounded-xl shadow-sm focus:outline-none focus:border-[#174B38] cursor-pointer"
            >
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards with Sparklines matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between hover:border-[#CCE2D2] transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center font-black italic text-base">
              P
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <span>{stats.revenueChange}</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-[#78847D]">
              Total Revenue
            </div>
            <div className="text-2xl font-extrabold text-[#1E2924] tabular-nums tracking-tight mt-0.5">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-50 flex items-end justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Verified PayPal</span>
            {renderSparkline([2000, 3100, 2800, 4900, 6200, 8100, 12750], '#10B981', 'rgba(16, 185, 129, 0.08)')}
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between hover:border-[#CCE2D2] transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
              <span>{stats.transactionsChange}</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-[#78847D]">
              Total Transactions
            </div>
            <div className="text-2xl font-extrabold text-[#1E2924] tabular-nums tracking-tight mt-0.5">
              {stats.totalTransactions}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-50 flex items-end justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Settled orders</span>
            {renderSparkline([120, 145, 160, 190, 210, 235, 248], '#3B82F6', 'rgba(59, 130, 246, 0.08)')}
          </div>
        </div>

        {/* Card 3: Active Clients */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between hover:border-[#CCE2D2] transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-purple-600 flex items-center gap-0.5">
              <span>{stats.clientsChange}</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-[#78847D]">
              Active Clients
            </div>
            <div className="text-2xl font-extrabold text-[#1E2924] tabular-nums tracking-tight mt-0.5">
              {stats.activeClients}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-50 flex items-end justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Billed businesses</span>
            {renderSparkline([80, 95, 105, 118, 128, 136, 142], '#8B5CF6', 'rgba(139, 92, 246, 0.08)')}
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between hover:border-[#CCE2D2] transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
              <span>{stats.pendingChange}</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-[#78847D]">
              Pending Payments
            </div>
            <div className="text-2xl font-extrabold text-[#1E2924] tabular-nums tracking-tight mt-0.5">
              ${stats.pendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-50 flex items-end justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Active invoices</span>
            {renderSparkline([1200, 1600, 1400, 1900, 2100, 2250, 2320], '#F59E0B', 'rgba(245, 158, 11, 0.08)')}
          </div>
        </div>
      </div>

      {/* 3. Main Center Grid (Revenue Overview + Transactions on Left, AI Assistant + Pro on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Revenue Overview Chart & Recent Transactions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#1E2924]">
                  Revenue Overview
                </h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#174B38] tabular-nums">
                    ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    ↑ {stats.revenueChange} vs last month
                  </span>
                </div>
              </div>

              {/* Selector */}
              <div className="relative">
                <select
                  value={revenueRange}
                  onChange={e => setRevenueRange(e.target.value)}
                  className="appearance-none bg-[#FAF9F5] border border-[#E8EAE5] text-xs font-semibold text-[#1E2924] pl-3 pr-7 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option>This Month</option>
                  <option>Quarter 1</option>
                  <option>Full Year</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Area Chart matching screenshot */}
            <div className="mt-6 relative">
              {/* Highlight Pin at Apr 22 ($8,250) matching reference screenshot */}
              <div className="absolute top-[32%] left-[72%] -translate-x-1/2 -translate-y-full z-10 hidden sm:flex flex-col items-center pointer-events-none">
                <div className="bg-[#174B38] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap">
                  $8,250
                </div>
                <div className="w-2 h-2 bg-[#174B38] rotate-45 -mt-1" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-white shadow mt-0.5" />
              </div>

              {/* High-res responsive SVG Chart with gradient fill */}
              <div className="w-full h-56 sm:h-64">
                <svg viewBox="0 0 700 220" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="revenueGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid guide lines */}
                  <line x1="45" y1="20" x2="685" y2="20" stroke="#F1F3EE" strokeDasharray="3 3" />
                  <text x="35" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">10k</text>

                  <line x1="45" y1="60" x2="685" y2="60" stroke="#F1F3EE" strokeDasharray="3 3" />
                  <text x="35" y="64" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">8k</text>

                  <line x1="45" y1="100" x2="685" y2="100" stroke="#F1F3EE" strokeDasharray="3 3" />
                  <text x="35" y="104" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">6k</text>

                  <line x1="45" y1="140" x2="685" y2="140" stroke="#F1F3EE" strokeDasharray="3 3" />
                  <text x="35" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">4k</text>

                  <line x1="45" y1="180" x2="685" y2="180" stroke="#F1F3EE" strokeDasharray="3 3" />
                  <text x="35" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">2k</text>

                  <line x1="45" y1="205" x2="685" y2="205" stroke="#E2E8F0" />
                  <text x="35" y="208" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>

                  {/* Area fill path */}
                  <path
                    d="M 50 170 
                       C 90 160, 110 140, 140 145 
                       C 180 150, 200 120, 230 115 
                       C 270 110, 310 135, 350 125 
                       C 390 115, 430 90, 460 85 
                       C 490 80, 500 70, 520 65 
                       C 550 60, 580 90, 610 80 
                       C 640 70, 660 35, 680 15 
                       L 680 205 L 50 205 Z"
                    fill="url(#revenueGreenGrad)"
                  />

                  {/* Stroke curve line */}
                  <path
                    d="M 50 170 
                       C 90 160, 110 140, 140 145 
                       C 180 150, 200 120, 230 115 
                       C 270 110, 310 135, 350 125 
                       C 390 115, 430 90, 460 85 
                       C 490 80, 500 70, 520 65 
                       C 550 60, 580 90, 610 80 
                       C 640 70, 660 35, 680 15"
                    fill="none"
                    stroke="#174B38"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* X-axis date labels matching screenshot */}
                  <text x="50" y="220" textAnchor="middle" className="text-[11px] fill-slate-500 font-medium">Apr 1</text>
                  <text x="200" y="220" textAnchor="middle" className="text-[11px] fill-slate-500 font-medium">Apr 8</text>
                  <text x="360" y="220" textAnchor="middle" className="text-[11px] fill-slate-500 font-medium">Apr 15</text>
                  <text x="520" y="220" textAnchor="middle" className="text-[11px] fill-slate-500 font-medium font-bold fill-[#174B38]">Apr 22</text>
                  <text x="670" y="220" textAnchor="middle" className="text-[11px] fill-slate-500 font-medium">Apr 30</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Recent Transactions Card matching reference screenshot */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#1E2924]">
                Recent Transactions
              </h2>
              <button
                onClick={onNavigateToTransactions}
                className="text-xs font-semibold text-[#174B38] hover:text-[#287052] flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-[#78847D] border-b border-slate-100 font-medium text-[11px]">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 4).map(txn => {
                    const isCompleted = txn.status === 'Completed';
                    const isPositive = txn.amount > 0;
                    return (
                      <tr
                        key={txn.id}
                        onClick={() => onSelectTransaction(txn)}
                        className="hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                      >
                        {/* Date with PayPal icon */}
                        <td className="py-3.5 px-2 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center font-bold italic text-xs shrink-0">
                              P
                            </span>
                            <span className="font-medium text-slate-700">
                              {txn.capturedAt ? new Date(txn.capturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Apr 30, 2025'}
                            </span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-2 font-medium text-slate-900">
                          {txn.description}
                        </td>

                        {/* Amount */}
                        <td className={`py-3.5 px-2 text-right font-bold tabular-nums whitespace-nowrap ${
                          isPositive ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {isPositive ? `+$${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-$${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-2 text-right">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-[#E7F1E9] text-[#174B38]'
                                : 'bg-[#FEF3C7] text-[#D97706]'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): AI Payment Assistant & Grow Your Business Banner */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Payment Assistant Card matching screenshot */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E2924]">
                      AI Payment Assistant
                    </h3>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#10B981]" />
                      <span>Gemini 3.8 Flash • Real-time</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToAI()}
                  className="text-[11px] font-semibold text-[#174B38] hover:underline"
                >
                  Expand
                </button>
              </div>

              {/* Chat Message Scroll */}
              <div className="py-4 space-y-3 max-h-56 overflow-y-auto">
                {widgetMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#E7F1E9] text-[#174B38] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-[#10B981]" />
                      </div>
                    )}
                    <div
                      className={`text-xs p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#174B38] text-white rounded-tr-none'
                          : 'bg-[#F2F1EC] text-[#1E2924] rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.text}

                      {/* Proposal Action if returned */}
                      {msg.proposal && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200">
                          <div className="font-bold text-[#174B38]">
                            Proposal for {msg.proposal.client_name}: ${msg.proposal.total_amount}
                          </div>
                          <button
                            onClick={() => onNavigateToAI()}
                            className="mt-1.5 w-full bg-[#174B38] text-white py-1.5 rounded-lg text-center font-bold text-[11px] hover:bg-[#11382A]"
                          >
                            Review & Create Checkout →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested quick prompt buttons matching screenshot */}
              <div className="pt-2 pb-3 space-y-1.5">
                <button
                  onClick={() => handleWidgetSend('Create a payment link for Alex for $450 due in 7 days')}
                  className="w-full text-left text-xs bg-[#FAF9F5] hover:bg-[#E7F1E9] text-[#174B38] px-3 py-2 rounded-xl border border-[#CCE2D2] transition-colors cursor-pointer font-medium"
                >
                  Create a payment link
                </button>
                <button
                  onClick={() => handleWidgetSend('Check my latest transactions')}
                  className="w-full text-left text-xs bg-[#FAF9F5] hover:bg-[#E7F1E9] text-[#174B38] px-3 py-2 rounded-xl border border-[#CCE2D2] transition-colors cursor-pointer font-medium"
                >
                  Check my latest transactions
                </button>
                <button
                  onClick={() => handleWidgetSend('Show business revenue insights')}
                  className="w-full text-left text-xs bg-[#FAF9F5] hover:bg-[#E7F1E9] text-[#174B38] px-3 py-2 rounded-xl border border-[#CCE2D2] transition-colors cursor-pointer font-medium"
                >
                  Show business insights
                </button>
              </div>
            </div>

            {/* Input field matching screenshot */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleWidgetSend();
              }}
              className="pt-2 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-[#F2F1EC] text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#174B38] focus:bg-white focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSending}
                className="w-9 h-9 rounded-xl bg-[#174B38] hover:bg-[#11382A] text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>

          {/* "Grow Your Business with PayPilot AI" Card matching screenshot */}
          <div className="bg-[#E7F1E9] rounded-2xl overflow-hidden border border-[#CCE2D2] shadow-xs relative">
            <div className="p-5 pb-0">
              <h3 className="text-base font-extrabold text-[#174B38] leading-tight">
                Grow Your Business with PayPilot AI
              </h3>
              <p className="text-xs text-[#52635B] mt-1 leading-snug">
                Unlock more features and maximize your potential.
              </p>
              <button
                onClick={() => onNavigateToPayments()}
                className="mt-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Entrepreneur photo in card matching screenshot */}
            <div className="mt-3 px-4">
              <img
                src="/src/assets/images/dashboard_entrepreneur_laptop_1794391938348.jpg"
                alt="Entrepreneur scaling business with PayPilot AI"
                className="w-full h-36 object-cover rounded-t-xl object-top shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Integrations Bar matching reference screenshot */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8EAE5] text-center space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#1E2924]">
            Powerful Integrations. Endless Possibilities.
          </h3>
          <p className="text-xs sm:text-sm text-[#55635B] mt-0.5">
            Connect with PayPal and leverage the power of AI to build something amazing.
          </p>
        </div>

        {/* Partner Logos strip */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-slate-700 opacity-90">
          {/* PayPal */}
          <div className="flex items-center gap-1.5 font-extrabold text-[#003087] text-lg">
            <CreditCard className="w-5 h-5 text-[#0079C1]" />
            <span className="italic tracking-tight">PayPal</span>
          </div>

          {/* OpenAI */}
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
            <Bot className="w-4 h-4 text-slate-900" />
            <span>OpenAI</span>
          </div>

          {/* Google Gemini */}
          <div className="flex items-center gap-1.5 font-bold text-blue-600 text-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Google Gemini</span>
          </div>

          {/* Anthropic */}
          <div className="flex items-center gap-1.5 font-medium text-amber-800 text-sm">
            <span className="font-serif font-bold text-base">✳</span>
            <span>Anthropic</span>
          </div>

          {/* Midjourney */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700 text-sm">
            <span>⛵</span>
            <span>Midjourney</span>
          </div>

          {/* Google Cloud */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700 text-sm">
            <span>☁</span>
            <span>Google Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
