import { Inventory, StockMovement } from '@/types';
import { MOCK_INVENTORY } from './mockData';

export const inventoryService = {
  async getBranchInventory(branchId: string): Promise<Inventory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_INVENTORY.filter(inv => inv.branchId === branchId));
      }, 150);
    });
  },

  async adjustStock(inventoryId: string, newQuantity: number, reason: string): Promise<Inventory> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = MOCK_INVENTORY.find(inv => inv.id === inventoryId);
        if (!item) return reject(new Error('Inventory item not found'));
        item.quantity = newQuantity;
        item.status = newQuantity === 0 ? 'OUT_OF_STOCK' : newQuantity <= item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';
        item.updatedAt = new Date().toISOString();
        resolve({ ...item });
      }, 200);
    });
  },

  async getLowStockAlerts(branchId: string): Promise<Inventory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_INVENTORY.filter(inv => inv.branchId === branchId && (inv.status === 'LOW_STOCK' || inv.status === 'OUT_OF_STOCK')));
      }, 100);
    });
  }
};
