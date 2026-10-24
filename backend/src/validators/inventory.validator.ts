import { z } from 'zod';

export const createInventorySchema = z.object({
  body: z.object({
    medicineId: z.string().min(1, 'Medicine ID is required.'),
    organizationId: z.string().min(1, 'Organization ID is required.'),
    branchId: z.string().min(1, 'Branch ID is required.'),
    sellingPrice: z.number().min(0, 'Selling price must be non-negative.'),
    mrp: z.number().min(0, 'MRP must be non-negative.'),
    reorderLevel: z.number().int().min(0).default(10),
    initialQuantity: z.number().int().min(0).default(0),
  }),
});

export const adjustStockSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Inventory ID is required.'),
  }),
  body: z.object({
    newQuantity: z.number().int().min(0, 'Stock quantity cannot be negative.'),
    reason: z.string().min(3, 'Audit adjustment reason is required.'),
    batchId: z.string().optional(),
  }),
});

export const addBatchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Inventory ID is required.'),
  }),
  body: z.object({
    batchNumber: z.string().min(1, 'Batch number is required.'),
    expiryDate: z.string().min(4, 'Expiry date is required.'),
    quantity: z.number().int().min(1, 'Batch quantity must be at least 1 unit.'),
    purchasePrice: z.number().min(0, 'Purchase price must be non-negative.'),
  }),
});

export const transferStockSchema = z.object({
  body: z.object({
    sourceBranchId: z.string().min(1, 'Source branch ID is required.'),
    destinationBranchId: z.string().min(1, 'Destination branch ID is required.'),
    medicineId: z.string().min(1, 'Medicine ID is required.'),
    quantity: z.number().int().min(1, 'Transfer quantity must be at least 1 unit.'),
    batchNumber: z.string().optional(),
    notes: z.string().optional(),
  }).refine((data) => data.sourceBranchId !== data.destinationBranchId, {
    message: 'Destination branch must be different from source branch.',
    path: ['destinationBranchId'],
  }),
});
