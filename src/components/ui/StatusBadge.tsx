import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-[#16845B]/10 text-[#16845B] border-[#16845B]/20',
  Completed: 'bg-[#16845B]/10 text-[#16845B] border-[#16845B]/20',
  APPROVED: 'bg-[#315CFF]/10 text-[#315CFF] border-[#315CFF]/20',
  PENDING: 'bg-[#D99027]/12 text-[#B47315] border-[#D99027]/25',
  Pending: 'bg-[#D99027]/12 text-[#B47315] border-[#D99027]/25',
  OVERDUE: 'bg-[#D94C57]/12 text-[#D94C57] border-[#D94C57]/25',
  FAILED: 'bg-[#D94C57]/12 text-[#D94C57] border-[#D94C57]/25',
  Failed: 'bg-[#D94C57]/12 text-[#D94C57] border-[#D94C57]/25',
  CANCELLED: 'bg-slate-100 text-[#68758C] border-[#E7EAF1]',
  REFUNDED: 'bg-slate-100 text-[#68758C] border-[#E7EAF1]',
  Refunded: 'bg-slate-100 text-[#68758C] border-[#E7EAF1]',
  DRAFT: 'bg-[#EAF1FF] text-[#315CFF] border-[#315CFF]/15',
};

const DOT_COLORS: Record<string, string> = {
  COMPLETED: 'bg-[#16845B]',
  Completed: 'bg-[#16845B]',
  APPROVED: 'bg-[#315CFF]',
  PENDING: 'bg-[#D99027]',
  Pending: 'bg-[#D99027]',
  OVERDUE: 'bg-[#D94C57]',
  FAILED: 'bg-[#D94C57]',
  Failed: 'bg-[#D94C57]',
  CANCELLED: 'bg-[#68758C]',
  REFUNDED: 'bg-[#68758C]',
  Refunded: 'bg-[#68758C]',
  DRAFT: 'bg-[#315CFF]',
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className = '',
}) => {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-[#68758C] border-[#E7EAF1]';
  const dot = DOT_COLORS[status] || 'bg-[#68758C]';
  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
};
