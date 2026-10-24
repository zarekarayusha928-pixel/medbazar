import { Router } from 'express';
import { medicineController } from '../controllers/medicine.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createMedicineSchema,
  updateMedicineSchema,
  createCategorySchema,
} from '../validators/medicine.validator.js';

const router = Router();

// Category listing and creation
router.get('/categories', (req, res, next) =>
  medicineController.getCategories(req, res, next)
);

router.post(
  '/categories',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  validateRequest(createCategorySchema),
  (req, res, next) => medicineController.createCategory(req, res, next)
);

// Medicines listing and search (Public / Customer / Pharmacy)
router.get('/', (req, res, next) =>
  medicineController.getMedicines(req, res, next)
);

// Get medicine details
router.get('/:id', (req, res, next) =>
  medicineController.getMedicineById(req, res, next)
);

// Create medicine in global catalog (Admin / Pharmacy Owner)
router.post(
  '/',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  validateRequest(createMedicineSchema),
  (req, res, next) => medicineController.createMedicine(req, res, next)
);

// Update medicine record
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  validateRequest(updateMedicineSchema),
  (req, res, next) => medicineController.updateMedicine(req, res, next)
);

export const medicineRoutes = router;
