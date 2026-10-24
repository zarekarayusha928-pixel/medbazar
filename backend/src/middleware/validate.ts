import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

export function validateRequest(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        try {
          req.query = parsed.query;
        } catch {
          Object.defineProperty(req, 'query', {
            value: parsed.query,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }
      if (parsed.params !== undefined) {
        try {
          req.params = parsed.params;
        } catch {
          Object.defineProperty(req, 'params', {
            value: parsed.params,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const path = issue.path.slice(1).join('.') || 'general';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        }
        next(ApiError.badRequest('Validation failed. Please verify your input.', errors));
      } else {
        next(err);
      }
    }
  };
}
