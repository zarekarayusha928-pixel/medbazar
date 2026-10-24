import { Pharmacy, Branch, PharmacyActivity } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_PHARMACIES, MOCK_BRANCHES } from './mockData';

// Persistent in-memory mock store
let mockPharmaciesList: Pharmacy[] = [...MOCK_PHARMACIES];
let mockBranchesList: Branch[] = [...MOCK_BRANCHES];

const MOCK_ACTIVITIES_STORE: Record<string, PharmacyActivity[]> = {
  pharm_1: [
    {
      id: 'act_1',
      pharmacyId: 'pharm_1',
      type: 'VERIFICATION',
      title: 'State License Approved',
      description: 'Drug inspector approved regulatory renewal filing #MH-NZ-2024-8841.',
      actor: 'Maharashtra FDA Inspector',
      timestamp: '2026-10-12 11:30 AM',
    },
    {
      id: 'act_2',
      pharmacyId: 'pharm_1',
      type: 'BRANCH_ADDED',
      title: 'Koregaon Park Branch Added',
      description: 'Secondary dispensing center authorized for 24x7 emergency deliveries.',
      actor: 'Dr. Suresh Mehta (Owner)',
      timestamp: '2026-09-28 04:15 PM',
    },
    {
      id: 'act_3',
      pharmacyId: 'pharm_1',
      type: 'ONBOARDING',
      title: 'Organization Registered',
      description: 'Apothecary Healthcare verified on platform with 18% commission agreement.',
      actor: 'Platform Admin',
      timestamp: '2026-01-15 09:00 AM',
    },
  ],
};

export const pharmacyApi = {
  async getPharmacies(params?: { status?: string }): Promise<Pharmacy[]> {
    if (!isMockMode()) {
      return apiClient.get<Pharmacy[]>('/pharmacies', { params });
    }

    await mockDelay(150);
    if (params?.status && params.status !== 'ALL') {
      return mockPharmaciesList.filter((p) => p.status === params.status);
    }
    return [...mockPharmaciesList];
  },

  async getPharmacyById(id: string): Promise<Pharmacy | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Pharmacy>(`/pharmacies/${id}`);
    }

    await mockDelay(100);
    return mockPharmaciesList.find((p) => p.id === id);
  },

  async createPharmacy(data: Partial<Pharmacy>): Promise<Pharmacy> {
    if (!isMockMode()) {
      return apiClient.post<Pharmacy>('/pharmacies', data);
    }

    await mockDelay(200);
    const newPharmacy: Pharmacy = {
      id: `pharm_${Date.now()}`,
      name: data.name || 'New Retail Pharmacy',
      legalName: data.legalName || data.name || 'New Retail Pharmacy Pvt Ltd',
      licenseNumber: data.licenseNumber || `DL-${Date.now().toString().slice(-6)}`,
      gstNumber: data.gstNumber || '27AABCS1429B1Z0',
      phone: data.phone || '+91 98000 00000',
      email: data.email || 'pharmacy@example.com',
      ownerName: data.ownerName || 'Pharmacy Owner',
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      city: data.city || 'Pune',
      state: data.state || 'Maharashtra',
      pincode: data.pincode || '411001',
      status: (data.status as any) || 'ACTIVE',
      branchCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      verifiedAt: new Date().toISOString().split('T')[0],
    };
    mockPharmaciesList = [newPharmacy, ...mockPharmaciesList];
    return newPharmacy;
  },

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<Pharmacy> {
    if (!isMockMode()) {
      return apiClient.put<Pharmacy>(`/pharmacies/${id}`, updates);
    }

    await mockDelay(150);
    const index = mockPharmaciesList.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pharmacy ${id} not found`);
    }
    const updated = { ...mockPharmaciesList[index], ...updates };
    mockPharmaciesList[index] = updated;
    return updated;
  },

  async updatePharmacyStatus(id: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'): Promise<Pharmacy> {
    return this.updatePharmacy(id, { status });
  },

  async getBranches(organizationId?: string): Promise<Branch[]> {
    if (!isMockMode()) {
      return apiClient.get<Branch[]>('/branches', { params: { organizationId } });
    }

    await mockDelay(150);
    if (organizationId && organizationId !== 'ALL') {
      return mockBranchesList.filter((b) => b.organizationId === organizationId);
    }
    return [...mockBranchesList];
  },

  async getBranchById(id: string): Promise<Branch | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Branch>(`/branches/${id}`);
    }

    await mockDelay(100);
    return mockBranchesList.find((b) => b.id === id);
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    if (!isMockMode()) {
      return apiClient.post<Branch>('/branches', data);
    }

    await mockDelay(200);
    const parent = mockPharmaciesList.find((p) => p.id === data.organizationId);
    const newBranch: Branch = {
      id: `br_${Date.now()}`,
      organizationId: data.organizationId || mockPharmaciesList[0]?.id || 'pharm_1',
      organizationName: parent?.name || 'Apothecary Healthcare',
      name: data.name || 'New Dispensary Branch',
      address: data.address || 'Commercial Center',
      city: data.city || 'Pune',
      state: data.state || 'Maharashtra',
      pincode: data.pincode || '411001',
      phone: data.phone || '+91 98000 00000',
      status: data.status || 'ACTIVE',
      operatingHours: data.operatingHours || '08:00 AM - 10:00 PM',
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockBranchesList = [newBranch, ...mockBranchesList];
    if (parent) {
      parent.branchCount += 1;
    }
    return newBranch;
  },

  async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch> {
    if (!isMockMode()) {
      return apiClient.put<Branch>(`/branches/${id}`, updates);
    }

    await mockDelay(150);
    const index = mockBranchesList.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Branch ${id} not found`);
    }
    const updated = { ...mockBranchesList[index], ...updates };
    mockBranchesList[index] = updated;
    return updated;
  },

  async updateBranchStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Branch> {
    if (!isMockMode()) {
      return apiClient.patch<Branch>(`/branches/${id}/status`, { status });
    }

    await mockDelay(150);
    const index = mockBranchesList.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Branch ${id} not found`);
    }
    mockBranchesList[index].status = status;
    return mockBranchesList[index];
  },

  async getPharmacyActivities(pharmacyId: string): Promise<PharmacyActivity[]> {
    if (!isMockMode()) {
      return apiClient.get<PharmacyActivity[]>(`/pharmacies/${pharmacyId}/activities`);
    }

    await mockDelay(100);
    return MOCK_ACTIVITIES_STORE[pharmacyId] || [
      {
        id: `act_${Date.now()}`,
        pharmacyId,
        type: 'STATUS_CHANGE',
        title: 'Status Verified',
        description: 'Pharmacy operational status verified and compliant.',
        actor: 'Platform Superadmin',
        timestamp: 'Just now',
      },
    ];
  },
};
