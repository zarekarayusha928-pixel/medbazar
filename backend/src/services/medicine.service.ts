import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { DosageForm, MedicineStatus } from '@prisma/client';

export interface MedicineFilters {
  query?: string;
  categoryId?: string;
  rx?: boolean;
  dosageForm?: DosageForm;
  brand?: string;
  status?: MedicineStatus;
}

// In-memory fallback dataset for offline/dev testing
let mockCategories: any[] = [
  { id: 'cat_pain', name: 'Pain Relief', description: 'Painkillers, anti-inflammatory and fever reducers' },
  { id: 'cat_diabetes', name: 'Diabetes Care', description: 'Insulin, blood sugar control and test strips' },
  { id: 'cat_vitamins', name: 'Vitamins', description: 'Daily wellness, multivitamins and mineral supplements' },
  { id: 'cat_personal', name: 'Personal Care', description: 'Skin health, hygiene, antiseptics and wellness' },
  { id: 'cat_antibiotics', name: 'Antibiotics', description: 'Bacterial infection treatment & Schedule H medications' },
];

let mockMedicines: any[] = [
  {
    id: 'med_1',
    name: 'Dolo 650 Tablet',
    genericName: 'Paracetamol',
    brand: 'Micro Labs',
    composition: 'Paracetamol 650mg',
    dosageForm: 'TABLET',
    strength: '650mg',
    categoryId: 'cat_pain',
    prescriptionRequired: false,
    barcode: '8901148205018',
    manufacturer: 'Micro Labs Ltd',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med_2',
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    brand: 'GSK',
    composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosageForm: 'TABLET',
    strength: '625mg',
    categoryId: 'cat_antibiotics',
    prescriptionRequired: true,
    barcode: '8901148205025',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med_3',
    name: 'Metsmall 500 SR',
    genericName: 'Metformin Hydrochloride',
    brand: 'Torrent Pharma',
    composition: 'Metformin Hydrochloride 500mg Sustained Release',
    dosageForm: 'TABLET',
    strength: '500mg',
    categoryId: 'cat_diabetes',
    prescriptionRequired: true,
    barcode: '8901148205032',
    manufacturer: 'Torrent Pharmaceuticals Ltd',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class MedicineService {
  async getCategories() {
    if (await isDbReachable()) {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
        });
        if (categories.length > 0) return categories;
      } catch (_err) {
        // DB offline fallback
      }
    }
    return mockCategories;
  }

  async createCategory(data: { name: string; description?: string }) {
    if (await isDbReachable()) {
      try {
        return await prisma.category.create({
          data: {
            name: data.name,
            description: data.description,
          },
        });
      } catch (_err) {
        // Fallback
      }
    }

    const existing = mockCategories.find((c) => c.name.toLowerCase() === data.name.toLowerCase());
    if (existing) {
      throw ApiError.conflict(`Category '${data.name}' already exists.`);
    }
    const newCat = {
      id: `cat_${Date.now()}`,
      name: data.name,
      description: data.description,
    };
    mockCategories.push(newCat);
    return newCat;
  }

  async getMedicines(filters: MedicineFilters = {}) {
    if (await isDbReachable()) {
      try {
        const where: any = {};

        if (filters.categoryId && filters.categoryId !== 'ALL') {
          where.categoryId = filters.categoryId;
        }

        if (filters.rx !== undefined) {
          where.prescriptionRequired = filters.rx;
        }

        if (filters.dosageForm) {
          where.dosageForm = filters.dosageForm;
        }

        if (filters.brand) {
          where.brand = { contains: filters.brand, mode: 'insensitive' };
        }

        if (filters.status) {
          where.status = filters.status;
        }

        if (filters.query && filters.query.trim()) {
          const q = filters.query.trim();
          where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { genericName: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { composition: { contains: q, mode: 'insensitive' } },
          ];
        }

        const medicines = await prisma.medicine.findMany({
          where,
          include: { category: true },
          orderBy: { name: 'asc' },
        });

        if (medicines.length > 0) return medicines;
      } catch (_err) {
        // DB offline fallback
      }
    }

    // Filter in-memory mock
    let list = [...mockMedicines];
    if (filters.categoryId && filters.categoryId !== 'ALL') {
      list = list.filter((m) => m.categoryId === filters.categoryId);
    }
    if (filters.rx !== undefined) {
      list = list.filter((m) => m.prescriptionRequired === filters.rx);
    }
    if (filters.dosageForm) {
      list = list.filter((m) => m.dosageForm === filters.dosageForm);
    }
    if (filters.status) {
      list = list.filter((m) => m.status === filters.status);
    }
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.composition.toLowerCase().includes(q)
      );
    }

    return list.map((m) => ({
      ...m,
      category: mockCategories.find((c) => c.id === m.categoryId),
    }));
  }

  async getMedicineById(id: string) {
    if (await isDbReachable()) {
      try {
        const medicine = await prisma.medicine.findUnique({
          where: { id },
          include: { category: true },
        });
        if (medicine) return medicine;
      } catch (_err) {
        // DB offline fallback
      }
    }

    const item = mockMedicines.find((m) => m.id === id);
    if (!item) {
      throw ApiError.notFound(`Medicine with ID '${id}' not found.`);
    }

    return {
      ...item,
      category: mockCategories.find((c) => c.id === item.categoryId),
    };
  }

  async createMedicine(data: any) {
    if (await isDbReachable()) {
      try {
        return await prisma.medicine.create({
          data,
          include: { category: true },
        });
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
        if (err.code === 'P2002') {
          throw ApiError.conflict('A medicine with this barcode already exists.');
        }
      }
    }

    // If DB offline, store in mock
    const newMed = {
      id: `med_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockMedicines.unshift(newMed);
    return {
      ...newMed,
      category: mockCategories.find((c) => c.id === newMed.categoryId),
    };
  }

  async updateMedicine(id: string, updates: any) {
    if (await isDbReachable()) {
      try {
        return await prisma.medicine.update({
          where: { id },
          data: updates,
          include: { category: true },
        });
      } catch (err: any) {
        if (err.code === 'P2025') {
          throw ApiError.notFound(`Medicine '${id}' not found.`);
        }
      }
    }
      // Fallback
      const index = mockMedicines.findIndex((m) => m.id === id);
      if (index === -1) {
        throw ApiError.notFound(`Medicine '${id}' not found.`);
      }
      mockMedicines[index] = {
        ...mockMedicines[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...mockMedicines[index],
        category: mockCategories.find((c) => c.id === mockMedicines[index].categoryId),
      };
  }
}

export const medicineService = new MedicineService();
