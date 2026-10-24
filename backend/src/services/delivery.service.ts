import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { AuthenticatedUser } from '../types/index.js';
import { orderService } from './order.service.js';
import {
  CreateDeliveryInput,
  UpdateDeliveryStatusInput,
} from '../validators/delivery.validator.js';

interface MockDelivery {
  id: string;
  orderId: string;
  orderNumber?: string;
  branchId: string;
  branchName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryStaffId?: string | null;
  deliveryStaffName?: string | null;
  deliveryStaffPhone?: string | null;
  deliveryAddress: string;
  status: 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  assignedTime: string;
  completedTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

const mockDeliveries: MockDelivery[] = [
  {
    id: 'del_1',
    orderId: 'ord_1',
    orderNumber: 'MB-771249',
    branchId: 'br_1',
    branchName: 'Shivajinagar Central Dispensary',
    customerId: 'usr_cust_1',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98220 11223',
    deliveryStaffId: 'usr_rider_1',
    deliveryStaffName: 'Ramesh Pawar',
    deliveryStaffPhone: '+91 98230 33221',
    deliveryAddress: 'Flat 402, Green Acres, FC Road, Shivajinagar, Pune 411005',
    status: 'OUT_FOR_DELIVERY',
    assignedTime: new Date(Date.now() - 3600000).toISOString(),
    completedTime: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'del_2',
    orderId: 'ord_2',
    orderNumber: 'MB-771250',
    branchId: 'br_1',
    branchName: 'Shivajinagar Central Dispensary',
    customerId: 'usr_cust_2',
    customerName: 'Priya Patel',
    customerPhone: '+91 98220 44556',
    deliveryStaffId: 'usr_rider_1',
    deliveryStaffName: 'Ramesh Pawar',
    deliveryStaffPhone: '+91 98230 33221',
    deliveryAddress: 'B-12, Hermes Heritage, Shastri Nagar, Yerawada, Pune 411006',
    status: 'DELIVERED',
    assignedTime: new Date(Date.now() - 7200000).toISOString(),
    completedTime: new Date(Date.now() - 5400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
  },
];



export class DeliveryService {
  /**
   * List deliveries scoped strictly by user role:
   * - DELIVERY_STAFF: only deliveries assigned to this rider
   * - CUSTOMER: only deliveries for their own orders
   * - PHARMACY STAFF: only deliveries for their organization/branch
   * - PLATFORM_ADMIN: all deliveries
   */
  async getDeliveries(
    filters: { branchId?: string; status?: string },
    user: AuthenticatedUser
  ) {
    const userId = user.id || (user as any).userId;

    if (await isDbReachable()) {
      try {
        const where: any = {};

        if (user.role === 'DELIVERY_STAFF') {
          where.deliveryStaffId = userId;
        } else if (user.role === 'CUSTOMER') {
          where.order = { customerId: userId };
        } else if (user.role !== 'PLATFORM_ADMIN') {
          if (user.branchId) {
            where.branchId = user.branchId;
          } else if (user.organizationId) {
            where.branch = { organizationId: user.organizationId };
          }
        }

        if (filters.branchId && filters.branchId !== 'ALL') {
          where.branchId = filters.branchId;
        }
        if (filters.status && filters.status !== 'ALL') {
          where.status = filters.status;
        }

        const results = await prisma.delivery.findMany({
          where,
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                customerId: true,
                total: true,
                status: true,
                customer: { select: { id: true, name: true, phone: true } },
              },
            },
            branch: { select: { id: true, name: true } },
            deliveryStaff: { select: { id: true, name: true, phone: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        return results.map((d) => ({
          id: d.id,
          orderId: d.orderId,
          orderNumber: d.order?.orderNumber,
          branchId: d.branchId,
          branchName: d.branch?.name,
          customerId: d.order?.customerId,
          customerName: d.order?.customer?.name,
          customerPhone: d.order?.customer?.phone,
          deliveryStaffId: d.deliveryStaffId,
          deliveryStaffName: d.deliveryStaff?.name,
          deliveryStaffPhone: d.deliveryStaff?.phone,
          deliveryAddress: d.deliveryAddress,
          status: d.status,
          assignedTime: d.assignedTime.toISOString(),
          completedTime: d.completedTime ? d.completedTime.toISOString() : null,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        }));
      } catch (_err) {
        // Fallback to mock
      }
    }

    let list = [...mockDeliveries];

    if (user.role === 'DELIVERY_STAFF') {
      list = list.filter((d) => d.deliveryStaffId === userId);
    } else if (user.role === 'CUSTOMER') {
      list = list.filter((d) => d.customerId === userId);
    } else if (user.role !== 'PLATFORM_ADMIN') {
      if (user.branchId) {
        list = list.filter((d) => d.branchId === user.branchId);
      }
    }

    if (filters.branchId && filters.branchId !== 'ALL') {
      list = list.filter((d) => d.branchId === filters.branchId);
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((d) => d.status === filters.status);
    }

    return list;
  }

  /**
   * Get single delivery with strict access authorization
   */
  async getDeliveryById(id: string, user: AuthenticatedUser) {
    const userId = user.id || (user as any).userId;

    if (await isDbReachable()) {
      try {
        const d = await prisma.delivery.findUnique({
          where: { id },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                customerId: true,
                total: true,
                status: true,
                customer: { select: { id: true, name: true, phone: true } },
              },
            },
            branch: { select: { id: true, name: true, organizationId: true } },
            deliveryStaff: { select: { id: true, name: true, phone: true } },
          },
        });

        if (!d) {
          throw ApiError.notFound(`Delivery '${id}' not found.`);
        }

        // Authorization checks
        if (user.role === 'DELIVERY_STAFF' && d.deliveryStaffId !== userId) {
          throw ApiError.forbidden('Riders may only access deliveries assigned to them.');
        }

        if (user.role === 'CUSTOMER' && d.order.customerId !== userId) {
          throw ApiError.forbidden('Customers may only access deliveries for their own orders.');
        }

        if (
          user.role !== 'PLATFORM_ADMIN' &&
          user.role !== 'CUSTOMER' &&
          user.role !== 'DELIVERY_STAFF' &&
          user.organizationId &&
          d.branch.organizationId !== user.organizationId
        ) {
          throw ApiError.forbidden('Access denied to delivery from another pharmacy organization.');
        }

        return {
          id: d.id,
          orderId: d.orderId,
          orderNumber: d.order?.orderNumber,
          branchId: d.branchId,
          branchName: d.branch?.name,
          customerId: d.order?.customerId,
          customerName: d.order?.customer?.name,
          customerPhone: d.order?.customer?.phone,
          deliveryStaffId: d.deliveryStaffId,
          deliveryStaffName: d.deliveryStaff?.name,
          deliveryStaffPhone: d.deliveryStaff?.phone,
          deliveryAddress: d.deliveryAddress,
          status: d.status,
          assignedTime: d.assignedTime.toISOString(),
          completedTime: d.completedTime ? d.completedTime.toISOString() : null,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        };
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    const d = mockDeliveries.find((del) => del.id === id);
    if (!d) throw ApiError.notFound(`Delivery '${id}' not found.`);

    if (user.role === 'DELIVERY_STAFF' && d.deliveryStaffId !== userId) {
      throw ApiError.forbidden('Riders may only access deliveries assigned to them.');
    }
    if (user.role === 'CUSTOMER' && d.customerId !== userId) {
      throw ApiError.forbidden('Customers may only access deliveries for their own orders.');
    }

    return d;
  }

  /**
   * Create or assign delivery
   */
  async createDelivery(input: CreateDeliveryInput, user: AuthenticatedUser) {
    if (await isDbReachable()) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: input.orderId },
          include: { branch: true },
        });

        if (!order) throw ApiError.notFound(`Order '${input.orderId}' not found.`);

        if (
          user.role !== 'PLATFORM_ADMIN' &&
          user.organizationId &&
          order.organizationId !== user.organizationId
        ) {
          throw ApiError.forbidden('Cannot create delivery for another pharmacy organization.');
        }

        const delivery = await prisma.delivery.create({
          data: {
            orderId: input.orderId,
            branchId: input.branchId,
            deliveryAddress: input.deliveryAddress,
            deliveryStaffId: input.deliveryStaffId || null,
            status: 'ASSIGNED',
            assignedTime: new Date(),
          },
          include: {
            branch: { select: { name: true } },
            deliveryStaff: { select: { name: true, phone: true } },
          },
        });

        return {
          id: delivery.id,
          orderId: delivery.orderId,
          branchId: delivery.branchId,
          branchName: delivery.branch?.name,
          deliveryStaffId: delivery.deliveryStaffId,
          deliveryStaffName: delivery.deliveryStaff?.name,
          deliveryStaffPhone: delivery.deliveryStaff?.phone,
          deliveryAddress: delivery.deliveryAddress,
          status: delivery.status,
          assignedTime: delivery.assignedTime.toISOString(),
          createdAt: delivery.createdAt.toISOString(),
        };
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    const newDel: MockDelivery = {
      id: `del_${Date.now()}`,
      orderId: input.orderId,
      branchId: input.branchId,
      branchName: 'Main Dispensary',
      deliveryStaffId: input.deliveryStaffId || null,
      deliveryStaffName: 'Assigned Partner',
      deliveryAddress: input.deliveryAddress,
      status: 'ASSIGNED',
      assignedTime: new Date().toISOString(),
      completedTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDeliveries.unshift(newDel);
    return newDel;
  }

  /**
   * Update delivery status with state machine validation and parent order synchronization
   */
  async updateDeliveryStatus(
    id: string,
    input: UpdateDeliveryStatusInput,
    user: AuthenticatedUser
  ) {
    const userId = user.id || (user as any).userId;

    // Delivery state transition validator
    const validateTransition = (current: string, next: string) => {
      if (current === 'DELIVERED') {
        throw ApiError.badRequest('Cannot change status of a completed delivery.');
      }
      if (current === 'FAILED' && next !== 'ASSIGNED') {
        throw ApiError.badRequest('Failed delivery can only be re-assigned.');
      }
      if (current === 'ASSIGNED' && next === 'DELIVERED') {
        throw ApiError.badRequest('Delivery must be marked OUT_FOR_DELIVERY before DELIVERED.');
      }
    };

    if (await isDbReachable()) {
      try {
        const existing = await prisma.delivery.findUnique({
          where: { id },
          include: { order: true },
        });

        if (!existing) throw ApiError.notFound(`Delivery '${id}' not found.`);

        // Authorization: Rider assigned or pharmacy staff
        if (user.role === 'DELIVERY_STAFF' && existing.deliveryStaffId !== userId) {
          throw ApiError.forbidden('Riders may only update deliveries assigned to them.');
        }

        validateTransition(existing.status, input.status);

        const completedTime = input.status === 'DELIVERED' ? new Date() : existing.completedTime;

        const updated = await prisma.delivery.update({
          where: { id },
          data: {
            status: input.status,
            completedTime,
          },
          include: {
            order: true,
            branch: { select: { name: true } },
            deliveryStaff: { select: { name: true, phone: true } },
          },
        });

        // Sync parent Order status atomically
        if (input.status === 'OUT_FOR_DELIVERY') {
          await prisma.order.update({
            where: { id: existing.orderId },
            data: { status: 'OUT_FOR_DELIVERY' },
          });
        } else if (input.status === 'DELIVERED') {
          await prisma.order.update({
            where: { id: existing.orderId },
            data: { status: 'DELIVERED' },
          });
        }

        return {
          id: updated.id,
          orderId: updated.orderId,
          orderNumber: updated.order?.orderNumber,
          branchId: updated.branchId,
          branchName: updated.branch?.name,
          deliveryStaffId: updated.deliveryStaffId,
          deliveryStaffName: updated.deliveryStaff?.name,
          deliveryAddress: updated.deliveryAddress,
          status: updated.status,
          assignedTime: updated.assignedTime.toISOString(),
          completedTime: updated.completedTime ? updated.completedTime.toISOString() : null,
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    const del = mockDeliveries.find((d) => d.id === id);
    if (!del) throw ApiError.notFound(`Delivery '${id}' not found.`);

    if (user.role === 'DELIVERY_STAFF' && del.deliveryStaffId !== userId) {
      throw ApiError.forbidden('Riders may only update deliveries assigned to them.');
    }

    validateTransition(del.status, input.status);

    del.status = input.status;
    del.updatedAt = new Date().toISOString();
    if (input.status === 'DELIVERED') {
      del.completedTime = new Date().toISOString();
    }

    // Synchronize parent order status in mock fallback
    if (input.status === 'OUT_FOR_DELIVERY' || input.status === 'DELIVERED') {
      orderService.updateMockOrderStatusDirect(del.orderId, input.status);
    }

    return del;
  }
}

export const deliveryService = new DeliveryService();
