import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createDeliverySchema,
  updateDeliveryStatusSchema,
} from '../validators/delivery.validator.js';

const router = Router();

// All delivery routes require authentication
router.use(authenticate);

// List deliveries (scoped by caller's role)
router.get('/', (req, res, next) =>
  deliveryController.getDeliveries(req, res, next)
);

// Get delivery details
router.get('/:id', (req, res, next) =>
  deliveryController.getDeliveryById(req, res, next)
);

// Create delivery (Pharmacy staff or Admin)
router.post(
  '/',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'),
  validateRequest(createDeliverySchema),
  (req, res, next) => deliveryController.createDelivery(req, res, next)
);

// Update status (Rider, Staff, or Admin)
router.patch(
  '/:id/status',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'DELIVERY_STAFF', 'CASHIER'),
  validateRequest(updateDeliveryStatusSchema),
  (req, res, next) => deliveryController.updateDeliveryStatus(req, res, next)
);

export const deliveryRoutes = router;
