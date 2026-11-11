import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
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
  if (!isOpen) return null;

  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState(prefillClientName || '');
  const [clientEmail, setClientEmail] = useState(prefillClientEmail || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(450);
  const [quantity, setQuantity] = useState<number>(1);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdItem, setCreatedItem] = useState<PaymentRequestItem | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Assistant auto-fill
  const handleAIExtract = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiPrompt }),
      });
      const data = await res.json();
      if (data.proposal) {
        setClientName(data.proposal.client_name || '');
        setClientEmail(data.proposal.client_email || '');
        setTitle(data.proposal.service_name || '');
        setDescription(data.proposal.description || '');
        setUnitPrice(data.proposal.unit_price || 450);
        setQuantity(data.proposal.quantity || 1);
        if (data.proposal.due_date) setDueDate(data.proposal.due_date);
        setMode('manual'); // switch to review form
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || unitPrice <= 0) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          title: title || 'Professional Services',
          description,
          unitPrice,
          quantity,
          dueDate,
          currency: 'USD',
        }),
      });

      const data = await res.json();
      if (data.request) {
        setCreatedItem(data.request);
        onCreated(data.request);
      }
    } catch (err) {
      alert('Failed to create payment request.');
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[#CCE2D2] space-y-5 animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdItem ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Create Payment Request
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate a verified PayPal Sandbox checkout link for your client.
              </p>
            </div>

            {/* Mode Segment Bar */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'ai'
                    ? 'bg-white text-[#174B38] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Create with AI</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-white text-[#174B38] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Manual Form</span>
              </button>
            </div>

            {/* Mode 1: AI Prompt */}
            {mode === 'ai' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  Describe what you need in natural language. Gemini 3.8 will automatically extract the client name, deliverable title, pricing, and due date.
                </div>

                <textarea
                  rows={4}
                  placeholder="e.g. 'Create a payment request for Marcus for $1,020 for automated billing integration due in 14 days'"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-[#174B38] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleAIExtract}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full bg-[#174B38] hover:bg-[#11382A] text-white py-3 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#34D399]" />
                      <span>Extract & Populate Details →</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Mode 2: Manual / Review Form */}
            {mode === 'manual' && (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Client Email</label>
                    <input
                      type="email"
                      placeholder="alex@northstar.io"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Service / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Website Development Milestone"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Deliverable specifications..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={unitPrice}
                      onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#174B38] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="p-3 bg-[#FAF9F5] rounded-xl flex items-center justify-between font-bold text-slate-800">
                  <span>Total Amount Due:</span>
                  <span className="text-base text-[#174B38] tabular-nums">
                    ${(unitPrice * quantity).toFixed(2)} USD
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !clientName}
                    className="bg-[#174B38] hover:bg-[#11382A] text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {submitting ? 'Creating...' : 'Create & Generate Link'}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* Success Result View */
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-[#E7F1E9] text-[#10B981] flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Payment Request Created!
            </h3>
            <p className="text-xs text-slate-500">
              Invoice #{createdItem.requestNumber} for <strong>{createdItem.clientName}</strong> (${createdItem.totalAmount.toFixed(2)} USD) is live.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Public Customer Checkout Link</div>
              <div className="font-mono text-xs text-slate-800 break-all">
                {window.location.origin}/pay/{createdItem.publicToken}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={copyUrl}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={`/pay/${createdItem.publicToken}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#174B38] hover:bg-[#11382A] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <span>Open Checkout</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 mt-2 block mx-auto underline"
            >
              Done & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
