import { Inventory, InventoryBatch, StockMovement } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_INVENTORY } from './mockData';

let mockInventoryList: Inventory[] = [...MOCK_INVENTORY];
let mockMovementsList: StockMovement[] = [];

export interface InventoryQueryParams {
  branchId?: string;
  organizationId?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  search?: string;
}

export interface StockTransferRequest {
  sourceBranchId: string;
  destinationBranchId: string;
  medicineId: string;
  quantity: number;
  batchNumber?: string;
  notes?: string;
}

export const inventoryApi = {
  async getBranchInventory(branchId: string): Promise<Inventory[]> {
    return this.getInventory({ branchId });
  },

  async getInventory(params?: InventoryQueryParams): Promise<Inventory[]> {
    if (!isMockMode()) {
      return apiClient.get<Inventory[]>('/inventory', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockInventoryList];

    if (params?.branchId) {
      list = list.filter((inv) => inv.branchId === params.branchId);
    }
    if (params?.organizationId) {
      list = list.filter((inv) => inv.organizationId === params.organizationId);
    }
    if (params?.lowStock) {
      list = list.filter((inv) => inv.status === 'LOW_STOCK' || inv.status === 'OUT_OF_STOCK');
    }
    if (params?.expiringSoon) {
      const now = Date.now();
      list = list.filter((inv) => {
        return (inv.batches || []).some((b) => {
          const exp = new Date(b.expiryDate).getTime();
          const days = (exp - now) / (1000 * 3600 * 24);
          return days > 0 && days <= 90;
        });
      });
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (inv) =>
          inv.medicine?.name.toLowerCase().includes(q) ||
          inv.medicine?.genericName.toLowerCase().includes(q) ||
          inv.medicine?.brand.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Inventory>(`/inventory/${id}`);
    }

    await mockDelay(100);
    return mockInventoryList.find((inv) => inv.id === id);
  },

  async adjustStock(inventoryId: string, newQuantity: number, reason: string): Promise<Inventory> {
    if (!isMockMode()) {
      return apiClient.post<Inventory>(`/inventory/${inventoryId}/adjust`, { newQuantity, reason });
    }

    await mockDelay(200);
    const item = mockInventoryList.find((inv) => inv.id === inventoryId);
    if (!item) {
      throw new Error(`Inventory item ${inventoryId} not found`);
    }

    const delta = newQuantity - item.quantity;
    item.quantity = newQuantity;
    item.status = newQuantity === 0 ? 'OUT_OF_STOCK' : newQuantity <= item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';
    item.updatedAt = new Date().toISOString();

    mockMovementsList.unshift({
      id: `sm_${Date.now()}`,
      organizationId: item.organizationId,
      branchId: item.branchId,
      inventoryId: item.id,
      medicineName: item.medicine?.name || 'Medicine',
      movementType: 'ADJUSTMENT',
      quantity: delta,
      referenceType: 'ADJUSTMENT',
      notes: reason,
      createdAt: new Date().toISOString(),
    });

    return { ...item };
  },

  async getLowStockAlerts(branchId?: string): Promise<Inventory[]> {
    return this.getInventory({ branchId, lowStock: true });
  },

  async getExpiringSoon(branchId?: string): Promise<Inventory[]> {
    return this.getInventory({ branchId, expiringSoon: true });
  },

  async addBatch(inventoryId: string, batchData: Omit<InventoryBatch, 'id' | 'inventoryId'>): Promise<Inventory> {
    if (!isMockMode()) {
      return apiClient.post<Inventory>(`/inventory/${inventoryId}/batches`, batchData);
    }

    await mockDelay(200);
    const item = mockInventoryList.find((inv) => inv.id === inventoryId);
    if (!item) {
      throw new Error(`Inventory item ${inventoryId} not found`);
    }

    const newBatch: InventoryBatch = {
      id: `batch_${Date.now()}`,
      inventoryId,
      ...batchData,
    };

    item.batches = [...(item.batches || []), newBatch];
    item.quantity += batchData.quantity;
    item.status = item.quantity === 0 ? 'OUT_OF_STOCK' : item.quantity <= item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';
    item.updatedAt = new Date().toISOString();

    mockMovementsList.unshift({
      id: `sm_${Date.now()}`,
      organizationId: item.organizationId,
      branchId: item.branchId,
      inventoryId: item.id,
      medicineName: item.medicine?.name || 'Medicine',
      movementType: 'PURCHASE',
      quantity: batchData.quantity,
      referenceType: 'PURCHASE_ORDER',
      notes: `Batch ${batchData.batchNumber} added`,
      createdAt: new Date().toISOString(),
    });

    return { ...item };
  },

  async getBatches(inventoryId: string): Promise<InventoryBatch[]> {
    if (!isMockMode()) {
      return apiClient.get<InventoryBatch[]>(`/inventory/${inventoryId}/batches`);
    }

    await mockDelay(100);
    const item = mockInventoryList.find((inv) => inv.id === inventoryId);
    return item?.batches || [];
  },

  async getMovements(inventoryId: string): Promise<StockMovement[]> {
    if (!isMockMode()) {
      return apiClient.get<StockMovement[]>(`/inventory/${inventoryId}/movements`);
    }

    await mockDelay(100);
    return mockMovementsList.filter((m) => m.inventoryId === inventoryId);
  },

  async transferStock(data: StockTransferRequest): Promise<any> {
    if (!isMockMode()) {
      return apiClient.post('/inventory/transfer', data);
    }

    await mockDelay(250);
    if (data.sourceBranchId === data.destinationBranchId) {
      throw new Error('Source and destination branches must be different.');
    }

    const source = mockInventoryList.find(
      (i) => i.branchId === data.sourceBranchId && i.medicineId === data.medicineId
    );
    if (!source || source.quantity < data.quantity) {
      throw new Error('Insufficient stock at source branch.');
    }

    source.quantity -= data.quantity;
    source.status = source.quantity === 0 ? 'OUT_OF_STOCK' : source.quantity <= source.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';

    let dest = mockInventoryList.find(
      (i) => i.branchId === data.destinationBranchId && i.medicineId === data.medicineId
    );
    if (!dest) {
      dest = {
        ...source,
        id: `inv_${Date.now()}`,
        branchId: data.destinationBranchId,
        quantity: data.quantity,
        batches: [],
      };
      mockInventoryList.push(dest);
    } else {
      dest.quantity += data.quantity;
      dest.status = 'IN_STOCK';
    }

    mockMovementsList.unshift(
      {
        id: `sm_${Date.now()}_out`,
        organizationId: source.organizationId,
        branchId: source.branchId,
        inventoryId: source.id,
        medicineName: source.medicine?.name || 'Medicine',
        movementType: 'TRANSFER_OUT',
        quantity: -data.quantity,
        notes: data.notes || `Transferred to ${data.destinationBranchId}`,
        createdAt: new Date().toISOString(),
      },
      {
        id: `sm_${Date.now()}_in`,
        organizationId: dest.organizationId,
        branchId: dest.branchId,
        inventoryId: dest.id,
        medicineName: dest.medicine?.name || 'Medicine',
        movementType: 'TRANSFER_IN',
        quantity: data.quantity,
        notes: data.notes || `Received from ${data.sourceBranchId}`,
        createdAt: new Date().toISOString(),
      }
    );

    return {
      transferredQuantity: data.quantity,
      sourceRemainingQuantity: source.quantity,
      destinationNewQuantity: dest.quantity,
    };
  },
};
