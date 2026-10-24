import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getUsers({
        role: req.query.role as any,
        status: req.query.status as any,
        pharmacyId: req.query.pharmacyId as string,
        branchId: req.query.branchId as string,
      });
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id as string);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      sendSuccess(res, user, 'User created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateUserRole(req.params.id as string, req.body.role);
      sendSuccess(res, user, 'User role updated.');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateUserStatus(req.params.id as string, req.body.status);
      sendSuccess(res, user, 'User status updated.');
    } catch (err) {
      next(err);
    }
  }

  async getStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = (req.query.organizationId as string) || req.user?.organizationId;
      const branchId = req.query.branchId as string;
      const staff = await userService.getStaffMembers(organizationId, branchId);
      sendSuccess(res, staff);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
