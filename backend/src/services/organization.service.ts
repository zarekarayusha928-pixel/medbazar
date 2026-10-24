import { OrganizationStatus } from '@prisma/client';
import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

let mockOrganizations: any[] = [
  {
    id: 'pharm_1',
    name: 'Apothecary Healthcare Chemist',
    legalName: 'Apothecary Healthcare Chemist Private Limited',
    licenseNumber: 'MH-PUN-2024-00129',
    gstNumber: '27AABCA1234F1Z5',
    phone: '+91 98220 12345',
    email: 'info@apothecary.com',
    ownerName: 'Dr. Ramesh Kulkarni',
    ownerEmail: 'owner@apothecary.com',
    ownerPhone: '+91 98220 54321',
    address: '124 Industrial Medical Complex, Swargate',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411002',
    status: 'ACTIVE',
    logoUrl: '/logos/apothecary.png',
    branchCount: 2,
    createdAt: '2026-01-01',
  },
  {
    id: 'pharm_2',
    name: 'Apollo Lifeline Pharmacy',
    legalName: 'Apollo Lifeline Retail Limited',
    licenseNumber: 'MH-MUM-2024-00981',
    gstNumber: '27AACCA9988G1Z2',
    phone: '+91 98111 22334',
    email: 'contact@apollolifeline.com',
    ownerName: 'Sunita Mehra',
    ownerEmail: 'owner@apollolifeline.com',
    ownerPhone: '+91 98111 55667',
    address: '45 Marine Lines Avenue',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400020',
    status: 'ACTIVE',
    logoUrl: '/logos/apollo.png',
    branchCount: 3,
    createdAt: '2026-01-10',
  },
];

export class OrganizationService {
  async getOrganizations(status?: OrganizationStatus) {
    if (await isDbReachable()) {
      try {
        const orgs = await prisma.organization.findMany({
          where: status ? { status } : undefined,
          include: {
            _count: {
              select: { branches: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (orgs.length > 0) {
          return orgs.map((org) => ({
            id: org.id,
            name: org.name,
            legalName: org.legalName,
            licenseNumber: org.licenseNumber,
            gstNumber: org.gstNumber || undefined,
            phone: org.phone,
            email: org.email,
            ownerName: org.ownerName || undefined,
            ownerEmail: org.ownerEmail || undefined,
            ownerPhone: org.ownerPhone || undefined,
            address: org.address || undefined,
            city: org.city || undefined,
            state: org.state || undefined,
            pincode: org.pincode || undefined,
            status: org.status,
            logoUrl: org.logoUrl || undefined,
            branchCount: org._count.branches,
            createdAt: org.createdAt.toISOString().split('T')[0],
          }));
        }
      } catch (_err) {
        // Fallback
      }
    }

    let list = [...mockOrganizations];
    if (status) {
      list = list.filter((o) => o.status === status);
    }
    return list;
  }

  async getOrganizationById(id: string) {
    if (await isDbReachable()) {
      try {
        const org = await prisma.organization.findUnique({
          where: { id },
          include: {
            branches: true,
            _count: {
              select: { branches: true },
            },
          },
        });

        if (org) {
          return {
            id: org.id,
            name: org.name,
            legalName: org.legalName,
            licenseNumber: org.licenseNumber,
            gstNumber: org.gstNumber || undefined,
            phone: org.phone,
            email: org.email,
            ownerName: org.ownerName || undefined,
            ownerEmail: org.ownerEmail || undefined,
            ownerPhone: org.ownerPhone || undefined,
            address: org.address || undefined,
            city: org.city || undefined,
            state: org.state || undefined,
            pincode: org.pincode || undefined,
            status: org.status,
            logoUrl: org.logoUrl || undefined,
            branchCount: org._count.branches,
            branches: org.branches,
            createdAt: org.createdAt.toISOString().split('T')[0],
          };
        }
      } catch (_err) {
        // Fallback
      }
    }

    const org = mockOrganizations.find((o) => o.id === id);
    if (!org) {
      throw ApiError.notFound('Pharmacy organization not found.');
    }

    return { ...org, branches: [] };
  }

  async createOrganization(data: any) {
    if (await isDbReachable()) {
      try {
        const existing = await prisma.organization.findUnique({
          where: { licenseNumber: data.licenseNumber },
        });
        if (existing) {
          throw ApiError.conflict('An organization with this drug license number already exists.');
        }

        const org = await prisma.organization.create({
          data: {
            name: data.name,
            legalName: data.legalName || data.name,
            licenseNumber: data.licenseNumber,
            gstNumber: data.gstNumber,
            phone: data.phone,
            email: data.email,
            ownerName: data.ownerName,
            ownerEmail: data.ownerEmail,
            ownerPhone: data.ownerPhone,
            address: data.address,
            city: data.city || 'Pune',
            state: data.state || 'Maharashtra',
            pincode: data.pincode || '411001',
            status: data.status || 'ACTIVE',
          },
        });

        // Automatically create primary branch
        const branch = await prisma.branch.create({
          data: {
            organizationId: org.id,
            name: `${org.name} - Main Branch`,
            address: org.address || 'Central Road',
            city: org.city || 'Pune',
            state: org.state || 'Maharashtra',
            pincode: org.pincode || '411001',
            phone: org.phone,
            status: 'ACTIVE',
          },
        });

        return {
          ...org,
          branchCount: 1,
          primaryBranchId: branch.id,
          createdAt: org.createdAt.toISOString().split('T')[0],
        };
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    const newOrg = {
      id: `pharm_${Date.now()}`,
      name: data.name,
      legalName: data.legalName || data.name,
      licenseNumber: data.licenseNumber,
      gstNumber: data.gstNumber,
      phone: data.phone,
      email: data.email,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      address: data.address,
      city: data.city || 'Pune',
      state: data.state || 'Maharashtra',
      pincode: data.pincode || '411001',
      status: data.status || 'ACTIVE',
      branchCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockOrganizations.unshift(newOrg);
    return newOrg;
  }

  async updateOrganization(id: string, data: any) {
    if (await isDbReachable()) {
      try {
        const org = await prisma.organization.update({
          where: { id },
          data,
        });
        return this.getOrganizationById(org.id);
      } catch (_err) {
        // Fallback
      }
    }

    const org = mockOrganizations.find((o) => o.id === id);
    if (!org) throw ApiError.notFound('Pharmacy organization not found.');
    Object.assign(org, data);
    return org;
  }

  async getActivities(organizationId: string) {
    if (await isDbReachable()) {
      try {
        const activities = await prisma.pharmacyActivity.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        if (activities.length > 0) {
          return activities.map((act) => ({
            id: act.id,
            pharmacyId: act.organizationId,
            type: act.type,
            title: act.title,
            description: act.description,
            actor: act.actor,
            timestamp: act.createdAt.toISOString(),
          }));
        }
      } catch (_err) {
        // Fallback
      }
    }

    return [
      {
        id: 'act_1',
        pharmacyId: organizationId,
        type: 'INVENTORY_UPDATE',
        title: 'Stock Updated',
        description: 'New inventory batches ingested.',
        actor: 'Pharmacist',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

export const organizationService = new OrganizationService();
