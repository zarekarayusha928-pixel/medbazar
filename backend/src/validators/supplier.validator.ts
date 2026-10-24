import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    organizationId: z.string().optional(),
    name: z.string().min(2, 'Supplier name must be at least 2 characters.'),
    contactPerson: z.string().optional(),
    phone: z.string().min(10, 'Valid phone number is required.'),
    email: z.string().email('Valid email is required.').optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Supplier ID is required.'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    contactPerson: z.string().optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
  }),
});
