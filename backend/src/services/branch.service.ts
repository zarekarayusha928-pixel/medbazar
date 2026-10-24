import { BranchStatus } from '@prisma/client';
import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { AuthenticatedUser } from '../types/index.js';

let mockBranches: any[] = [
  {
    id: 'br_1',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare Chemist',
    name: 'Kothrud Main Branch',
    address: 'Shop 4, Mayur Colony, Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    phone: '+91 98221 00111',
    status: 'ACTIVE',
    operatingHours: '08:00 AM - 11:00 PM',
    createdAt: '2026-01-01',
  },
  {
    id: 'br_2',
    organizationId: 'pharm_1',
    organizationName: 'Apothecary Healthcare Chemist',
    name: 'Baner Express Branch',
    address: 'Shop 12, High Street, Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    phone: '+91 98221 00222',
    status: 'ACTIVE',
    operatingHours: '09:00 AM - 10:00 PM',
    createdAt: '2026-01-15',
  },
];

export class BranchService {
  async getBranches(organizationId?: string) {
    if (await isDbReachable()) {
      try {
        const branches = await prisma.branch.findMany({
          where: organizationId ? { organizationId } : undefined,
          include: {
            organization: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (branches.length > 0) {
          return branches.map((b) => ({
            id: b.id,
            organizationId: b.organizationId,
            organizationName: b.organization.name,
            name: b.name,
            address: b.address,
            city: b.city,
            state: b.state,
            pincode: b.pincode,
            phone: b.phone,
            status: b.status,
            operatingHours: b.operatingHours || undefined,
            createdAt: b.createdAt.toISOString().split('T')[0],
          }));
        }
      } catch (_err) {
        // Fallback
      }
    }

    if (organizationId) {
      return mockBranches.filter((b) => b.organizationId === organizationId);
    }
    return mockBranches;
  }

  async getBranchById(id: string) {
    if (await isDbReachable()) {
      try {
        const b = await prisma.branch.findUnique({
          where: { id },
          include: {
            organization: {
              select: { name: true },
            },
          },
        });

        if (b) {
          return {
            id: b.id,
            organizationId: b.organizationId,
            organizationName: b.organization.name,
            name: b.name,
            address: b.address,
            city: b.city,
            state: b.state,
            pincode: b.pincode,
            phone: b.phone,
            status: b.status,
            operatingHours: b.operatingHours || undefined,
            createdAt: b.createdAt.toISOString().split('T')[0],
          };
        }
      } catch (_err) {
        // Fallback
      }
    }

    const b = mockBranches.find((branch) => branch.id === id);
    if (!b) {
      throw ApiError.notFound('Branch not found.');
    }
    return b;
  }

  async createBranch(data: {
    organizationId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    status?: BranchStatus;
    operatingHours?: string;
  }) {
    if (await isDbReachable()) {
      try {
        const org = await prisma.organization.findUnique({
          where: { id: data.organizationId },
        });
        if (!org) {
          throw ApiError.notFound('Parent pharmacy organization does not exist.');
        }

        const branch = await prisma.branch.create({
          data: {
            organizationId: data.organizationId,
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            phone: data.phone,
            status: data.status || 'ACTIVE',
            operatingHours: data.operatingHours,
          },
          include: {
            organization: {
              select: { name: true },
            },
          },
        });

        return {
          id: branch.id,
          organizationId: branch.organizationId,
          organizationName: branch.organization.name,
          name: branch.name,
          address: branch.address,
          city: branch.city,
          state: branch.state,
          pincode: branch.pincode,
          phone: branch.phone,
          status: branch.status,
          operatingHours: branch.operatingHours || undefined,
          createdAt: branch.createdAt.toISOString().split('T')[0],
        };
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    const newBranch = {
      id: `br_${Date.now()}`,
      organizationId: data.organizationId,
      organizationName: 'Apothecary Healthcare Chemist',
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      status: data.status || 'ACTIVE',
      operatingHours: data.operatingHours,
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockBranches.push(newBranch);
    return newBranch;
  }

  async updateBranch(
    id: string,
    updates: Partial<{
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      status: BranchStatus;
      operatingHours?: string;
    }>,
    user?: AuthenticatedUser
  ) {
    // 1. Verify existence and tenant isolation
    const current = await this.getBranchById(id);

    if (user && user.role !== 'PLATFORM_ADMIN') {
      if (current.organizationId !== user.organizationId) {
        throw ApiError.forbidden(
          'Tenant Access Violation: You do not have permission to update branches for another pharmacy organization.'
        );
      }
      if (user.role === 'BRANCH_MANAGER' && user.branchId && user.branchId !== id) {
        throw ApiError.forbidden(
          'Branch Access Violation: Branch managers can only update their assigned branch.'
        );
      }
    }

    if (await isDbReachable()) {
      try {
        const updated = await prisma.branch.update({
          where: { id },
          data: updates,
          include: {
            organization: {
              select: { name: true },
            },
          },
        });

        return {
          id: updated.id,
          organizationId: updated.organizationId,
          organizationName: updated.organization.name,
          name: updated.name,
          address: updated.address,
          city: updated.city,
          state: updated.state,
          pincode: updated.pincode,
          phone: updated.phone,
          status: updated.status,
          operatingHours: updated.operatingHours || undefined,
          createdAt: updated.createdAt.toISOString().split('T')[0],
        };
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    const index = mockBranches.findIndex((b) => b.id === id);
    if (index === -1) {
      throw ApiError.notFound('Branch not found.');
    }
    mockBranches[index] = {
      ...mockBranches[index],
      ...updates,
    };
    return mockBranches[index];
  }

  async updateBranchStatus(id: string, status: BranchStatus, user?: AuthenticatedUser) {
    return this.updateBranch(id, { status }, user);
  }
}

export const branchService = new BranchService();
