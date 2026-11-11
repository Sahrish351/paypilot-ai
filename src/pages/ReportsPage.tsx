import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileSpreadsheet, BarChart3, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { TransactionItem, PaymentRequestItem, ClientItem } from '../types.ts';
import { StatCard } from '../components/ui/StatCard.tsx';

export const ReportsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/payments', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/payment-requests', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/clients', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([t, r, c]) => {
        setTransactions(t.transactions || []);
        setRequests(r.requests || []);
        setClients(c.clients || []);
      })
      .catch(() => {});
  }, []);

  const filteredTxns = useMemo(() => {
    if (range === 'all') return transactions;
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const cutoff = Date.now() - days * 86400000;
    return transactions.filter(t => new Date(t.capturedAt || t.createdAt).getTime() >= cutoff);
  }, [transactions, range]);

  const completed = useMemo(
    () => filteredTxns.filter(t => t.status === 'Completed'),
    [filteredTxns]
  );
  const totalRevenue = useMemo(
    () => completed.reduce((sum, t) => sum + t.amount, 0),
    [completed]
  );
  const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

  const clientTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of completed) {
      map.set(t.clientName, (map.get(t.clientName) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [completed]);

  const maxClientVal = Math.max(...clientTotals.map(c => c[1]), 1);

  const exportCsv = (type: 'transactions' | 'requests' | 'clients') => {
    window.location.href = `/api/reports/export?type=${type}`;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
            Financial Reports & CSV Exports
          </h1>
          <p className="text-sm text-[#68758C] mt-0.5">
            Generate revenue, payment request, and client reports directly from verified ledger records.
          </p>
        </div>

        <div className="inline-flex bg-white border border-[#E7EAF1] rounded-xl p-1 self-start sm:self-auto">
          {(['7d', '30d', '90d', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                range === r ? 'bg-[#315CFF] text-white' : 'text-[#68758C]'
              }`}
            >
              {r === 'all' ? 'All Time' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Filtered Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          accent="cobalt"
        />
        <StatCard
          label="Verified Captures"
          value={completed.length}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Average Ticket"
          value={`$${avgTicket.toFixed(2)}`}
          icon={BarChart3}
          accent="cyan"
        />
        <StatCard
          label="Total Payment Requests"
          value={requests.length}
          icon={FileSpreadsheet}
          accent="navy"
        />
      </div>

      {/* Revenue by Client Chart */}
      <div className="bg-white rounded-2xl border border-[#E7EAF1] p-6 space-y-4">
        <h2 className="text-base font-bold text-[#101C3A]">Top Revenue by Client</h2>
        {clientTotals.length === 0 ? (
          <p className="text-xs text-[#68758C] py-6 text-center">
            No completed transactions in the selected period.
          </p>
        ) : (
          <div className="space-y-3">
            {clientTotals.map(([name, amt]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#18243A]">{name}</span>
                  <span className="font-bold text-[#315CFF] tabular-nums">
                    ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-3 bg-[#EAF1FF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#315CFF] rounded-full"
                    style={{ width: `${Math.round((amt / maxClientVal) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: 'Verified Transactions Ledger',
            desc: 'All PayPal Sandbox captures, order IDs, capture IDs, amounts, and timestamps.',
            count: `${transactions.length} record(s)`,
            type: 'transactions' as const,
            icon: BarChart3,
          },
          {
            title: 'Payment Requests Report',
            desc: 'Every request number, client, status (Pending, Overdue, Completed, Cancelled), and due date.',
            count: `${requests.length} request(s)`,
            type: 'requests' as const,
            icon: FileSpreadsheet,
          },
          {
            title: 'Client Billing Matrix',
            desc: 'Client contact details, lifetime paid amounts, open balances, and last payment date.',
            count: `${clients.length} client(s)`,
            type: 'clients' as const,
            icon: Users,
          },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.type}
              className="bg-white rounded-2xl border border-[#E7EAF1] p-6 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#68758C]">{card.count}</span>
                </div>
                <h3 className="text-base font-bold text-[#101C3A] pt-1">{card.title}</h3>
                <p className="text-xs text-[#68758C] leading-relaxed">{card.desc}</p>
              </div>
              <button
                onClick={() => exportCsv(card.type)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FAFBFF] hover:bg-[#EAF1FF] text-[#315CFF] border border-[#E7EAF1] font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
