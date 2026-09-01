import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-[#FFFCFB] border border-[#F4E9E4] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]',
        hoverable && 'transition-[box-shadow,border-color] duration-300 hover:shadow-[0_12px_36px_rgba(255,182,193,0.18)] hover:border-[#FFD9E2]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
