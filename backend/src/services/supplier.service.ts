import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

let mockSuppliers: any[] = [
  {
    id: 'sup_1',
    organizationId: 'pharm_1',
    name: 'Cipla Wholesale Distributors Pvt Ltd',
    contactPerson: 'Mr. Anand Sharma',
    phone: '+91 98220 44332',
    email: 'supply@cipla-dist.com',
    address: 'Warehouse Block 4, Hadapsar Industrial Area, Pune',
    gstNumber: '27AAACC1234D1Z2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class SupplierService {
  async getSuppliers(organizationId?: string) {
    if (await isDbReachable()) {
      try {
        const where: any = {};
        if (organizationId) {
          where.organizationId = organizationId;
        }
        const suppliers = await prisma.supplier.findMany({
          where,
          orderBy: { name: 'asc' },
        });
        if (suppliers.length > 0) return suppliers;
      } catch (_err) {
        // Fallback
      }
    }

    if (organizationId) {
      return mockSuppliers.filter((s) => s.organizationId === organizationId);
    }
    return mockSuppliers;
  }

  async getSupplierById(id: string) {
    if (await isDbReachable()) {
      try {
        const supplier = await prisma.supplier.findUnique({
          where: { id },
        });
        if (supplier) return supplier;
      } catch (_err) {
        // Fallback
      }
    }

    const item = mockSuppliers.find((s) => s.id === id);
    if (!item) {
      throw ApiError.notFound(`Supplier with ID '${id}' not found.`);
    }
    return item;
  }

  async createSupplier(data: {
    organizationId: string;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    gstNumber?: string;
  }) {
    if (await isDbReachable()) {
      try {
        return await prisma.supplier.create({
          data,
        });
      } catch (_err) {
        // Fallback
      }
    }

    const newSup = {
      id: `sup_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSuppliers.push(newSup);
    return newSup;
  }

  async updateSupplier(id: string, updates: any) {
    if (await isDbReachable()) {
      try {
        return await prisma.supplier.update({
          where: { id },
          data: updates,
        });
      } catch (_err) {
        // Fallback
      }
    }

    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index === -1) {
      throw ApiError.notFound(`Supplier with ID '${id}' not found.`);
    }
    mockSuppliers[index] = {
      ...mockSuppliers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockSuppliers[index];
  }
}

export const supplierService = new SupplierService();
