import { z } from 'zod';
import { OrderType, PaymentMethod, OrderStatus } from '@prisma/client';

export const createOrderItemSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required.'),
  quantity: z
    .number()
    .int('Quantity must be an integer.')
    .positive('Quantity must be greater than zero.'),
});

export const createOrderSchema = z.object({
  body: z.object({
    organizationId: z.string().optional(),
    branchId: z.string().min(1, 'Branch ID is required for order fulfillment.'),
    items: z
      .array(createOrderItemSchema)
      .min(1, 'At least one medicine item is required in the cart.'),
    orderType: z.nativeEnum(OrderType).default('ONLINE'),
    paymentMethod: z.nativeEnum(PaymentMethod).default('ONLINE'),
    paymentRef: z.string().optional(),
    deliveryAddress: z.string().optional(),
    prescriptionId: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    notes: z.string().optional(),
  }),
});

export const cancelOrderSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
