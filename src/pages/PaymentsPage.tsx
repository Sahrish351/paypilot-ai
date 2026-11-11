import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  XCircle,
  Eye,
  CreditCard,
  Send,
} from 'lucide-react';
import { PaymentRequestItem } from '../types.ts';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.tsx';

interface PaymentsPageProps {
  onOpenCreatePayment: () => void;
  refreshSignal: number;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onOpenCreatePayment,
  refreshSignal,
}) => {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment-requests', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests, refreshSignal]);

  const counts = useMemo(() => {
    return {
      ALL: requests.length,
      PENDING: requests.filter(r => r.status === 'PENDING').length,
      OVERDUE: requests.filter(r => r.status === 'OVERDUE').length,
      COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
      CANCELLED: requests.filter(r => r.status === 'CANCELLED').length,
      DRAFT: requests.filter(r => r.status === 'DRAFT').length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      const q = searchQuery.toLowerCase();
      if (
        q &&
        !r.clientName.toLowerCase().includes(q) &&
        !r.requestNumber.toLowerCase().includes(q) &&
        !r.title.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (dateFrom && r.dueDate < dateFrom) return false;
      if (dateTo && r.dueDate > dateTo) return false;
      return true;
    });
  }, [requests, statusFilter, searchQuery, dateFrom, dateTo]);

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/pay/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleShareLink = async (req: PaymentRequestItem) => {
    const url = `${window.location.origin}/pay/${req.publicToken}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment Request ${req.requestNumber}`,
          text: `${req.title} — $${req.totalAmount.toFixed(2)} ${req.currency}`,
          url,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    handleCopyLink(req.publicToken);
  };

  const handleActivateDraft = async (id: string) => {
    await fetch(`/api/payment-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'PENDING' }),
    });
    loadRequests();
  };

  const executeCancel = async () => {
    if (!confirmCancelId) return;
    setActionLoading(true);
    try {
      await fetch(`/api/payment-requests/${confirmCancelId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      setConfirmCancelId(null);
      setSelectedRequest(null);
      loadRequests();
    } finally {
      setActionLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    setActionLoading(true);
    try {
      await fetch(`/api/payment-requests/${confirmDeleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setConfirmDeleteId(null);
      setSelectedRequest(null);
      loadRequests();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
            Payment Requests
          </h1>
          <p className="text-sm text-[#68758C] mt-0.5">
            Create, filter, share, and track payment requests across their complete lifecycle.
          </p>
        </div>

        <button
          onClick={onOpenCreatePayment}
          className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payment Request</span>
        </button>
      </div>

      {/* Overview Mini Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          [
            ['All Requests', counts.ALL, 'text-[#101C3A]'],
            ['Pending', counts.PENDING, 'text-[#D99027]'],
            ['Overdue', counts.OVERDUE, 'text-[#D94C57]'],
            ['Completed', counts.COMPLETED, 'text-[#16845B]'],
            ['Cancelled', counts.CANCELLED, 'text-[#68758C]'],
          ] as const
        ).map(([label, count, color]) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E7EAF1] p-4">
            <div className="text-[11px] font-medium text-[#68758C]">{label}</div>
            <div className={`text-2xl font-extrabold tabular-nums mt-1 ${color}`}>{count}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search + Date Range */}
      <div className="bg-white rounded-2xl border border-[#E7EAF1] p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED', 'DRAFT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#315CFF] text-white'
                  : 'bg-[#FAFBFF] text-[#68758C] hover:text-[#101C3A]'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({counts[tab]})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#68758C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search client, request #, or service..."
              className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            aria-label="Due date from"
            className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2 text-xs"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            aria-label="Due date to"
            className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No matching payment requests"
          description="Try clearing your filters or create a new payment request using the AI Payment Agent."
          actionLabel="Create Payment Request"
          onAction={onOpenCreatePayment}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7EAF1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBFF] border-b border-[#E7EAF1] text-[#68758C]">
                  <th className="p-4 font-semibold">Request</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1]">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-[#FAFBFF] transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-[11px] font-bold text-[#315CFF]">
                        {req.requestNumber}
                      </div>
                      <div className="font-semibold text-[#18243A] mt-0.5">{req.title}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#18243A]">{req.clientName}</div>
                      <div className="text-[11px] text-[#68758C]">{req.clientEmail}</div>
                    </td>
                    <td className="p-4 font-extrabold text-[#101C3A] tabular-nums">
                      ${req.totalAmount.toFixed(2)} {req.currency}
                    </td>
                    <td className="p-4 text-[#68758C]">{req.dueDate}</td>
                    <td className="p-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 rounded-lg text-[#68758C] hover:text-[#315CFF] hover:bg-[#EAF1FF] cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyLink(req.publicToken)}
                          className="p-2 rounded-lg text-[#68758C] hover:text-[#315CFF] hover:bg-[#EAF1FF] cursor-pointer"
                          title="Copy payment link"
                        >
                          {copiedToken === req.publicToken ? (
                            <Check className="w-4 h-4 text-[#16845B]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`/pay/${req.publicToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-[#68758C] hover:text-[#315CFF] hover:bg-[#EAF1FF]"
                          title="Open public checkout"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {(req.status === 'PENDING' || req.status === 'OVERDUE') && (
                          <button
                            onClick={() => setConfirmCancelId(req.id)}
                            className="p-2 rounded-lg text-[#68758C] hover:text-[#D94C57] hover:bg-[#D94C57]/10 cursor-pointer"
                            title="Cancel request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(req.status === 'DRAFT' || req.status === 'CANCELLED') && (
                          <button
                            onClick={() => setConfirmDeleteId(req.id)}
                            className="p-2 rounded-lg text-[#68758C] hover:text-[#D94C57] hover:bg-[#D94C57]/10 cursor-pointer"
                            title="Delete request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Request Details Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? `${selectedRequest.requestNumber} — ${selectedRequest.title}` : ''}
        subtitle={selectedRequest ? `Client: ${selectedRequest.clientName}` : ''}
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedRequest.status} />
              <span className="font-extrabold text-lg text-[#101C3A] tabular-nums">
                ${selectedRequest.totalAmount.toFixed(2)} {selectedRequest.currency}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFBFF] border border-[#E7EAF1] space-y-2">
              <div>
                <span className="text-[#68758C]">Client Email:</span>{' '}
                <strong className="text-[#18243A]">{selectedRequest.clientEmail || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[#68758C]">Due Date:</span>{' '}
                <strong className="text-[#18243A]">{selectedRequest.dueDate}</strong>
              </div>
              <div>
                <span className="text-[#68758C]">Description:</span>
                <p className="text-[#18243A] mt-1 leading-relaxed">{selectedRequest.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#101C3A]">Line Items</div>
              {selectedRequest.lineItems.map(li => (
                <div
                  key={li.id}
                  className="p-3 rounded-xl border border-[#E7EAF1] flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[#18243A]">{li.name}</div>
                    <div className="text-[11px] text-[#68758C]">
                      Qty {li.quantity} × ${li.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-bold text-[#101C3A] tabular-nums">
                    ${li.lineTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E7EAF1]">
              {selectedRequest.status === 'DRAFT' && (
                <button
                  onClick={() => {
                    handleActivateDraft(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="bg-[#315CFF] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Activate Request
                </button>
              )}
              <button
                onClick={() => handleShareLink(selectedRequest)}
                className="inline-flex items-center gap-1.5 bg-[#EAF1FF] text-[#315CFF] font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{copiedToken === selectedRequest.publicToken ? 'Link Copied' : 'Share Payment Link'}</span>
              </button>
              <a
                href={`/pay/${selectedRequest.publicToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#101C3A] text-white font-semibold px-4 py-2 rounded-xl"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(confirmCancelId)}
        onClose={() => setConfirmCancelId(null)}
        onConfirm={executeCancel}
        title="Cancel Payment Request"
        message="Cancelling this payment request will prevent the client from checking out via its link. You can still inspect or delete it afterward."
        confirmLabel="Cancel Request"
        danger
        loading={actionLoading}
      />

      <ConfirmationDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDelete}
        title="Delete Payment Request"
        message="This will permanently remove this draft or cancelled payment request from your workspace."
        confirmLabel="Delete Permanently"
        danger
        loading={actionLoading}
      />
    </div>
  );
};
