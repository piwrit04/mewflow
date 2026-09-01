import React from 'react';

interface MewLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const MewLogo: React.FC<MewLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 32, textTitle: 'text-lg', textSub: 'text-xs' },
    md: { icon: 48, textTitle: 'text-2xl', textSub: 'text-xs tracking-wider' },
    lg: { icon: 72, textTitle: 'text-3xl', textSub: 'text-sm tracking-widest' },
    xl: { icon: 96, textTitle: 'text-4xl', textSub: 'text-base tracking-widest' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* MewFlow Mascot Logo SVG */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer soft glowing background badge */}
          <rect
            x="10"
            y="10"
            width="100"
            height="100"
            rx="32"
            fill="#FFF0F3"
            stroke="#FFE4E8"
            strokeWidth="3"
          />

          {/* Cat ears */}
          <path
            d="M32 46L24 24C32 26 44 32 46 40"
            fill="#FFB6C1"
            stroke="#4A4450"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Inner ear */}
          <path
            d="M31 40L27 28C32 29 38 33 40 37"
            fill="#FFD9E2"
          />

          <path
            d="M88 46L96 24C88 26 76 32 74 40"
            fill="#FFB6C1"
            stroke="#4A4450"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Inner ear */}
          <path
            d="M89 40L93 28C88 29 82 33 80 37"
            fill="#FFD9E2"
          />

          {/* Cat Head / Face Base */}
          <rect
            x="24"
            y="36"
            width="72"
            height="58"
            rx="29"
            fill="#FFFFFF"
            stroke="#4A4450"
            strokeWidth="2.5"
          />

          {/* Cute Eyes (Curved happy eyes) */}
          <path
            d="M40 58C42 55 46 55 48 58"
            stroke="#4A4450"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M72 58C74 55 78 55 80 58"
            stroke="#4A4450"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Blush on cheeks */}
          <ellipse cx="36" cy="65" rx="5" ry="3.5" fill="#FFB6C1" opacity="0.8" />
          <ellipse cx="84" cy="65" rx="5" ry="3.5" fill="#FFB6C1" opacity="0.8" />

          {/* Cat Nose & Mouth */}
          <path
            d="M59 62L61 62"
            stroke="#4A4450"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M56 65C58 68 60 67 60 65C60 67 62 68 64 65"
            stroke="#4A4450"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Little Order Checklist Sheet held by cat paws */}
          <g transform="translate(42, 66)">
            {/* Tiny Clipboard / Order list */}
            <rect
              x="0"
              y="0"
              width="36"
              height="36"
              rx="8"
              fill="#FFF8F5"
              stroke="#D8B4FE"
              strokeWidth="2"
            />
            {/* Checklist lines */}
            <line x1="12" y1="9" x2="28" y2="9" stroke="#8F8795" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="17" x2="28" y2="17" stroke="#8F8795" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="25" x2="24" y2="25" stroke="#8F8795" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Tiny green checkmark badge on order */}
            <circle cx="7" cy="9" r="2.5" fill="#A7D8B0" />
            <path d="M6 9L6.8 10L8 8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

            {/* Tiny pink checkmark badge on second order */}
            <circle cx="7" cy="17" r="2.5" fill="#FFB6C1" />
            <path d="M6 17L6.8 18L8 16" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

            {/* Tiny lavender checkmark on third order */}
            <circle cx="7" cy="25" r="2.5" fill="#D8B4FE" />
          </g>

          {/* Cute Little Pink Bow Tie (🎀) */}
          <g transform="translate(60, 94)">
            {/* Left Bow wing */}
            <path
              d="M0 0C-8 -6 -12 -2 -8 4C-6 6 -2 2 0 0Z"
              fill="#FFB6C1"
              stroke="#4A4450"
              strokeWidth="1.5"
            />
            {/* Right Bow wing */}
            <path
              d="M0 0C8 -6 12 -2 8 4C6 6 2 2 0 0Z"
              fill="#FFB6C1"
              stroke="#4A4450"
              strokeWidth="1.5"
            />
            {/* Center knot */}
            <circle cx="0" cy="0" r="3" fill="#D8B4FE" stroke="#4A4450" strokeWidth="1.5" />
          </g>

          {/* Soft White Sparkle in corner */}
          <path
            d="M98 20L99.5 24L103.5 25.5L99.5 27L98 31L96.5 27L92.5 25.5L96.5 24L98 20Z"
            fill="#FFD98E"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-[#4A4450] ${currentSize.textTitle}`}>
            喵序
          </span>
          <span className={`font-semibold text-[#8F8795] font-sans ${currentSize.textSub}`}>
            MewFlow
          </span>
        </div>
      )}
    </div>
  );
};
