import React from 'react';

export type MascotVariant = 'idle' | 'sleeping' | 'empty-state' | 'wealth' | 'star-eyed' | 'avatar' | 'logo';

interface MewMascotProps {
  variant?: MascotVariant;
  size?: number | string;
  className?: string;
  animateFloat?: boolean;
}

export const MewMascot: React.FC<MewMascotProps> = ({
  variant = 'idle',
  size = 120,
  className = '',
  animateFloat = false,
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const isSleeping = variant === 'sleeping' || variant === 'empty-state';
  const isWealth = variant === 'wealth' || variant === 'star-eyed';
  const isAvatar = variant === 'avatar';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animateFloat ? 'animate-[bounce_3s_ease-in-out_infinite]' : ''
      } ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        {/* Soft background aura */}
        <circle
          cx="70"
          cy="70"
          r="62"
          fill={isWealth ? '#FFF9E6' : isSleeping ? '#F8F6FA' : '#FFF0F3'}
          stroke={isWealth ? '#FFE699' : isSleeping ? '#EFE9F4' : '#FFCCD7'}
          strokeWidth="2.5"
        />

        {/* Ambient background sparkles */}
        {isWealth ? (
          <>
            {/* Golden coins & star sparkles */}
            <path d="M118 24L120 29L125 31L120 33L118 38L116 33L111 31L116 29L118 24Z" fill="#FFB800" />
            <path d="M22 28L24 33L29 35L24 37L22 42L20 37L15 35L20 33L22 28Z" fill="#FFD000" />
            <circle cx="118" cy="85" r="7" fill="#FFE58F" stroke="#FAAD14" strokeWidth="1.5" />
            <text x="115" y="89" fontSize="9" fontWeight="bold" fill="#D48806">¥</text>
            <circle cx="24" cy="88" r="6" fill="#FFE58F" stroke="#FAAD14" strokeWidth="1.5" />
            <text x="21.5" y="91.5" fontSize="8" fontWeight="bold" fill="#D48806">¥</text>
          </>
        ) : isSleeping ? (
          <>
            {/* Cute ZZZ bubbles floating */}
            <path d="M108 30H118L108 40H118" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
            <path d="M96 22H102L96 28H102" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
            <path d="M88 16H92L88 20H92" stroke="#E9D5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            <circle cx="28" cy="40" r="3" fill="#D8B4FE" opacity="0.5" />
          </>
        ) : (
          <>
            <path d="M118 28L120 33L125 35L120 37L118 42L116 37L111 35L116 33L118 28Z" fill="#FFD98E" opacity="0.9" />
            <path d="M22 88L23.5 92L27.5 93.5L23.5 95L22 99L20.5 95L16.5 93.5L20.5 92L22 88Z" fill="#D8B4FE" opacity="0.8" />
            <circle cx="120" cy="90" r="3" fill="#FFB6C1" opacity="0.7" />
            <circle cx="25" cy="40" r="2.5" fill="#A7D8B0" opacity="0.7" />
          </>
        )}

        {/* Left Ear */}
        <path
          d="M38 52L26 26C36 29 49 35 52 46"
          fill="#FFB6C1"
          stroke="#4A4450"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left Inner Ear */}
        <path d="M37 45L29 30C36 32 43 36 45 42" fill="#FFD9E2" />

        {/* Right Ear */}
        <path
          d="M102 52L114 26C104 29 91 35 88 46"
          fill="#FFB6C1"
          stroke="#4A4450"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Inner Ear */}
        <path d="M103 45L111 30C104 32 97 36 95 42" fill="#FFD9E2" />

        {/* Cat Head Base */}
        <rect
          x="28"
          y="40"
          width="84"
          height="68"
          rx="34"
          fill="#FFFFFF"
          stroke="#4A4450"
          strokeWidth="3"
        />

        {/* Eyes based on variant */}
        {isSleeping ? (
          <>
            {/* Sleeping closed relaxed curves - - */}
            <path d="M46 68C50 71 55 71 58 68" stroke="#4A4450" strokeWidth="3" strokeLinecap="round" />
            <path d="M82 68C86 71 91 71 94 68" stroke="#4A4450" strokeWidth="3" strokeLinecap="round" />
            {/* Gentle snoozing bubble on mouth */}
            <circle cx="76" cy="71" r="4.5" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1.2" opacity="0.9" />
          </>
        ) : isWealth ? (
          <>
            {/* Star-eyes / Sparkling anime eyes */}
            <path d="M52 58L54 64L60 66L54 68L52 74L50 68L44 66L50 64L52 58Z" fill="#FF9900" stroke="#4A4450" strokeWidth="1.2" />
            <path d="M88 58L90 64L96 66L90 68L88 74L86 68L80 66L86 64L88 58Z" fill="#FF9900" stroke="#4A4450" strokeWidth="1.2" />
          </>
        ) : (
          <>
            {/* Happy Curved Eyes */}
            <path d="M48 66C50 62 55 62 57 66" stroke="#4A4450" strokeWidth="3" strokeLinecap="round" />
            <path d="M83 66C85 62 90 62 92 66" stroke="#4A4450" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* Blushing Cheeks */}
        <ellipse cx="43" cy="74" rx="6" ry="4" fill="#FFB6C1" opacity="0.85" />
        <ellipse cx="97" cy="74" rx="6" ry="4" fill="#FFB6C1" opacity="0.85" />

        {/* Nose */}
        <path d="M69 70L71 70" stroke="#4A4450" strokeWidth="2.5" strokeLinecap="round" />

        {/* Cute :3 Mouth */}
        {!isSleeping && (
          <path
            d={isWealth ? "M64 72C66 77 74 77 76 72" : "M65 73C67 76.5 69.5 76 70 73.5C70.5 76 73 76.5 75 73"}
            stroke="#4A4450"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill={isWealth ? '#FF8BA7' : 'none'}
          />
        )}

        {/* Mascot Props / Hands */}
        {isWealth ? (
          <g transform="translate(52, 78)">
            {/* Huge Golden Coin */}
            <circle cx="18" cy="18" r="18" fill="#FFD700" stroke="#4A4450" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="13" fill="#FFE57F" stroke="#E6B800" strokeWidth="1.5" />
            <text x="11.5" y="24" fontSize="17" fontWeight="900" fill="#996B00" fontFamily="sans-serif">¥</text>
            {/* Left Cat Paw holding coin */}
            <ellipse cx="-4" cy="18" rx="6" ry="5" fill="#FFFFFF" stroke="#4A4450" strokeWidth="2" />
            {/* Right Cat Paw holding coin */}
            <ellipse cx="40" cy="18" rx="6" ry="5" fill="#FFFFFF" stroke="#4A4450" strokeWidth="2" />
          </g>
        ) : isSleeping ? (
          <g transform="translate(45, 84)">
            {/* Cat sleeping flat paws tucked */}
            <rect x="0" y="0" width="50" height="24" rx="12" fill="#FFFFFF" stroke="#4A4450" strokeWidth="2.5" />
            <ellipse cx="14" cy="10" rx="6" ry="4" fill="#FFD9E2" />
            <ellipse cx="36" cy="10" rx="6" ry="4" fill="#FFD9E2" />
          </g>
        ) : !isAvatar ? (
          <g transform="translate(48, 76)">
            {/* Little Order Checklist / Notepad */}
            <rect
              x="0"
              y="0"
              width="44"
              height="44"
              rx="10"
              fill="#FFF8F5"
              stroke="#FFB6C1"
              strokeWidth="2.5"
            />
            {/* Top Clip of notepad */}
            <rect x="14" y="-3" width="16" height="6" rx="3" fill="#FF6B8B" stroke="#4A4450" strokeWidth="1.5" />
            
            {/* Order lines */}
            <line x1="14" y1="12" x2="35" y2="12" stroke="#B5ABB9" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="21" x2="35" y2="21" stroke="#B5ABB9" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="30" x2="28" y2="30" stroke="#B5ABB9" strokeWidth="2" strokeLinecap="round" />

            {/* Checkmark badges on orders */}
            <circle cx="8" cy="12" r="3" fill="#A7D8B0" />
            <path d="M6.8 12L7.8 13.2L9.2 10.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

            <circle cx="8" cy="21" r="3" fill="#FF6B8B" />
            <path d="M6.8 21L7.8 22.2L9.2 19.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

            <circle cx="8" cy="30" r="3" fill="#D8B4FE" />

            {/* Left Cat Paw */}
            <ellipse cx="-2" cy="18" rx="6" ry="5" fill="#FFFFFF" stroke="#4A4450" strokeWidth="2" />
            {/* Right Cat Paw */}
            <ellipse cx="46" cy="18" rx="6" ry="5" fill="#FFFFFF" stroke="#4A4450" strokeWidth="2" />
          </g>
        ) : null}

        {/* Little Pink Ribbon Bow (🎀) on bottom */}
        <g transform="translate(70, 114)">
          <path
            d="M0 0C-9 -7 -14 -3 -9 5C-7 7 -2 2 0 0Z"
            fill="#FF6B8B"
            stroke="#4A4450"
            strokeWidth="1.8"
          />
          <path
            d="M0 0C9 -7 14 -3 9 5C7 7 2 2 0 0Z"
            fill="#FF6B8B"
            stroke="#4A4450"
            strokeWidth="1.8"
          />
          <circle cx="0" cy="0" r="3.5" fill="#FFD98E" stroke="#4A4450" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
};
