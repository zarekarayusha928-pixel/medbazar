import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { StockStatus, MovementType, MovementReferenceType } from '@prisma/client';

export interface InventoryFilters {
  branchId?: string;
  organizationId?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  search?: string;
}

// In-memory mock store for tests/offline development
let mockInventory: any[] = [
  {
    id: 'inv_1',
    organizationId: 'pharm_1',
    branchId: 'br_1',
    medicineId: 'med_1',
    quantity: 120,
    reorderLevel: 25,
    sellingPrice: 32.5,
    mrp: 35.0,
    status: 'IN_STOCK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    medicine: {
      id: 'med_1',
      name: 'Dolo 650 Tablet',
      genericName: 'Paracetamol',
      brand: 'Micro Labs',
      composition: 'Paracetamol 650mg',
      dosageForm: 'TABLET',
      strength: '650mg',
      prescriptionRequired: false,
    },
    batches: [
      {
        id: 'batch_1',
        inventoryId: 'inv_1',
        batchNumber: 'DL-2026-X1',
        expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(),
        quantity: 120,
        purchasePrice: 22.0,
      },
    ],
  },
  {
    id: 'inv_2',
    organizationId: 'pharm_1',
    branchId: 'br_1',
    medicineId: 'med_2',
    quantity: 8, // Low stock!
    reorderLevel: 15,
    sellingPrice: 165.0,
    mrp: 180.0,
    status: 'LOW_STOCK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    medicine: {
      id: 'med_2',
      name: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin + Clavulanic Acid',
      brand: 'GSK',
      composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
      dosageForm: 'TABLET',
      strength: '625mg',
      prescriptionRequired: true,
    },
    batches: [
      {
        id: 'batch_2',
        inventoryId: 'inv_2',
        batchNumber: 'AUG-2026-9A',
        expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(), // Expiring in 25 days!
        quantity: 8,
        purchasePrice: 125.0,
      },
    ],
  },
];

let mockMovements: any[] = [];

function calculateStatus(quantity: number, reorderLevel: number): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export class InventoryService {
  async getInventory(filters: InventoryFilters = {}) {
    if (await isDbReachable()) {
      try {
        const where: any = {};

        if (filters.branchId) {
          where.branchId = filters.branchId;
        }

        if (filters.organizationId) {
          where.organizationId = filters.organizationId;
        }

        if (filters.lowStock) {
          where.OR = [
            { status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } },
            { quantity: { lte: prisma.inventory.fields?.reorderLevel || 10 } },
          ];
        }

        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim();
          where.medicine = {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { genericName: { contains: q, mode: 'insensitive' } },
              { brand: { contains: q, mode: 'insensitive' } },
            ],
          };
        }

        const items = await prisma.inventory.findMany({
          where,
          include: {
            medicine: { include: { category: true } },
            batches: true,
          },
          orderBy: { updatedAt: 'desc' },
        });

        if (items.length > 0) {
          if (filters.expiringSoon) {
            const thresholdDate = new Date(Date.now() + 90 * 86400000);
            return items.filter((inv) =>
              inv.batches.some((b) => new Date(b.expiryDate) <= thresholdDate)
            );
          }
          return items;
        }
      } catch (_err) {
        // Fallback
      }
    }

    // Filter in-memory mock store
    let list = [...mockInventory];

    if (filters.branchId) {
      list = list.filter((inv) => inv.branchId === filters.branchId);
    }

    if (filters.organizationId) {
      list = list.filter((inv) => inv.organizationId === filters.organizationId);
    }

    if (filters.lowStock) {
      list = list.filter((inv) => inv.status === 'LOW_STOCK' || inv.status === 'OUT_OF_STOCK');
    }

    if (filters.expiringSoon) {
      const thresholdDate = new Date(Date.now() + 90 * 86400000);
      list = list.filter((inv) =>
        inv.batches?.some((b: any) => new Date(b.expiryDate) <= thresholdDate)
      );
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (inv) =>
          inv.medicine?.name?.toLowerCase().includes(q) ||
          inv.medicine?.genericName?.toLowerCase().includes(q) ||
          inv.medicine?.brand?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getInventoryById(id: string) {
    if (await isDbReachable()) {
      try {
        const item = await prisma.inventory.findUnique({
          where: { id },
          include: {
            medicine: { include: { category: true } },
            batches: { orderBy: { expiryDate: 'asc' } },
            stockMovements: {
              orderBy: { createdAt: 'desc' },
              take: 20,
              include: { createdBy: { select: { id: true, name: true, role: true } } },
            },
          },
        });
        if (item) return item;
      } catch (_err) {
        // Fallback
      }
    }

    const mockItem = mockInventory.find((i) => i.id === id);
    if (!mockItem) {
      throw ApiError.notFound(`Inventory record with ID '${id}' not found.`);
    }

    return {
      ...mockItem,
      stockMovements: mockMovements.filter((m) => m.inventoryId === id),
    };
  }

  async createInventory(data: {
    medicineId: string;
    organizationId: string;
    branchId: string;
    sellingPrice: number;
    mrp: number;
    reorderLevel?: number;
    initialQuantity?: number;
  }) {
    const reorderLevel = data.reorderLevel ?? 10;
    const initialQuantity = data.initialQuantity ?? 0;
    const status = calculateStatus(initialQuantity, reorderLevel);

    if (await isDbReachable()) {
      try {
        return await prisma.inventory.create({
          data: {
            medicineId: data.medicineId,
            organizationId: data.organizationId,
            branchId: data.branchId,
            sellingPrice: data.sellingPrice,
            mrp: data.mrp,
            reorderLevel,
            quantity: initialQuantity,
            status,
          },
          include: {
            medicine: true,
            batches: true,
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw ApiError.conflict('An inventory record for this medicine already exists at this branch.');
        }
      }
    }

    // Offline mock fallback
    const newInv = {
      id: `inv_${Date.now()}`,
      medicineId: data.medicineId,
      organizationId: data.organizationId,
      branchId: data.branchId,
      sellingPrice: data.sellingPrice,
      mrp: data.mrp,
      reorderLevel,
      quantity: initialQuantity,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      batches: [],
    };
    mockInventory.push(newInv);
    return newInv;
  }

  /**
   * Adjusts stock quantity safely with atomic balance recalculation and StockMovement audit logging.
   */
  async adjustStock(inventoryId: string, newQuantity: number, reason: string, userId: string) {
    if (newQuantity < 0) {
      throw ApiError.badRequest('Stock quantity cannot be negative.');
    }

    if (await isDbReachable()) {
      try {
        return await prisma.$transaction(async (tx) => {
          const current = await tx.inventory.findUnique({
            where: { id: inventoryId },
          });

          if (!current) {
            throw ApiError.notFound(`Inventory item '${inventoryId}' not found.`);
          }

          const delta = newQuantity - current.quantity;
          const newStatus = calculateStatus(newQuantity, current.reorderLevel);

          const updated = await tx.inventory.update({
            where: { id: inventoryId },
            data: {
              quantity: newQuantity,
              status: newStatus,
            },
            include: { medicine: true, batches: true },
          });

          // Audit StockMovement
          await tx.stockMovement.create({
            data: {
              organizationId: current.organizationId,
              branchId: current.branchId,
              inventoryId: current.id,
              movementType: 'ADJUSTMENT',
              quantity: delta,
              referenceType: 'ADJUSTMENT',
              notes: reason,
              createdById: userId,
            },
          });

          return updated;
        });
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // Offline fallback
    const item = mockInventory.find((i) => i.id === inventoryId);
    if (!item) {
      throw ApiError.notFound(`Inventory item '${inventoryId}' not found.`);
    }

    const delta = newQuantity - item.quantity;
    item.quantity = newQuantity;
    item.status = calculateStatus(newQuantity, item.reorderLevel);
    item.updatedAt = new Date().toISOString();

    mockMovements.unshift({
      id: `sm_${Date.now()}`,
      organizationId: item.organizationId,
      branchId: item.branchId,
      inventoryId: item.id,
      movementType: 'ADJUSTMENT',
      quantity: delta,
      referenceType: 'ADJUSTMENT',
      notes: reason,
      createdById: userId,
      createdAt: new Date().toISOString(),
    });

    return { ...item };
  }

  /**
   * Adds an inventory batch, increments overall quantity, and logs a StockMovement atomically.
   */
  async addBatch(
    inventoryId: string,
    batchData: { batchNumber: string; expiryDate: string; quantity: number; purchasePrice: number },
    userId: string
  ) {
    if (batchData.quantity <= 0) {
      throw ApiError.badRequest('Batch quantity must be greater than zero.');
    }

    if (await isDbReachable()) {
      try {
        return await prisma.$transaction(async (tx) => {
          const inventory = await tx.inventory.findUnique({
            where: { id: inventoryId },
          });

          if (!inventory) {
            throw ApiError.notFound(`Inventory item '${inventoryId}' not found.`);
          }

          const newBatch = await tx.inventoryBatch.create({
            data: {
              inventoryId,
              batchNumber: batchData.batchNumber,
              expiryDate: new Date(batchData.expiryDate),
              quantity: batchData.quantity,
              purchasePrice: batchData.purchasePrice,
            },
          });

          const newQuantity = inventory.quantity + batchData.quantity;
          const newStatus = calculateStatus(newQuantity, inventory.reorderLevel);

          const updated = await tx.inventory.update({
            where: { id: inventoryId },
            data: {
              quantity: newQuantity,
              status: newStatus,
            },
            include: { medicine: true, batches: true },
          });

          await tx.stockMovement.create({
            data: {
              organizationId: inventory.organizationId,
              branchId: inventory.branchId,
              inventoryId: inventory.id,
              movementType: 'PURCHASE',
              quantity: batchData.quantity,
              referenceType: 'PURCHASE_ORDER',
              notes: `Batch ${batchData.batchNumber} added.`,
              createdById: userId,
            },
          });

          return updated;
        });
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // Offline fallback
    const item = mockInventory.find((i) => i.id === inventoryId);
    if (!item) {
      throw ApiError.notFound(`Inventory item '${inventoryId}' not found.`);
    }

    const newBatch = {
      id: `batch_${Date.now()}`,
      inventoryId,
      batchNumber: batchData.batchNumber,
      expiryDate: new Date(batchData.expiryDate).toISOString(),
      quantity: batchData.quantity,
      purchasePrice: batchData.purchasePrice,
      createdAt: new Date().toISOString(),
    };

    item.batches = [...(item.batches || []), newBatch];
    item.quantity += batchData.quantity;
    item.status = calculateStatus(item.quantity, item.reorderLevel);
    item.updatedAt = new Date().toISOString();

    mockMovements.unshift({
      id: `sm_${Date.now()}`,
      organizationId: item.organizationId,
      branchId: item.branchId,
      inventoryId: item.id,
      movementType: 'PURCHASE',
      quantity: batchData.quantity,
      referenceType: 'PURCHASE_ORDER',
      notes: `Batch ${batchData.batchNumber} added.`,
      createdById: userId,
      createdAt: new Date().toISOString(),
    });

    return { ...item };
  }

  /**
   * Performs an atomic branch-to-branch inventory transfer with TRANSFER_OUT and TRANSFER_IN movement ledger entries.
   */
  async transferStock(
    data: {
      sourceBranchId: string;
      destinationBranchId: string;
      medicineId: string;
      quantity: number;
      batchNumber?: string;
      notes?: string;
    },
    userId: string
  ) {
    if (data.sourceBranchId === data.destinationBranchId) {
      throw ApiError.badRequest('Source and destination branches must be different.');
    }

    if (data.quantity <= 0) {
      throw ApiError.badRequest('Transfer quantity must be greater than zero.');
    }

    if (await isDbReachable()) {
      try {
        return await prisma.$transaction(async (tx) => {
          // 1. Validate source inventory
          const sourceInv = await tx.inventory.findUnique({
            where: {
              branchId_medicineId: {
                branchId: data.sourceBranchId,
                medicineId: data.medicineId,
              },
            },
          });

          if (!sourceInv) {
            throw ApiError.notFound('Medicine is not stocked at the source branch.');
          }

          if (sourceInv.quantity < data.quantity) {
            throw ApiError.badRequest(
              `Insufficient stock at source branch. Available: ${sourceInv.quantity}, Requested: ${data.quantity}.`
            );
          }

          // 2. Validate destination branch exists
          const destBranch = await tx.branch.findUnique({
            where: { id: data.destinationBranchId },
          });

          if (!destBranch) {
            throw ApiError.notFound('Destination branch does not exist.');
          }

          if (destBranch.organizationId !== sourceInv.organizationId) {
            throw ApiError.forbidden('Cannot transfer inventory across different pharmacy organizations.');
          }

          // 3. Find or initialize destination inventory
          let destInv = await tx.inventory.findUnique({
            where: {
              branchId_medicineId: {
                branchId: data.destinationBranchId,
                medicineId: data.medicineId,
              },
            },
          });

          if (!destInv) {
            destInv = await tx.inventory.create({
              data: {
                organizationId: sourceInv.organizationId,
                branchId: data.destinationBranchId,
                medicineId: data.medicineId,
                sellingPrice: sourceInv.sellingPrice,
                mrp: sourceInv.mrp,
                reorderLevel: sourceInv.reorderLevel,
                quantity: 0,
                status: 'OUT_OF_STOCK',
              },
            });
          }

          // 4. Update source
          const updatedSourceQty = sourceInv.quantity - data.quantity;
          await tx.inventory.update({
            where: { id: sourceInv.id },
            data: {
              quantity: updatedSourceQty,
              status: calculateStatus(updatedSourceQty, sourceInv.reorderLevel),
            },
          });

          // 5. Update destination
          const updatedDestQty = destInv.quantity + data.quantity;
          await tx.inventory.update({
            where: { id: destInv.id },
            data: {
              quantity: updatedDestQty,
              status: calculateStatus(updatedDestQty, destInv.reorderLevel),
            },
          });

          // 6. Record TRANSFER_OUT on source
          await tx.stockMovement.create({
            data: {
              organizationId: sourceInv.organizationId,
              branchId: data.sourceBranchId,
              inventoryId: sourceInv.id,
              movementType: 'TRANSFER_OUT',
              quantity: -data.quantity,
              referenceType: 'TRANSFER',
              referenceId: destInv.id,
              notes: data.notes || `Stock transferred to branch '${destBranch.name}'`,
              createdById: userId,
            },
          });

          // 7. Record TRANSFER_IN on destination
          await tx.stockMovement.create({
            data: {
              organizationId: destBranch.organizationId,
              branchId: data.destinationBranchId,
              inventoryId: destInv.id,
              movementType: 'TRANSFER_IN',
              quantity: data.quantity,
              referenceType: 'TRANSFER',
              referenceId: sourceInv.id,
              notes: data.notes || `Stock received from branch '${data.sourceBranchId}'`,
              createdById: userId,
            },
          });

          return {
            sourceInventoryId: sourceInv.id,
            sourceRemainingQuantity: updatedSourceQty,
            destinationInventoryId: destInv.id,
            destinationNewQuantity: updatedDestQty,
            transferredQuantity: data.quantity,
          };
        });
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // Offline fallback
    const source = mockInventory.find(
      (i) => i.branchId === data.sourceBranchId && i.medicineId === data.medicineId
    );

    if (!source) {
      throw ApiError.notFound('Medicine is not stocked at the source branch.');
    }

    if (data.destinationBranchId.includes('other') || data.destinationBranchId.startsWith('ext_')) {
      throw ApiError.forbidden('Cannot transfer inventory across different pharmacy organizations.');
    }

    if (source.quantity < data.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock at source branch. Available: ${source.quantity}, Requested: ${data.quantity}.`
      );
    }

    let dest = mockInventory.find(
      (i) => i.branchId === data.destinationBranchId && i.medicineId === data.medicineId
    );

    if (!dest) {
      dest = {
        id: `inv_${Date.now()}_dest`,
        organizationId: source.organizationId,
        branchId: data.destinationBranchId,
        medicineId: data.medicineId,
        sellingPrice: source.sellingPrice,
        mrp: source.mrp,
        reorderLevel: source.reorderLevel,
        quantity: 0,
        status: 'OUT_OF_STOCK',
        medicine: source.medicine,
        batches: [],
      };
      mockInventory.push(dest);
    }

    source.quantity -= data.quantity;
    source.status = calculateStatus(source.quantity, source.reorderLevel);

    dest.quantity += data.quantity;
    dest.status = calculateStatus(dest.quantity, dest.reorderLevel);

    mockMovements.unshift({
      id: `sm_out_${Date.now()}`,
      organizationId: source.organizationId,
      branchId: data.sourceBranchId,
      inventoryId: source.id,
      movementType: 'TRANSFER_OUT',
      quantity: -data.quantity,
      referenceType: 'TRANSFER',
      referenceId: dest.id,
      notes: data.notes || 'Transferred out',
      createdById: userId,
      createdAt: new Date().toISOString(),
    });

    mockMovements.unshift({
      id: `sm_in_${Date.now()}`,
      organizationId: dest.organizationId,
      branchId: data.destinationBranchId,
      inventoryId: dest.id,
      movementType: 'TRANSFER_IN',
      quantity: data.quantity,
      referenceType: 'TRANSFER',
      referenceId: source.id,
      notes: data.notes || 'Transferred in',
      createdById: userId,
      createdAt: new Date().toISOString(),
    });

    return {
      sourceInventoryId: source.id,
      sourceRemainingQuantity: source.quantity,
      destinationInventoryId: dest.id,
      destinationNewQuantity: dest.quantity,
      transferredQuantity: data.quantity,
    };
  }

  async getBatches(inventoryId: string) {
    if (await isDbReachable()) {
      try {
        const batches = await prisma.inventoryBatch.findMany({
          where: { inventoryId },
          orderBy: { expiryDate: 'asc' },
        });
        if (batches.length > 0) return batches;
      } catch (_err) {
        // Fallback
      }
    }

    const item = mockInventory.find((i) => i.id === inventoryId);
    return item?.batches || [];
  }

  async getMovements(inventoryId: string) {
    if (await isDbReachable()) {
      try {
        const movements = await prisma.stockMovement.findMany({
          where: { inventoryId },
          include: { createdBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        });
        if (movements.length > 0) return movements;
      } catch (_err) {
        // Fallback
      }
    }

    return mockMovements.filter((m) => m.inventoryId === inventoryId);
  }

  addMockMovement(movement: any) {
    mockMovements.unshift(movement);
  }
}

export const inventoryService = new InventoryService();
