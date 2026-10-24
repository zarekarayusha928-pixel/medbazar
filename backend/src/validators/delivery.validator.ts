import { z } from 'zod';

export const createDeliverySchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    branchId: z.string().min(1, 'Branch ID is required'),
    deliveryAddress: z.string().min(5, 'Delivery address must be at least 5 characters'),
    deliveryStaffId: z.string().optional(),
  }),
});

export const updateDeliveryStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED']),
    notes: z.string().max(500).optional(),
  }),
});

export const assignDeliverySchema = z.object({
  body: z.object({
    deliveryStaffId: z.string().min(1, 'Delivery staff ID is required'),
  }),
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>['body'];
export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>['body'];
export type AssignDeliveryInput = z.infer<typeof assignDeliverySchema>['body'];
