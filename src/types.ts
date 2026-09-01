export interface User {
  username: string;
  avatarUrl?: string;
  roleTitle?: string;
}

export type NavTabId = 'dashboard' | 'orders' | 'customers' | 'analytics' | 'settings';

export interface NavTabItem {
  id: NavTabId;
  label: string;
  iconName: string;
}

export interface OrderSummaryStats {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  totalCount: number;
}

// Order Types & Enums
export type OrderType = 'standard' | 'hosting'; // 普通单 | 托管

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'; // 待处理 | 进行中 | 已完成 | 已取消

export type ServerType = 'official' | 'international' | 'bilibili'; // 官服 | 国际服 | B服

export type PlatformType = 'xianyu' | 'wechat'; // 闲鱼 | 微信

export interface Order {
  id: string;
  orderNo: string;
  type: OrderType;
  customerName: string;
  customerPhone?: string;
  project: string;
  amount: number;
  server: ServerType;
  platform: PlatformType;
  remark?: string;
  isTransferred: boolean;
  status: OrderStatus;
  transferAmount: number;
  platformFee: number;
  actualAmount: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface OrderSettlementResult {
  orderAmount: number;
  transferAmount: number;
  platformFee: number;
  actualAmount: number;
}

export interface OrderFilterOptions {
  searchTerm?: string;
  type?: OrderType | 'all';
  status?: OrderStatus | 'all';
  platform?: PlatformType | 'all';
  server?: ServerType | 'all';
}

export type OrderViewMode = 
  | { view: 'list' }
  | { view: 'new' }
  | { view: 'detail'; orderId: string }
  | { view: 'edit'; orderId: string };
