import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createPrescriptionSchema,
  updatePrescriptionStatusSchema,
} from '../validators/prescription.validator.js';

const router = Router();

// All prescription endpoints require authentication
router.use(authenticate);

// List prescriptions
router.get('/', (req, res, next) =>
  prescriptionController.getPrescriptions(req, res, next)
);

// Get single prescription
router.get('/:id', (req, res, next) =>
  prescriptionController.getPrescriptionById(req, res, next)
);

// Secure private file access
router.get('/:id/file', (req, res, next) =>
  prescriptionController.getPrescriptionFile(req, res, next)
);

// Customer upload prescription
router.post(
  '/',
  validateRequest(createPrescriptionSchema),
  (req, res, next) => prescriptionController.createPrescription(req, res, next)
);

// Pharmacist review prescription
router.patch(
  '/:id/status',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  validateRequest(updatePrescriptionStatusSchema),
  (req, res, next) => prescriptionController.updatePrescriptionStatus(req, res, next)
);

export const prescriptionRoutes = router;
