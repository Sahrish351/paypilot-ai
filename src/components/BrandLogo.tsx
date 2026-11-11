import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
  onClick,
}) => {
  const isLight = variant === 'light';

  const sizeClasses = {
    sm: 'text-base gap-2',
    md: 'text-xl gap-2.5',
    lg: 'text-2xl gap-3',
  }[size];

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center font-display font-bold tracking-tight select-none ${sizeClasses} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div
        className={`${iconSizes} rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 hover:scale-105 ${
          isLight
            ? 'bg-gradient-to-br from-[#315CFF] to-[#38C6D9] text-white'
            : 'bg-gradient-to-br from-[#101C3A] to-[#315CFF] text-white'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4.5 11.5L19.5 4.5L13.5 19.5L10.8 13.2L4.5 11.5Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M19.5 4.5L10.8 13.2"
            stroke="#38C6D9"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-center">
        <span className={`font-extrabold ${isLight ? 'text-white' : 'text-[#101C3A]'}`}>
          PayPilot
        </span>
        <span
          className={`ml-1.5 font-bold text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
            isLight
              ? 'bg-[#315CFF]/30 text-[#7ADCF0] border border-[#38C6D9]/30'
              : 'bg-[#EAF1FF] text-[#315CFF] border border-[#315CFF]/15'
          }`}
        >
          AI
        </span>
      </div>
    </div>
  );
};
