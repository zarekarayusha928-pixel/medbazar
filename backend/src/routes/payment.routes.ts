import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { verifyPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

// Public: Gateway configuration status
router.get('/config', (req, res, next) =>
  paymentController.getGatewayConfig(req, res, next)
);

// Public webhook listener for provider callbacks (verified by provider signature)
router.post('/webhook/:gateway', (req, res, next) =>
  paymentController.handleWebhook(req, res, next)
);

// Authenticated endpoints
router.use(authenticate);

// Order payment details
router.get('/order/:orderId', (req, res, next) =>
  paymentController.getPaymentByOrderId(req, res, next)
);

// Server-side payment verification
router.post(
  '/verify',
  validateRequest(verifyPaymentSchema),
  (req, res, next) => paymentController.verifyPayment(req, res, next)
);

export const paymentRoutes = router;
