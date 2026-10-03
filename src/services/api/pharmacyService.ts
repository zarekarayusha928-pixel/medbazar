import { Pharmacy, Branch } from '@/types';
import { MOCK_PHARMACIES, MOCK_BRANCHES } from './mockData';

export const pharmacyService = {
  async getPharmacies(): Promise<Pharmacy[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PHARMACIES]), 150));
  },

  async getBranches(organizationId?: string): Promise<Branch[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let branches = [...MOCK_BRANCHES];
        if (organizationId) branches = branches.filter(b => b.organizationId === organizationId);
        resolve(branches);
      }, 150);
    });
  }
};
