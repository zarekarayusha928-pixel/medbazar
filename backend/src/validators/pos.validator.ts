import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createPosSaleItemSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required.'),
  quantity: z
    .number()
    .int('Quantity must be an integer.')
    .positive('Quantity must be greater than zero.'),
  batchNumber: z.string().optional(),
});

export const createPosSaleSchema = z.object({
  body: z.object({
    organizationId: z.string().optional(),
    branchId: z.string().optional(),
    items: z
      .array(createPosSaleItemSchema)
      .min(1, 'At least one medicine item is required to complete a sale.'),
    paymentMethod: z.nativeEnum(PaymentMethod).default('CASH'),
    paymentRef: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    discount: z.number().min(0, 'Discount cannot be negative.').default(0),
    idempotencyKey: z.string().optional(),
  }),
});
