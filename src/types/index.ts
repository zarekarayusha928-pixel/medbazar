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
  pharmacyId?: string;
  pharmacyName?: string;
  branchId?: string;
  branchName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  legalName: string;
  licenseNumber: string;
  gstNumber?: string;
  phone: string;
  email: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  logoUrl?: string;
  branchCount: number;
  createdAt: string;
  verifiedAt?: string;
}

export interface PharmacyActivity {
  id: string;
  pharmacyId: string;
  type: 'ONBOARDING' | 'VERIFICATION' | 'STATUS_CHANGE' | 'BRANCH_ADDED' | 'STAFF_ADDED' | 'ORDER' | 'SETTING_UPDATE';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  timezone: string;
  maintenanceMode: boolean;
  commissionRate: number;
  deliveryFeeBase: number;
  minimumOrderValue: number;
  payoutCycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  drugRegulatoryAuthorityId: string;
  requireDigitalRxVerification: boolean;
  require2FAForOwners: boolean;
  rxRecordRetentionYears: number;
  smsGatewayEnabled: boolean;
  emailNotificationsEnabled: boolean;
  dispatchAlertsEnabled: boolean;
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
  referenceType?: 'ORDER' | 'POS_SALE' | 'PURCHASE_ORDER' | 'ADJUSTMENT' | 'TRANSFER';
  referenceId?: string;
  notes?: string;
  createdBy?: string;
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
  organizationName?: string;
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
  shippingAddress?: string;
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
  doctorName?: string;
  orderId?: string;
  fileUrl: string;
  fileName: string;
  fileType: 'IMAGE' | 'PDF';
  status: 'UPLOADED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFORMATION';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  uploadedAt?: string;
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

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  organizationId: string;
  branchId: string;
  branchName: string;
  itemsCount: number;
  itemsSummary: string;
  total: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  purchaseDate: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryStaffName: string;
  deliveryStaffPhone: string;
  branchId: string;
  branchName: string;
  status: 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  assignedTime: string;
  completedTime?: string;
}

// Aliases matching domain vocabulary
export type Role = UserRole;
export type Organization = Pharmacy;
export type Batch = InventoryBatch;
export type POSSale = PosSale;
export type POSSaleItem = PosSaleItem;
export type Delivery = DeliveryAssignment;

// Payment domain model
export interface Payment {
  id: string;
  orderId?: string;
  posSaleId?: string;
  amount: number;
  currency: string;
  method: 'ONLINE' | 'COD' | 'UPI' | 'CASH' | 'CARD';
  status: PaymentStatus;
  transactionRef?: string;
  gatewayName?: string;
  paidAt?: string;
  createdAt: string;
}

// Notification domain model
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

// Analytics and reporting domain model
export interface ReportSummary {
  period: '30d' | '90d' | 'ytd';
  totalGmv: number;
  totalOrders: number;
  totalRevenue: number;
  platformCommissions: number;
  netPayouts: number;
}

export interface ReportSalesTrend {
  month: string;
  gmv: number;
  orders: number;
}

export interface ReportPharmacyPerformance {
  id: string;
  pharmacyName: string;
  branchCount: number;
  totalOrders: number;
  gmv: number;
  platformCommission: number;
  netPayout: number;
}

export interface ReportMedicineDemand {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface Report {
  id: string;
  period: '30d' | '90d' | 'ytd';
  generatedAt: string;
  summary: ReportSummary;
  salesTrend: ReportSalesTrend[];
  pharmacyPerformance: ReportPharmacyPerformance[];
  medicineDemand: ReportMedicineDemand[];
}

// Generic API response envelopes
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ApiErrorData {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

