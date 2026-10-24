import { UserRole, UserStatus } from '@prisma/client';
import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword } from '../utils/password.js';
import { mockUsers, mockStaff, MockUserRecord } from './mockUserStore.js';

export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  pharmacyId?: string;
  branchId?: string;
}

export class UserService {
  async getUsers(filter: UserFilter = {}) {
    if (await isDbReachable()) {
      try {
        const whereClause: any = {};

        if (filter.role) {
          whereClause.role = filter.role;
        }
        if (filter.status) {
          whereClause.status = filter.status;
        }
        if (filter.pharmacyId) {
          whereClause.organizationMembers = {
            some: { organizationId: filter.pharmacyId },
          };
        }

        const users = await prisma.user.findMany({
          where: whereClause,
          include: {
            organizationMembers: {
              include: {
                organization: true,
                branch: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (users.length > 0) {
          return users.map((u) => {
            const membership = u.organizationMembers[0];
            return {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || '',
              role: u.role,
              status: u.status,
              avatarUrl: u.avatarUrl,
              pharmacyId: membership?.organizationId,
              pharmacyName: membership?.organization?.name,
              branchId: membership?.branchId,
              branchName: membership?.branch?.name,
              createdAt: u.createdAt.toISOString().split('T')[0],
            };
          });
        }
      } catch (_err) {
        // Fallback
      }
    }

    // In-memory fallback
    let list = [...mockUsers];
    if (filter.role) {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter.status) {
      list = list.filter((u) => u.status === filter.status);
    }
    if (filter.pharmacyId) {
      list = list.filter((u) => u.organizationId === filter.pharmacyId);
    }
    if (filter.branchId) {
      list = list.filter((u) => u.branchId === filter.branchId);
    }

    return list.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatarUrl,
      pharmacyId: u.organizationId,
      pharmacyName: u.organizationName,
      branchId: u.branchId,
      branchName: u.branchName,
      createdAt: u.createdAt.split('T')[0],
    }));
  }

  async getUserById(id: string) {
    if (await isDbReachable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            organizationMembers: {
              include: {
                organization: true,
                branch: true,
              },
            },
          },
        });

        if (user) {
          const membership = user.organizationMembers[0];
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            pharmacyId: membership?.organizationId,
            pharmacyName: membership?.organization?.name,
            branchId: membership?.branchId,
            branchName: membership?.branch?.name,
            createdAt: user.createdAt.toISOString().split('T')[0],
          };
        }
      } catch (_err) {
        // Fallback
      }
    }

    const mock = mockUsers.find((u) => u.id === id);
    if (!mock) {
      throw ApiError.notFound('User not found.');
    }
    return {
      id: mock.id,
      name: mock.name,
      email: mock.email,
      phone: mock.phone,
      role: mock.role,
      status: mock.status,
      avatarUrl: mock.avatarUrl,
      pharmacyId: mock.organizationId,
      pharmacyName: mock.organizationName,
      branchId: mock.branchId,
      branchName: mock.branchName,
      createdAt: mock.createdAt.split('T')[0],
    };
  }

  async createUser(data: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    pharmacyId?: string;
    branchId?: string;
    status?: UserStatus;
  }) {
    if (await isDbReachable()) {
      try {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
          throw ApiError.conflict('User with this email already exists.');
        }

        const passwordHash = await hashPassword('DemoPassword@2026');

        const user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash,
            role: data.role,
            status: data.status || 'ACTIVE',
            ...(data.pharmacyId
              ? {
                  organizationMembers: {
                    create: {
                      organizationId: data.pharmacyId,
                      branchId: data.branchId,
                      role: data.role,
                      status: 'ACTIVE',
                    },
                  },
                }
              : {}),
          },
          include: {
            organizationMembers: {
              include: {
                organization: true,
                branch: true,
              },
            },
          },
        });

        const membership = user.organizationMembers[0];
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          status: user.status,
          pharmacyId: membership?.organizationId,
          pharmacyName: membership?.organization?.name,
          branchId: membership?.branchId,
          branchName: membership?.branch?.name,
          createdAt: user.createdAt.toISOString().split('T')[0],
        };
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // In-memory fallback
    const existing = mockUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw ApiError.conflict('User with this email already exists.');
    }

    const newUser: MockUserRecord = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98000 00000',
      passwordHash: await hashPassword('DemoPassword@2026'),
      role: data.role,
      status: data.status || 'ACTIVE',
      organizationId: data.pharmacyId,
      branchId: data.branchId,
      createdAt: new Date().toISOString(),
    };
    mockUsers.unshift(newUser);

    if (data.role !== 'CUSTOMER' && data.role !== 'PLATFORM_ADMIN') {
      mockStaff.unshift({
        id: `stf_${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        organizationId: data.pharmacyId || 'pharm_1',
        organizationName: 'Apothecary Healthcare',
        branchId: data.branchId,
        joinedAt: new Date().toISOString().split('T')[0],
      });
    }

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      pharmacyId: newUser.organizationId,
      branchId: newUser.branchId,
      createdAt: newUser.createdAt.split('T')[0],
    };
  }

  async updateUserRole(id: string, role: UserRole) {
    if (await isDbReachable()) {
      try {
        const updated = await prisma.user.update({
          where: { id },
          data: { role },
        });
        return this.getUserById(updated.id);
      } catch (_err) {
        // Fallback
      }
    }

    const mock = mockUsers.find((u) => u.id === id);
    if (!mock) {
      throw ApiError.notFound('User not found.');
    }
    mock.role = role;
    const staffRec = mockStaff.find((s) => s.userId === id);
    if (staffRec) {
      staffRec.role = role;
    }
    return this.getUserById(id);
  }

  async updateUserStatus(id: string, status: UserStatus) {
    if (await isDbReachable()) {
      try {
        const updated = await prisma.user.update({
          where: { id },
          data: { status },
        });
        return this.getUserById(updated.id);
      } catch (_err) {
        // Fallback
      }
    }

    const mock = mockUsers.find((u) => u.id === id);
    if (!mock) {
      throw ApiError.notFound('User not found.');
    }
    mock.status = status;
    const staffRec = mockStaff.find((s) => s.userId === id);
    if (staffRec) {
      staffRec.status = status;
    }
    return this.getUserById(id);
  }

  async getStaffMembers(organizationId?: string, branchId?: string) {
    if (await isDbReachable()) {
      try {
        const members = await prisma.organizationMember.findMany({
          where: {
            ...(organizationId ? { organizationId } : {}),
            ...(branchId ? { branchId } : {}),
          },
          include: {
            user: true,
            organization: true,
            branch: true,
          },
        });

        if (members.length > 0) {
          return members.map((m) => ({
            id: m.id,
            userId: m.userId,
            name: m.user.name,
            email: m.user.email,
            phone: m.user.phone || '',
            role: m.role,
            status: m.status,
            organizationId: m.organizationId,
            organizationName: m.organization.name,
            branchId: m.branchId,
            branchName: m.branch?.name,
            joinedAt: m.joinedAt.toISOString().split('T')[0],
          }));
        }
      } catch (_err) {
        // Fallback
      }
    }

    // In-memory fallback
    let list = [...mockStaff];
    if (organizationId && organizationId !== 'ALL') {
      list = list.filter((s) => s.organizationId === organizationId);
    }
    if (branchId && branchId !== 'ALL') {
      list = list.filter((s) => s.branchId === branchId);
    }
    return list;
  }
}

export const userService = new UserService();
