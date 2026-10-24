import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class InventoryController {
  async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lowStock = req.query.lowStock !== undefined ? req.query.lowStock === 'true' : undefined;
      const expiringSoon = req.query.expiringSoon !== undefined ? req.query.expiringSoon === 'true' : undefined;

      const items = await inventoryService.getInventory({
        branchId: req.query.branchId as string,
        organizationId: req.query.organizationId as string,
        lowStock,
        expiringSoon,
        search: (req.query.search || req.query.query) as string,
      });
      sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  }

  async getInventoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await inventoryService.getInventoryById(req.params.id as string);
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  }

  async createInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.body.organizationId || req.user?.organizationId;
      const item = await inventoryService.createInventory({
        ...req.body,
        organizationId,
      });
      sendSuccess(res, item, 'Inventory item created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async adjustStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'system';
      const updated = await inventoryService.adjustStock(
        req.params.id as string,
        req.body.newQuantity,
        req.body.reason,
        userId
      );
      sendSuccess(res, updated, 'Inventory stock adjusted successfully.');
    } catch (err) {
      next(err);
    }
  }

  async addBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'system';
      const updated = await inventoryService.addBatch(
        req.params.id as string,
        req.body,
        userId
      );
      sendSuccess(res, updated, 'Batch added and stock updated successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async transferStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'system';
      const result = await inventoryService.transferStock(req.body, userId);
      sendSuccess(res, result, 'Stock transferred successfully between branches.');
    } catch (err) {
      next(err);
    }
  }

  async getBatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const batches = await inventoryService.getBatches(req.params.id as string);
      sendSuccess(res, batches);
    } catch (err) {
      next(err);
    }
  }

  async getMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movements = await inventoryService.getMovements(req.params.id as string);
      sendSuccess(res, movements);
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();
