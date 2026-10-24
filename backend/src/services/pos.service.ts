import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { AuthenticatedUser } from '../types/index.js';
import { PaymentMethod, StockStatus, PaymentStatus } from '@prisma/client';

export interface PosSaleItemInput {
  medicineId: string;
  quantity: number;
  batchNumber?: string;
}

export interface CreatePosSaleData {
  organizationId?: string;
  branchId?: string;
  items: PosSaleItemInput[];
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  idempotencyKey?: string;
}

// In-memory idempotency cache & sliding window debouncing
const processedIdempotencyKeys = new Map<string, { result: any; expiresAt: number }>();
const recentSubmissions = new Map<string, number>();

// In-memory mock store for test / offline fallback
let mockPosSales: any[] = [];
let mockPayments: any[] = [];

function calculateStatus(quantity: number, reorderLevel: number): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export class PosService {
  /**
   * Completes an offline counter POS sale with atomic stock deduction and audit ledger logging.
   */
  async createSale(data: CreatePosSaleData, cashier: AuthenticatedUser) {
    const cashierId = cashier.id || (cashier as any).userId;

    // 1. Resolve & Verify Branch and Organization Access
    let targetOrgId = data.organizationId || cashier.organizationId;
    let targetBranchId = data.branchId || cashier.branchId;

    if (!targetBranchId) {
      throw ApiError.badRequest('Branch ID is required to process counter sales.');
    }

    if (cashier.role !== 'PLATFORM_ADMIN') {
      if (cashier.organizationId && targetOrgId && cashier.organizationId !== targetOrgId) {
        throw ApiError.forbidden(
          'Tenant Access Violation: You do not have permission to execute sales for another pharmacy organization.'
        );
      }
      if (
        (cashier.role === 'CASHIER' || cashier.role === 'PHARMACIST' || cashier.role === 'BRANCH_MANAGER') &&
        cashier.branchId &&
        cashier.branchId !== targetBranchId
      ) {
        throw ApiError.forbidden(
          'Branch Access Violation: Cashiers and branch staff can only process counter sales for their assigned branch.'
        );
      }
    }

    // 2. Payment Verification
    // External payment methods (CARD, UPI) require transaction proof / authorization code
    if (data.paymentMethod === 'CARD' || data.paymentMethod === 'UPI') {
      if (!data.paymentRef || data.paymentRef.trim().length < 4) {
        throw ApiError.badRequest(
          `Payment Verification Required: ${data.paymentMethod} payment requires a valid terminal reference or authorization code.`
        );
      }
    }

    // 3. Validate Quantities
    for (const item of data.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw ApiError.badRequest(`Invalid quantity for medicine '${item.medicineId}'. Must be a positive integer.`);
      }
    }

    // 4. Idempotency & Double-Click Guard
    const now = Date.now();
    if (data.idempotencyKey) {
      const cached = processedIdempotencyKeys.get(data.idempotencyKey);
      if (cached && cached.expiresAt > now) {
        return cached.result;
      }
    } else {
      // Sliding window fingerprint: cashier + branch + item IDs & quantities
      const itemsFingerprint = data.items
        .map((i) => `${i.medicineId}:${i.quantity}`)
        .sort()
        .join('|');
      const fingerprint = `${cashierId}:${targetBranchId}:${itemsFingerprint}`;
      const lastSubmitTime = recentSubmissions.get(fingerprint);

      if (lastSubmitTime && now - lastSubmitTime < 2000) {
        throw ApiError.conflict(
          'Duplicate submission detected. Please do not double-click the checkout button.'
        );
      }
      recentSubmissions.set(fingerprint, now);
    }

    // 5. Database Execution (PostgreSQL with Transaction-Safe Stock Deduction)
    if (await isDbReachable()) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Resolve organization if needed
          if (!targetOrgId) {
            const branch = await tx.branch.findUnique({
              where: { id: targetBranchId },
              select: { organizationId: true },
            });
            if (!branch) {
              throw ApiError.notFound(`Branch '${targetBranchId}' not found.`);
            }
            targetOrgId = branch.organizationId;
          }

          // Fetch current selling prices & verify stock directly from database
          const lineItemsWithDetails: Array<{
            inventoryId: string;
            medicineId: string;
            medicineName: string;
            unitPrice: number;
            quantity: number;
            total: number;
            batchNumber?: string;
            reorderLevel: number;
            currentStock: number;
          }> = [];

          for (const item of data.items) {
            const inv = await tx.inventory.findUnique({
              where: {
                branchId_medicineId: {
                  branchId: targetBranchId!,
                  medicineId: item.medicineId,
                },
              },
              include: {
                medicine: { select: { name: true, brand: true } },
                batches: {
                  where: { quantity: { gt: 0 } },
                  orderBy: { expiryDate: 'asc' },
                },
              },
            });

            if (!inv) {
              throw ApiError.notFound(`Medicine '${item.medicineId}' is not stocked at this branch.`);
            }

            if (inv.quantity < item.quantity) {
              throw ApiError.badRequest(
                `Insufficient stock for '${inv.medicine.name}'. Available: ${inv.quantity}, Requested: ${item.quantity}.`
              );
            }

            const unitPrice = Number(inv.sellingPrice);
            const lineTotal = unitPrice * item.quantity;
            const chosenBatch = item.batchNumber || inv.batches[0]?.batchNumber || 'STANDARD';

            lineItemsWithDetails.push({
              inventoryId: inv.id,
              medicineId: inv.medicineId,
              medicineName: inv.medicine.name,
              unitPrice,
              quantity: item.quantity,
              total: lineTotal,
              batchNumber: chosenBatch,
              reorderLevel: inv.reorderLevel,
              currentStock: inv.quantity,
            });
          }

          // Calculate server-authoritative totals
          const subtotal = lineItemsWithDetails.reduce((sum, i) => sum + i.total, 0);
          const discount = data.discount ? Math.max(0, Number(data.discount)) : 0;

          if (discount > subtotal) {
            throw ApiError.badRequest('Discount cannot exceed the total subtotal amount.');
          }

          const total = Math.round((subtotal - discount) * 100) / 100;
          const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

          // Create POSSale
          const sale = await tx.pOSSale.create({
            data: {
              organizationId: targetOrgId!,
              branchId: targetBranchId!,
              receiptNumber,
              customerName: data.customerName || 'Walk-in Customer',
              customerPhone: data.customerPhone || 'Counter Direct',
              subtotal,
              discount,
              total,
              paymentMethod: data.paymentMethod,
              createdById: cashierId,
            },
          });

          // Create Sale Items, Deduct Inventory, Deduct Batches & Create OFFLINE_SALE movements
          for (const item of lineItemsWithDetails) {
            await tx.pOSSaleItem.create({
              data: {
                posSaleId: sale.id,
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                batchNumber: item.batchNumber,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
              },
            });

            // Atomically decrement branch inventory
            const newQty = item.currentStock - item.quantity;
            await tx.inventory.update({
              where: { id: item.inventoryId },
              data: {
                quantity: { decrement: item.quantity },
                status: calculateStatus(newQty, item.reorderLevel),
              },
            });

            // If batches exist, deduct from FIFO batches
            let remainingToDeduct = item.quantity;
            const batches = await tx.inventoryBatch.findMany({
              where: { inventoryId: item.inventoryId, quantity: { gt: 0 } },
              orderBy: { expiryDate: 'asc' },
            });

            for (const b of batches) {
              if (remainingToDeduct <= 0) break;
              const deduct = Math.min(b.quantity, remainingToDeduct);
              await tx.inventoryBatch.update({
                where: { id: b.id },
                data: { quantity: { decrement: deduct } },
              });
              remainingToDeduct -= deduct;
            }

            // Create OFFLINE_SALE StockMovement record
            await tx.stockMovement.create({
              data: {
                organizationId: targetOrgId!,
                branchId: targetBranchId!,
                inventoryId: item.inventoryId,
                movementType: 'OFFLINE_SALE',
                quantity: -item.quantity, // Negative integer represents stock deduction
                referenceType: 'POS_SALE',
                referenceId: sale.id,
                notes: `Counter POS Sale Receipt ${receiptNumber}`,
                createdById: cashierId,
              },
            });
          }

          // Record Payment
          await tx.payment.create({
            data: {
              posSaleId: sale.id,
              amount: total,
              currency: 'INR',
              method: data.paymentMethod,
              status: 'PAID',
              transactionRef: data.paymentRef || `CASH-${Date.now()}`,
              paidAt: new Date(),
            },
          });

          // Return complete saved receipt details
          const completeSale = await tx.pOSSale.findUnique({
            where: { id: sale.id },
            include: {
              items: true,
              branch: { select: { id: true, name: true, phone: true, address: true } },
              createdBy: { select: { id: true, name: true, email: true } },
              payment: true,
            },
          });

          return completeSale;
        });

        if (data.idempotencyKey) {
          processedIdempotencyKeys.set(data.idempotencyKey, {
            result,
            expiresAt: now + 60000,
          });
        }

        return result;
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw ApiError.internal(err.message || 'Database transaction error processing POS sale.');
      }
    }

    // ==========================================
    // Offline / Test Mock Fallback
    // ==========================================
    // Fetch simulated branch stock from inventory service
    const { inventoryService } = await import('./inventory.service.js');
    const branchInventory = await inventoryService.getInventory({ branchId: targetBranchId });

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const saleId = `pos_${Date.now()}`;

    const lineItems: any[] = [];
    for (const item of data.items) {
      const inv = branchInventory.find((i: any) => i.medicineId === item.medicineId);
      if (!inv) {
        throw ApiError.notFound(`Medicine '${item.medicineId}' is not stocked at this branch.`);
      }

      if (inv.quantity < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for '${inv.medicine?.name || item.medicineId}'. Available: ${inv.quantity}, Requested: ${item.quantity}.`
        );
      }

      const unitPrice = Number(inv.sellingPrice);
      const lineTotal = unitPrice * item.quantity;
      lineItems.push({
        id: `psi_${Date.now()}_${item.medicineId}`,
        medicineId: item.medicineId,
        medicineName: inv.medicine?.name || 'Medicine',
        batchNumber: item.batchNumber || inv.batches?.[0]?.batchNumber || 'BT-2026-X1',
        quantity: item.quantity,
        unitPrice,
        total: lineTotal,
      });

      // Deduct stock in mock inventory
      inv.quantity -= item.quantity;
      inv.status = calculateStatus(inv.quantity, inv.reorderLevel);

      // Record OFFLINE_SALE movement
      inventoryService.addMockMovement({
        id: `sm_${Date.now()}_${item.medicineId}`,
        organizationId: targetOrgId || 'pharm_1',
        branchId: targetBranchId,
        inventoryId: inv.id,
        movementType: 'OFFLINE_SALE',
        quantity: -item.quantity,
        referenceType: 'POS_SALE',
        referenceId: saleId,
        notes: `Counter POS Sale Receipt ${receiptNumber}`,
        createdById: cashierId,
        createdAt: new Date().toISOString(),
      });
    }

    const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0);
    const discount = data.discount ? Math.max(0, Number(data.discount)) : 0;
    if (discount > subtotal) {
      throw ApiError.badRequest('Discount cannot exceed the total subtotal amount.');
    }
    const total = Math.round((subtotal - discount) * 100) / 100;

    const savedSale = {
      id: saleId,
      organizationId: targetOrgId || 'pharm_1',
      branchId: targetBranchId,
      receiptNumber,
      customerName: data.customerName || 'Walk-in Customer',
      customerPhone: data.customerPhone || 'Counter Direct',
      subtotal,
      discount,
      total,
      paymentMethod: data.paymentMethod,
      createdById: cashierId,
      createdAt: new Date().toISOString(),
      items: lineItems,
      branch: {
        id: targetBranchId,
        name: 'Main Dispensary Branch',
        phone: '+91 98221 00111',
        address: 'Pune Station Commercial Wing',
      },
      createdBy: {
        id: cashierId,
        name: cashier.email.split('@')[0],
        email: cashier.email,
      },
      payment: {
        id: `pay_${Date.now()}`,
        amount: total,
        currency: 'INR',
        method: data.paymentMethod,
        status: 'PAID',
        transactionRef: data.paymentRef || `CASH-${Date.now()}`,
      },
    };

    mockPosSales.unshift(savedSale);

    if (data.idempotencyKey) {
      processedIdempotencyKeys.set(data.idempotencyKey, {
        result: savedSale,
        expiresAt: now + 60000,
      });
    }

    return savedSale;
  }

  /**
   * Retrieves POS counter sales history with organizational and branch permission isolation.
   */
  async getSales(
    filters: { branchId?: string; organizationId?: string; search?: string },
    user: AuthenticatedUser
  ) {
    let whereBranchId = filters.branchId;
    let whereOrgId = filters.organizationId;

    if (user.role !== 'PLATFORM_ADMIN') {
      whereOrgId = user.organizationId;
      if (user.role === 'CASHIER' || user.role === 'PHARMACIST' || user.role === 'BRANCH_MANAGER') {
        if (user.branchId) {
          whereBranchId = user.branchId;
        }
      }
    }

    if (await isDbReachable()) {
      try {
        const where: any = {};
        if (whereOrgId) where.organizationId = whereOrgId;
        if (whereBranchId) where.branchId = whereBranchId;
        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim();
          where.OR = [
            { receiptNumber: { contains: q, mode: 'insensitive' } },
            { customerName: { contains: q, mode: 'insensitive' } },
            { customerPhone: { contains: q, mode: 'insensitive' } },
          ];
        }

        const sales = await prisma.pOSSale.findMany({
          where,
          include: {
            items: true,
            branch: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (sales.length > 0) return sales;
      } catch (_err) {
        // Fallback
      }
    }

    let list = [...mockPosSales];
    if (whereOrgId) {
      list = list.filter((s) => s.organizationId === whereOrgId);
    }
    if (whereBranchId) {
      list = list.filter((s) => s.branchId === whereBranchId);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.receiptNumber.toLowerCase().includes(q) ||
          (s.customerName && s.customerName.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Retrieves a specific POS sale receipt by ID or Receipt Number with authorization check.
   */
  async getSaleById(idOrReceipt: string, user: AuthenticatedUser) {
    if (await isDbReachable()) {
      try {
        const sale = await prisma.pOSSale.findFirst({
          where: {
            OR: [{ id: idOrReceipt }, { receiptNumber: idOrReceipt }],
          },
          include: {
            items: true,
            branch: { select: { id: true, name: true, address: true, phone: true } },
            organization: { select: { id: true, name: true, gstNumber: true, licenseNumber: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            payment: true,
          },
        });

        if (sale) {
          if (user.role !== 'PLATFORM_ADMIN' && sale.organizationId !== user.organizationId) {
            throw ApiError.forbidden('Access denied to POS receipt for another organization.');
          }
          return sale;
        }
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    const sale = mockPosSales.find((s) => s.id === idOrReceipt || s.receiptNumber === idOrReceipt);
    if (!sale) {
      throw ApiError.notFound(`POS sale receipt '${idOrReceipt}' not found.`);
    }

    if (user.role !== 'PLATFORM_ADMIN' && user.organizationId && sale.organizationId !== user.organizationId) {
      throw ApiError.forbidden('Access denied to POS receipt for another organization.');
    }

    return sale;
  }
}

export const posService = new PosService();
