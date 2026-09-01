import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SelectProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  icon?: React.ReactNode;
}

export function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = '请选择',
  label,
  size = 'md',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  align = 'left',
  icon,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOptionIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedOptionIndex >= 0 ? options[selectedOptionIndex] : undefined;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedOptionIndex >= 0 ? selectedOptionIndex : 0);
    }
  }, [isOpen, selectedOptionIndex]);

  // Keyboard navigation handler for Select
  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const sizeClasses = {
    xs: 'h-8 px-2.5 text-xs rounded-xl',
    sm: 'h-10 px-3 text-xs sm:text-sm rounded-2xl',
    md: 'h-11 px-3.5 text-xs sm:text-sm rounded-2xl',
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 bg-[#FFFFFF] border border-[#F4E9E4] hover:border-[#FF5277] hover:bg-[#FFF2F5]/40 text-[#4A4450] font-semibold outline-none transition-[box-shadow,border-color,background-color] duration-200 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#FF5277]/40 focus-visible:border-[#FF5277] ${
          isOpen ? 'border-[#FF5277] bg-[#FFFFFF] ring-2 ring-[#FFCCD7]' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#8F8795] shrink-0">{icon}</span>}
          {selectedOption ? (
            <span className="truncate flex items-center gap-1.5">
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-[#B5ABB9] truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8F8795] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FF5277]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 2, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full z-50 mt-1 min-w-[130px] w-full bg-[#FFFFFF] border border-[#F4E9E4] rounded-2xl p-1.5 shadow-lg shadow-[#4A4450]/8 max-h-60 overflow-y-auto ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${dropdownClassName}`}
            role="listbox"
          >
            <div className="space-y-0.5">
              {options.map((option, idx) => {
                const isSelected = option.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      buttonRef.current?.focus();
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF2F5] text-[#FF5277] font-bold'
                        : isHighlighted
                        ? 'bg-[#FFF8F5] text-[#FF5277] font-semibold'
                        : 'text-[#4A4450] hover:bg-[#FFF8F5] font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {option.icon && <span>{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {option.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFF2F5] text-[#FF5277] font-bold">
                          {option.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5277]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
