import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface PageHeaderProps {
  /** Optional Lucide icon component or ReactNode for the page */
  icon?: LucideIcon | React.ReactNode;
  /** Primary title of the page */
  title: string;
  /** Subtitle / friendly description */
  description?: string;
  /** Optional badge text or node next to title */
  badgeText?: React.ReactNode;
  /** Primary action button label */
  primaryActionLabel?: string;
  /** Primary action button icon */
  primaryActionIcon?: React.ReactNode;
  /** Primary action click handler */
  onPrimaryAction?: () => void;
  /** Optional custom extra action element */
  extra?: React.ReactNode;
  /** Alias for extra actions */
  actions?: React.ReactNode;
  /** Optional className */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  badgeText,
  primaryActionLabel,
  primaryActionIcon,
  onPrimaryAction,
  extra,
  actions,
  className,
}) => {
  const renderIcon = () => {
    if (!icon) {
      return <Sparkles className="w-5 h-5" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-5 h-5" />;
  };

  const actionElements = actions || extra;

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      {/* Left: Standard Icon Container + Title & Description */}
      <div className="flex items-center gap-3">
        {/* Standardized Page Icon Container: 40x40 (w-10 h-10) rounded-2xl with harmonious micro-gradient & inner glow */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFF2F5] to-[#FFE5EC] border border-[#FFCCD7] flex items-center justify-center text-[#FF5277] shrink-0 shadow-[0_2px_8px_0_rgba(255,82,119,0.12)]">
          {renderIcon()}
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A4450] tracking-tight leading-tight text-balance">
              {title}
            </h2>
            {badgeText && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#FFF2F5] text-[#FF5277] border border-[#FFCCD7]">
                {badgeText}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-[#635B69] mt-0.5 leading-relaxed font-semibold">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
        {actionElements}
        {primaryActionLabel && onPrimaryAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onPrimaryAction}
            leftIcon={primaryActionIcon}
            className="font-bold text-xs sm:text-sm shadow-xs"
          >
            {primaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

