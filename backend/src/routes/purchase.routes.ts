import { Router } from 'express';
import { purchaseController } from '../controllers/purchase.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
} from '../validators/purchase.validator.js';

const router = Router();

// List purchase orders
router.get(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  (req, res, next) => purchaseController.getPurchaseOrders(req, res, next)
);

// Get purchase order by ID
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  (req, res, next) => purchaseController.getPurchaseOrderById(req, res, next)
);

// Create new purchase order
router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(createPurchaseOrderSchema),
  (req, res, next) => purchaseController.createPurchaseOrder(req, res, next)
);

// Ingest stock from purchase order into branch inventory
router.post(
  '/:id/receive',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  validateRequest(receivePurchaseOrderSchema),
  (req, res, next) => purchaseController.receivePurchaseOrder(req, res, next)
);

export const purchaseRoutes = router;
