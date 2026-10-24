import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

/**
 * Enforces organization-level tenant isolation.
 * PLATFORM_ADMIN can access any organization.
 * All other roles can only access data belonging to their own organization.
 */
export function requireOrganizationAccess(getOrgId?: (req: Request) => string | string[] | undefined) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    // Platform Superadmin has overarching platform oversight
    if (req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    const rawTargetOrgId =
      getOrgId?.(req) ||
      req.params.organizationId ||
      req.params.pharmacyId ||
      req.body.organizationId ||
      (req.query.organizationId as string);

    if (!rawTargetOrgId) {
      return next();
    }

    const targetOrgId = Array.isArray(rawTargetOrgId) ? rawTargetOrgId[0] : String(rawTargetOrgId);

    if (!req.user.organizationId || req.user.organizationId !== targetOrgId) {
      return next(
        ApiError.forbidden(
          'Tenant Access Violation: You do not have permission to access records for this pharmacy organization.'
        )
      );
    }

    next();
  };
}

/**
 * Enforces branch-level operational isolation.
 * PLATFORM_ADMIN and PHARMACY_OWNER can access all branches within their organization.
 * BRANCH_MANAGER, PHARMACIST, CASHIER can only access their assigned branch.
 */
export function requireBranchAccess(getBranchId?: (req: Request) => string | string[] | undefined) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (req.user.role === 'PLATFORM_ADMIN' || req.user.role === 'PHARMACY_OWNER') {
      return next();
    }

    const rawTargetBranchId =
      getBranchId?.(req) ||
      req.params.branchId ||
      req.body.branchId ||
      (req.query.branchId as string);

    if (!rawTargetBranchId) {
      return next();
    }

    const targetBranchId = Array.isArray(rawTargetBranchId) ? rawTargetBranchId[0] : String(rawTargetBranchId);

    if (!req.user.branchId || req.user.branchId !== targetBranchId) {
      return next(
        ApiError.forbidden(
          'Branch Access Violation: You do not have permission to access records for this branch.'
        )
      );
    }

    next();
  };
}
