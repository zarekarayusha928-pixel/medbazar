import { DeliveryAssignment } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_DELIVERIES } from './mockData';

let mockDeliveriesList: DeliveryAssignment[] = [...MOCK_DELIVERIES];

export interface DeliveryQueryParams {
  branchId?: string;
  status?: string;
}

export const deliveryApi = {
  async getDeliveries(params?: DeliveryQueryParams): Promise<DeliveryAssignment[]> {
    if (!isMockMode()) {
      return apiClient.get<DeliveryAssignment[]>('/deliveries', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockDeliveriesList];

    if (params?.branchId && params.branchId !== 'ALL') {
      list = list.filter((d) => d.branchId === params.branchId);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((d) => d.status === params.status);
    }

    return list;
  },

  async getDeliveryById(id: string): Promise<DeliveryAssignment | undefined> {
    if (!isMockMode()) {
      return apiClient.get<DeliveryAssignment>(`/deliveries/${id}`);
    }

    await mockDelay(100);
    return mockDeliveriesList.find((d) => d.id === id);
  },

  async assignDelivery(data: Partial<DeliveryAssignment>): Promise<DeliveryAssignment> {
    if (!isMockMode()) {
      return apiClient.post<DeliveryAssignment>('/deliveries', data);
    }

    await mockDelay(200);
    const newDelivery: DeliveryAssignment = {
      id: `del_${Date.now()}`,
      orderId: data.orderId || 'ord_1',
      orderNumber: data.orderNumber || 'MB-771249',
      customerName: data.customerName || 'Patient Name',
      customerPhone: data.customerPhone || '+91 98000 00000',
      deliveryAddress: data.deliveryAddress || 'Delivery Address, Pune',
      deliveryStaffName: data.deliveryStaffName || 'Ramesh Pawar',
      deliveryStaffPhone: data.deliveryStaffPhone || '+91 98230 33221',
      branchId: data.branchId || 'br_1',
      branchName: data.branchName || 'Shivajinagar Central Dispensary',
      status: 'ASSIGNED',
      assignedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    mockDeliveriesList = [newDelivery, ...mockDeliveriesList];
    return newDelivery;
  },

  async updateDeliveryStatus(id: string, status: DeliveryAssignment['status']): Promise<DeliveryAssignment> {
    if (!isMockMode()) {
      return apiClient.patch<DeliveryAssignment>(`/deliveries/${id}/status`, { status });
    }

    await mockDelay(200);
    const item = mockDeliveriesList.find((d) => d.id === id);
    if (!item) {
      throw new Error(`Delivery assignment ${id} not found`);
    }

    item.status = status;
    if (status === 'DELIVERED') {
      item.completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return { ...item };
  },
};
