import { Router } from 'express';
import { branchController } from '../controllers/branch.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { requireOrganizationAccess } from '../middleware/tenant.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createBranchSchema,
  updateBranchStatusSchema,
  updateBranchSchema,
} from '../validators/branch.validator.js';

const router = Router();

// List branches (optionally filtered by organizationId)
router.get('/', (req, res, next) =>
  branchController.getBranches(req, res, next)
);

// Get branch details
router.get('/:id', (req, res, next) =>
  branchController.getBranchById(req, res, next)
);

// Create a branch under an organization
router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  requireOrganizationAccess((req) => req.body.organizationId),
  validateRequest(createBranchSchema),
  (req, res, next) => branchController.createBranch(req, res, next)
);

// Update branch details
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(updateBranchSchema),
  (req, res, next) => branchController.updateBranch(req, res, next)
);

// Update branch status (supports PATCH and PUT)
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(updateBranchStatusSchema),
  (req, res, next) => branchController.updateBranchStatus(req, res, next)
);

router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  validateRequest(updateBranchStatusSchema),
  (req, res, next) => branchController.updateBranchStatus(req, res, next)
);

export const branchRoutes = router;
