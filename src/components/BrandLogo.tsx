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
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center font-bold tracking-tight select-none ${sizeClasses} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Brand Icon: Modern Pilot Leaf / FinTech Compass Wave */}
      <div
        className={`${iconSizes} rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 hover:scale-105 ${
          isLight
            ? 'bg-[#10B981] text-[#0D3326]'
            : 'bg-[#174B38] text-[#34D399]'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Compass / flight feather dynamic shape */}
          <path
            d="M12 2L19 21L12 17L5 21L12 2Z"
            fill="currentColor"
            fillOpacity={isLight ? '0.95' : '0.9'}
          />
          <path
            d="M12 5V16.5"
            stroke={isLight ? '#064E3B' : '#E7F1E9'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-baseline">
        <span
          className={`font-extrabold ${
            isLight ? 'text-white' : 'text-[#174B38]'
          }`}
        >
          PayPilot
        </span>
        <span
          className={`ml-1 font-semibold text-xs tracking-wider uppercase px-1.5 py-0.5 rounded ${
            isLight
              ? 'bg-[#287052] text-[#A7F3D0]'
              : 'bg-[#E7F1E9] text-[#174B38]'
          }`}
        >
          AI
        </span>
      </div>
    </div>
  );
};
