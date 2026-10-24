import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { requireOrganizationAccess } from '../middleware/tenant.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validators/organization.validator.js';

const router = Router();

// Public / Authenticated: List active pharmacies or all organizations for admins
router.get('/', (req, res, next) =>
  organizationController.getOrganizations(req, res, next)
);

// Get organization / pharmacy by ID
router.get('/:id', (req, res, next) =>
  organizationController.getOrganizationById(req, res, next)
);

// Onboard new pharmacy organization (Platform Admin only)
router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN'),
  validateRequest(createOrganizationSchema),
  (req, res, next) => organizationController.createOrganization(req, res, next)
);

// Update organization details (Platform Admin or Pharmacy Owner for their own organization)
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  requireOrganizationAccess((req) => req.params.id),
  validateRequest(updateOrganizationSchema),
  (req, res, next) => organizationController.updateOrganization(req, res, next)
);

// Activities audit log for organization
router.get(
  '/:id/activities',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  requireOrganizationAccess((req) => req.params.id),
  (req, res, next) => organizationController.getActivities(req, res, next)
);

export const organizationRoutes = router;
