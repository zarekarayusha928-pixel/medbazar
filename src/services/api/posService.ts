import { posApi, CreatePosSalePayload } from './posApi';

export type { CreatePosSalePayload };

// Backward-compatible service facade delegating to the unified posApi
export const posService = posApi;
