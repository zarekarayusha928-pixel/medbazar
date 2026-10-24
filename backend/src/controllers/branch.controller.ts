import { Request, Response, NextFunction } from 'express';
import { branchService } from '../services/branch.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class BranchController {
  async getBranches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branches = await branchService.getBranches(req.query.organizationId as string);
      sendSuccess(res, branches);
    } catch (err) {
      next(err);
    }
  }

  async getBranchById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await branchService.getBranchById(req.params.id as string);
      sendSuccess(res, branch);
    } catch (err) {
      next(err);
    }
  }

  async createBranch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await branchService.createBranch(req.body);
      sendSuccess(res, branch, 'Branch created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateBranch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await branchService.updateBranch(req.params.id as string, req.body, req.user);
      sendSuccess(res, branch, 'Branch updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async updateBranchStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branch = await branchService.updateBranchStatus(req.params.id as string, req.body.status, req.user);
      sendSuccess(res, branch, 'Branch status updated.');
    } catch (err) {
      next(err);
    }
  }
}

export const branchController = new BranchController();
