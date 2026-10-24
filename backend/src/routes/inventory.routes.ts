import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createInventorySchema,
  adjustStockSchema,
  addBatchSchema,
  transferStockSchema,
} from '../validators/inventory.validator.js';

const router = Router();

// List branch inventory (optionally filtered by branch, lowStock, expiringSoon, search)
router.get('/', (req, res, next) =>
  inventoryController.getInventory(req, res, next)
);

// Inter-branch stock transfer
router.post(
  '/transfer',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(transferStockSchema),
  (req, res, next) => inventoryController.transferStock(req, res, next)
);

// Get specific inventory item
router.get('/:id', (req, res, next) =>
  inventoryController.getInventoryById(req, res, next)
);

// Create new inventory record at branch
router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(createInventorySchema),
  (req, res, next) => inventoryController.createInventory(req, res, next)
);

// Adjust inventory stock
router.post(
  '/:id/adjust',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  validateRequest(adjustStockSchema),
  (req, res, next) => inventoryController.adjustStock(req, res, next)
);

// Ingest batch to inventory
router.post(
  '/:id/batches',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  validateRequest(addBatchSchema),
  (req, res, next) => inventoryController.addBatch(req, res, next)
);

// Get batch records for item
router.get('/:id/batches', (req, res, next) =>
  inventoryController.getBatches(req, res, next)
);

// Get audit stock movements for item
router.get('/:id/movements', (req, res, next) =>
  inventoryController.getMovements(req, res, next)
);

export const inventoryRoutes = router;
