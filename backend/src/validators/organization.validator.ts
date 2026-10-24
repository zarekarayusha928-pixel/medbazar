import { z } from 'zod';
import { OrganizationStatus } from '@prisma/client';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Pharmacy name must be at least 2 characters.'),
    legalName: z.string().min(2, 'Legal business name is required.').optional(),
    licenseNumber: z.string().min(3, 'Drug retail license number is required.'),
    gstNumber: z.string().optional(),
    phone: z.string().min(10, 'Contact phone is required.'),
    email: z.string().email('Contact email must be valid.'),
    ownerName: z.string().optional(),
    ownerEmail: z.string().email().optional(),
    ownerPhone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().default('Pune'),
    state: z.string().default('Maharashtra'),
    pincode: z.string().default('411001'),
    status: z.nativeEnum(OrganizationStatus).default('ACTIVE'),
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Organization ID is required.'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    legalName: z.string().optional(),
    licenseNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    status: z.nativeEnum(OrganizationStatus).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
});
