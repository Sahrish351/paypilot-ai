import React, { useState } from 'react';
import { Workflow, Zap, CheckCircle2, Bell, ShieldCheck, Mail, ToggleLeft, ToggleRight } from 'lucide-react';

export const AutomationPage: React.FC = () => {
  const [automations, setAutomations] = useState([
    {
      id: '1',
      title: 'Automated 3-Day Overdue Reminder',
      description: 'When an approved invoice reaches 3 days past due date, AI prepares a polite email draft.',
      enabled: true,
      trigger: 'On Due Date + 3 Days',
    },
    {
      id: '2',
      title: 'Instant PayPal Capture Receipt',
      description: 'Upon successful server-side PayPal Sandbox capture, issue receipt to customer automatically.',
      enabled: true,
      trigger: 'PayPal Webhook: PAYMENT.CAPTURE.COMPLETED',
    },
    {
      id: '3',
      title: 'AI Revenue Anomaly & Milestone Alert',
      description: 'Notify business owner when weekly collections exceed $5,000 threshold.',
      enabled: true,
      trigger: 'Real-time Ledger Aggregation',
    },
    {
      id: '4',
      title: 'Auto-Sync to Accounting CSV',
      description: 'Append verified transaction details to the exportable accounting store immediately upon capture.',
      enabled: true,
      trigger: 'Immediate Post-Capture',
    },
  ]);

  const toggle = (id: string) => {
    setAutomations(prev =>
      prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1E9] text-[#174B38] text-xs font-semibold mb-2">
          <Workflow className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Intelligent Workflows</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2924] tracking-tight">
          Smart Payment Automation
        </h1>
        <p className="text-sm text-[#55635B] mt-0.5">
          Configure autonomous rules for payment collection, receipt issuing, and cashflow monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {automations.map(a => (
          <div
            key={a.id}
            className="bg-white p-6 rounded-2xl border border-[#E8EAE5] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#CCE2D2] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-[#174B38] bg-[#E7F1E9] px-2.5 py-0.5 rounded-full">
                  {a.trigger}
                </span>
                <button
                  onClick={() => toggle(a.id)}
                  className="cursor-pointer transition-transform active:scale-95"
                >
                  {a.enabled ? (
                    <ToggleRight className="w-8 h-8 text-[#10B981]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {a.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{a.enabled ? 'Active Rule' : 'Paused'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">ID: auto_0{a.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
