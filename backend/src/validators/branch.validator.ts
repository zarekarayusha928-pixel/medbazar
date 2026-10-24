import { z } from 'zod';
import { BranchStatus } from '@prisma/client';

export const createBranchSchema = z.object({
  body: z.object({
    organizationId: z.string().min(1, 'Organization ID is required.'),
    name: z.string().min(2, 'Branch name must be at least 2 characters.'),
    address: z.string().min(3, 'Address is required.'),
    city: z.string().default('Pune'),
    state: z.string().default('Maharashtra'),
    pincode: z.string().min(6, 'Valid pincode is required.'),
    phone: z.string().min(10, 'Branch phone is required.'),
    status: z.nativeEnum(BranchStatus).default('ACTIVE'),
    operatingHours: z.string().optional(),
  }),
});

export const updateBranchStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Branch ID is required.'),
  }),
  body: z.object({
    status: z.nativeEnum(BranchStatus),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Branch ID is required.'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(3).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().min(6).optional(),
    phone: z.string().min(10).optional(),
    status: z.nativeEnum(BranchStatus).optional(),
    operatingHours: z.string().optional(),
  }),
});
