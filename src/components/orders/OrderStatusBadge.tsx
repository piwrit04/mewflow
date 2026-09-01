import React from 'react';
import { Badge } from '../ui/Badge';
import { OrderStatus, OrderType } from '../../types';
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from '../../services/settlementService';
import { ArrowRightLeft } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="pink" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5277] mr-1.5 shrink-0 animate-pulse" />
          {ORDER_STATUS_LABELS.pending}
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="lavender" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA] mr-1.5 shrink-0 animate-pulse" />
          {ORDER_STATUS_LABELS.in_progress}
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="mint" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F855A] mr-1.5 shrink-0" />
          {ORDER_STATUS_LABELS.completed}
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="cream" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#635B69] mr-1.5 shrink-0" />
          {ORDER_STATUS_LABELS.cancelled}
        </Badge>
      );
    default:
      return (
        <Badge variant="cream" className={className}>
          {status}
        </Badge>
      );
  }
};

interface OrderTypeBadgeProps {
  type: OrderType;
  className?: string;
}

export const OrderTypeBadge: React.FC<OrderTypeBadgeProps> = ({ type, className = '' }) => {
  if (type === 'hosting') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF] ${className}`}>
        {ORDER_TYPE_LABELS.hosting}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF2F5] text-[#FF5277] border border-[#FFCCD7] ${className}`}>
      {ORDER_TYPE_LABELS.standard}
    </span>
  );
};

export const TransferredBadge: React.FC<{ rate?: string; className?: string }> = ({ rate = '80%', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-lg bg-[#FFF4DE] text-[#D97706] border border-[#FFD9A0] shadow-xs shrink-0 ${className}`}
      title={`外包转单：按 ${rate} 结算分成`}
      aria-label={`外包转单：按 ${rate} 结算分成`}
    >
      <ArrowRightLeft className="w-3.5 h-3.5" />
    </span>
  );
};

