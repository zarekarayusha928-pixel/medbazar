import { z } from 'zod';
import { PrescriptionStatus } from '@prisma/client';

export const createPrescriptionSchema = z.object({
  body: z.object({
    organizationId: z.string().min(1, 'Organization ID is required.'),
    doctorName: z.string().optional(),
    fileUrl: z.string().optional().default('/mock-rx.pdf'),
    fileName: z.string().optional().default('prescription_upload.pdf'),
    fileType: z
      .string()
      .refine(
        (val) => ['PDF', 'IMAGE', 'PNG', 'JPG', 'JPEG'].includes(val.toUpperCase()),
        'Allowed file formats are PDF, PNG, JPG, JPEG only.'
      )
      .default('PDF'),
    fileSizeBytes: z
      .number()
      .max(10 * 1024 * 1024, 'Prescription file size exceeds maximum limit of 10MB.')
      .optional(),
    notes: z.string().optional(),
  }),
});

export const updatePrescriptionStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(PrescriptionStatus),
    notes: z.string().optional(),
  }),
});
