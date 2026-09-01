import { Order, OrderFilterOptions, OrderSummaryStats, OrderStatus } from '../types';

export interface CreateOrderDTO {
  type: Order['type'];
  customerName: string;
  customerPhone?: string;
  project: string;
  amount: number;
  server: Order['server'];
  platform: Order['platform'];
  remark?: string;
  isTransferred?: boolean;
  status?: Order['status'];
  customTransferAmount?: number;
}

export interface UpdateOrderDTO {
  type?: Order['type'];
  customerName?: string;
  customerPhone?: string;
  project?: string;
  amount?: number;
  server?: Order['server'];
  platform?: Order['platform'];
  remark?: string;
  isTransferred?: boolean;
  status?: Order['status'];
  customTransferAmount?: number;
}

export interface IOrderRepository {
  getAll(filter?: OrderFilterOptions): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(dto: CreateOrderDTO): Promise<Order>;
  update(id: string, dto: UpdateOrderDTO): Promise<Order>;
  delete(id: string): Promise<boolean>;
  advanceStatus(id: string): Promise<Order>;
  batchUpdateStatus(ids: string[], status: OrderStatus): Promise<number>;
  batchDelete(ids: string[]): Promise<number>;
  exportJSON(): Promise<string>;
  importJSON(jsonData: string, mode?: 'merge' | 'replace'): Promise<{ count: number }>;
  count(): Promise<number>;
  getSummaryStats(): Promise<OrderSummaryStats>;
  seedSampleData(): Promise<void>;
}
