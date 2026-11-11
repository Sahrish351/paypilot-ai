import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Copy, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal.tsx';
import { PaymentRequestItem } from '../types.ts';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (req: PaymentRequestItem) => void;
  prefillClientName?: string;
  prefillClientEmail?: string;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  prefillClientName = '',
  prefillClientEmail = '',
}) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [clientName, setClientName] = useState(prefillClientName);
  const [clientEmail, setClientEmail] = useState(prefillClientEmail);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState<string>('250');
  const [quantity, setQuantity] = useState<string>('1');
  const [currency, setCurrency] = useState('USD');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdItem, setCreatedItem] = useState<PaymentRequestItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClientName(prefillClientName);
      setClientEmail(prefillClientEmail);
      setCreatedItem(null);
      setError(null);
      if (prefillClientName) setMode('manual');
    }
  }, [isOpen, prefillClientName, prefillClientEmail]);

  const handleAIExtract = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI extraction failed.');
      if (data.proposal) {
        setClientName(data.proposal.client_name || '');
        setClientEmail(data.proposal.client_email || '');
        setTitle(data.proposal.service_name || '');
        setDescription(data.proposal.description || '');
        setUnitPrice(String(data.proposal.unit_price || 250));
        setQuantity(String(data.proposal.quantity || 1));
        setCurrency(data.proposal.currency || 'USD');
        if (data.proposal.due_date) setDueDate(data.proposal.due_date);
        setMode('manual');
      } else {
        setError('Could not detect payment fields in that message. Try specifying client and amount.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setError(null);
    const priceNum = parseFloat(unitPrice);
    const qtyNum = parseInt(quantity, 10) || 1;
    if (!clientName.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          title: title.trim() || 'Professional Services',
          description: description.trim(),
          unitPrice: priceNum,
          quantity: qtyNum,
          currency,
          dueDate,
          status: asDraft ? 'DRAFT' : 'PENDING',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment request.');
      setCreatedItem(data.request);
      onCreated(data.request);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyUrl = () => {
    if (!createdItem) return;
    navigator.clipboard.writeText(`${window.location.origin}/pay/${createdItem.publicToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Payment Request"
      subtitle="Use natural language with AI or enter itemized details directly."
      maxWidthClass="max-w-xl"
    >
      {createdItem ? (
        <div className="space-y-5 text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-[#16845B]/12 text-[#16845B] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#101C3A]">
              {createdItem.requestNumber} Created
            </h3>
            <p className="text-xs text-[#68758C] mt-1">
              {createdItem.clientName} • ${createdItem.totalAmount.toFixed(2)} {createdItem.currency} • Status: {createdItem.status}
            </p>
          </div>

          <div className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-[#18243A] truncate">
              {window.location.origin}/pay/{createdItem.publicToken}
            </span>
            <button
              onClick={copyUrl}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#EAF1FF] text-[#315CFF] font-semibold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center pt-2">
            <a
              href={`/pay/${createdItem.publicToken}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#315CFF] text-white text-xs font-semibold px-4 py-2.5 rounded-xl"
            >
              <span>Open Checkout Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E7EAF1] text-xs font-semibold text-[#18243A] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAFBFF] rounded-xl border border-[#E7EAF1]">
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                mode === 'ai' ? 'bg-[#315CFF] text-white shadow-xs' : 'text-[#68758C]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Quick Fill</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === 'manual' ? 'bg-[#315CFF] text-white shadow-xs' : 'text-[#68758C]'
              }`}
            >
              Manual Details
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#D94C57]/10 border border-[#D94C57]/25 text-[#D94C57] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'ai' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EAF1FF] border border-[#315CFF]/15 text-xs text-[#101C3A] flex items-start gap-2.5">
                <Bot className="w-4 h-4 text-[#315CFF] shrink-0 mt-0.5" />
                <span>
                  Describe your payment request in plain English. You’ll review and confirm the extracted fields before creating the link.
                </span>
              </div>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder='e.g. "Bill Alex Morgan $450 for website redesign due in 7 days"'
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl p-3.5 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAIExtract}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{aiLoading ? 'Extracting details...' : 'Extract & Review Proposal'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={e => handleSubmit(e, false)} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#18243A] mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Website Development Milestone"
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#18243A] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Deliverables included in this payment request..."
                  className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Unit Price *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#18243A] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E7EAF1]">
                <div className="text-xs text-[#68758C]">
                  Total:{' '}
                  <span className="font-extrabold text-[#101C3A] text-sm">
                    ${((parseFloat(unitPrice) || 0) * (parseInt(quantity, 10) || 1)).toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={e => handleSubmit(e, true)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E7EAF1] font-semibold text-[#68758C] hover:bg-slate-50 cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2347d6] text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Payment Request'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};
