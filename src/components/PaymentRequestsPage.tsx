import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Calendar,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { PaymentRequestItem } from '../types.ts';

interface PaymentRequestsPageProps {
  requests: PaymentRequestItem[];
  onOpenCreateModal: () => void;
  onOpenCheckout: (token: string) => void;
  onOpenFollowUp: (req: PaymentRequestItem) => void;
  onRefresh: () => void;
}

export const PaymentRequestsPage: React.FC<PaymentRequestsPageProps> = ({
  requests,
  onOpenCreateModal,
  onOpenCheckout,
  onOpenFollowUp,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/pay/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this payment request?')) return;
    try {
      await fetch(`/api/payment-requests/${id}/cancel`, { method: 'POST' });
      onRefresh();
    } catch (e) {
      console.warn(e);
    }
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    draft: requests.filter(r => r.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
            Payment Requests
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Create, manage and track every client payment request and PayPal checkout in one place.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payment Request</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status segment buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E8EAE5]">
          {[
            { id: 'ALL', label: `All (${counts.all})` },
            { id: 'PENDING', label: `Pending (${counts.pending})` },
            { id: 'COMPLETED', label: `Paid (${counts.completed})` },
            { id: 'DRAFT', label: `Drafts (${counts.draft})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#174B38] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or #"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E8EAE5] focus:border-[#174B38] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8EAE5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF9F5] text-slate-500 font-semibold border-b border-[#E8EAE5] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No payment requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(r => {
                  const isPaid = r.status === 'COMPLETED';
                  const isPending = r.status === 'PENDING';
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FAF9F5] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {r.requestNumber}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {r.clientName}
                        {r.clientEmail && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {r.clientEmail}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs truncate">
                        {r.title}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-[#174B38] tabular-nums whitespace-nowrap">
                        ${r.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {r.currency}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {r.dueDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-[#E7F1E9] text-[#174B38]'
                              : isPending
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(r.publicToken)}
                            title="Copy Public Payment Link"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedToken === r.publicToken ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => onOpenCheckout(r.publicToken)}
                            title="Open Customer Checkout Page"
                            className="p-1.5 text-[#174B38] hover:bg-[#E7F1E9] rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <button
                              onClick={() => onOpenFollowUp(r)}
                              title="Generate AI Reminder"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {!isPaid && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              title="Cancel Request"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
