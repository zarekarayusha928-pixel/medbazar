import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please provide a valid email.'),
    phone: z.string().optional(),
    role: z.nativeEnum(UserRole).default('PHARMACIST'),
    pharmacyId: z.string().optional(),
    branchId: z.string().optional(),
    status: z.nativeEnum(UserStatus).default('ACTIVE'),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required.'),
  }),
  body: z.object({
    role: z.nativeEnum(UserRole),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required.'),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});
