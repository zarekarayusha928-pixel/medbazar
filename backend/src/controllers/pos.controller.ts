import { Request, Response, NextFunction } from 'express';
import { posService } from '../services/pos.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class PosController {
  async createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const sale = await posService.createSale(req.body, req.user);
      sendSuccess(res, sale, 'POS sale completed and stock deducted.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const sales = await posService.getSales(
        {
          branchId: req.query.branchId as string,
          organizationId: req.query.organizationId as string,
          search: req.query.search as string,
        },
        req.user
      );
      sendSuccess(res, sales);
    } catch (err) {
      next(err);
    }
  }

  async getSaleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const sale = await posService.getSaleById(req.params.id as string, req.user);
      sendSuccess(res, sale);
    } catch (err) {
      next(err);
    }
  }
}

export const posController = new PosController();
