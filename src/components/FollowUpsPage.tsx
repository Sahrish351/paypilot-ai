import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Bot,
  RefreshCw,
  Clock,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { PaymentRequestItem } from '../types.ts';

interface FollowUpsPageProps {
  requests: PaymentRequestItem[];
  preselectedRequest?: PaymentRequestItem | null;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({
  requests,
  preselectedRequest,
}) => {
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const [selectedReq, setSelectedReq] = useState<PaymentRequestItem>(
    preselectedRequest || pendingRequests[0] || requests[0]
  );
  const [tone, setTone] = useState<'friendly' | 'professional' | 'polite' | 'urgent'>('friendly');
  const [generating, setGenerating] = useState(false);
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate reminder draft on selection or tone change
  const generateDraft = async (reqToUse?: PaymentRequestItem, toneToUse?: string) => {
    const target = reqToUse || selectedReq;
    if (!target) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: target.clientName,
          amount: target.totalAmount,
          dueDate: target.dueDate,
          tone: toneToUse || tone,
        }),
      });
      const data = await res.json();
      if (data.reminder) {
        const paymentLink = `${window.location.origin}/pay/${target.publicToken}`;
        setMessageDraft(data.reminder.replace('{{PAYMENT_LINK}}', paymentLink));
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setGenerating(false);
    }
  };

  React.useEffect(() => {
    if (selectedReq) {
      generateDraft(selectedReq, tone);
    }
  }, [selectedReq?.id, tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1E9] text-[#174B38] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Client Communication Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
          Smart Follow-Up Assistant
        </h1>
        <p className="text-sm text-[#55635B] mt-0.5">
          Generate polite, personalized payment reminder messages with customizable tones in one click.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Select invoice */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800">
            Select Pending Payment Request
          </h2>

          <div className="space-y-3">
            {pendingRequests.map(r => {
              const isSelected = selectedReq?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReq(r)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#174B38] bg-white ring-2 ring-[#174B38]/15 shadow-sm'
                      : 'border-[#E8EAE5] bg-white hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {r.clientName}
                    </span>
                    <span className="font-extrabold text-sm text-[#174B38] tabular-nums">
                      ${r.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1 truncate">
                    {r.title}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {r.dueDate}</span>
                    </div>
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      {r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Tone Selector & AI Reminder Editor */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#CCE2D2] p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personalized Message Draft
              </h3>
              <p className="text-xs text-slate-500">
                Drafted for {selectedReq?.clientName || 'Client'}
              </p>
            </div>

            {/* Tone Selector */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF9F5] rounded-xl border border-slate-200">
              {(['friendly', 'professional', 'polite', 'urgent'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                    tone === t
                      ? 'bg-[#174B38] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Draft text area */}
          <div className="relative">
            <textarea
              rows={8}
              value={messageDraft}
              onChange={e => setMessageDraft(e.target.value)}
              disabled={generating}
              className="w-full bg-[#FAF9F5] p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-slate-900 focus:bg-white focus:border-[#174B38] focus:outline-none"
            />
            {generating && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center rounded-xl">
                <RefreshCw className="w-6 h-6 animate-spin text-[#174B38]" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => generateDraft()}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate with different phrasing</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto bg-[#174B38] hover:bg-[#11382A] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-[#34D399]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Message'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
