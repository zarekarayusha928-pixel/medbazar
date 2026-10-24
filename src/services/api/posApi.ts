import { PosSale, PosSaleItem } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_INVENTORY } from './mockData';

export interface CreatePosSalePayload {
  organizationId: string;
  branchId: string;
  items: PosSaleItem[];
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  paymentRef?: string;
  customerName?: string;
  customerPhone?: string;
  discount: number;
  idempotencyKey?: string;
}

let mockPosSales: PosSale[] = [
  {
    id: 'pos_101',
    organizationId: 'pharm_1',
    branchId: 'br_1',
    receiptNumber: 'REC-884192',
    customerName: 'Anand Verma',
    customerPhone: '+91 98200 12345',
    items: [
      {
        id: 'psi_1',
        medicineId: 'med_1',
        medicineName: 'Paracetamol 650mg (Dolo)',
        quantity: 2,
        unitPrice: 32.5,
        total: 65,
        batchNumber: 'BT-2026-A1',
      },
    ],
    subtotal: 65,
    discount: 5,
    total: 60,
    paymentMethod: 'UPI',
    createdBy: 'Kiran Kulkarni (Cashier)',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const posApi = {
  async processSale(payload: CreatePosSalePayload): Promise<PosSale> {
    if (!isMockMode()) {
      return apiClient.post<PosSale>('/pos/sales', payload);
    }

    await mockDelay(250);

    // Validate and deduct stock in branch inventory (mock store)
    for (const item of payload.items) {
      const invItem = MOCK_INVENTORY.find(
        (inv) => inv.branchId === payload.branchId && inv.medicineId === item.medicineId
      );
      if (!invItem || invItem.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.medicineName}`);
      }
    }

    for (const item of payload.items) {
      const invItem = MOCK_INVENTORY.find(
        (inv) => inv.branchId === payload.branchId && inv.medicineId === item.medicineId
      );
      if (invItem) {
        invItem.quantity -= item.quantity;
        if (invItem.quantity === 0) invItem.status = 'OUT_OF_STOCK';
        else if (invItem.quantity <= invItem.reorderLevel) invItem.status = 'LOW_STOCK';
      }
    }

    const subtotal = payload.items.reduce((sum, i) => sum + i.total, 0);
    const total = Math.max(0, subtotal - payload.discount);

    const newSale: PosSale = {
      id: `pos_${Date.now()}`,
      organizationId: payload.organizationId,
      branchId: payload.branchId,
      receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      items: payload.items,
      subtotal,
      discount: payload.discount,
      total,
      paymentMethod: payload.paymentMethod,
      createdBy: 'Kiran Kulkarni (Cashier)',
      createdAt: new Date().toISOString(),
    };

    mockPosSales = [newSale, ...mockPosSales];
    return newSale;
  },

  async getSalesHistory(params?: { organizationId?: string; branchId?: string }): Promise<PosSale[]> {
    if (!isMockMode()) {
      return apiClient.get<PosSale[]>('/pos/sales', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockPosSales];
    if (params?.organizationId) {
      list = list.filter((s) => s.organizationId === params.organizationId);
    }
    if (params?.branchId) {
      list = list.filter((s) => s.branchId === params.branchId);
    }
    return list;
  },

  async getSaleById(id: string): Promise<PosSale | undefined> {
    if (!isMockMode()) {
      return apiClient.get<PosSale>(`/pos/sales/${id}`);
    }

    await mockDelay(100);
    return mockPosSales.find((s) => s.id === id);
  },
};
