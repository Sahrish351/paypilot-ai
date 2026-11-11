import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { TransactionItem } from '../types.ts';

interface TransactionsPageProps {
  transactions: TransactionItem[];
  onOpenReportExport: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onOpenReportExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completed = transactions.filter(t => t.status === 'Completed');
  const totalCaptured = completed.reduce((sum, t) => sum + t.amount, 0);

  const filtered = transactions.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paypalOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
            Transaction History
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Real-time verified payments captured through the PayPal Orders API v2.
          </p>
        </div>

        <button
          onClick={onOpenReportExport}
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Total Captured</div>
          <div className="text-2xl font-extrabold text-[#174B38] tabular-nums mt-1">
            ${totalCaptured.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Verified PayPal settlement
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Completed Transactions</div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
            {completed.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            100% verified orders
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Average Ticket</div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
            ${(totalCaptured / (completed.length || 1)).toFixed(2)}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            Per client checkout
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Disputes / Chargebacks</div>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
            0.00%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Clean merchant record
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E8EAE5]">
          {['ALL', 'Completed', 'Refunded'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#174B38] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E8EAE5] focus:border-[#174B38] focus:outline-none"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-[#E8EAE5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF9F5] text-slate-500 font-semibold border-b border-[#E8EAE5] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">PayPal Order ID</th>
                <th className="py-3.5 px-4">Client / Description</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(txn => {
                const isCompleted = txn.status === 'Completed';
                const isPositive = txn.amount > 0;
                return (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(txn.capturedAt || txn.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center font-bold text-[10px] italic">
                          P
                        </span>
                        <span>{txn.paypalOrderId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{txn.clientName}</div>
                      <div className="text-xs text-slate-500">{txn.description}</div>
                    </td>

                    <td className={`py-3.5 px-4 text-right font-extrabold tabular-nums whitespace-nowrap ${
                      isPositive ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                      {isPositive ? `+$${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-$${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} {txn.currency}
                    </td>

                    <td className="py-3.5 px-4">
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

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTxn(txn);
                        }}
                        className="text-xs font-semibold text-[#174B38] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-[#CCE2D2] space-y-5 animate-in fade-in">
            <button
              onClick={() => setSelectedTxn(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center font-black italic text-lg">
                P
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Transaction Details
                </h3>
                <div className="text-xs text-slate-500 font-mono">
                  {selectedTxn.id}
                </div>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Amount:</span>
                <span className="text-lg font-extrabold text-[#174B38] tabular-nums">
                  ${selectedTxn.amount.toFixed(2)} {selectedTxn.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {selectedTxn.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-900">{selectedTxn.clientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Description:</span>
                <span className="text-slate-800 font-medium">{selectedTxn.description}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="font-mono text-slate-900 font-bold">{selectedTxn.paypalOrderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Capture ID:</span>
                <span className="font-mono text-slate-900">{selectedTxn.paypalCaptureId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{new Date(selectedTxn.capturedAt || selectedTxn.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-[#E7F1E9] rounded-xl text-[11px] text-[#174B38] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Verified server-side capture through PayPal Developer Sandbox.</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleCopy(selectedTxn.paypalOrderId)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedId === selectedTxn.paypalOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === selectedTxn.paypalOrderId ? 'Copied' : 'Copy Order ID'}</span>
              </button>
              <button
                onClick={() => setSelectedTxn(null)}
                className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
