// Centralized exports for Med Bazar Frontend API Foundation
export * from './client';
export * from './authApi';
export * from './medicineApi';
export * from './pharmacyApi';
export * from './inventoryApi';
export * from './orderApi';
export * from './prescriptionApi';
export * from './posApi';
export * from './deliveryApi';
export * from './reportApi';
export * from './userApi';
export * from './purchaseApi';
export * from './supplierApi';

// Legacy service facades pointing to unified API foundation
export { medicineApi as medicineService } from './medicineApi';
export { pharmacyApi as pharmacyService } from './pharmacyApi';
export { inventoryApi as inventoryService } from './inventoryApi';
export { orderApi as orderService } from './orderApi';
export { prescriptionApi as prescriptionService } from './prescriptionApi';
export { posApi as posService } from './posApi';
export { userApi as staffService } from './userApi';
export { supplierApi as supplierService } from './supplierApi';
export { adminService } from './adminService';
