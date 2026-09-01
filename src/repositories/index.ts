import { IOrderRepository } from './IOrderRepository';
import { DexieOrderRepository } from './dexie/DexieOrderRepository';

export const orderRepository: IOrderRepository = new DexieOrderRepository();

export * from './IOrderRepository';
