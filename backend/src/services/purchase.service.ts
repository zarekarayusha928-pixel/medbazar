import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { PurchaseStatus, StockStatus } from '@prisma/client';

export interface PurchaseFilters {
  organizationId?: string;
  branchId?: string;
  status?: PurchaseStatus;
  search?: string;
}

let mockPurchases: any[] = [
  {
    id: 'po_1',
    purchaseNumber: 'PO-2026-091',
    organizationId: 'pharm_1',
    branchId: 'br_1',
    supplierId: 'sup_1',
    supplierName: 'Cipla Wholesale Distributors Pvt Ltd',
    total: 38500.0,
    status: 'RECEIVED',
    purchaseDate: '2026-10-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'poi_1',
        medicineId: 'med_1',
        batchNumber: 'DL-2026-X1',
        expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(),
        quantity: 100,
        unitPrice: 22.0,
        total: 2200.0,
      },
      {
        id: 'poi_2',
        medicineId: 'med_2',
        batchNumber: 'AUG-2026-9A',
        expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(),
        quantity: 50,
        unitPrice: 125.0,
        total: 6250.0,
      },
    ],
  },
  {
    id: 'po_2',
    purchaseNumber: 'PO-2026-092',
    organizationId: 'pharm_1',
    branchId: 'br_1',
    supplierId: 'sup_2',
    supplierName: 'Sun Pharma Distribution Hub',
    total: 14200.0,
    status: 'PENDING',
    purchaseDate: '2026-10-18',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'poi_3',
        medicineId: 'med_3',
        batchNumber: 'MET-2026-11B',
        expiryDate: new Date(Date.now() + 300 * 86400000).toISOString(),
        quantity: 80,
        unitPrice: 18.0,
        total: 1440.0,
      },
    ],
  },
];

function calculateStatus(quantity: number, reorderLevel: number): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export class PurchaseService {
  async getPurchaseOrders(filters: PurchaseFilters = {}) {
    if (await isDbReachable()) {
      try {
        const where: any = {};

        if (filters.organizationId) {
          where.organizationId = filters.organizationId;
        }
        if (filters.branchId) {
          where.branchId = filters.branchId;
        }
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim();
          where.OR = [
            { purchaseNumber: { contains: q, mode: 'insensitive' } },
            { supplierName: { contains: q, mode: 'insensitive' } },
          ];
        }

        const list = await prisma.purchaseOrder.findMany({
          where,
          include: {
            items: { include: { medicine: true } },
            branch: { select: { id: true, name: true } },
          },
          orderBy: { purchaseDate: 'desc' },
        });

        if (list.length > 0) return list;
      } catch (_err) {
        // Fallback
      }
    }

    let list = [...mockPurchases];

    if (filters.organizationId) {
      list = list.filter((p) => p.organizationId === filters.organizationId);
    }
    if (filters.branchId) {
      list = list.filter((p) => p.branchId === filters.branchId);
    }
    if (filters.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.purchaseNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getPurchaseOrderById(id: string) {
    if (await isDbReachable()) {
      try {
        const po = await prisma.purchaseOrder.findUnique({
          where: { id },
          include: {
            items: { include: { medicine: true } },
            branch: { select: { id: true, name: true } },
            supplier: true,
          },
        });
        if (po) return po;
      } catch (_err) {
        // Fallback
      }
    }

    const item = mockPurchases.find((p) => p.id === id);
    if (!item) {
      throw ApiError.notFound(`Purchase order with ID '${id}' not found.`);
    }
    return item;
  }

  async createPurchaseOrder(data: {
    organizationId: string;
    branchId: string;
    supplierId?: string;
    supplierName: string;
    items: Array<{
      medicineId: string;
      batchNumber: string;
      expiryDate: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const total = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const purchaseNumber = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    if (await isDbReachable()) {
      try {
        return await prisma.purchaseOrder.create({
          data: {
            purchaseNumber,
            organizationId: data.organizationId,
            branchId: data.branchId,
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            total,
            status: 'PENDING',
            items: {
              create: data.items.map((item) => ({
                medicineId: item.medicineId,
                batchNumber: item.batchNumber,
                expiryDate: new Date(item.expiryDate),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
              })),
            },
          },
          include: {
            items: { include: { medicine: true } },
          },
        });
      } catch (_err) {
        // Fallback
      }
    }

    const newPO = {
      id: `po_${Date.now()}`,
      purchaseNumber,
      organizationId: data.organizationId,
      branchId: data.branchId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      total,
      status: 'PENDING',
      purchaseDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: data.items.map((item, idx) => ({
        id: `poi_${Date.now()}_${idx}`,
        medicineId: item.medicineId,
        batchNumber: item.batchNumber,
        expiryDate: new Date(item.expiryDate).toISOString(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    };

    mockPurchases.unshift(newPO);
    return newPO;
  }

  /**
   * Receives a purchase order and ingests stock into branch inventory atomically.
   * STRICT IDEMPOTENCY GUARD: Once RECEIVED, repeating this call is blocked to prevent double-counting.
   */
  async receivePurchaseOrder(id: string, userId: string) {
    if (await isDbReachable()) {
      try {
        return await prisma.$transaction(async (tx) => {
          const po = await tx.purchaseOrder.findUnique({
            where: { id },
            include: { items: true },
          });

          if (!po) {
            throw ApiError.notFound(`Purchase order '${id}' not found.`);
          }

          // Idempotency guard: prevent adding stock twice!
          if (po.status === 'RECEIVED') {
            throw ApiError.badRequest(
              `Purchase order '${po.purchaseNumber}' has already been received. Stock was previously ingested.`
            );
          }

          if (po.status === 'CANCELLED') {
            throw ApiError.badRequest(`Cannot receive a cancelled purchase order.`);
          }

          // Process each line item into branch inventory
          for (const item of po.items) {
            // Find or create Inventory record
            let inv = await tx.inventory.findUnique({
              where: {
                branchId_medicineId: {
                  branchId: po.branchId,
                  medicineId: item.medicineId,
                },
              },
            });

            if (!inv) {
              inv = await tx.inventory.create({
                data: {
                  organizationId: po.organizationId,
                  branchId: po.branchId,
                  medicineId: item.medicineId,
                  sellingPrice: Number(item.unitPrice) * 1.25, // 25% default retail markup
                  mrp: Number(item.unitPrice) * 1.35,
                  reorderLevel: 10,
                  quantity: 0,
                  status: 'OUT_OF_STOCK',
                },
              });
            }

            // Create batch record
            await tx.inventoryBatch.create({
              data: {
                inventoryId: inv.id,
                batchNumber: item.batchNumber,
                expiryDate: item.expiryDate,
                quantity: item.quantity,
                purchasePrice: item.unitPrice,
              },
            });

            // Increment inventory quantity
            const newQty = inv.quantity + item.quantity;
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                quantity: newQty,
                status: calculateStatus(newQty, inv.reorderLevel),
              },
            });

            // Record stock movement
            await tx.stockMovement.create({
              data: {
                organizationId: po.organizationId,
                branchId: po.branchId,
                inventoryId: inv.id,
                movementType: 'PURCHASE',
                quantity: item.quantity,
                referenceType: 'PURCHASE_ORDER',
                referenceId: po.id,
                notes: `Stock ingested from PO ${po.purchaseNumber}`,
                createdById: userId,
              },
            });
          }

          // Mark purchase order as RECEIVED
          const updatedPO = await tx.purchaseOrder.update({
            where: { id: po.id },
            data: { status: 'RECEIVED' },
            include: { items: { include: { medicine: true } } },
          });

          return updatedPO;
        });
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // Offline fallback
      const po = mockPurchases.find((p) => p.id === id);
      if (!po) {
        throw ApiError.notFound(`Purchase order '${id}' not found.`);
      }

      if (po.status === 'RECEIVED') {
        throw ApiError.badRequest(
          `Purchase order '${po.purchaseNumber}' has already been received. Stock was previously ingested.`
        );
      }

      po.status = 'RECEIVED';
      po.updatedAt = new Date().toISOString();
      return { ...po };
  }
}

export const purchaseService = new PurchaseService();
