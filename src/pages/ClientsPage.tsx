import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Building2,
  Edit2,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { ClientItem, PaymentRequestItem, TransactionItem } from '../types.ts';
import { StatCard } from '../components/ui/StatCard.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.tsx';

interface ClientsPageProps {
  onCreatePaymentForClient: (client: ClientItem) => void;
  refreshSignal: number;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  onCreatePaymentForClient,
  refreshSignal,
}) => {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', company: '', notes: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Client Details drawer/modal
  const [detailData, setDetailData] = useState<{
    client: ClientItem;
    requests: PaymentRequestItem[];
    transactions: TransactionItem[];
  } | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ClientItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients', { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setClients(d.clients || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients, refreshSignal]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const totals = useMemo(() => {
    return {
      totalPaid: clients.reduce((s, c) => s + c.totalPaid, 0),
      totalPending: clients.reduce((s, c) => s + c.pendingAmount, 0),
    };
  }, [clients]);

  const openAddModal = () => {
    setEditingClient(null);
    setFormState({ name: '', email: '', company: '', notes: '' });
    setFormError(null);
    setFormModalOpen(true);
  };

  const openEditModal = (c: ClientItem) => {
    setEditingClient(c);
    setFormState({
      name: c.name,
      email: c.email,
      company: c.company,
      notes: c.notes || '',
    });
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formState.name.trim()) {
      setFormError('Client name is required.');
      return;
    }
    setSaving(true);
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save client.');
      setFormModalOpen(false);
      loadClients();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openClientDetail = async (c: ClientItem) => {
    const res = await fetch(`/api/clients/${c.id}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setDetailData(data);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/clients/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete client.');
      setDeleteTarget(null);
      loadClients();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
            Client Directory
          </h1>
          <p className="text-sm text-[#68758C] mt-0.5">
            Manage client profiles, lifetime collected totals, and client-specific payment histories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Clients" value={clients.length} icon={Users} accent="cobalt" />
        <StatCard
          label="Lifetime Paid by Clients"
          value={`$${totals.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          accent="success"
        />
        <StatCard
          label="Outstanding Client Balances"
          value={`$${totals.totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Clock}
          accent="warning"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search clients by name, company, or email..."
          className="w-full bg-white border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
        />
      </div>

      {deleteError && (
        <div className="p-3.5 rounded-xl bg-[#D94C57]/10 border border-[#D94C57]/25 text-[#D94C57] text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Client Cards */}
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Add a client profile to track payment requests, balances, and verified transactions."
          actionLabel="Add First Client"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#E7EAF1] p-5 shadow-xs hover:border-[#315CFF]/35 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#101C3A]">{c.name}</h3>
                    <div className="text-xs text-[#68758C] flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{c.company}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-[#68758C] hover:text-[#315CFF] hover:bg-[#EAF1FF] cursor-pointer"
                      title="Edit client"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(c);
                      }}
                      className="p-1.5 rounded-lg text-[#68758C] hover:text-[#D94C57] hover:bg-[#D94C57]/10 cursor-pointer"
                      title="Delete client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#68758C] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#315CFF]" />
                  <span className="truncate">{c.email}</span>
                </div>

                {c.notes && (
                  <p className="text-[11px] text-[#68758C] bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl p-2.5 line-clamp-2">
                    {c.notes}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#16845B]/8">
                    <div className="text-[10px] text-[#16845B] font-semibold">Total Paid</div>
                    <div className="font-extrabold text-[#101C3A] tabular-nums">
                      ${c.totalPaid.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#D99027]/10">
                    <div className="text-[10px] text-[#B47315] font-semibold">Outstanding</div>
                    <div className="font-extrabold text-[#101C3A] tabular-nums">
                      ${c.pendingAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#E7EAF1]">
                <button
                  onClick={() => openClientDetail(c)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FAFBFF] hover:bg-[#EAF1FF] text-[#101C3A] border border-[#E7EAF1] text-xs font-semibold py-2 rounded-xl cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => onCreatePaymentForClient(c)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-semibold py-2 rounded-xl cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bill Client</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingClient ? `Edit Client: ${editingClient.name}` : 'Add New Client'}
      >
        <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-[#D94C57]/10 text-[#D94C57] font-medium">
              {formError}
            </div>
          )}
          <div>
            <label className="block font-semibold text-[#18243A] mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formState.name}
              onChange={e => setFormState({ ...formState, name: e.target.value })}
              className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#315CFF]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18243A] mb-1">Email Address</label>
            <input
              type="email"
              value={formState.email}
              onChange={e => setFormState({ ...formState, email: e.target.value })}
              className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#315CFF]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18243A] mb-1">Company</label>
            <input
              type="text"
              value={formState.company}
              onChange={e => setFormState({ ...formState, company: e.target.value })}
              className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#315CFF]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#18243A] mb-1">Notes</label>
            <textarea
              rows={2}
              value={formState.notes}
              onChange={e => setFormState({ ...formState, notes: e.target.value })}
              className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#315CFF]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[#68758C] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#315CFF] text-white font-bold cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingClient ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Client History Detail Modal */}
      <Modal
        isOpen={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title={detailData?.client.name || 'Client Details'}
        subtitle={`${detailData?.client.company || ''} • ${detailData?.client.email || ''}`}
        maxWidthClass="max-w-2xl"
      >
        {detailData && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FAFBFF] border border-[#E7EAF1]">
                <div className="text-[#68758C]">Requests</div>
                <div className="text-lg font-extrabold text-[#101C3A]">{detailData.requests.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#16845B]/10">
                <div className="text-[#16845B]">Total Paid</div>
                <div className="text-lg font-extrabold text-[#101C3A]">
                  ${detailData.client.totalPaid.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#D99027]/12">
                <div className="text-[#B47315]">Outstanding</div>
                <div className="text-lg font-extrabold text-[#101C3A]">
                  ${detailData.client.pendingAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-[#101C3A]">Payment Requests ({detailData.requests.length})</h3>
              {detailData.requests.length === 0 ? (
                <p className="text-[#68758C]">No payment requests for this client yet.</p>
              ) : (
                detailData.requests.map(r => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-[#E7EAF1] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#18243A]">
                        {r.requestNumber} • {r.title}
                      </div>
                      <div className="text-[11px] text-[#68758C]">Due {r.dueDate}</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#101C3A] tabular-nums">
                        ${r.totalAmount.toFixed(2)}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-[#101C3A]">
                Verified Transactions ({detailData.transactions.length})
              </h3>
              {detailData.transactions.length === 0 ? (
                <p className="text-[#68758C]">No verified transactions recorded for this client.</p>
              ) : (
                detailData.transactions.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-[#E7EAF1] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#18243A]">{t.description}</div>
                      <div className="text-[11px] font-mono text-[#68758C]">
                        Order {t.paypalOrderId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#16845B] tabular-nums">
                        ${t.amount.toFixed(2)}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Client Profile"
        message={`Are you sure you want to remove ${deleteTarget?.name || 'this client'}? Clients with active payment requests cannot be deleted until those requests are cancelled.`}
        confirmLabel="Delete Client"
        danger
        loading={deleting}
      />
    </div>
  );
};
