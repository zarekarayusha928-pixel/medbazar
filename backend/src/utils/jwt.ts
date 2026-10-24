import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { TokenPayload } from '../types/index.js';
import { ApiError } from './apiError.js';

// In-memory token revocation blacklist (for revoked JWTs before TTL expiry)
const revokedTokens = new Set<string>();

export function signJwtToken(payload: TokenPayload, expiresIn?: string): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (expiresIn || env.JWT_EXPIRES_IN) as any,
  });
}

export function verifyJwtToken(token: string): TokenPayload {
  if (revokedTokens.has(token)) {
    throw ApiError.unauthorized('Token has been revoked. Please sign in again.', 'REVOKED_TOKEN');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please sign in again.', 'EXPIRED_TOKEN');
    }
    throw ApiError.unauthorized('Invalid authentication token.', 'INVALID_TOKEN');
  }
}

export function revokeJwtToken(token: string): void {
  revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

// Convenient aliases
export const signToken = signJwtToken;
export const verifyToken = verifyJwtToken;
export const revokeToken = revokeJwtToken;

