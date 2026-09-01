import { db } from './db';
import {
  IOrderRepository,
  CreateOrderDTO,
  UpdateOrderDTO,
} from '../IOrderRepository';
import {
  Order,
  OrderFilterOptions,
  OrderSummaryStats,
  OrderStatus,
} from '../../types';
import { calculateSettlement, formatNTEOrderNo } from '../../services/settlementService';
import { generateSeedOrders } from './seedData';

export class DexieOrderRepository implements IOrderRepository {
  private hasCheckedSeed = false;

  private async ensureInitialSeed(): Promise<void> {
    if (this.hasCheckedSeed) return;
    this.hasCheckedSeed = true;
    const currentCount = await db.orders.count();
    if (currentCount <= 1) {
      const seeds = generateSeedOrders();
      for (const seed of seeds) {
        const exists = await db.orders.get(seed.id);
        if (!exists) {
          await db.orders.put(seed);
        }
      }
    }
  }

  async seedSampleData(): Promise<void> {
    const seeds = generateSeedOrders();
    for (const seed of seeds) {
      await db.orders.put(seed);
    }
  }

  private generateOrderNo(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomSeq = String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
    return `#NTE${yy}${mm}${dd}${randomSeq}`;
  }

  async getAll(filter?: OrderFilterOptions): Promise<Order[]> {
    await this.ensureInitialSeed();
    const collection = db.orders.toCollection();

    let list = await collection.toArray();

    // Sort by createdAt descending (newest first)
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter) {
      if (filter.searchTerm && filter.searchTerm.trim() !== '') {
        const rawTerm = filter.searchTerm.trim();
        const term = rawTerm.toLowerCase();
        const termAlphanumeric = term.replace(/[^a-z0-9]/g, '');
        const termDigits = term.replace(/\D/g, '');

        list = list.filter((o) => {
          const rawNo = (o.orderNo || '').toLowerCase();
          const formattedNo = formatNTEOrderNo(o.orderNo || '').toLowerCase();
          const rawNoAlphanumeric = rawNo.replace(/[^a-z0-9]/g, '');
          const formattedNoAlphanumeric = formattedNo.replace(/[^a-z0-9]/g, '');

          const matchesOrderNo =
            rawNo.includes(term) ||
            formattedNo.includes(term) ||
            (termAlphanumeric.length > 0 &&
              (rawNoAlphanumeric.includes(termAlphanumeric) ||
                formattedNoAlphanumeric.includes(termAlphanumeric)));

          const matchesCustomer =
            o.customerName && o.customerName.toLowerCase().includes(term);

          const matchesProject =
            o.project && o.project.toLowerCase().includes(term);

          const phone = (o.customerPhone || '').toLowerCase();
          const phoneDigits = phone.replace(/\D/g, '');
          const matchesPhone =
            phone.includes(term) ||
            (termDigits.length > 0 && phoneDigits.includes(termDigits));

          const matchesRemark =
            o.remark && o.remark.toLowerCase().includes(term);

          return (
            matchesOrderNo ||
            matchesCustomer ||
            matchesProject ||
            matchesPhone ||
            matchesRemark
          );
        });
      }

      if (filter.type && filter.type !== 'all') {
        list = list.filter((o) => o.type === filter.type);
      }

      if (filter.status && filter.status !== 'all') {
        list = list.filter((o) => o.status === filter.status);
      }

      if (filter.platform && filter.platform !== 'all') {
        list = list.filter((o) => o.platform === filter.platform);
      }

      if (filter.server && filter.server !== 'all') {
        list = list.filter((o) => o.server === filter.server);
      }
    }

    return list;
  }

  async getById(id: string): Promise<Order | null> {
    const order = await db.orders.get(id);
    return order || null;
  }

  async create(dto: CreateOrderDTO): Promise<Order> {
    const now = new Date().toISOString();
    const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const orderNo = this.generateOrderNo();

    const isTransferred = !!dto.isTransferred;
    const settlement = calculateSettlement({
      type: dto.type,
      amount: dto.amount,
      isTransferred,
      platform: dto.platform,
      customTransferAmount: dto.customTransferAmount,
    });

    const newOrder: Order = {
      id,
      orderNo,
      type: dto.type,
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone?.trim() || '',
      project: dto.project.trim(),
      amount: dto.amount,
      server: dto.server,
      platform: dto.platform,
      remark: dto.remark?.trim() || '',
      isTransferred,
      status: dto.status || 'pending',
      transferAmount: settlement.transferAmount,
      platformFee: settlement.platformFee,
      actualAmount: settlement.actualAmount,
      createdAt: now,
      updatedAt: now,
    };

    await db.orders.add(newOrder);
    return newOrder;
  }

  async update(id: string, dto: UpdateOrderDTO): Promise<Order> {
    const existing = await db.orders.get(id);
    if (!existing) {
      throw new Error(`未找到 ID 为 ${id} 的订单`);
    }

    const type = dto.type !== undefined ? dto.type : existing.type;
    const amount = dto.amount !== undefined ? dto.amount : existing.amount;
    const isTransferred =
      dto.isTransferred !== undefined ? dto.isTransferred : existing.isTransferred;
    const platform = dto.platform !== undefined ? dto.platform : existing.platform;
    const customTransferAmount = dto.customTransferAmount;

    const settlement = calculateSettlement({
      type,
      amount,
      isTransferred,
      platform,
      customTransferAmount,
    });

    const now = new Date().toISOString();

    const updatedOrder: Order = {
      ...existing,
      type,
      customerName:
        dto.customerName !== undefined ? dto.customerName.trim() : existing.customerName,
      customerPhone:
        dto.customerPhone !== undefined ? dto.customerPhone.trim() : existing.customerPhone,
      project: dto.project !== undefined ? dto.project.trim() : existing.project,
      amount,
      server: dto.server !== undefined ? dto.server : existing.server,
      platform,
      remark: dto.remark !== undefined ? dto.remark.trim() : existing.remark,
      isTransferred,
      status: dto.status !== undefined ? dto.status : existing.status,
      transferAmount: settlement.transferAmount,
      platformFee: settlement.platformFee,
      actualAmount: settlement.actualAmount,
      updatedAt: now,
    };

    await db.orders.put(updatedOrder);
    return updatedOrder;
  }

  async advanceStatus(id: string): Promise<Order> {
    const existing = await db.orders.get(id);
    if (!existing) {
      throw new Error(`未找到 ID 为 ${id} 的订单`);
    }

    let nextStatus: OrderStatus = 'in_progress';
    if (existing.status === 'pending') {
      nextStatus = 'in_progress';
    } else if (existing.status === 'in_progress') {
      nextStatus = 'completed';
    } else if (existing.status === 'completed') {
      nextStatus = 'in_progress'; // Loop back if clicked again
    } else if (existing.status === 'cancelled') {
      nextStatus = 'pending';
    }

    const now = new Date().toISOString();
    const updatedOrder: Order = {
      ...existing,
      status: nextStatus,
      updatedAt: now,
    };

    await db.orders.put(updatedOrder);
    return updatedOrder;
  }

  async batchUpdateStatus(ids: string[], status: OrderStatus): Promise<number> {
    const now = new Date().toISOString();
    let count = 0;
    for (const id of ids) {
      const existing = await db.orders.get(id);
      if (existing) {
        await db.orders.put({
          ...existing,
          status,
          updatedAt: now,
        });
        count++;
      }
    }
    return count;
  }

  async batchDelete(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const existing = await db.orders.get(id);
      if (existing) {
        await db.orders.delete(id);
        count++;
      }
    }
    return count;
  }

  async exportJSON(): Promise<string> {
    await this.ensureInitialSeed();
    const orders = await db.orders.toArray();
    const payload = {
      version: '1.0.0',
      appName: 'MewFlow',
      exportTime: new Date().toISOString(),
      ordersCount: orders.length,
      orders,
    };
    return JSON.stringify(payload, null, 2);
  }

  async importJSON(jsonData: string, mode: 'merge' | 'replace' = 'merge'): Promise<{ count: number }> {
    try {
      const parsed = JSON.parse(jsonData);
      const ordersList: Order[] = Array.isArray(parsed) ? parsed : (parsed.orders || []);
      
      if (!Array.isArray(ordersList) || ordersList.length === 0) {
        throw new Error('导入文件中未检测到有效的订单列表');
      }

      if (mode === 'replace') {
        await db.orders.clear();
      }

      let count = 0;
      for (const item of ordersList) {
        if (item && item.id && item.amount !== undefined && item.project) {
          await db.orders.put(item);
          count++;
        }
      }

      return { count };
    } catch (err: any) {
      throw new Error(`解析导入数据失败: ${err.message || '格式错误'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    const existing = await db.orders.get(id);
    if (!existing) return false;
    await db.orders.delete(id);
    return true;
  }

  async count(): Promise<number> {
    return await db.orders.count();
  }

  async getSummaryStats(): Promise<OrderSummaryStats> {
    await this.ensureInitialSeed();
    const all = await db.orders.toArray();
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedTodayCount = 0;

    const todayStr = new Date().toDateString();

    for (const order of all) {
      if (order.status === 'pending') {
        pendingCount++;
      } else if (order.status === 'in_progress') {
        inProgressCount++;
      } else if (order.status === 'completed') {
        const orderDate = new Date(order.updatedAt || order.createdAt).toDateString();
        if (orderDate === todayStr) {
          completedTodayCount++;
        }
      }
    }

    return {
      pendingCount,
      inProgressCount,
      completedTodayCount,
      totalCount: all.length,
    };
  }
}
