import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    organizationId: z.string().optional(),
    branchId: z.string().min(1, 'Branch ID is required.'),
    supplierId: z.string().optional(),
    supplierName: z.string().min(2, 'Supplier name is required.'),
    items: z.array(
      z.object({
        medicineId: z.string().min(1, 'Medicine ID is required.'),
        batchNumber: z.string().min(1, 'Batch number is required.'),
        expiryDate: z.string().min(4, 'Expiry date is required.'),
        quantity: z.number().int().min(1, 'Item quantity must be at least 1 unit.'),
        unitPrice: z.number().min(0, 'Unit price must be non-negative.'),
      })
    ).min(1, 'At least one purchase order item is required.'),
  }),
});

export const receivePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Purchase Order ID is required.'),
  }),
});
