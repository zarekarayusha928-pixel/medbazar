import { Order, OrderStatus } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_ORDERS } from './mockData';

let mockOrdersList: Order[] = [...MOCK_ORDERS];

export interface OrderQueryParams {
  organizationId?: string;
  branchId?: string;
  customerId?: string;
  status?: string;
}

export const orderApi = {
  async getOrders(params?: OrderQueryParams): Promise<Order[]> {
    if (!isMockMode()) {
      return apiClient.get<Order[]>('/orders', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockOrdersList];

    if (params?.organizationId && params.organizationId !== 'ALL') {
      list = list.filter((o) => o.organizationId === params.organizationId);
    }
    if (params?.branchId && params.branchId !== 'ALL') {
      list = list.filter((o) => o.branchId === params.branchId);
    }
    if (params?.customerId) {
      list = list.filter((o) => o.customerId === params.customerId);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((o) => o.status === params.status);
    }

    return list;
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Order>(`/orders/${id}`);
    }

    await mockDelay(100);
    return mockOrdersList.find((o) => o.id === id);
  },

  async createOrder(orderData: any): Promise<Order> {
    if (!isMockMode()) {
      const payload = {
        branchId: orderData.branchId,
        organizationId: orderData.organizationId,
        items: (orderData.items || []).map((i: any) => ({
          medicineId: i.medicineId || i.medicine?.id || i.id,
          quantity: i.quantity,
        })),
        orderType: orderData.orderType || 'ONLINE',
        paymentMethod: orderData.paymentMethod || 'ONLINE',
        paymentRef: orderData.paymentRef,
        deliveryAddress: orderData.deliveryAddress,
        prescriptionId: orderData.prescriptionId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        idempotencyKey: orderData.idempotencyKey,
      };
      return apiClient.post<Order>('/orders', payload);
    }

    await mockDelay(250);
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `MB-${Math.floor(100000 + Math.random() * 900000)}`,
      organizationId: orderData.organizationId || 'pharm_1',
      organizationName: orderData.organizationName || 'Apothecary Healthcare',
      branchId: orderData.branchId || 'br_1',
      branchName: orderData.branchName || 'Shivajinagar Central Dispensary',
      customerId: orderData.customerId || 'usr_cust_1',
      customerName: orderData.customerName || 'Rajesh Sharma',
      customerPhone: orderData.customerPhone || '+91 98765 43210',
      orderType: orderData.orderType || 'ONLINE',
      status: orderData.status || 'CONFIRMED',
      paymentStatus: orderData.paymentStatus || 'PAID',
      paymentMethod: orderData.paymentMethod || 'UPI',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      total: orderData.total || 0,
      deliveryAddress: orderData.deliveryAddress || 'Flat 402, Shivajinagar, Pune, Maharashtra - 411005',
      createdAt: new Date().toISOString(),
      prescriptionId: orderData.prescriptionId,
      prescriptionStatus: orderData.prescriptionStatus,
    };

    mockOrdersList = [newOrder, ...mockOrdersList];
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (!isMockMode()) {
      return apiClient.patch<Order>(`/orders/${orderId}/status`, { status });
    }

    await mockDelay(200);
    const order = mockOrdersList.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = status;
    return { ...order };
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    if (!isMockMode()) {
      return apiClient.post<Order>(`/orders/${orderId}/cancel`, { reason });
    }

    await mockDelay(200);
    const order = mockOrdersList.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = 'CANCELLED';
    return { ...order };
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.getOrders({ customerId });
  },

  async reorder(orderId: string): Promise<Order> {
    if (!isMockMode()) {
      return apiClient.post<Order>(`/orders/${orderId}/reorder`);
    }

    await mockDelay(200);
    const existing = mockOrdersList.find((o) => o.id === orderId);
    if (!existing) {
      throw new Error(`Order ${orderId} not found`);
    }

    const reordered: Order = {
      ...existing,
      id: `ord_${Date.now()}`,
      orderNumber: `MB-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    };

    mockOrdersList = [reordered, ...mockOrdersList];
    return reordered;
  },
};
