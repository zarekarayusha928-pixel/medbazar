import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Full name must be at least 2 characters.'),
    email: z.string().email('Please provide a valid email address.'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    // Public registration CANNOT register as PLATFORM_ADMIN
    role: z
      .nativeEnum(UserRole)
      .refine((role) => role !== 'PLATFORM_ADMIN', {
        message: 'Security Policy: Public registration cannot create platform administrators.',
      })
      .default('CUSTOMER'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, 'Identifier (email or phone) is required.'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'New password must be at least 6 characters.'),
    token: z.string().optional(),
  }),
});
