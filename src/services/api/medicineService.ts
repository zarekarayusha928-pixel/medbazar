import { Medicine, Category } from '@/types';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from './mockData';

export const medicineService = {
  async getAllMedicines(): Promise<Medicine[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_MEDICINES]), 150));
  },

  async getMedicineById(id: string): Promise<Medicine | undefined> {
    return new Promise((resolve) => 
      setTimeout(() => resolve(MOCK_MEDICINES.find(m => m.id === id)), 100)
    );
  },

  async getCategories(): Promise<Category[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_CATEGORIES]), 100));
  },

  async searchMedicines(query: string, categoryId?: string): Promise<Medicine[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...MOCK_MEDICINES];
        if (query) {
          const q = query.toLowerCase();
          results = results.filter(
            m => m.name.toLowerCase().includes(q) ||
                 m.genericName.toLowerCase().includes(q) ||
                 m.brand.toLowerCase().includes(q)
          );
        }
        if (categoryId) {
          results = results.filter(m => m.categoryId === categoryId);
        }
        resolve(results);
      }, 150);
    });
  }
};
