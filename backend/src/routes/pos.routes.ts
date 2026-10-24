import { Router } from 'express';
import { posController } from '../controllers/pos.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import { createPosSaleSchema } from '../validators/pos.validator.js';

const router = Router();

// Process counter POS sale
router.post(
  '/sales',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'),
  validateRequest(createPosSaleSchema),
  (req, res, next) => posController.createSale(req, res, next)
);

// List branch counter sales history
router.get(
  '/sales',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'),
  (req, res, next) => posController.getSales(req, res, next)
);

// Get specific receipt details
router.get(
  '/sales/:id',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'),
  (req, res, next) => posController.getSaleById(req, res, next)
);

export const posRoutes = router;
