import { UserRole, UserStatus } from '@prisma/client';
import { hashPasswordSync } from '../utils/password.js';

export interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  organizationId?: string;
  organizationName?: string;
  branchId?: string;
  branchName?: string;
  createdAt: string;
}

export interface MockStaffRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  organizationName: string;
  branchId?: string;
  branchName?: string;
  joinedAt: string;
}

const DEFAULT_HASH = hashPasswordSync('DemoPassword@2026');

export const mockUsers: MockUserRecord[] = [
  {
    id: 'usr_admin_1',
    name: 'Neha Kapoor (Platform Admin)',
    email: 'admin@medbazar.com',
    phone: '+91 99999 00001',
    passwordHash: DEFAULT_HASH,
    role: 'PLATFORM_ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'usr_owner_1',
    name: 'Dr. Suresh Mehta',
    email: 'suresh.mehta@apothecary.com',
    phone: '+91 98230 11223',
    passwordHash: DEFAULT_HASH,
    role: 'PHARMACY_OWNER',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    createdAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'usr_mgr_1',
    name: 'Vikram Singhania',
    email: 'vikram.s@apothecary.com',
    phone: '+91 98230 77665',
    passwordHash: DEFAULT_HASH,
    role: 'BRANCH_MANAGER',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    createdAt: new Date('2025-03-01').toISOString(),
  },
  {
    id: 'usr_pharm_1',
    name: 'Amit Deshmukh (Reg. Pharmacist)',
    email: 'amit.d@apothecary.com',
    phone: '+91 98230 44556',
    passwordHash: DEFAULT_HASH,
    role: 'PHARMACIST',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    createdAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'usr_cash_1',
    name: 'Kiran Kulkarni',
    email: 'kiran.k@apothecary.com',
    phone: '+91 98230 99887',
    passwordHash: DEFAULT_HASH,
    role: 'CASHIER',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    createdAt: new Date('2025-03-15').toISOString(),
  },
  {
    id: 'usr_deliv_1',
    name: 'Ramesh Pawar',
    email: 'ramesh.p@apothecary.com',
    phone: '+91 98230 33221',
    passwordHash: DEFAULT_HASH,
    role: 'DELIVERY_STAFF',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    createdAt: new Date('2025-04-10').toISOString(),
  },
  {
    id: 'usr_cust_1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98765 43210',
    passwordHash: DEFAULT_HASH,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: new Date('2025-05-10').toISOString(),
  },
];

export const mockStaff: MockStaffRecord[] = [
  {
    id: 'stf_1',
    userId: 'usr_pharm_1',
    name: 'Amit Deshmukh (Reg. Pharmacist)',
    email: 'amit.d@apothecary.com',
    phone: '+91 98230 44556',
    role: 'PHARMACIST',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    joinedAt: '2025-02-01',
  },
  {
    id: 'stf_2',
    userId: 'usr_cash_1',
    name: 'Kiran Kulkarni',
    email: 'kiran.k@apothecary.com',
    phone: '+91 98230 99887',
    role: 'CASHIER',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    joinedAt: '2025-03-15',
  },
  {
    id: 'stf_3',
    userId: 'usr_deliv_1',
    name: 'Ramesh Pawar',
    email: 'ramesh.p@apothecary.com',
    phone: '+91 98230 33221',
    role: 'DELIVERY_STAFF',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    joinedAt: '2025-04-10',
  },
  {
    id: 'stf_4',
    userId: 'usr_mgr_1',
    name: 'Vikram Singhania',
    email: 'vikram.s@apothecary.com',
    phone: '+91 98230 77665',
    role: 'BRANCH_MANAGER',
    status: 'ACTIVE',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare',
    branchId: 'br_1',
    branchName: 'Kothrud Main Branch',
    joinedAt: '2025-03-01',
  },
];
