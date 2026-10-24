import { z } from 'zod';
import { DosageForm, MedicineStatus } from '@prisma/client';

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Medicine name is required.'),
    genericName: z.string().min(2, 'Generic compound name is required.'),
    brand: z.string().min(2, 'Brand / Manufacturer label is required.'),
    composition: z.string().min(2, 'Chemical composition is required.'),
    dosageForm: z.nativeEnum(DosageForm).default('TABLET'),
    strength: z.string().min(1, 'Strength is required (e.g., 500mg, 10ml).'),
    categoryId: z.string().min(1, 'Category is required.'),
    prescriptionRequired: z.boolean().default(false),
    barcode: z.string().optional(),
    manufacturer: z.string().min(2, 'Manufacturer name is required.'),
    imageUrl: z.string().url().optional().or(z.literal('')),
    status: z.nativeEnum(MedicineStatus).default('ACTIVE'),
  }),
});

export const updateMedicineSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Medicine ID is required.'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    genericName: z.string().min(2).optional(),
    brand: z.string().min(2).optional(),
    composition: z.string().min(2).optional(),
    dosageForm: z.nativeEnum(DosageForm).optional(),
    strength: z.string().optional(),
    categoryId: z.string().optional(),
    prescriptionRequired: z.boolean().optional(),
    barcode: z.string().optional(),
    manufacturer: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    status: z.nativeEnum(MedicineStatus).optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name is required.'),
    description: z.string().optional(),
  }),
});
