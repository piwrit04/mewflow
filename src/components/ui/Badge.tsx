import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'pink' | 'lavender' | 'cream' | 'mint' | 'yellow';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'pink',
  children,
  ...props
}) => {
  const variantStyles = {
    pink: 'bg-[#FFF0F4] text-[#E04866] border border-[#FFCCD7]',
    lavender: 'bg-[#F6EEFF] text-[#7E3AF2] border border-[#E4D1FC]',
    cream: 'bg-[#FFF8F5] text-[#554D5C] border border-[#EEDCD5]',
    mint: 'bg-[#EFFBF2] text-[#2F855A] border border-[#BCE8C9]',
    yellow: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
