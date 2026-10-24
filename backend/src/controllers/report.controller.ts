import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ReportController {
  async getPharmacyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const report = await reportService.getPharmacyReport(
        {
          organizationId: req.query.organizationId as string,
          branchId: req.query.branchId as string,
          period: req.query.period as any,
        },
        req.user
      );
      sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  }

  async getDashboardTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const telemetry = await reportService.getDashboardTelemetry(
        {
          organizationId: req.query.organizationId as string,
          branchId: req.query.branchId as string,
          period: req.query.period as any,
        },
        req.user
      );
      sendSuccess(res, telemetry);
    } catch (err) {
      next(err);
    }
  }

  async getAdminReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const report = await reportService.getAdminReport(req.query.period as string, req.user);
      sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  }

  async exportReportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const period = (req.query.period as string) || '30d';
      const format = ((req.query.format as string) || 'csv') as 'csv' | 'json';
      const content = await reportService.exportReportData(period, format, req.user);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=pharmacy_report_${period}.csv`);
        res.status(200).send(content);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(content);
      }
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
