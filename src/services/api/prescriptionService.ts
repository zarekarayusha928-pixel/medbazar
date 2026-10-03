import { Prescription } from '@/types';
import { MOCK_PRESCRIPTIONS } from './mockData';

export const prescriptionService = {
  async getPrescriptions(organizationId?: string): Promise<Prescription[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...MOCK_PRESCRIPTIONS];
        if (organizationId) list = list.filter(p => p.organizationId === organizationId);
        resolve(list);
      }, 150);
    });
  },

  async updatePrescriptionStatus(
    prescriptionId: string, 
    status: Prescription['status'], 
    notes?: string, 
    reviewedBy?: string
  ): Promise<Prescription> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = MOCK_PRESCRIPTIONS.find(p => p.id === prescriptionId);
        if (!item) return reject(new Error('Prescription not found'));
        item.status = status;
        if (notes) item.notes = notes;
        item.reviewedBy = reviewedBy || 'Amit Deshmukh (Pharmacist)';
        item.reviewedAt = new Date().toISOString();
        resolve({ ...item });
      }, 200);
    });
  }
};
