import {
  Pharmacy,
  Branch,
  Medicine,
  User,
  PharmacyActivity,
  PlatformSettings,
  Staff,
  Order,
  UserRole
} from '@/types';
import {
  MOCK_PHARMACIES,
  MOCK_BRANCHES,
  MOCK_MEDICINES,
  MOCK_STAFF,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_USERS,
  MOCK_PHARMACY_ACTIVITIES,
  MOCK_PLATFORM_SETTINGS,
} from './mockData';
import { isMockMode } from './client';
import { pharmacyApi } from './pharmacyApi';
import { medicineApi } from './medicineApi';
import { userApi } from './userApi';


const STORAGE_KEYS = {
  PHARMACIES: 'medbazar_admin_pharmacies',
  BRANCHES: 'medbazar_admin_branches',
  MEDICINES: 'medbazar_admin_medicines',
  USERS: 'medbazar_admin_users',
  ACTIVITIES: 'medbazar_admin_activities',
  SETTINGS: 'medbazar_admin_settings',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota or disabled fallback
  }
}

export interface AdminDashboardMetrics {
  totalPharmacies: number;
  activePharmacies: number;
  branches: number;
  customers: number;
  orders: number;
  platformSales: number;
  pendingVerifications: number;
}

export interface PharmacyReportRow {
  pharmacyId: string;
  pharmacyName: string;
  licenseNumber: string;
  branchCount: number;
  totalOrders: number;
  gmv: number;
  platformCommission: number;
  netPayout: number;
  payoutStatus: 'SETTLED' | 'PROCESSING' | 'PENDING';
}

export interface MedicineDemandRow {
  medicineId: string;
  name: string;
  genericName: string;
  category: string;
  ordersCount: number;
  unitsSold: number;
  totalSales: number;
  prescriptionRequired: boolean;
}

export const adminService = {
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const pharmacies = await this.getPharmacies();
    const branches = await this.getBranches();
    const users = await this.getUsers();

    const activePharmacies = pharmacies.filter(p => p.status === 'ACTIVE').length;
    const customersCount = users.filter(u => u.role === 'CUSTOMER').length;
    const totalOrdersCount = MOCK_ORDERS.length;
    const platformSales = MOCK_ORDERS.reduce((acc, curr) => acc + curr.total, 0) + 1845000; // Simulated historical + current
    const pendingVerifications = pharmacies.filter(p => p.status === 'PENDING').length;

    return {
      totalPharmacies: pharmacies.length,
      activePharmacies,
      branches: branches.length,
      customers: customersCount,
      orders: totalOrdersCount,
      platformSales,
      pendingVerifications,
    };
  },

  async getPharmacies(): Promise<Pharmacy[]> {
    if (!isMockMode()) {
      return pharmacyApi.getPharmacies();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = loadFromStorage<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, MOCK_PHARMACIES);
        resolve(list);
      }, 80);
    });
  },

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    if (!isMockMode()) {
      const p = await pharmacyApi.getPharmacyById(id);
      return p || null;
    }
    const pharmacies = await this.getPharmacies();
    return pharmacies.find(p => p.id === id) || null;
  },

  async updatePharmacyStatus(id: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'): Promise<Pharmacy> {
    if (!isMockMode()) {
      return pharmacyApi.updatePharmacyStatus(id, status);
    }
    const pharmacies = await this.getPharmacies();
    const idx = pharmacies.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Pharmacy not found');

    const updated = { ...pharmacies[idx], status };
    pharmacies[idx] = updated;
    saveToStorage(STORAGE_KEYS.PHARMACIES, pharmacies);

    // Record activity
    await this.addActivity({
      pharmacyId: id,
      type: 'STATUS_CHANGE',
      title: `Pharmacy Status Changed to ${status}`,
      description: `Platform Administrator updated business state to ${status}.`,
      actor: 'Platform Superadmin',
    });

    return updated;
  },

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<Pharmacy> {
    if (!isMockMode()) {
      return pharmacyApi.updatePharmacy(id, updates);
    }
    const pharmacies = await this.getPharmacies();
    const idx = pharmacies.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Pharmacy not found');

    const updated = { ...pharmacies[idx], ...updates };
    pharmacies[idx] = updated;
    saveToStorage(STORAGE_KEYS.PHARMACIES, pharmacies);

    await this.addActivity({
      pharmacyId: id,
      type: 'SETTING_UPDATE',
      title: 'Business Profile Updated',
      description: 'Profile information, drug licensing, or contact parameters modified.',
      actor: 'Platform Superadmin',
    });

    return updated;
  },

  async createPharmacy(data: Partial<Pharmacy>): Promise<Pharmacy> {
    if (!isMockMode()) {
      return pharmacyApi.createPharmacy(data);
    }
    const pharmacies = await this.getPharmacies();

    const newPharmacy: Pharmacy = {
      id: `pharm_${Date.now()}`,
      name: data.name || 'New Retail Pharmacy',
      legalName: data.legalName || data.name || 'New Retail Pharmacy Ltd',
      licenseNumber: data.licenseNumber || 'PENDING-LIC',
      gstNumber: data.gstNumber || '',
      phone: data.phone || '+91 90000 00000',
      email: data.email || 'info@pharmacy.com',
      ownerName: data.ownerName || 'Pharmacy Owner',
      ownerEmail: data.ownerEmail || data.email || 'owner@pharmacy.com',
      ownerPhone: data.ownerPhone || data.phone || '+91 90000 00000',
      address: data.address || '',
      city: data.city || 'Pune',
      state: data.state || 'Maharashtra',
      pincode: data.pincode || '411001',
      status: (data.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED') || 'PENDING',
      branchCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      verifiedAt: data.status === 'ACTIVE' ? new Date().toISOString().split('T')[0] : undefined,
    };

    pharmacies.unshift(newPharmacy);
    saveToStorage(STORAGE_KEYS.PHARMACIES, pharmacies);

    // Also auto-create a primary branch for it
    await this.createBranch({
      organizationId: newPharmacy.id,
      organizationName: newPharmacy.name,
      name: `${newPharmacy.name} - Main Branch`,
      address: newPharmacy.address || 'Central Road',
      city: newPharmacy.city || 'Pune',
      state: newPharmacy.state || 'Maharashtra',
      pincode: newPharmacy.pincode || '411001',
      phone: newPharmacy.phone,
      status: 'ACTIVE',
    });

    // Also register an owner user
    await this.createUser({
      name: newPharmacy.ownerName,
      email: newPharmacy.ownerEmail || newPharmacy.email,
      phone: newPharmacy.ownerPhone || newPharmacy.phone,
      role: 'PHARMACY_OWNER',
      pharmacyId: newPharmacy.id,
      pharmacyName: newPharmacy.name,
      status: 'ACTIVE',
    });

    await this.addActivity({
      pharmacyId: newPharmacy.id,
      type: 'ONBOARDING',
      title: 'Pharmacy Business Onboarded',
      description: `Created initial business account for ${newPharmacy.name} with license ${newPharmacy.licenseNumber}.`,
      actor: 'Platform Superadmin',
    });

    return newPharmacy;
  },

  async getPharmacyBranches(pharmacyId: string): Promise<Branch[]> {
    if (!isMockMode()) {
      return pharmacyApi.getBranches(pharmacyId);
    }
    const branches = await this.getBranches();
    return branches.filter(b => b.organizationId === pharmacyId);
  },

  async getPharmacyStaff(pharmacyId: string): Promise<Staff[]> {
    if (!isMockMode()) {
      return userApi.getStaffMembers(pharmacyId);
    }
    return MOCK_STAFF.filter(s => s.organizationId === pharmacyId);
  },

  async getPharmacyActivities(pharmacyId: string): Promise<PharmacyActivity[]> {
    if (!isMockMode()) {
      return pharmacyApi.getPharmacyActivities(pharmacyId);
    }
    const all = loadFromStorage<PharmacyActivity[]>(STORAGE_KEYS.ACTIVITIES, MOCK_PHARMACY_ACTIVITIES);
    return all.filter(a => a.pharmacyId === pharmacyId);
  },

  async addActivity(act: Omit<PharmacyActivity, 'id' | 'timestamp'>): Promise<PharmacyActivity> {
    const all = loadFromStorage<PharmacyActivity[]>(STORAGE_KEYS.ACTIVITIES, MOCK_PHARMACY_ACTIVITIES);
    const newAct: PharmacyActivity = {
      ...act,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    all.unshift(newAct);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, all);
    return newAct;
  },

  async getBranches(): Promise<Branch[]> {
    if (!isMockMode()) {
      return pharmacyApi.getBranches();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = loadFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, MOCK_BRANCHES);
        resolve(list);
      }, 80);
    });
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    if (!isMockMode()) {
      return pharmacyApi.createBranch(data);
    }
    const branches = await this.getBranches();
    const newBranch: Branch = {
      id: `branch_${Date.now()}`,
      organizationId: data.organizationId || 'pharm_1',
      organizationName: data.organizationName || 'Apothecary Healthcare',
      name: data.name || 'New Retail Branch',
      address: data.address || 'Main Road',
      city: data.city || 'Pune',
      state: data.state || 'Maharashtra',
      pincode: data.pincode || '411001',
      phone: data.phone || '+91 90000 00000',
      status: (data.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      operatingHours: data.operatingHours || '09:00 AM - 10:00 PM',
      createdAt: new Date().toISOString().split('T')[0],
    };

    branches.unshift(newBranch);
    saveToStorage(STORAGE_KEYS.BRANCHES, branches);

    // Update branch count in pharmacy
    const pharmacies = await this.getPharmacies();
    const pharm = pharmacies.find(p => p.id === newBranch.organizationId);
    if (pharm) {
      pharm.branchCount = (pharm.branchCount || 0) + 1;
      saveToStorage(STORAGE_KEYS.PHARMACIES, pharmacies);
    }

    return newBranch;
  },

  async updateBranchStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Branch> {
    if (!isMockMode()) {
      return pharmacyApi.updateBranchStatus(id, status);
    }
    const branches = await this.getBranches();
    const idx = branches.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Branch not found');

    const updated = { ...branches[idx], status };
    branches[idx] = updated;
    saveToStorage(STORAGE_KEYS.BRANCHES, branches);
    return updated;
  },

  async getGlobalMedicines(): Promise<Medicine[]> {
    if (!isMockMode()) {
      return medicineApi.getMedicines();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = loadFromStorage<Medicine[]>(STORAGE_KEYS.MEDICINES, MOCK_MEDICINES);
        resolve(list);
      }, 80);
    });
  },

  async createGlobalMedicine(data: Partial<Medicine>): Promise<Medicine> {
    if (!isMockMode()) {
      return medicineApi.createMedicine(data as any);
    }
    const medicines = await this.getGlobalMedicines();
    const newMedicine: Medicine = {
      id: `med_${Date.now()}`,
      name: data.name || 'New Generic Formulation',
      genericName: data.genericName || 'Active Pharmaceutical Ingredient',
      brand: data.brand || 'Generic Pharma',
      composition: data.composition || data.genericName || '',
      dosageForm: data.dosageForm || 'TABLET',
      strength: data.strength || '500mg',
      categoryId: data.categoryId || 'cat_pain',
      categoryName: data.categoryName || 'Pain Relief',
      prescriptionRequired: !!data.prescriptionRequired,
      manufacturer: data.manufacturer || data.brand || 'Standard Manufacturing Ltd',
      status: (data.status as 'ACTIVE' | 'DISCONTINUED') || 'ACTIVE',
    };

    medicines.unshift(newMedicine);
    saveToStorage(STORAGE_KEYS.MEDICINES, medicines);
    return newMedicine;
  },

  async updateMedicineStatus(id: string, status: 'ACTIVE' | 'DISCONTINUED'): Promise<Medicine> {
    if (!isMockMode()) {
      return medicineApi.updateMedicineStatus(id, status);
    }
    const medicines = await this.getGlobalMedicines();
    const idx = medicines.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');

    const updated = { ...medicines[idx], status };
    medicines[idx] = updated;
    saveToStorage(STORAGE_KEYS.MEDICINES, medicines);
    return updated;
  },

  async getUsers(): Promise<User[]> {
    if (!isMockMode()) {
      return userApi.getUsers();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = loadFromStorage<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
        resolve(list);
      }, 80);
    });
  },

  async createUser(data: Partial<User>): Promise<User> {
    if (!isMockMode()) {
      return userApi.createUser(data);
    }
    const users = await this.getUsers();
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name || 'New Platform User',
      email: data.email || 'user@example.com',
      phone: data.phone || '+91 90000 00000',
      role: data.role || 'PHARMACIST',
      pharmacyId: data.pharmacyId,
      pharmacyName: data.pharmacyName,
      branchId: data.branchId,
      branchName: data.branchName,
      status: (data.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    users.unshift(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    if (!isMockMode()) {
      return userApi.updateUserRole(id, role);
    }
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');

    const updated = { ...users[idx], role };
    users[idx] = updated;
    saveToStorage(STORAGE_KEYS.USERS, users);
    return updated;
  },

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<User> {
    if (!isMockMode()) {
      return userApi.updateUserStatus(id, status);
    }
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');

    const updated = { ...users[idx], status };
    users[idx] = updated;
    saveToStorage(STORAGE_KEYS.USERS, users);
    return updated;
  },

  async getPlatformSettings(): Promise<PlatformSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const settings = loadFromStorage<PlatformSettings>(STORAGE_KEYS.SETTINGS, MOCK_PLATFORM_SETTINGS);
        resolve(settings);
      }, 80);
    });
  },

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = await this.getPlatformSettings();
    const merged = { ...current, ...updates };
    saveToStorage(STORAGE_KEYS.SETTINGS, merged);
    return merged;
  },

  async getReportsData(period: string = '30d') {
    const pharmacies = await this.getPharmacies();
    const medicines = await this.getGlobalMedicines();

    // Pharmacy financial performance summary
    const pharmacyPerformance: PharmacyReportRow[] = [
      {
        pharmacyId: 'pharm_1',
        pharmacyName: 'Apothecary Healthcare',
        licenseNumber: '20B/MH-PUN-104928',
        branchCount: 2,
        totalOrders: 284,
        gmv: 428900,
        platformCommission: 23589.5,
        netPayout: 405310.5,
        payoutStatus: 'SETTLED',
      },
      {
        pharmacyId: 'pharm_2',
        pharmacyName: 'MediCure Pharmacy',
        licenseNumber: '20B/MH-PUN-409212',
        branchCount: 1,
        totalOrders: 162,
        gmv: 215400,
        platformCommission: 11847.0,
        netPayout: 203553.0,
        payoutStatus: 'SETTLED',
      },
      {
        pharmacyId: 'pharm_3',
        pharmacyName: 'Wellness Chemist Network',
        licenseNumber: '20B/MH-MUM-883921',
        branchCount: 1,
        totalOrders: 94,
        gmv: 142000,
        platformCommission: 7810.0,
        netPayout: 134190.0,
        payoutStatus: 'PROCESSING',
      },
      {
        pharmacyId: 'pharm_4',
        pharmacyName: 'LifeCare Meds & Diagnostics',
        licenseNumber: '20B/MH-NAS-332190',
        branchCount: 1,
        totalOrders: 18,
        gmv: 24500,
        platformCommission: 1347.5,
        netPayout: 23152.5,
        payoutStatus: 'PENDING',
      },
    ];

    // Top medicines demand summary
    const medicineDemand: MedicineDemandRow[] = medicines.slice(0, 6).map((m, i) => {
      const units = [840, 520, 480, 390, 610, 310][i] || 250;
      const orders = [320, 210, 195, 160, 240, 120][i] || 100;
      const rev = [27300, 106080, 22080, 14820, 27450, 41850][i] || 15000;
      return {
        medicineId: m.id,
        name: m.name,
        genericName: m.genericName,
        category: m.categoryName || 'General',
        ordersCount: orders,
        unitsSold: units,
        totalSales: rev,
        prescriptionRequired: m.prescriptionRequired,
      };
    });

    // Monthly GMV trend
    const salesTrend = [
      { month: 'May 2026', gmv: 1120000, orders: 1820, commission: 61600 },
      { month: 'Jun 2026', gmv: 1280000, orders: 2040, commission: 70400 },
      { month: 'Jul 2026', gmv: 1450000, orders: 2310, commission: 79750 },
      { month: 'Aug 2026', gmv: 1620000, orders: 2590, commission: 89100 },
      { month: 'Sep 2026', gmv: 1740000, orders: 2780, commission: 95700 },
      { month: 'Oct 2026 (MTD)', gmv: 1845000, orders: 2950, commission: 101475 },
    ];

    return {
      period,
      summary: {
        totalGmv: 1845000,
        platformRevenue: 101475,
        totalOrdersFulfilled: 2950,
        prescriptionsProcessed: 1420,
        activePharmaciesCount: pharmacies.filter(p => p.status === 'ACTIVE').length,
      },
      salesTrend,
      pharmacyPerformance,
      medicineDemand,
    };
  },
};
