// Domain models for Med Bazar

export type UserRole = 
  | 'PLATFORM_ADMIN'
  | 'PHARMACY_OWNER'
  | 'BRANCH_MANAGER'
  | 'PHARMACIST'
  | 'CASHIER'
  | 'DELIVERY_STAFF'
  | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  legalName: string;
  licenseNumber: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  logoUrl?: string;
  branchCount: number;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  organizationName?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  operatingHours?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  medicineCount?: number;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  composition: string;
  dosageForm: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS' | 'OTHER';
  strength: string;
  categoryId: string;
  categoryName?: string;
  prescriptionRequired: boolean;
  barcode?: string;
  manufacturer: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'DISCONTINUED';
}

export interface InventoryBatch {
  id: string;
  inventoryId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  purchasePrice: number;
}

export interface Inventory {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  medicineId: string;
  medicine?: Medicine;
  quantity: number;
  reorderLevel: number;
  sellingPrice: number;
  mrp: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  batches?: InventoryBatch[];
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  organizationId: string;
  branchId: string;
  inventoryId: string;
  medicineName: string;
  movementType: 
    | 'PURCHASE'
    | 'ONLINE_SALE'
    | 'OFFLINE_SALE'
    | 'RETURN'
    | 'ADJUSTMENT'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'EXPIRY';
  quantity: number;
  referenceType?: 'ORDER' | 'POS_SALE' | 'PURCHASE_ORDER' | 'ADJUSTMENT';
  referenceId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: CustomerAddress[];
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'PRESCRIPTION_REVIEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  prescriptionRequired: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  organizationId: string;
  pharmacyName?: string;
  branchId: string;
  branchName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderType: 'ONLINE' | 'PICKUP';
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'ONLINE' | 'COD' | 'UPI';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryAddress?: string;
  prescriptionId?: string;
  prescriptionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Prescription {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  fileUrl: string;
  fileName: string;
  fileType: 'IMAGE' | 'PDF';
  status: 'UPLOADED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFORMATION';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PosSaleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  batchNumber?: string;
}

export interface PosSale {
  id: string;
  organizationId: string;
  branchId: string;
  receiptNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: PosSaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  createdBy: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  organizationId: string;
  branchId?: string;
  branchName?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}
