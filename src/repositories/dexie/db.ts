import Dexie, { type Table } from 'dexie';
import { Order } from '../../types';

export class MewFlowDatabase extends Dexie {
  orders!: Table<Order, string>;

  constructor() {
    super('MewFlowDB');
    this.version(1).stores({
      orders: 'id, orderNo, type, status, server, platform, customerName, createdAt, updatedAt',
    });
  }
}

export const db = new MewFlowDatabase();
