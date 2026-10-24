import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = Router();

// All report endpoints require authentication
router.use(authenticate);

// Pharmacy operational reports
router.get(
  '/pharmacy',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST'),
  (req, res, next) => reportController.getPharmacyReport(req, res, next)
);

// Pharmacy dashboard telemetry
router.get(
  '/dashboard',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'),
  (req, res, next) => reportController.getDashboardTelemetry(req, res, next)
);

// Superadmin platform aggregate report
router.get(
  '/admin',
  authorizeRoles('PLATFORM_ADMIN'),
  (req, res, next) => reportController.getAdminReport(req, res, next)
);

// Export report data (CSV / JSON)
router.get(
  '/export',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  (req, res, next) => reportController.exportReportData(req, res, next)
);

export const reportRoutes = router;
