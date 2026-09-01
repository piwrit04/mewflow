import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = '',
  id,
  ariaLabel,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(!checked);
  };

  const isMarked = checked || indeterminate;

  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'w-3.5 h-3.5 rounded-[4px] border transition-colors duration-150 flex items-center justify-center shrink-0 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5277]/40',
        isMarked
          ? 'bg-[#FF5277] border-[#FF5277] text-white shadow-2xs'
          : 'bg-white border-[#D6CBD0] hover:border-[#FF5277]',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {checked && !indeterminate && (
        <Check className="w-2.5 h-2.5 text-white stroke-[3.5] animate-in zoom-in-50 duration-100" />
      )}
      {indeterminate && (
        <Minus className="w-2.5 h-2.5 text-white stroke-[3.5]" />
      )}
    </button>
  );
};
