import { inventoryApi } from './inventoryApi';

// Backward-compatible service facade delegating to the unified inventoryApi
export const inventoryService = inventoryApi;
