import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  accent?: 'cobalt' | 'cyan' | 'navy' | 'success' | 'warning';
  trendBadge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = 'cobalt',
  trendBadge,
}) => {
  const iconStyles = {
    cobalt: 'bg-[#EAF1FF] text-[#315CFF]',
    cyan: 'bg-[#38C6D9]/15 text-[#0E8CA0]',
    navy: 'bg-[#101C3A]/8 text-[#101C3A]',
    success: 'bg-[#16845B]/12 text-[#16845B]',
    warning: 'bg-[#D99027]/12 text-[#B47315]',
  }[accent];

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF1] p-5 shadow-xs hover:shadow-md hover:border-[#315CFF]/30 transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trendBadge && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#315CFF]">
            {trendBadge}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-xs font-medium text-[#68758C]">{label}</div>
        <div className="text-2xl font-extrabold text-[#18243A] tabular-nums tracking-tight mt-1">
          {value}
        </div>
      </div>

      {sublabel && (
        <div className="mt-3 pt-3 border-t border-[#E7EAF1]/70 text-[11px] text-[#68758C]">
          {sublabel}
        </div>
      )}
    </div>
  );
};
