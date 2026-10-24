import { Request, Response, NextFunction } from 'express';
import { prescriptionService } from '../services/prescription.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class PrescriptionController {
  async createPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const rx = await prescriptionService.createPrescription(req.body, req.user);
      sendSuccess(res, rx, 'Prescription uploaded successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async getPrescriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const list = await prescriptionService.getPrescriptions(
        {
          organizationId: req.query.organizationId as string,
          customerId: req.query.customerId as string,
          status: req.query.status as string,
        },
        req.user
      );
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  }

  async getPrescriptionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const rx = await prescriptionService.getPrescriptionById(req.params.id as string, req.user);
      sendSuccess(res, rx);
    } catch (err) {
      next(err);
    }
  }

  async updatePrescriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const rx = await prescriptionService.updatePrescriptionStatus(
        req.params.id as string,
        req.body,
        req.user
      );
      sendSuccess(res, rx, 'Prescription verification updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getPrescriptionFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const fileInfo = await prescriptionService.getPrescriptionFile(req.params.id as string, req.user);
      sendSuccess(res, fileInfo, 'Prescription file access authorized.');
    } catch (err) {
      next(err);
    }
  }
}

export const prescriptionController = new PrescriptionController();
