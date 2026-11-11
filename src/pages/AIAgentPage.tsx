import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ChatMessage, PaymentProposal, PaymentRequestItem } from '../types.ts';

interface AIAgentPageProps {
  onPaymentCreated: () => void;
}

const SUGGESTED_PROMPTS = [
  'Create a payment request for John for $250 for website development.',
  'Bill Sarah Chen (sarah@luminahealth.com) $850 for UX Design System due 2026-11-30.',
  'Show my latest transactions and revenue summary.',
  'Invoice Alex Morgan $450 for landing page optimization due in 7 days.',
];

export const AIAgentPage: React.FC<AIAgentPageProps> = ({ onPaymentCreated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [lastAiMode, setLastAiMode] = useState<'gemini-live' | 'heuristic-fallback' | null>(null);

  const [activeProposal, setActiveProposal] = useState<PaymentProposal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<PaymentRequestItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/ai/history', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setGeminiConfigured(Boolean(d.geminiConfigured));
        if (d.messages && d.messages.length > 0) {
          setMessages(d.messages);
          const lastProp = [...d.messages].reverse().find(m => m.proposal);
          if (lastProp?.proposal) setActiveProposal(lastProp.proposal);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || loading) return;

    setActionError(null);
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text, activeProposal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed.');

      setGeminiConfigured(Boolean(data.geminiConfigured));
      if (data.aiMode) setLastAiMode(data.aiMode);

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        aiMode: data.aiMode,
        proposal: data.proposal,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (data.proposal) {
        setActiveProposal(data.proposal);
        setCreatedRequest(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await fetch('/api/ai/clear-history', { method: 'POST', credentials: 'include' });
    setMessages([
      {
        id: `clr_${Date.now()}`,
        role: 'assistant',
        content: 'Conversation cleared. Describe a payment request or ask about your ledger.',
        timestamp: new Date().toISOString(),
      },
    ]);
    setActiveProposal(null);
    setCreatedRequest(null);
    setActionError(null);
  };

  const handleApproveAndCreate = async () => {
    if (!activeProposal) return;
    setActionError(null);

    if (!activeProposal.client_name.trim()) {
      setActionError('Please enter a client name before approving.');
      setIsEditing(true);
      return;
    }
    if (!activeProposal.unit_price || activeProposal.unit_price <= 0) {
      setActionError('Please specify a valid positive payment amount before approving.');
      setIsEditing(true);
      return;
    }

    setCreatingRequest(true);
    try {
      const res = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientName: activeProposal.client_name,
          clientEmail: activeProposal.client_email,
          title: activeProposal.service_name,
          description: activeProposal.description,
          unitPrice: activeProposal.unit_price,
          quantity: activeProposal.quantity || 1,
          currency: activeProposal.currency || 'USD',
          dueDate: activeProposal.due_date,
          status: 'PENDING',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment request.');
      setCreatedRequest(data.request);
      onPaymentCreated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setCreatingRequest(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdRequest) return;
    navigator.clipboard.writeText(`${window.location.origin}/pay/${createdRequest.publicToken}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Payment Agent</span>
            </span>
            {geminiConfigured !== null && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  geminiConfigured
                    ? 'bg-[#16845B]/10 text-[#16845B] border-[#16845B]/20'
                    : 'bg-[#D99027]/12 text-[#B47315] border-[#D99027]/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    geminiConfigured ? 'bg-[#16845B]' : 'bg-[#D99027]'
                  }`}
                />
                {geminiConfigured
                  ? 'Gemini API Connected'
                  : 'Deterministic Parser Mode (Set GEMINI_API_KEY for live Gemini)'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101C3A] tracking-tight">
            Conversational Payment Builder
          </h1>
          <p className="text-sm text-[#68758C]">
            Describe who you want to bill. The assistant extracts structured details, asks for missing fields, and waits for your explicit approval.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E7EAF1] bg-white hover:bg-slate-50 text-xs font-semibold text-[#68758C] cursor-pointer self-start"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat Workspace */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E7EAF1] shadow-xs flex flex-col h-[640px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E7EAF1] flex items-center justify-between bg-[#FAFBFF]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#315CFF] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101C3A]">PayPilot Assistant</div>
                <div className="text-[11px] text-[#68758C]">
                  Never executes payments autonomously
                </div>
              </div>
            </div>
            {lastAiMode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF1FF] text-[#315CFF]">
                {lastAiMode}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#315CFF] text-white rounded-tr-sm'
                      : 'bg-[#FAFBFF] border border-[#E7EAF1] text-[#18243A] rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#FAFBFF] border border-[#E7EAF1] rounded-2xl px-4 py-3 text-xs text-[#68758C] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#315CFF]" />
                  <span>Analyzing instruction & validating payment fields...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-4 py-2.5 border-t border-[#E7EAF1] bg-[#FAFBFF] flex gap-2 overflow-x-auto">
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(p)}
                className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-[#E7EAF1] hover:border-[#315CFF] text-[#18243A] transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-[#E7EAF1] bg-white flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder='e.g. "Create a payment request for John for $250 for website development"'
              className="flex-1 bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-[#315CFF] hover:bg-[#2347d6] text-white px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {/* Right: Structured Payment Proposal & Approval Panel */}
        <div className="lg:col-span-5 space-y-4">
          {actionError && (
            <div className="p-3.5 rounded-xl bg-[#D94C57]/10 border border-[#D94C57]/25 text-[#D94C57] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {!activeProposal ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#E7EAF1] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#101C3A]">Payment Proposal Preview</h2>
              <p className="text-xs text-[#68758C] leading-relaxed">
                Send a natural-language payment instruction on the left. Extracted details will appear here for your review and approval.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E7EAF1] shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E7EAF1] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#315CFF]">
                    Structured Payment Proposal
                  </span>
                  <h2 className="text-lg font-extrabold text-[#101C3A]">
                    Review Before Creating Link
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(p => !p)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF1FF] text-[#315CFF] text-xs font-semibold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Done Editing' : 'Edit Details'}</span>
                </button>
              </div>

              {/* Missing Info Alert */}
              {activeProposal.missing_fields && activeProposal.missing_fields.length > 0 && !createdRequest && (
                <div className="p-3.5 rounded-2xl bg-[#D99027]/10 border border-[#D99027]/25 text-xs space-y-1.5">
                  <div className="font-bold text-[#B47315]">
                    Clarification Suggested ({activeProposal.missing_fields.join(', ')})
                  </div>
                  <ul className="list-disc list-inside text-[#68758C] space-y-0.5">
                    {activeProposal.clarification_questions?.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fields */}
              {isEditing ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#18243A] mb-1">Client Name</label>
                      <input
                        type="text"
                        value={activeProposal.client_name}
                        onChange={e =>
                          setActiveProposal({ ...activeProposal, client_name: e.target.value })
                        }
                        className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#18243A] mb-1">Client Email</label>
                      <input
                        type="email"
                        value={activeProposal.client_email || ''}
                        onChange={e =>
                          setActiveProposal({ ...activeProposal, client_email: e.target.value })
                        }
                        className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#18243A] mb-1">Service Title</label>
                    <input
                      type="text"
                      value={activeProposal.service_name}
                      onChange={e =>
                        setActiveProposal({ ...activeProposal, service_name: e.target.value })
                      }
                      className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#18243A] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={activeProposal.description}
                      onChange={e =>
                        setActiveProposal({ ...activeProposal, description: e.target.value })
                      }
                      className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-[#18243A] mb-1">Unit Price</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={activeProposal.unit_price}
                        onChange={e => {
                          const price = parseFloat(e.target.value) || 0;
                          setActiveProposal({
                            ...activeProposal,
                            unit_price: price,
                            total_amount: Number((price * (activeProposal.quantity || 1)).toFixed(2)),
                          });
                        }}
                        className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#18243A] mb-1">Currency</label>
                      <select
                        value={activeProposal.currency}
                        onChange={e =>
                          setActiveProposal({ ...activeProposal, currency: e.target.value })
                        }
                        className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
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
                        value={activeProposal.due_date}
                        onChange={e =>
                          setActiveProposal({ ...activeProposal, due_date: e.target.value })
                        }
                        className="w-full bg-[#FAFBFF] border border-[#E7EAF1] rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#FAFBFF] border border-[#E7EAF1]">
                      <div className="text-[10px] text-[#68758C]">Client</div>
                      <div className="font-bold text-[#101C3A] mt-0.5">
                        {activeProposal.client_name}
                      </div>
                      <div className="text-[11px] text-[#68758C] truncate">
                        {activeProposal.client_email || 'Email not provided'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#EAF1FF] border border-[#315CFF]/15">
                      <div className="text-[10px] text-[#315CFF] font-semibold">Total Amount</div>
                      <div className="text-xl font-extrabold text-[#101C3A] tabular-nums mt-0.5">
                        ${activeProposal.total_amount.toFixed(2)}{' '}
                        <span className="text-xs font-bold">{activeProposal.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF1] space-y-1">
                    <div className="font-bold text-[#101C3A]">{activeProposal.service_name}</div>
                    <p className="text-[#68758C] leading-relaxed">{activeProposal.description}</p>
                    <div className="pt-1 text-[11px] text-[#68758C]">
                      Due Date: <strong className="text-[#18243A]">{activeProposal.due_date}</strong> •
                      Status: <strong className="text-[#315CFF]">Awaiting Approval</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions or Created State */}
              {createdRequest ? (
                <div className="p-4 rounded-2xl bg-[#16845B]/10 border border-[#16845B]/25 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#16845B]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Request {createdRequest.requestNumber} Approved & Created</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white border border-[#E7EAF1] rounded-xl px-3 py-2 text-xs">
                    <span className="font-mono truncate">
                      {window.location.origin}/pay/{createdRequest.publicToken}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 text-[#315CFF] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <a
                    href={`/pay/${createdRequest.publicToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#315CFF] text-white text-xs font-semibold py-2.5 rounded-xl"
                  >
                    <span>Open PayPal Sandbox Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#E7EAF1]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProposal(null);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#E7EAF1] text-xs font-semibold text-[#68758C] hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Proposal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveAndCreate}
                    disabled={creatingRequest}
                    className="flex-1 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {creatingRequest ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>
                      {creatingRequest ? 'Creating Request...' : 'Approve & Create Payment Request'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
