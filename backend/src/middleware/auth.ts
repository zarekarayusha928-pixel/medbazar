import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { prisma, isDbReachable } from '../config/prisma.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token is missing. Please sign in.'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(ApiError.unauthorized('Malformed authorization header.'));
  }

  try {
    const payload = verifyJwtToken(token);

    // Try fetching fresh user record with membership from database if reachable
    let user = null;
    let dbConnected = false;

    if (await isDbReachable()) {
      try {
        user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            organizationMembers: {
              include: {
                organization: true,
                branch: true,
              },
            },
          },
        });
        dbConnected = true;
      } catch (_dbError) {
        dbConnected = false;
      }
    }

    if (dbConnected) {
      if (!user) {
        return next(ApiError.unauthorized('User account no longer exists.'));
      }

      if (user.status !== 'ACTIVE') {
        return next(ApiError.forbidden('Your account has been deactivated or suspended.'));
      }

      const primaryMembership = user.organizationMembers[0];

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        organizationId: primaryMembership?.organizationId || payload.organizationId,
        organizationName: primaryMembership?.organization?.name,
        branchId: primaryMembership?.branchId || payload.branchId,
        branchName: primaryMembership?.branch?.name,
      };
    } else {
      // Safe fallback to verified cryptographically-signed JWT payload
      req.user = {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split('@')[0],
        role: payload.role,
        status: 'ACTIVE',
        organizationId: payload.organizationId,
        branchId: payload.branchId,
      };
    }

    next();
  } catch (err) {
    next(err);
  }
}
