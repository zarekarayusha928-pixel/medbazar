import { Request, Response, NextFunction } from 'express';
import { purchaseService } from '../services/purchase.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class PurchaseController {
  async getPurchaseOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = (req.query.organizationId as string) || req.user?.organizationId;
      const branchId = req.query.branchId as string;
      const status = req.query.status as any;
      const search = (req.query.search || req.query.query) as string;

      const orders = await purchaseService.getPurchaseOrders({
        organizationId,
        branchId,
        status,
        search,
      });
      sendSuccess(res, orders);
    } catch (err) {
      next(err);
    }
  }

  async getPurchaseOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await purchaseService.getPurchaseOrderById(req.params.id as string);
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }

  async createPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.body.organizationId || req.user?.organizationId || 'pharm_1';
      const order = await purchaseService.createPurchaseOrder({
        ...req.body,
        organizationId,
      });
      sendSuccess(res, order, 'Purchase order created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async receivePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'system';
      const received = await purchaseService.receivePurchaseOrder(req.params.id as string, userId);
      sendSuccess(res, received, 'Purchase order stock received and ingested into branch inventory.');
    } catch (err) {
      next(err);
    }
  }
}

export const purchaseController = new PurchaseController();
