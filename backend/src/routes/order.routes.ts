import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from '../validators/order.validator.js';

const router = Router();

// All order endpoints require authentication
router.use(authenticate);

// List orders with customer / tenant isolation
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));

// Get order details by ID
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));

// Place a new marketplace order
router.post(
  '/',
  validateRequest(createOrderSchema),
  (req, res, next) => orderController.createOrder(req, res, next)
);

// Update order status (Staff / Admin only)
router.patch(
  '/:id/status',
  authorizeRoles('PLATFORM_ADMIN', 'PHARMACY_OWNER', 'BRANCH_MANAGER', 'PHARMACIST', 'CASHIER'),
  validateRequest(updateOrderStatusSchema),
  (req, res, next) => orderController.updateOrderStatus(req, res, next)
);

// Cancel an order (Customer or Staff)
router.post(
  '/:id/cancel',
  validateRequest(cancelOrderSchema),
  (req, res, next) => orderController.cancelOrder(req, res, next)
);

// Reorder an existing order (Customer or Staff)
router.post(
  '/:id/reorder',
  (req, res, next) => orderController.reorder(req, res, next)
);

export const orderRoutes = router;
