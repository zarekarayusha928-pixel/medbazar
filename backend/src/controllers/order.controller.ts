import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const order = await orderService.createOrder(req.body, req.user);
      sendSuccess(res, order, 'Order submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const orders = await orderService.getOrders(
        {
          branchId: req.query.branchId as string,
          organizationId: req.query.organizationId as string,
          customerId: req.query.customerId as string,
          status: req.query.status as string,
          search: req.query.search as string,
        },
        req.user
      );
      sendSuccess(res, orders);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const order = await orderService.getOrderById(req.params.id as string, req.user);
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const order = await orderService.updateOrderStatus(
        req.params.id as string,
        req.body.status as OrderStatus,
        req.user
      );
      sendSuccess(res, order, 'Order status updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const order = await orderService.cancelOrder(
        req.params.id as string,
        req.body?.reason,
        req.user
      );
      sendSuccess(res, order, 'Order cancelled successfully.');
    } catch (err) {
      next(err);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const newOrder = await orderService.reorder(req.params.id as string, req.user);
      sendSuccess(res, newOrder, 'Reorder placed successfully.', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
