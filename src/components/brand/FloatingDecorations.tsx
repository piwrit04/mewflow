import React from 'react';
import { motion } from 'motion/react';

export const FloatingDecorations: React.FC = () => {
  const decorations = [
    { emoji: '🌸', top: '10%', left: '8%', size: 'text-2xl sm:text-3xl', duration: 7, delay: 0 },
    { emoji: '✨', top: '18%', right: '12%', size: 'text-xl sm:text-2xl', duration: 5, delay: 1 },
    { emoji: '🐾', top: '35%', left: '5%', size: 'text-xl sm:text-2xl', duration: 8, delay: 2, rotate: 15 },
    { emoji: '🎀', top: '75%', left: '10%', size: 'text-2xl sm:text-3xl', duration: 6, delay: 0.5 },
    { emoji: '🍡', top: '68%', right: '8%', size: 'text-2xl sm:text-3xl', duration: 7.5, delay: 1.5 },
    { emoji: '✨', bottom: '12%', right: '18%', size: 'text-xl sm:text-2xl', duration: 6.5, delay: 2.5 },
    { emoji: '🌸', top: '48%', right: '6%', size: 'text-lg sm:text-xl', duration: 9, delay: 3 },
    { emoji: '🐾', bottom: '15%', left: '22%', size: 'text-lg sm:text-xl', duration: 8, delay: 1.2, rotate: -20 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      {/* Gentle background soft gradient radial spots */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FFE4E8]/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#F3E8FF]/50 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#FFF0E8]/50 rounded-full blur-3xl" />

      {/* Floating subtle elements */}
      {decorations.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size} opacity-45 drop-shadow-sm filter`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined,
          }}
          animate={{
            y: [-6, 8, -6],
            rotate: item.rotate ? [item.rotate - 5, item.rotate + 5, item.rotate - 5] : [-4, 4, -4],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
};
