import { Request, Response, NextFunction } from 'express';
import { supplierService } from '../services/supplier.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class SupplierController {
  async getSuppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = (req.query.organizationId as string) || req.user?.organizationId;
      const suppliers = await supplierService.getSuppliers(organizationId);
      sendSuccess(res, suppliers);
    } catch (err) {
      next(err);
    }
  }

  async getSupplierById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id as string);
      sendSuccess(res, supplier);
    } catch (err) {
      next(err);
    }
  }

  async createSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.body.organizationId || req.user?.organizationId || 'pharm_1';
      const supplier = await supplierService.createSupplier({
        ...req.body,
        organizationId,
      });
      sendSuccess(res, supplier, 'Supplier created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplier = await supplierService.updateSupplier(req.params.id as string, req.body);
      sendSuccess(res, supplier, 'Supplier updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const supplierController = new SupplierController();
