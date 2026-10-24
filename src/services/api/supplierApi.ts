import { Supplier } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';

let mockSuppliersList: Supplier[] = [
  {
    id: 'sup_1',
    organizationId: 'pharm_1',
    name: 'Cipla Wholesale Distributors Pvt Ltd',
    contactPerson: 'Mr. Anand Sharma',
    phone: '+91 98220 44332',
    email: 'supply@cipla-dist.com',
    address: 'Warehouse Block 4, Hadapsar Industrial Area, Pune',
    gstNumber: '27AAACC1234D1Z2',
    createdAt: '2026-01-10',
  },
  {
    id: 'sup_2',
    organizationId: 'pharm_1',
    name: 'Sun Pharma Distribution Hub',
    contactPerson: 'Ms. Kavita Patil',
    phone: '+91 94220 77889',
    email: 'orders@sunpharma-hub.com',
    address: 'Plot 18, Bhosari MIDC, Pune',
    gstNumber: '27AAACS5678E1Z9',
    createdAt: '2026-01-15',
  },
];

export const supplierApi = {
  async getSuppliers(organizationId?: string): Promise<Supplier[]> {
    if (!isMockMode()) {
      return apiClient.get<Supplier[]>('/suppliers', { params: { organizationId } });
    }

    await mockDelay(150);
    if (organizationId && organizationId !== 'ALL') {
      return mockSuppliersList.filter((s) => s.organizationId === organizationId);
    }
    return [...mockSuppliersList];
  },

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Supplier>(`/suppliers/${id}`);
    }

    await mockDelay(100);
    return mockSuppliersList.find((s) => s.id === id);
  },

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    if (!isMockMode()) {
      return apiClient.post<Supplier>('/suppliers', data);
    }

    await mockDelay(200);
    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockSuppliersList = [newSupplier, ...mockSuppliersList];
    return newSupplier;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    if (!isMockMode()) {
      return apiClient.put<Supplier>(`/suppliers/${id}`, updates);
    }

    await mockDelay(150);
    const index = mockSuppliersList.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Supplier ${id} not found`);
    }
    const updated = { ...mockSuppliersList[index], ...updates };
    mockSuppliersList[index] = updated;
    return updated;
  },
};
