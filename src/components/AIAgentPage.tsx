import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  CreditCard,
  Edit3,
  Calendar,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, PaymentRequestItem } from '../types.ts';

interface AIAgentPageProps {
  initialPrompt?: string;
  onOpenCheckout: (publicToken: string) => void;
  onPaymentCreated: (req: PaymentRequestItem) => void;
}

export const AIAgentPage: React.FC<AIAgentPageProps> = ({
  initialPrompt = '',
  onOpenCheckout,
  onPaymentCreated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [activeProposal, setActiveProposal] = useState<any>(null);
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<PaymentRequestItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from server on mount
  useEffect(() => {
    fetch('/api/ai/history')
      .then(r => r.json())
      .then(d => {
        if (d.messages && d.messages.length > 0) {
          setMessages(d.messages);
          // Find any proposal in history
          const lastWithProposal = [...d.messages].reverse().find(m => m.proposal);
          if (lastWithProposal) {
            setActiveProposal(lastWithProposal.proposal);
          }
        } else {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: "Hello! I'm your PayPilot AI assistant. I can help you prepare payment requests, verify transactions, create professional payment messages, and explore your revenue.",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            id: 'welcome_fb',
            role: 'assistant',
            content: "Hello! I'm your PayPilot AI assistant. I can help you prepare payment requests, understand transactions, and create client payment links.",
            timestamp: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (data.message) {
        const assistantMsg: ChatMessage = {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          proposal: data.proposal,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (data.proposal) {
          setActiveProposal(data.proposal);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "I encountered a minor network glitch, but I'm ready for your command! Try asking me to create a payment request or summarize revenue.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch('/api/ai/clear-history', { method: 'POST' });
      setMessages([
        {
          id: 'welcome_new',
          role: 'assistant',
          content: "Hello! Conversation cleared. How can I assist your payments today?",
          timestamp: new Date().toISOString(),
        },
      ]);
      setActiveProposal(null);
      setCreatedRequest(null);
    } catch (e) {
      console.warn(e);
    }
  };

  // Convert proposal into a live PayPal Sandbox Payment Request
  const handleCreatePayPalCheckout = async () => {
    if (!activeProposal) return;
    setCreatingCheckout(true);

    try {
      const createRes = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: activeProposal.client_name,
          clientEmail: activeProposal.client_email,
          title: activeProposal.service_name,
          description: activeProposal.description,
          unitPrice: activeProposal.unit_price,
          quantity: activeProposal.quantity,
          dueDate: activeProposal.due_date,
          currency: activeProposal.currency || 'USD',
        }),
      });

      const createData = await createRes.json();
      if (createData.request) {
        setCreatedRequest(createData.request);
        onPaymentCreated(createData.request);

        // Pre-create PayPal Order on backend
        await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentRequestId: createData.request.id }),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCheckout(false);
    }
  };

  const copyPaymentUrl = () => {
    if (!createdRequest) return;
    const url = `${window.location.origin}/pay/${createdRequest.publicToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyDescription = () => {
    if (!activeProposal) return;
    navigator.clipboard.writeText(activeProposal.description);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1E9] text-[#174B38] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Powered by Google Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
            Meet Your AI Payment Agent
          </h1>
          <p className="text-sm text-[#55635B] mt-0.5">
            Describe what you need in plain English. Your AI assistant will prepare the structured payment workflow.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="self-start sm:self-auto text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Command Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'Create a payment request', prompt: 'Create a payment request for Alex for $450 for website development due in 7 days' },
          { label: 'Generate invoice description', prompt: 'Generate a professional invoice description for mobile app UI/UX design deliverables' },
          { label: 'Explain my revenue', prompt: 'Explain my collected revenue and transaction statistics this month' },
          { label: 'Find overdue payments', prompt: 'Which payment requests are currently pending or overdue?' },
          { label: 'Draft a friendly reminder', prompt: 'Draft a polite follow-up reminder for Alex for the $450 invoice' },
          { label: 'Summarize transactions', prompt: 'Summarize my latest payment transactions and settled PayPal orders' },
        ].map((cmd, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(cmd.prompt)}
            className="text-left text-xs bg-white hover:bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8EAE5] hover:border-[#CCE2D2] text-[#1E2924] font-medium transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <span>{cmd.label}</span>
            <span className="text-[10px] text-[#10B981] font-bold mt-2 flex items-center gap-0.5">
              Run <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </button>
        ))}
      </div>

      {/* Main 2-Column Split: Conversation Panel on Left, Structured Proposal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Chat interface */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col h-[600px] overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-[#E7F1E9] text-[#174B38] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-[#10B981]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-[#FAF9F5] text-[#1E2924] border border-[#E8EAE5] rounded-tl-none font-medium'
                        : 'bg-[#174B38] text-white rounded-tr-none font-normal'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Proposal inline pill badge */}
                    {m.proposal && (
                      <div className="mt-3 pt-3 border-t border-[#E8EAE5] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#174B38]">
                          Proposal: {m.proposal.client_name} · ${m.proposal.total_amount} USD
                        </span>
                        <button
                          onClick={() => setActiveProposal(m.proposal)}
                          className="text-[#10B981] font-bold hover:underline flex items-center gap-1"
                        >
                          View Card →
                        </button>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 mt-1.5 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
                <div className="w-8 h-8 rounded-full bg-[#E7F1E9] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#10B981] animate-spin" />
                </div>
                <div className="bg-[#FAF9F5] border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 font-medium text-slate-600">Gemini is reasoning...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input box */}
          <div className="p-4 border-t border-[#E8EAE5] bg-[#FAF9F5]">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask your AI agent (e.g. 'Bill Alex $450 for completed website project')..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#E8EAE5] focus:border-[#174B38] focus:outline-none text-[#1E2924] placeholder:text-slate-400 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="bg-[#174B38] hover:bg-[#11382A] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Structured Payment Proposal Card */}
        <div className="lg:col-span-5 space-y-6">
          {activeProposal ? (
            <div className="bg-white rounded-2xl border border-[#CCE2D2] p-6 shadow-md relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E7F1E9] text-[#174B38] flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1E2924]">
                      Payment Request Proposal
                    </h2>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Draft · Needs Approval
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProposal(!isEditingProposal)}
                  className="text-xs font-semibold text-[#174B38] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingProposal ? 'Done' : 'Edit'}</span>
                </button>
              </div>

              {/* Proposal Content */}
              <div className="mt-4 space-y-3.5 text-xs">
                {/* Client Name */}
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Client Name</label>
                  {isEditingProposal ? (
                    <input
                      type="text"
                      value={activeProposal.client_name}
                      onChange={e =>
                        setActiveProposal({ ...activeProposal, client_name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-900">
                      {activeProposal.client_name}
                    </div>
                  )}
                </div>

                {/* Service Name */}
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Service Deliverable</label>
                  {isEditingProposal ? (
                    <input
                      type="text"
                      value={activeProposal.service_name}
                      onChange={e =>
                        setActiveProposal({ ...activeProposal, service_name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                    />
                  ) : (
                    <div className="font-semibold text-slate-800">
                      {activeProposal.service_name}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">Professional Description</label>
                    <button
                      onClick={copyDescription}
                      className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5"
                    >
                      {copiedDesc ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDesc ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  {isEditingProposal ? (
                    <textarea
                      rows={2}
                      value={activeProposal.description}
                      onChange={e =>
                        setActiveProposal({ ...activeProposal, description: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  ) : (
                    <div className="bg-[#FAF9F5] p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic">
                      "{activeProposal.description}"
                    </div>
                  )}
                </div>

                {/* Amount & Due Date grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Total Amount</label>
                    {isEditingProposal ? (
                      <input
                        type="number"
                        value={activeProposal.unit_price}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setActiveProposal({
                            ...activeProposal,
                            unit_price: val,
                            total_amount: val * (activeProposal.quantity || 1),
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                      />
                    ) : (
                      <div className="text-lg font-extrabold text-[#174B38] tabular-nums">
                        ${activeProposal.total_amount || activeProposal.unit_price} USD
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Due Date</label>
                    {isEditingProposal ? (
                      <input
                        type="date"
                        value={activeProposal.due_date}
                        onChange={e =>
                          setActiveProposal({ ...activeProposal, due_date: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeProposal.due_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notice: Human in the loop rule */}
                <div className="p-2.5 rounded-xl bg-[#E7F1E9] text-[#174B38] text-[11px] leading-snug flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" />
                  <span>
                    <strong>Human Authorization Required:</strong> AI never charges or creates orders without your explicit review and approval.
                  </span>
                </div>

                {/* Action buttons */}
                {!createdRequest ? (
                  <div className="pt-3 space-y-2">
                    <button
                      onClick={handleCreatePayPalCheckout}
                      disabled={creatingCheckout}
                      className="w-full bg-[#174B38] hover:bg-[#11382A] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {creatingCheckout ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating PayPal Checkout...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-[#34D399]" />
                          <span>Approve & Create PayPal Checkout</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 space-y-3 bg-[#E7F1E9] p-4 rounded-xl border border-[#CCE2D2]">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span>Payment Request Live on PayPal Sandbox!</span>
                    </div>

                    <div className="text-[11px] text-slate-600 break-all bg-white p-2.5 rounded-lg border border-slate-200">
                      {window.location.origin}/pay/{createdRequest.publicToken}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyPaymentUrl}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-800 py-2 rounded-lg font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                      </button>

                      <button
                        onClick={() => onOpenCheckout(createdRequest.publicToken)}
                        className="flex-1 bg-[#174B38] hover:bg-[#11382A] text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Open Checkout</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] text-slate-400 mx-auto flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                No Active Payment Proposal
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Type a message on the left like <em>"Create a payment request for Sarah for $850"</em> and Gemini will extract the structured proposal here!
              </p>
            </div>
          )}

          {/* Quick FAQ / Guidance Card */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E8EAE5] space-y-2.5 text-xs text-[#55635B]">
            <div className="font-bold text-[#174B38] text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <span>How PayPilot AI Works</span>
            </div>
            <p className="leading-relaxed">
              1. <strong>Natural extraction</strong>: Mention amounts, due dates, services, or client names in any order.
            </p>
            <p className="leading-relaxed">
              2. <strong>PayPal Orders API</strong>: Approving the proposal issues an authenticated PayPal Sandbox order token.
            </p>
            <p className="leading-relaxed">
              3. <strong>Instant Customer Checkout</strong>: Clients pay via debit/credit or PayPal buyer account with zero friction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
