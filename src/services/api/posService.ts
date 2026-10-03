import { PosSale, PosSaleItem } from '@/types';
import { MOCK_INVENTORY } from './mockData';

export interface CreatePosSalePayload {
  organizationId: string;
  branchId: string;
  items: PosSaleItem[];
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  customerName?: string;
  customerPhone?: string;
  discount: number;
}

export const posService = {
  async processSale(payload: CreatePosSalePayload): Promise<PosSale> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate stock in branch inventory
        for (const item of payload.items) {
          const invItem = MOCK_INVENTORY.find(
            inv => inv.branchId === payload.branchId && inv.medicineId === item.medicineId
          );
          if (!invItem || invItem.quantity < item.quantity) {
            return reject(new Error(`Insufficient stock for ${item.medicineName}`));
          }
        }

        // Deduct stock from the branch inventory (Same source of truth as online)
        for (const item of payload.items) {
          const invItem = MOCK_INVENTORY.find(
            inv => inv.branchId === payload.branchId && inv.medicineId === item.medicineId
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
          createdAt: new Date().toISOString()
        };

        resolve(newSale);
      }, 250);
    });
  }
};
