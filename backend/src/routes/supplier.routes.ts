import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
} from '../validators/supplier.validator.js';

const router = Router();

router.get('/', (req, res, next) =>
  supplierController.getSuppliers(req, res, next)
);

router.get('/:id', (req, res, next) =>
  supplierController.getSupplierById(req, res, next)
);

router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(createSupplierSchema),
  (req, res, next) => supplierController.createSupplier(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(updateSupplierSchema),
  (req, res, next) => supplierController.updateSupplier(req, res, next)
);

export const supplierRoutes = router;
