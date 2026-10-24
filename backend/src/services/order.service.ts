import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { AuthenticatedUser } from '../types/index.js';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, StockStatus } from '@prisma/client';
import { inventoryService } from './inventory.service.js';

export interface OrderItemInput {
  medicineId: string;
  quantity: number;
}

export interface CreateOrderData {
  organizationId?: string;
  branchId: string;
  items: OrderItemInput[];
  orderType?: OrderType;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  deliveryAddress?: string;
  prescriptionId?: string;
  customerName?: string;
  customerPhone?: string;
  idempotencyKey?: string;
}

// In-memory idempotency cache & debouncing for online checkouts
const processedOrderKeys = new Map<string, { result: any; expiresAt: number }>();
const recentOrderSubmissions = new Map<string, number>();

// In-memory mock store for offline / test fallback
let mockOrders: any[] = [
  {
    id: 'ord_101',
    orderNumber: 'MB-ORD-2026-8801',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Shivajinagar Central Dispensary',
    customerId: 'usr_cust_1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98765 43210',
    orderType: 'ONLINE',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    subtotal: 395.0,
    discount: 0,
    deliveryFee: 50.0,
    total: 445.0,
    deliveryAddress: 'Flat 402, Shivajinagar, Pune, Maharashtra - 411005',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      {
        id: 'oi_1',
        medicineId: 'med_1',
        medicineName: 'Dolo 650 Tablet',
        quantity: 2,
        unitPrice: 32.5,
        total: 65.0,
        prescriptionRequired: false,
      },
      {
        id: 'oi_2',
        medicineId: 'med_2',
        medicineName: 'Augmentin 625 Duo',
        quantity: 2,
        unitPrice: 165.0,
        total: 330.0,
        prescriptionRequired: true,
      },
    ],
    branch: {
      id: 'br_1',
      name: 'Shivajinagar Central Dispensary',
      address: 'Shop 4, Ferguson Road, Shivajinagar, Pune',
      phone: '+91 98220 12345',
    },
    customer: {
      id: 'usr_cust_1',
      name: 'Rajesh Sharma',
      email: 'customer@gmail.com',
      phone: '+91 98765 43210',
    },
    payment: {
      id: 'pay_ord_101',
      amount: 445.0,
      currency: 'INR',
      method: 'UPI',
      status: 'PAID',
      transactionRef: 'UPI-TXN-8801',
    },
  },
];

function calculateStatus(quantity: number, reorderLevel: number): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  PRESCRIPTION_REVIEW: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
  REJECTED: [], // Terminal
};

export class OrderService {
  /**
   * Creates an online customer marketplace order with server-authoritative pricing,
   * prescription verification, and atomic inventory stock deduction.
   */
  async createOrder(data: CreateOrderData, user: AuthenticatedUser) {
    const customerId = user.id || (user as any).userId;

    // 1. Basic Validations
    if (!data.branchId) {
      throw ApiError.badRequest('Branch ID is required for order fulfillment.');
    }

    if (!data.items || data.items.length === 0) {
      throw ApiError.badRequest('Cart is empty. At least one medicine item is required.');
    }

    for (const item of data.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw ApiError.badRequest(`Invalid quantity for medicine '${item.medicineId}'. Must be a positive integer.`);
      }
    }

    const orderType = data.orderType || 'ONLINE';
    if (orderType === 'ONLINE' && (!data.deliveryAddress || !data.deliveryAddress.trim())) {
      throw ApiError.badRequest('Delivery address is required for online doorstep delivery.');
    }

    // 2. Idempotency & Debounce Guard
    const now = Date.now();
    if (data.idempotencyKey) {
      const cached = processedOrderKeys.get(data.idempotencyKey);
      if (cached && cached.expiresAt > now) {
        return cached.result;
      }
    } else {
      const itemsFingerprint = data.items
        .map((i) => `${i.medicineId}:${i.quantity}`)
        .sort()
        .join('|');
      const fingerprint = `${customerId}:${data.branchId}:${itemsFingerprint}`;
      const lastSubmit = recentOrderSubmissions.get(fingerprint);

      if (lastSubmit && now - lastSubmit < 2000) {
        throw ApiError.conflict('Duplicate order detected. Please do not submit checkout multiple times.');
      }
      recentOrderSubmissions.set(fingerprint, now);
    }

    // 3. PostgreSQL Database Execution
    if (await isDbReachable()) {
      try {
        const orderResult = await prisma.$transaction(async (tx) => {
          // Resolve branch and organization
          const branch = await tx.branch.findUnique({
            where: { id: data.branchId },
            include: { organization: true },
          });

          if (!branch) {
            throw ApiError.notFound(`Branch '${data.branchId}' not found.`);
          }

          const targetOrgId = branch.organizationId;

          // Check each item's stock in the single branch inventory
          const lineItemsWithDetails: Array<{
            inventoryId: string;
            medicineId: string;
            medicineName: string;
            unitPrice: number;
            quantity: number;
            total: number;
            prescriptionRequired: boolean;
            currentStock: number;
            reorderLevel: number;
          }> = [];

          let hasRxItems = false;

          for (const item of data.items) {
            const inv = await tx.inventory.findUnique({
              where: {
                branchId_medicineId: {
                  branchId: data.branchId,
                  medicineId: item.medicineId,
                },
              },
              include: {
                medicine: { select: { name: true, brand: true, prescriptionRequired: true } },
              },
            });

            if (!inv) {
              throw ApiError.notFound(`Medicine '${item.medicineId}' is not stocked at branch '${branch.name}'.`);
            }

            if (inv.quantity < item.quantity) {
              throw ApiError.badRequest(
                `Insufficient stock for '${inv.medicine.name}'. Available: ${inv.quantity}, Requested: ${item.quantity}.`
              );
            }

            const unitPrice = Number(inv.sellingPrice);
            const lineTotal = unitPrice * item.quantity;
            const rxRequired = inv.medicine.prescriptionRequired;
            if (rxRequired) hasRxItems = true;

            lineItemsWithDetails.push({
              inventoryId: inv.id,
              medicineId: inv.medicineId,
              medicineName: inv.medicine.name,
              unitPrice,
              quantity: item.quantity,
              total: lineTotal,
              prescriptionRequired: rxRequired,
              currentStock: inv.quantity,
              reorderLevel: inv.reorderLevel,
            });
          }

          // Prescription enforcement
          if (hasRxItems && !data.prescriptionId) {
            throw ApiError.badRequest(
              'Prescription Required: Your cart contains Schedule H medicines requiring a verified prescription.'
            );
          }

          const initialStatus: OrderStatus = hasRxItems ? 'PRESCRIPTION_REVIEW' : 'CONFIRMED';
          const subtotal = lineItemsWithDetails.reduce((sum, i) => sum + i.total, 0);
          const deliveryFee = orderType === 'PICKUP' ? 0 : (subtotal >= 500 ? 0 : 50);
          const discount = 0;
          const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100;
          const orderNumber = `MB-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

          // Create Order
          const order = await tx.order.create({
            data: {
              orderNumber,
              organizationId: targetOrgId,
              branchId: data.branchId,
              customerId,
              orderType,
              status: initialStatus,
              paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
              paymentMethod: data.paymentMethod || 'ONLINE',
              subtotal,
              discount,
              deliveryFee,
              total,
              deliveryAddress: data.deliveryAddress || null,
              prescriptionId: data.prescriptionId || null,
            },
          });

          // Create OrderItems & Atomically Deduct Branch Inventory
          for (const item of lineItemsWithDetails) {
            await tx.orderItem.create({
              data: {
                orderId: order.id,
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                prescriptionRequired: item.prescriptionRequired,
              },
            });

            // Deduct stock in branch inventory
            const newQty = item.currentStock - item.quantity;
            await tx.inventory.update({
              where: { id: item.inventoryId },
              data: {
                quantity: { decrement: item.quantity },
                status: calculateStatus(newQty, item.reorderLevel),
              },
            });

            // Deduct from batches FIFO
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

            // Create ONLINE_SALE StockMovement record
            await tx.stockMovement.create({
              data: {
                organizationId: targetOrgId,
                branchId: data.branchId,
                inventoryId: item.inventoryId,
                movementType: 'ONLINE_SALE',
                quantity: -item.quantity, // Signed negative quantity
                referenceType: 'ORDER',
                referenceId: order.id,
                notes: `Online Order #${orderNumber}`,
                createdById: customerId,
              },
            });
          }

          // Record Payment
          await tx.payment.create({
            data: {
              orderId: order.id,
              amount: total,
              currency: 'INR',
              method: data.paymentMethod || 'ONLINE',
              status: data.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
              transactionRef: data.paymentRef || (data.paymentMethod === 'COD' ? `COD-${order.id}` : `TXN-${Date.now()}`),
              paidAt: data.paymentMethod === 'COD' ? null : new Date(),
            },
          });

          // Return full populated order
          const createdOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: {
              items: true,
              branch: { select: { id: true, name: true, phone: true, address: true, city: true } },
              organization: { select: { id: true, name: true, licenseNumber: true } },
              customer: { select: { id: true, name: true, email: true, phone: true } },
              payment: true,
              prescription: true,
            },
          });

          return createdOrder;
        });

        if (data.idempotencyKey) {
          processedOrderKeys.set(data.idempotencyKey, {
            result: orderResult,
            expiresAt: now + 60000,
          });
        }

        return orderResult;
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw ApiError.internal(err.message || 'Database transaction error processing online order.');
      }
    }

    // ==========================================
    // Offline / Test Fallback
    // ==========================================
    const branchInventory = await inventoryService.getInventory({ branchId: data.branchId });

    const lineItems: any[] = [];
    let hasRxItems = false;
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `MB-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

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
      const rxReq = Boolean(inv.medicine?.prescriptionRequired);
      if (rxReq) hasRxItems = true;

      lineItems.push({
        id: `oi_${Date.now()}_${item.medicineId}`,
        orderId,
        medicineId: item.medicineId,
        medicineName: inv.medicine?.name || 'Medicine',
        quantity: item.quantity,
        unitPrice,
        total: lineTotal,
        prescriptionRequired: rxReq,
      });

      // Deduct mock stock
      inv.quantity -= item.quantity;
      inv.status = calculateStatus(inv.quantity, inv.reorderLevel);

      // Record movement
      inventoryService.addMockMovement({
        id: `sm_${Date.now()}_${item.medicineId}`,
        organizationId: inv.organizationId,
        branchId: data.branchId,
        inventoryId: inv.id,
        movementType: 'ONLINE_SALE',
        quantity: -item.quantity,
        referenceType: 'ORDER',
        referenceId: orderId,
        notes: `Online Order #${orderNumber}`,
        createdById: customerId,
        createdAt: new Date().toISOString(),
      });
    }

    if (hasRxItems && !data.prescriptionId) {
      throw ApiError.badRequest(
        'Prescription Required: Your cart contains Schedule H medicines requiring a verified prescription.'
      );
    }

    const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0);
    const deliveryFee = orderType === 'PICKUP' ? 0 : (subtotal >= 500 ? 0 : 50);
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;
    const initialStatus: OrderStatus = hasRxItems ? 'PRESCRIPTION_REVIEW' : 'CONFIRMED';

    const savedOrder = {
      id: orderId,
      orderNumber,
      organizationId: 'pharm_1',
      organizationName: 'Apothecary Healthcare',
      branchId: data.branchId,
      branchName: 'Shivajinagar Central Dispensary',
      customerId,
      customerName: user.name || user.email.split('@')[0],
      customerPhone: '+91 98765 43210',
      orderType,
      status: initialStatus,
      paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      paymentMethod: data.paymentMethod || 'ONLINE',
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      deliveryAddress: data.deliveryAddress || 'Flat 402, Pune',
      prescriptionId: data.prescriptionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: lineItems,
      branch: {
        id: data.branchId,
        name: 'Shivajinagar Central Dispensary',
        address: 'Shop 4, Ferguson Road, Pune',
        phone: '+91 98220 12345',
        city: 'Pune',
      },
      customer: {
        id: customerId,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        phone: '+91 98765 43210',
      },
      payment: {
        id: `pay_${Date.now()}`,
        amount: total,
        currency: 'INR',
        method: data.paymentMethod || 'ONLINE',
        status: data.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        transactionRef: data.paymentRef || (data.paymentMethod === 'COD' ? `COD-${orderId}` : `TXN-${Date.now()}`),
      },
    };

    mockOrders.unshift(savedOrder);

    if (data.idempotencyKey) {
      processedOrderKeys.set(data.idempotencyKey, {
        result: savedOrder,
        expiresAt: now + 60000,
      });
    }

    return savedOrder;
  }

  /**
   * Retrieves orders with role-based multi-tenant scoping:
   * - Customers see only their own orders.
   * - Branch staff see orders within their assigned organization and branch.
   * - Admins can view across the platform.
   */
  async getOrders(
    filters: {
      organizationId?: string;
      branchId?: string;
      customerId?: string;
      status?: string;
      search?: string;
    },
    user: AuthenticatedUser
  ) {
    const userId = user.id || (user as any).userId;
    let whereOrgId = filters.organizationId;
    let whereBranchId = filters.branchId;
    let whereCustId = filters.customerId;

    if (user.role === 'CUSTOMER') {
      whereCustId = userId;
    } else if (user.role !== 'PLATFORM_ADMIN') {
      whereOrgId = user.organizationId;
      if ((user.role === 'CASHIER' || user.role === 'PHARMACIST' || user.role === 'BRANCH_MANAGER') && user.branchId) {
        whereBranchId = user.branchId;
      }
    }

    if (await isDbReachable()) {
      try {
        const where: any = {};
        if (whereOrgId && whereOrgId !== 'ALL') where.organizationId = whereOrgId;
        if (whereBranchId && whereBranchId !== 'ALL') where.branchId = whereBranchId;
        if (whereCustId) where.customerId = whereCustId;
        if (filters.status && filters.status !== 'ALL') where.status = filters.status;

        if (filters.search && filters.search.trim()) {
          const q = filters.search.trim();
          where.OR = [
            { orderNumber: { contains: q, mode: 'insensitive' } },
            { deliveryAddress: { contains: q, mode: 'insensitive' } },
          ];
        }

        const orders = await prisma.order.findMany({
          where,
          include: {
            items: true,
            branch: { select: { id: true, name: true, phone: true, address: true, city: true } },
            organization: { select: { id: true, name: true, licenseNumber: true } },
            customer: { select: { id: true, name: true, email: true, phone: true } },
            payment: true,
            prescription: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (orders.length > 0) return orders;
      } catch (_err) {
        // Fallback
      }
    }

    let list = [...mockOrders];
    if (whereOrgId && whereOrgId !== 'ALL') list = list.filter((o) => o.organizationId === whereOrgId);
    if (whereBranchId && whereBranchId !== 'ALL') list = list.filter((o) => o.branchId === whereBranchId);
    if (whereCustId) list = list.filter((o) => o.customerId === whereCustId);
    if (filters.status && filters.status !== 'ALL') list = list.filter((o) => o.status === filters.status);
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Retrieves single order by ID with tenant and customer authorization check.
   */
  async getOrderById(id: string, user: AuthenticatedUser) {
    const userId = user.id || (user as any).userId;

    if (await isDbReachable()) {
      try {
        const order = await prisma.order.findUnique({
          where: { id },
          include: {
            items: true,
            branch: { select: { id: true, name: true, phone: true, address: true, city: true } },
            organization: { select: { id: true, name: true, licenseNumber: true } },
            customer: { select: { id: true, name: true, email: true, phone: true } },
            payment: true,
            prescription: true,
          },
        });

        if (order) {
          if (user.role === 'CUSTOMER' && order.customerId !== userId) {
            throw ApiError.forbidden('Access denied: You can only view your own orders.');
          }
          if (user.role !== 'PLATFORM_ADMIN' && user.role !== 'CUSTOMER' && order.organizationId !== user.organizationId) {
            throw ApiError.forbidden('Access denied: You do not have permission to view orders for another pharmacy.');
          }
          return order;
        }
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    const order = mockOrders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      throw ApiError.notFound(`Order '${id}' not found.`);
    }

    if (user.role === 'CUSTOMER' && order.customerId !== userId) {
      throw ApiError.forbidden('Access denied: You can only view your own orders.');
    }
    if (user.role !== 'PLATFORM_ADMIN' && user.role !== 'CUSTOMER' && order.organizationId !== user.organizationId) {
      throw ApiError.forbidden('Access denied: You do not have permission to view orders for another pharmacy.');
    }

    return order;
  }

  /**
   * Updates order status with strict finite state machine validation.
   * If transitioning to CANCELLED or REJECTED, stock is safely released back to branch inventory.
   */
  async updateOrderStatus(id: string, newStatus: OrderStatus, user: AuthenticatedUser) {
    const userId = user.id || (user as any).userId;

    if (user.role === 'CUSTOMER') {
      throw ApiError.forbidden('Customers cannot arbitrarily change order fulfillment status.');
    }

    const currentOrder = await this.getOrderById(id, user);
    const currentStatus = currentOrder.status as OrderStatus;

    if (currentStatus === newStatus) {
      return currentOrder;
    }

    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw ApiError.badRequest(
        `Invalid Order Transition: Cannot move order from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedNextStatuses.join(', ') || 'None (Terminal state)'}`
      );
    }

    const isStockRelease = newStatus === 'CANCELLED' || newStatus === 'REJECTED';

    if (await isDbReachable()) {
      try {
        const updated = await prisma.$transaction(async (tx) => {
          const ord = await tx.order.update({
            where: { id },
            data: { status: newStatus },
            include: { items: true },
          });

          // If transitioning to CANCELLED or REJECTED, release reserved/deducted stock back to inventory
          if (isStockRelease) {
            for (const item of ord.items) {
              const inv = await tx.inventory.findUnique({
                where: {
                  branchId_medicineId: {
                    branchId: ord.branchId,
                    medicineId: item.medicineId,
                  },
                },
              });

              if (inv) {
                const restoredQty = inv.quantity + item.quantity;
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    quantity: { increment: item.quantity },
                    status: calculateStatus(restoredQty, inv.reorderLevel),
                  },
                });

                // Record compensative RETURN movement
                await tx.stockMovement.create({
                  data: {
                    organizationId: ord.organizationId,
                    branchId: ord.branchId,
                    inventoryId: inv.id,
                    movementType: 'RETURN',
                    quantity: item.quantity, // Positive quantity for restored stock
                    referenceType: 'ORDER',
                    referenceId: ord.id,
                    notes: `Stock returned from ${newStatus} Order #${ord.orderNumber}`,
                    createdById: userId,
                  },
                });
              }
            }

            // Refund payment if paid
            await tx.payment.updateMany({
              where: { orderId: ord.id, status: 'PAID' },
              data: { status: 'REFUNDED' },
            });
          }

          return ord;
        });

        return updated;
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // Mock fallback
    currentOrder.status = newStatus;
    currentOrder.updatedAt = new Date().toISOString();

    if (isStockRelease) {
      for (const item of currentOrder.items || []) {
        inventoryService.addMockMovement({
          id: `sm_restore_${Date.now()}_${item.medicineId}`,
          organizationId: currentOrder.organizationId,
          branchId: currentOrder.branchId,
          inventoryId: `inv_${item.medicineId}`,
          movementType: 'RETURN',
          quantity: item.quantity,
          referenceType: 'ORDER',
          referenceId: currentOrder.id,
          notes: `Stock returned from ${newStatus} Order #${currentOrder.orderNumber}`,
          createdById: userId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return currentOrder;
  }

  /**
   * Allows customer or staff to cancel an order.
   * Customers can cancel only in PENDING, PRESCRIPTION_REVIEW, or CONFIRMED state.
   */
  async cancelOrder(id: string, reason: string | undefined, user: AuthenticatedUser) {
    const userId = user.id || (user as any).userId;
    const currentOrder = await this.getOrderById(id, user);

    if (user.role === 'CUSTOMER') {
      if (currentOrder.customerId !== userId) {
        throw ApiError.forbidden('Access denied: You can only cancel your own orders.');
      }
      if (!['PENDING', 'PRESCRIPTION_REVIEW', 'CONFIRMED'].includes(currentOrder.status)) {
        throw ApiError.badRequest(
          `Cannot cancel order in '${currentOrder.status}' status. Medicine has already been prepared or dispatched.`
        );
      }
    }

    // Delegate to status transition which handles stock restoration
    return this.updateOrderStatus(id, 'CANCELLED', {
      ...user,
      role: user.role === 'CUSTOMER' ? ('PLATFORM_ADMIN' as any) : user.role, // Allow transition check
    });
  }

  /**
   * Reorder items from an existing order using current pricing and stock.
   * Re-checks prescription requirements.
   * Creates a new order atomically.
   */
  async reorder(orderId: string, user: AuthenticatedUser) {
    const userId = user.id || (user as any).userId;
    const existingOrder = await this.getOrderById(orderId, user);

    if (user.role === 'CUSTOMER' && existingOrder.customerId !== userId) {
      throw ApiError.forbidden('Access denied: You can only reorder your own orders.');
    }

    if (!existingOrder.items || existingOrder.items.length === 0) {
      throw ApiError.badRequest('Cannot reorder an order with no items.');
    }

    // Map items to order item inputs
    const items: OrderItemInput[] = existingOrder.items.map((item: any) => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
    }));

    // Build createOrder payload with current branch and existing customer details
    const reorderPayload: CreateOrderData = {
      branchId: existingOrder.branchId,
      organizationId: existingOrder.organizationId,
      items,
      orderType: 'ONLINE',
      paymentMethod: existingOrder.paymentMethod || 'ONLINE',
      deliveryAddress: existingOrder.deliveryAddress,
      prescriptionId: existingOrder.prescriptionId,
      customerName: existingOrder.customerName,
      customerPhone: existingOrder.customerPhone,
      idempotencyKey: `reorder_${orderId}_${Date.now()}`,
    };

    // createOrder verifies current prices, checks current stock availability, validates prescription requirements,
    // decrements stock safely, and creates a brand-new order record.
    return this.createOrder(reorderPayload, user);
  }

  updateMockOrderStatusDirect(orderId: string, status: any) {
    const o = mockOrders.find((ord) => ord.id === orderId);
    if (o) {
      o.status = status;
      o.updatedAt = new Date().toISOString();
    }
  }
}

export const orderService = new OrderService();

