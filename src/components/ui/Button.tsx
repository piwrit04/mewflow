import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-full transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] hover:from-[#FF5A7D] hover:to-[#F43860] text-white font-bold shadow-[0_4px_14px_0_rgba(255,82,119,0.32)] hover:shadow-[0_6px_20px_0_rgba(255,82,119,0.45)] focus:ring-[#FF6B8B] active:scale-[0.98]',
      secondary:
        'bg-[#FFF0F3] hover:bg-[#FFE4E8] text-[#E05368] border border-[#FFD9E2] font-bold shadow-xs focus:ring-[#FFB6C1] active:scale-[0.98]',
      outline:
        'border border-[#EEDCD5] hover:border-[#FFB6C1] bg-[#FFFFFF] hover:bg-[#FFF0F3] text-[#4A4450] font-semibold focus:ring-[#FFB6C1] active:scale-[0.98]',
      ghost:
        'hover:bg-[#FFE4E8]/50 text-[#4A4450] font-semibold focus:ring-[#FFB6C1]',
    };

    const sizeStyles = {
      sm: 'text-xs sm:text-sm px-4 py-2 gap-1.5',
      md: 'text-sm sm:text-base px-5 py-2.5 gap-2',
      lg: 'text-base sm:text-lg px-7 py-3.5 gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>{loadingText || '处理中……'}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex items-center text-current">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex items-center text-current">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
