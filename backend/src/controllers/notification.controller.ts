import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class NotificationController {
  async getChannelsStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = notificationService.getChannelsStatus();
      sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.getNotifications(req.user, unreadOnly);
      sendSuccess(res, notifications);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const notification = await notificationService.markAsRead(req.params.id as string, req.user);
      sendSuccess(res, notification, 'Notification marked as read.');
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const result = await notificationService.markAllAsRead(req.user);
      sendSuccess(res, result, 'All notifications marked as read.');
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
