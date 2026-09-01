import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  theme?: 'dark' | 'light' | 'pink';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 120,
  className = '',
  theme = 'dark',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const themeClasses = {
    dark: 'bg-[#4A4450] text-[#FFFFFF] border border-[#5C5564] shadow-md shadow-[#4A4450]/15',
    light: 'bg-[#FFFCFB] text-[#4A4450] border border-[#F4E9E4] shadow-lg shadow-[#4A4450]/10',
    pink: 'bg-[#FFF2F5] text-[#FF5277] border border-[#FFCCD7] shadow-sm',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#4A4450] border-l-transparent border-r-transparent border-b-transparent border-4',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#4A4450] border-l-transparent border-r-transparent border-t-transparent border-4',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#4A4450] border-t-transparent border-b-transparent border-r-transparent border-4',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#4A4450] border-t-transparent border-b-transparent border-l-transparent border-4',
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: position === 'top' ? 3 : position === 'bottom' ? -3 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: position === 'top' ? 2 : position === 'bottom' ? -2 : 0 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`absolute z-50 pointer-events-none whitespace-nowrap text-[11px] font-semibold px-2.5 py-1 rounded-xl tracking-wide ${
              positionClasses[position]
            } ${themeClasses[theme]}`}
            role="tooltip"
          >
            {content}
            {theme === 'dark' && (
              <span className={`absolute w-0 h-0 pointer-events-none ${arrowClasses[position]}`} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
