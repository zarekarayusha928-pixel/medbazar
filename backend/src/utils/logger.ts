import { env } from '../config/env.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'jwt',
  'secret',
  'authsecret',
  'fileurl',
  'rx',
  'prescription',
  'prescriptionfile',
  'cardnumber',
  'cvv',
]);

function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      sanitized[key] = sanitize(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, meta?: any): void {
    if (meta) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  },

  warn(message: string, meta?: any): void {
    if (meta) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  },

  error(message: string, error?: any): void {
    if (error instanceof Error) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}: ${error.message}`);
      if (env.NODE_ENV !== 'production' && error.stack) {
        console.error(error.stack);
      }
    } else if (error) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, JSON.stringify(sanitize(error)));
    } else {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    }
  },
};
