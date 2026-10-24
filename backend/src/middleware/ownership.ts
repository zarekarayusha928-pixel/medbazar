import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

/**
 * Enforces customer ownership: customers can only access their own user profile, orders, and prescriptions.
 * Internal staff or platform admins can access patient records as part of fulfillment.
 */
export function requireCustomerOwnership(getCustomerId?: (req: Request) => string | string[] | undefined) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    // Platform admins and pharmacy staff can access customer order/rx data for processing
    if (req.user.role !== 'CUSTOMER') {
      return next();
    }

    const rawTargetCustomerId =
      getCustomerId?.(req) ||
      req.params.userId ||
      req.params.customerId ||
      req.query.customerId ||
      req.body.customerId;

    if (!rawTargetCustomerId) {
      return next();
    }

    const targetCustomerId = Array.isArray(rawTargetCustomerId)
      ? rawTargetCustomerId[0]
      : String(rawTargetCustomerId);

    if (req.user.id !== targetCustomerId) {
      return next(
        ApiError.forbidden(
          'Access Denied: You cannot view or modify another customer\'s profile, orders, or prescriptions.'
        )
      );
    }

    next();
  };
}
