import { Medicine, Category } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from './mockData';

// Persistent in-memory mock store
let mockMedicinesList: Medicine[] = [...MOCK_MEDICINES];
let mockCategoriesList: Category[] = [...MOCK_CATEGORIES];

export interface MedicineQueryParams {
  categoryId?: string;
  query?: string;
  rx?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export const medicineApi = {
  async getAllMedicines(): Promise<Medicine[]> {
    return this.getMedicines();
  },

  async getMedicines(params?: MedicineQueryParams): Promise<Medicine[]> {
    if (!isMockMode()) {
      return apiClient.get<Medicine[]>('/medicines', { params });
    }

    await mockDelay(150);
    let list = [...mockMedicinesList];

    if (params?.categoryId && params.categoryId !== 'ALL') {
      list = list.filter((m) => m.categoryId === params.categoryId);
    }
    if (params?.rx !== undefined) {
      list = list.filter((m) => m.prescriptionRequired === params.rx);
    }
    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.composition.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getMedicineById(id: string): Promise<Medicine | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Medicine>(`/medicines/${id}`);
    }

    await mockDelay(100);
    return mockMedicinesList.find((m) => m.id === id);
  },

  async getCategories(): Promise<Category[]> {
    if (!isMockMode()) {
      return apiClient.get<Category[]>('/medicines/categories');
    }

    await mockDelay(100);
    return [...mockCategoriesList];
  },

  async createMedicine(data: Omit<Medicine, 'id'>): Promise<Medicine> {
    if (!isMockMode()) {
      return apiClient.post<Medicine>('/medicines', data);
    }

    await mockDelay(200);
    const newMedicine: Medicine = {
      ...data,
      id: `med_${Date.now()}`,
    };
    mockMedicinesList = [newMedicine, ...mockMedicinesList];
    return newMedicine;
  },

  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine> {
    if (!isMockMode()) {
      return apiClient.put<Medicine>(`/medicines/${id}`, updates);
    }

    await mockDelay(150);
    const index = mockMedicinesList.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine ${id} not found`);
    }
    const updated = { ...mockMedicinesList[index], ...updates };
    mockMedicinesList[index] = updated;
    return updated;
  },

  async updateMedicineStatus(id: string, status: 'ACTIVE' | 'DISCONTINUED'): Promise<Medicine> {
    return this.updateMedicine(id, { status });
  },

  async searchMedicines(query: string, categoryId?: string): Promise<Medicine[]> {
    return this.getMedicines({ query, categoryId });
  },
};
