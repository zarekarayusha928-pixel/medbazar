import { Router, Request, Response } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { organizationRoutes } from './organization.routes.js';
import { branchRoutes } from './branch.routes.js';
import { medicineRoutes } from './medicine.routes.js';
import { inventoryRoutes } from './inventory.routes.js';
import { supplierRoutes } from './supplier.routes.js';
import { purchaseRoutes } from './purchase.routes.js';
import { posRoutes } from './pos.routes.js';
import { orderRoutes } from './order.routes.js';
import { prescriptionRoutes } from './prescription.routes.js';
import { paymentRoutes } from './payment.routes.js';
import { deliveryRoutes } from './delivery.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { reportRoutes } from './report.routes.js';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'DISCONNECTED';
  try {
    // Quick query to test DB reachability with a timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 1500)
      ),
    ]);
    dbStatus = 'CONNECTED';
  } catch (err) {
    dbStatus = 'DISCONNECTED';
  }

  sendSuccess(res, {
    status: 'ONLINE',
    version: '1.0.0',
    service: 'medbazar-api',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.get(
  '/staff',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER'),
  (req, res, next) => userController.getStaff(req, res, next)
);
router.post(
  '/staff',
  authenticate,
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER'),
  (req, res, next) => userController.createUser(req, res, next)
);
router.use('/organizations', organizationRoutes);
router.use('/pharmacies', organizationRoutes); // Frontend alias
router.use('/branches', branchRoutes);
router.use('/medicines', medicineRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/pos', posRoutes);
router.use('/orders', orderRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

export const apiRouter = router;


