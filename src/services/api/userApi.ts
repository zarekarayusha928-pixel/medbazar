import { User, UserRole, Staff } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_STAFF } from './mockData';
import { DEMO_USERS } from '@/context/AuthContext';

let mockUsersList: User[] = [
  ...Object.values(DEMO_USERS),
  {
    id: 'usr_owner_2',
    name: 'Dr. Anita Joshi',
    email: 'anita.joshi@medicure.com',
    phone: '+91 98222 33445',
    role: 'PHARMACY_OWNER',
    status: 'ACTIVE',
    pharmacyId: 'pharm_2',
    pharmacyName: 'MediCure Pharmacy',
    createdAt: '2025-02-10',
  },
  {
    id: 'usr_cust_2',
    name: 'Pooja Kulkarni',
    email: 'pooja.k@example.com',
    phone: '+91 98333 44556',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2025-06-18',
  },
];

let mockStaffList: Staff[] = [...MOCK_STAFF];

export interface UserQueryParams {
  role?: string;
  status?: string;
  pharmacyId?: string;
}

export const userApi = {
  async getUsers(params?: UserQueryParams): Promise<User[]> {
    if (!isMockMode()) {
      return apiClient.get<User[]>('/users', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockUsersList];

    if (params?.role && params.role !== 'ALL') {
      list = list.filter((u) => u.role === params.role);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((u) => u.status === params.status);
    }
    if (params?.pharmacyId) {
      list = list.filter((u) => u.pharmacyId === params.pharmacyId);
    }

    return list;
  },

  async getUserById(id: string): Promise<User | undefined> {
    if (!isMockMode()) {
      return apiClient.get<User>(`/users/${id}`);
    }

    await mockDelay(100);
    return mockUsersList.find((u) => u.id === id);
  },

  async createUser(data: Partial<User>): Promise<User> {
    if (!isMockMode()) {
      return apiClient.post<User>('/users', data);
    }

    await mockDelay(200);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name || 'New User',
      email: data.email || 'user@example.com',
      phone: data.phone || '+91 98000 00000',
      role: data.role || 'PHARMACIST',
      status: data.status || 'ACTIVE',
      pharmacyId: data.pharmacyId,
      branchId: data.branchId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    mockUsersList = [newUser, ...mockUsersList];
    return newUser;
  },

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    if (!isMockMode()) {
      return apiClient.patch<User>(`/users/${id}/role`, { role });
    }

    await mockDelay(150);
    const user = mockUsersList.find((u) => u.id === id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    user.role = role;
    return { ...user };
  },

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<User> {
    if (!isMockMode()) {
      return apiClient.patch<User>(`/users/${id}/status`, { status });
    }

    await mockDelay(150);
    const user = mockUsersList.find((u) => u.id === id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    user.status = status;
    return { ...user };
  },

  async getStaffMembers(organizationId?: string, branchId?: string): Promise<Staff[]> {
    if (!isMockMode()) {
      return apiClient.get<Staff[]>('/staff', { params: { organizationId, branchId } });
    }

    await mockDelay(150);
    let list = [...mockStaffList];
    if (organizationId && organizationId !== 'ALL') {
      list = list.filter((s) => s.organizationId === organizationId);
    }
    if (branchId && branchId !== 'ALL') {
      list = list.filter((s) => s.branchId === branchId);
    }
    return list;
  },

  async createStaff(data: Partial<Staff>): Promise<Staff> {
    if (!isMockMode()) {
      return apiClient.post<Staff>('/staff', data);
    }

    await mockDelay(200);
    const newStaff: Staff = {
      id: `stf_${Date.now()}`,
      organizationId: data.organizationId || 'pharm_1',
      branchId: data.branchId,
      branchName: data.branchName,
      userId: `usr_${Date.now()}`,
      name: data.name || 'Staff Member',
      email: data.email || 'staff@example.com',
      phone: data.phone || '+91 98000 00000',
      role: data.role || 'PHARMACIST',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    mockStaffList = [newStaff, ...mockStaffList];
    return newStaff;
  },
};
