import { PurchaseOrder } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_PURCHASES } from './mockData';

let mockPurchasesList: PurchaseOrder[] = [...MOCK_PURCHASES];

export interface PurchaseQueryParams {
  branchId?: string;
  status?: string;
  search?: string;
}

export const purchaseApi = {
  async getPurchases(params?: PurchaseQueryParams): Promise<PurchaseOrder[]> {
    if (!isMockMode()) {
      return apiClient.get<PurchaseOrder[]>('/purchases', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockPurchasesList];

    if (params?.branchId) {
      list = list.filter((p) => p.branchId === params.branchId);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((p) => p.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.supplierName.toLowerCase().includes(q) ||
          p.purchaseNumber.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getPurchaseById(id: string): Promise<PurchaseOrder | undefined> {
    if (!isMockMode()) {
      return apiClient.get<PurchaseOrder>(`/purchases/${id}`);
    }

    await mockDelay(100);
    return mockPurchasesList.find((p) => p.id === id);
  },

  async createPurchase(data: Partial<PurchaseOrder> & { items?: any[] }): Promise<PurchaseOrder> {
    if (!isMockMode()) {
      return apiClient.post<PurchaseOrder>('/purchases', data);
    }

    await mockDelay(200);
    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      purchaseNumber: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      supplierName: data.supplierName || 'Distributor Corp',
      organizationId: data.organizationId || 'pharm_1',
      branchId: data.branchId || 'br_1',
      branchName: data.branchName || 'Main Dispensary Branch',
      itemsCount: data.itemsCount || data.items?.length || 1,
      itemsSummary: data.itemsSummary || 'Prescription and OTC stock',
      total: Number(data.total || 0),
      status: 'PENDING',
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    mockPurchasesList = [newPO, ...mockPurchasesList];
    return newPO;
  },

  async receivePurchase(id: string): Promise<PurchaseOrder> {
    if (!isMockMode()) {
      return apiClient.post<PurchaseOrder>(`/purchases/${id}/receive`);
    }

    await mockDelay(200);
    const index = mockPurchasesList.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Purchase order ${id} not found.`);
    }

    mockPurchasesList[index] = {
      ...mockPurchasesList[index],
      status: 'RECEIVED',
    };

    return mockPurchasesList[index];
  },
};
