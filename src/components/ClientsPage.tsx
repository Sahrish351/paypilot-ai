import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Building,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  CreditCard,
} from 'lucide-react';
import { ClientItem } from '../types.ts';

interface ClientsPageProps {
  clients: ClientItem[];
  onRefresh: () => void;
  onSelectClientForPayment: (client: ClientItem) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  onRefresh,
  onSelectClientForPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    setSaving(true);
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      setShowAddModal(false);
      setNewClient({ name: '', email: '', company: '', notes: '' });
      onRefresh();
    } catch (err) {
      console.warn(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
            Client Directory
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Manage client profiles, lifetime payment totals, and pending payment collections.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E8EAE5] focus:border-[#174B38] focus:outline-none"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map(c => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between hover:border-[#CCE2D2] transition-all group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-[#E7F1E9] text-[#174B38] flex items-center justify-center font-bold text-sm">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button
                  onClick={() => onSelectClientForPayment(c)}
                  className="text-[11px] font-bold text-[#174B38] hover:underline flex items-center gap-1 bg-[#FAF9F5] px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  <CreditCard className="w-3 h-3 text-[#10B981]" />
                  <span>Bill Client</span>
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building className="w-3 h-3" />
                  <span>{c.company}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
              </div>

              {c.notes && (
                <p className="text-[11px] text-slate-500 bg-[#FAF9F5] p-2 rounded-lg mt-3 italic line-clamp-2">
                  "{c.notes}"
                </p>
              )}
            </div>

            {/* Financial Totals */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</span>
                <div className="font-bold text-emerald-700 tabular-nums">
                  ${c.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending</span>
                <div className="font-bold text-amber-700 tabular-nums">
                  ${c.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#CCE2D2] space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Add New Client</h3>
            <p className="text-xs text-slate-500">
              Save client details to simplify future AI-generated payment requests.
            </p>

            <form onSubmit={handleAddClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="alex@northstardigital.io"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Northstar Digital"
                  value={newClient.company}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Deliverables, payment preferences, etc."
                  value={newClient.notes}
                  onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newClient.name}
                  className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-2 rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
