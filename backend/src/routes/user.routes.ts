import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { requireCustomerOwnership } from '../middleware/ownership.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../validators/user.validator.js';

const router = Router();

// Staff roster
router.get(
  '/staff',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  (req, res, next) => userController.getStaff(req, res, next)
);

// List users (admin / owner / manager only)
router.get(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  (req, res, next) => userController.getUsers(req, res, next)
);

// Get specific user (Customers can only view their own profile)
router.get(
  '/:id',
  authenticate,
  requireCustomerOwnership((req) => req.params.id),
  (req, res, next) => userController.getUserById(req, res, next)
);

// Create user / staff member
router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  validateRequest(createUserSchema),
  (req, res, next) => userController.createUser(req, res, next)
);

// Update user role
router.put(
  '/:id/role',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  validateRequest(updateUserRoleSchema),
  (req, res, next) => userController.updateRole(req, res, next)
);

// Update user status
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  validateRequest(updateUserStatusSchema),
  (req, res, next) => userController.updateStatus(req, res, next)
);

export const userRoutes = router;
