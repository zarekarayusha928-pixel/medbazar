import { Request, Response, NextFunction } from 'express';
import { medicineService } from '../services/medicine.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class MedicineController {
  async getMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rx = req.query.rx !== undefined ? req.query.rx === 'true' : undefined;
      const medicines = await medicineService.getMedicines({
        query: req.query.query as string,
        categoryId: req.query.categoryId as string,
        rx,
        dosageForm: req.query.dosageForm as any,
        brand: req.query.brand as string,
        status: req.query.status as any,
      });
      sendSuccess(res, medicines);
    } catch (err) {
      next(err);
    }
  }

  async getMedicineById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const medicine = await medicineService.getMedicineById(req.params.id as string);
      sendSuccess(res, medicine);
    } catch (err) {
      next(err);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await medicineService.getCategories();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await medicineService.createCategory(req.body);
      sendSuccess(res, category, 'Category created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async createMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const medicine = await medicineService.createMedicine(req.body);
      sendSuccess(res, medicine, 'Medicine created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const medicine = await medicineService.updateMedicine(req.params.id as string, req.body);
      sendSuccess(res, medicine, 'Medicine updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const medicineController = new MedicineController();
