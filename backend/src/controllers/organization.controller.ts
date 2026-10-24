import { Request, Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class OrganizationController {
  async getOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await organizationService.getOrganizations(req.query.status as any);
      sendSuccess(res, orgs);
    } catch (err) {
      next(err);
    }
  }

  async getOrganizationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.getOrganizationById(req.params.id as string);
      sendSuccess(res, org);
    } catch (err) {
      next(err);
    }
  }

  async createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.createOrganization(req.body);
      sendSuccess(res, org, 'Organization onboarded successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.updateOrganization(req.params.id as string, req.body);
      sendSuccess(res, org, 'Organization details updated.');
    } catch (err) {
      next(err);
    }
  }

  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await organizationService.getActivities(req.params.id as string);
      sendSuccess(res, activities);
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();
