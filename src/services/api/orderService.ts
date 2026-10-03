import { Order, OrderStatus } from '@/types';
import { MOCK_ORDERS } from './mockData';

export const orderService = {
  async getOrders(organizationId?: string, branchId?: string): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let orders = [...MOCK_ORDERS];
        if (organizationId) orders = orders.filter(o => o.organizationId === organizationId);
        if (branchId) orders = orders.filter(o => o.branchId === branchId);
        resolve(orders);
      }, 150);
    });
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ORDERS.find(o => o.id === id)), 100);
    });
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = MOCK_ORDERS.find(o => o.id === orderId);
        if (!order) return reject(new Error('Order not found'));
        order.status = status;
        resolve({ ...order });
      }, 200);
    });
  }
};
