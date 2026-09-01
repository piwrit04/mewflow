import {
  OrderType,
  PlatformType,
  OrderStatus,
  ServerType,
  OrderSettlementResult,
} from '../types';

export interface SettlementInput {
  type: OrderType;
  amount: number;
  isTransferred: boolean;
  platform: PlatformType;
  customTransferAmount?: number;
}

/**
 * Independent Settlement Service
 * Calculates orderAmount, transferAmount, platformFee, and actualAmount.
 */
export function calculateSettlement(input: SettlementInput): OrderSettlementResult {
  const orderAmount = Math.max(0, Number(input.amount) || 0);

  // Platform Fee calculation
  let platformFee = 0;
  if (input.platform === 'xianyu') {
    // 闲鱼平台费率 1.6%
    platformFee = Math.round(orderAmount * 0.016 * 100) / 100;
  } else if (input.platform === 'wechat') {
    platformFee = 0;
  }

  // Transfer Amount calculation
  let transferAmount = 0;
  if (input.isTransferred) {
    if (input.customTransferAmount !== undefined && input.customTransferAmount >= 0) {
      transferAmount = Math.round(input.customTransferAmount * 100) / 100;
    } else {
      // Excel 默认转单比例约 80%
      transferAmount = Math.round(orderAmount * 0.8 * 100) / 100;
    }
  }

  // Actual Received Amount calculation
  let actualAmount = 0;
  if (input.isTransferred) {
    actualAmount = Math.max(0, Math.round((orderAmount - transferAmount - platformFee) * 100) / 100);
  } else {
    actualAmount = Math.max(0, Math.round((orderAmount - platformFee) * 100) / 100);
  }

  return {
    orderAmount,
    transferAmount,
    platformFee,
    actualAmount,
  };
}

/**
 * Format currency display (e.g. "¥128.00")
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '¥0.00';
  }
  return `¥${amount.toFixed(2)}`;
}

/**
 * Format date display (e.g. "2026-08-31 14:30")
 */
export function formatDateTime(isoString: string | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  } catch {
    return isoString;
  }
}

/**
 * Format order ID to #NTE26083101 style for display and search
 */
export function formatNTEOrderNo(orderNo: string | undefined): string {
  if (!orderNo) return '#NTE--';
  const trimmed = orderNo.trim();
  if (trimmed.startsWith('#NTE')) return trimmed;
  if (trimmed.startsWith('NTE')) return `#${trimmed}`;
  if (trimmed.startsWith('MF')) {
    const clean = trimmed.replace('MF', '');
    if (clean.length >= 8) {
      const yy = clean.slice(2, 4);
      const mmdd = clean.slice(4, 8);
      const suffix = clean.slice(-2);
      return `#NTE${yy}${mmdd}${suffix}`;
    }
  }
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

/**
 * Human-readable mapping labels
 */
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  standard: '普通单',
  hosting: '托管单',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const SERVER_LABELS: Record<ServerType, string> = {
  official: '官服',
  international: '国际服',
  bilibili: 'B服',
};

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  xianyu: '闲鱼',
  wechat: '微信',
};
