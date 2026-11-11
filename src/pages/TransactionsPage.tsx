import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { TransactionItem } from '../types.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { StatCard } from '../components/ui/StatCard.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.tsx';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/payments', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTransactions(d.transactions || []))
      .finally(() => setLoading(false));
  }, []);

  const completed = useMemo(
    () => transactions.filter(t => t.status === 'Completed'),
    [transactions]
  );
  const totalCaptured = useMemo(
    () => completed.reduce((sum, t) => sum + t.amount, 0),
    [completed]
  );
  const refundedCount = useMemo(
    () => transactions.filter(t => t.status === 'Refunded').length,
    [transactions]
  );

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      const q = searchQuery.toLowerCase();
      if (
        q &&
        !t.clientName.toLowerCase().includes(q) &&
        !t.id.toLowerCase().includes(q) &&
        !t.paypalOrderId.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      const txnDate = (t.capturedAt || t.createdAt).split('T')[0];
      if (dateFrom && txnDate < dateFrom) return false;
      if (dateTo && txnDate > dateTo) return false;
      return true;
    });
  }, [transactions, statusFilter, searchQuery, dateFrom, dateTo]);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(val);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    window.location.href = '/api/reports/export?type=transactions';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
            Verified Transactions
          </h1>
          <p className="text-sm text-[#68758C] mt-0.5">
            Settled PayPal Sandbox captures strictly separated from open payment requests.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-white hover:bg-[#EAF1FF] text-[#101C3A] border border-[#E7EAF1] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#315CFF]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Verified Captured"
          value={`$${totalCaptured.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          sublabel="PayPal Sandbox verified captures"
          icon={ShieldCheck}
          accent="cobalt"
        />
        <StatCard
          label="Completed Transactions"
          value={completed.length}
          sublabel="Confirmed by backend capture check"
          icon={CreditCard}
          accent="success"
        />
        <StatCard
          label="Average Ticket"
          value={`$${(completed.length > 0 ? totalCaptured / completed.length : 0).toFixed(2)}`}
          sublabel="Mean verified payment size"
          icon={CreditCard}
          accent="cyan"
        />
        <StatCard
          label="Refunded Entries"
          value={refundedCount}
          sublabel="Adjusted ledger items"
          icon={CreditCard}
          accent="navy"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E7EAF1] p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[#68758C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client, Transaction ID, or PayPal Order ID..."
            className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2 text-xs font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Refunded">Refunded</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            aria-label="From date"
            className="w-1/2 bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-2.5 py-2 text-xs"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            aria-label="To date"
            className="w-1/2 bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-2.5 py-2 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No verified transactions found"
          description="Transactions appear here only after a PayPal Sandbox order is captured and verified on the backend."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7EAF1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBFF] border-b border-[#E7EAF1] text-[#68758C]">
                  <th className="p-4 font-semibold">Transaction ID</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Payment Date</th>
                  <th className="p-4 font-semibold">Method</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1]">
                {filtered.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTxn(t)}
                    className="hover:bg-[#FAFBFF] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-mono font-bold text-[#315CFF]">{t.id}</div>
                      <div className="text-[11px] text-[#68758C] font-mono">Order: {t.paypalOrderId}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#18243A]">{t.clientName}</div>
                      <div className="text-[11px] text-[#68758C]">{t.description}</div>
                    </td>
                    <td className="p-4 font-extrabold text-[#101C3A] tabular-nums">
                      {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `$${t.amount.toFixed(2)}`}{' '}
                      {t.currency}
                    </td>
                    <td className="p-4 text-[#68758C]">
                      {new Date(t.capturedAt || t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-[#18243A] font-medium">PayPal Sandbox</td>
                    <td className="p-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTxn(t);
                        }}
                        className="p-2 rounded-lg text-[#68758C] hover:text-[#315CFF] hover:bg-[#EAF1FF] cursor-pointer"
                        aria-label="Inspect transaction"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <Modal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        title="Verified Transaction Receipt"
        subtitle={selectedTxn?.id}
      >
        {selectedTxn && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#EAF1FF] border border-[#315CFF]/20 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#315CFF] font-semibold">Captured Amount</div>
                <div className="text-2xl font-extrabold text-[#101C3A] tabular-nums mt-0.5">
                  ${selectedTxn.amount.toFixed(2)} {selectedTxn.currency}
                </div>
              </div>
              <StatusBadge status={selectedTxn.status} />
            </div>

            <div className="space-y-2.5 bg-[#FAFBFF] border border-[#E7EAF1] rounded-2xl p-4">
              {[
                ['Client', selectedTxn.clientName],
                ['Client Email', selectedTxn.clientEmail || 'N/A'],
                ['Description', selectedTxn.description],
                ['Payment Method', 'PayPal Sandbox (Orders API v2)'],
                ['Captured At', new Date(selectedTxn.capturedAt || selectedTxn.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-[#68758C]">{k}</span>
                  <span className="font-semibold text-[#18243A] text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                ['PayPal Order ID', selectedTxn.paypalOrderId],
                ['PayPal Capture ID', selectedTxn.paypalCaptureId],
                ['Verification Reference', selectedTxn.captureReference || 'VERIFIED'],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="p-3 rounded-xl border border-[#E7EAF1] flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[10px] text-[#68758C]">{label}</div>
                    <div className="font-mono font-semibold text-[#101C3A]">{val}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(val)}
                    className="p-1.5 rounded-lg bg-[#EAF1FF] text-[#315CFF] cursor-pointer"
                    title="Copy ID"
                  >
                    {copiedId === val ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
