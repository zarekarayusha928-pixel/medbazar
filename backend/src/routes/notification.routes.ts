import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Channel configuration status
router.get('/channels-status', (req, res, next) =>
  notificationController.getChannelsStatus(req, res, next)
);

// Authenticated notification routes
router.use(authenticate);

// Get user notifications
router.get('/', (req, res, next) =>
  notificationController.getNotifications(req, res, next)
);

// Mark single notification as read
router.patch('/:id/read', (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

// Mark all notifications as read
router.post('/read-all', (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

export const notificationRoutes = router;
