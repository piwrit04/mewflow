import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, isPassword, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#4A4450] flex items-center gap-1.5">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-[#8F8795] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={actualType}
            className={cn(
              'w-full bg-[#FFFCFB] border text-[#4A4450] placeholder:text-[#B5ABB9] text-base rounded-2xl py-3 px-4 transition-[box-shadow,border-color,background-color] duration-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#FFE4E8] focus:border-[#FFB6C1]',
              leftIcon ? 'pl-11' : 'pl-4',
              isPassword ? 'pr-12' : 'pr-4',
              error ? 'border-[#F59BA9] focus:ring-[#FFE5EA] focus:border-[#F59BA9]' : 'border-[#EEDCD5]',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1 rounded-xl text-[#8F8795] hover:text-[#4A4450] hover:bg-[#FFF0F3] transition-colors focus:outline-none"
              title={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#E5536B] flex items-center gap-1 mt-0.5 font-semibold animate-in fade-in duration-200">
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
