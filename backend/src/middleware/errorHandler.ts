import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  let statusCode = 500;
  let message = 'An unexpected server error occurred.';
  let code = 'INTERNAL_ERROR';
  let errors: Record<string, string[]> | undefined = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errors = err.errors;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'RESOURCE_CONFLICT';
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      message = `A record with this ${target} already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'The requested database record does not exist.';
    } else {
      statusCode = 400;
      code = 'DATABASE_ERROR';
      message = 'Database operation failed.';
    }
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON request body.';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Authentication required.';
  }

  // Safe logging without credentials
  logger.error(`${code} [${statusCode}] - ${message} | ${err?.message || ''}`);
  if (statusCode === 500 && err?.stack) {
    logger.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    code,
    errors,
    timestamp: new Date().toISOString(),
    ...(env.NODE_ENV !== 'production' && statusCode === 500 ? { stack: err.stack } : {}),
  });
}
