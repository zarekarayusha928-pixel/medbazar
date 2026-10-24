import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/delivery.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class DeliveryController {
  async getDeliveries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const list = await deliveryService.getDeliveries(
        {
          branchId: req.query.branchId as string,
          status: req.query.status as string,
        },
        req.user
      );
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const delivery = await deliveryService.getDeliveryById(req.params.id as string, req.user);
      sendSuccess(res, delivery);
    } catch (err) {
      next(err);
    }
  }

  async createDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const delivery = await deliveryService.createDelivery(req.body, req.user);
      sendSuccess(res, delivery, 'Delivery dispatched successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateDeliveryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const delivery = await deliveryService.updateDeliveryStatus(
        req.params.id as string,
        req.body,
        req.user
      );
      sendSuccess(res, delivery, 'Delivery status updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const deliveryController = new DeliveryController();
