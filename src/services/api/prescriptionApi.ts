import { Prescription } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';
import { MOCK_PRESCRIPTIONS } from './mockData';

let mockPrescriptionsList: Prescription[] = [...MOCK_PRESCRIPTIONS];

export interface PrescriptionQueryParams {
  organizationId?: string;
  customerId?: string;
  status?: string;
}

export const prescriptionApi = {
  async getPrescriptions(params?: PrescriptionQueryParams): Promise<Prescription[]> {
    if (!isMockMode()) {
      return apiClient.get<Prescription[]>('/prescriptions', { params: params as any });
    }

    await mockDelay(150);
    let list = [...mockPrescriptionsList];

    if (params?.organizationId && params.organizationId !== 'ALL') {
      list = list.filter((p) => p.organizationId === params.organizationId);
    }
    if (params?.customerId) {
      list = list.filter((p) => p.customerId === params.customerId);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((p) => p.status === params.status);
    }

    return list;
  },

  async getPrescriptionById(id: string): Promise<Prescription | undefined> {
    if (!isMockMode()) {
      return apiClient.get<Prescription>(`/prescriptions/${id}`);
    }

    await mockDelay(100);
    return mockPrescriptionsList.find((p) => p.id === id);
  },

  async uploadPrescription(data: Partial<Prescription>): Promise<Prescription> {
    if (!isMockMode()) {
      return apiClient.post<Prescription>('/prescriptions', data);
    }

    await mockDelay(250);
    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      organizationId: data.organizationId || 'pharm_1',
      customerId: data.customerId || 'usr_cust_1',
      customerName: data.customerName || 'Rajesh Sharma',
      customerPhone: data.customerPhone || '+91 98765 43210',
      doctorName: data.doctorName || 'Dr. K. V. Rao, MD',
      fileUrl: data.fileUrl || '/mock-rx.pdf',
      fileName: data.fileName || 'prescription_upload.pdf',
      fileType: data.fileType || 'PDF',
      status: 'PENDING_REVIEW',
      notes: data.notes || '',
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    mockPrescriptionsList = [newRx, ...mockPrescriptionsList];
    return newRx;
  },

  async updatePrescriptionStatus(
    prescriptionId: string,
    status: Prescription['status'],
    notes?: string,
    reviewedBy?: string
  ): Promise<Prescription> {
    if (!isMockMode()) {
      return apiClient.patch<Prescription>(`/prescriptions/${prescriptionId}/status`, {
        status,
        notes,
        reviewedBy,
      });
    }

    await mockDelay(200);
    const item = mockPrescriptionsList.find((p) => p.id === prescriptionId);
    if (!item) {
      throw new Error(`Prescription ${prescriptionId} not found`);
    }

    item.status = status;
    if (notes) item.notes = notes;
    item.reviewedBy = reviewedBy || 'Amit Deshmukh (Pharmacist)';
    item.reviewedAt = new Date().toISOString();
    return { ...item };
  },

  async getCustomerPrescriptions(customerId: string): Promise<Prescription[]> {
    return this.getPrescriptions({ customerId });
  },
};
