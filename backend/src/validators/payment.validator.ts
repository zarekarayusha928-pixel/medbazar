import { z } from 'zod';

export const verifyPaymentBodySchema = z
  .object({
    orderId: z.string().optional(),
    posSaleId: z.string().optional(),
    paymentMethod: z.enum(['ONLINE', 'COD', 'UPI', 'CASH', 'CARD']),
    transactionRef: z.string().min(1, 'Transaction reference is required').max(100).optional(),
    amount: z.number().positive().optional(),
    gatewayName: z.string().max(50).optional(),
    gatewaySignature: z.string().optional(),
  })
  .refine((data) => data.orderId || data.posSaleId, {
    message: 'Either orderId or posSaleId must be provided',
    path: ['orderId'],
  });

export const verifyPaymentSchema = z.object({
  body: verifyPaymentBodySchema,
});

export const webhookSchema = z.object({
  body: z
    .object({
      gateway: z.string().optional(),
      event: z.string().optional(),
      signature: z.string().optional(),
      data: z.record(z.string(), z.any()).optional(),
    })
    .passthrough(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentBodySchema>;
export type WebhookInput = z.infer<typeof webhookSchema>['body'];
