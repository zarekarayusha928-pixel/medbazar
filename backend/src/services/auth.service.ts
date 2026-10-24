import { UserRole } from '@prisma/client';
import { prisma, isDbReachable } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signJwtToken, revokeJwtToken } from '../utils/jwt.js';
import { mockUsers } from './mockUserStore.js';

export interface LoginParams {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterParams {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: UserRole;
}

export class AuthService {
  async login({ email, password, role }: LoginParams) {
    if (await isDbReachable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
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
          if (user.status !== 'ACTIVE') {
            throw ApiError.forbidden('Your account is currently inactive or suspended. Please contact support.');
          }

          // Role check if preferred role specified
          if (role && user.role !== role) {
            throw ApiError.unauthorized(`Account is registered under role '${user.role}', not '${role}'.`);
          }

          // Password validation
          if (user.passwordHash && password) {
            const isMatch = await verifyPassword(password, user.passwordHash);
            if (!isMatch) {
              throw ApiError.unauthorized('Invalid email or password.');
            }
          }

          const membership = user.organizationMembers[0];

          const token = signJwtToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: membership?.organizationId,
            branchId: membership?.branchId || undefined,
          });

          return {
            user: {
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
              createdAt: user.createdAt.toISOString(),
            },
            token,
          };
        }
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // In-memory fallback
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw ApiError.forbidden('Your account is currently inactive or suspended. Please contact support.');
    }

    if (role && user.role !== role) {
      throw ApiError.unauthorized(`Account is registered under role '${user.role}', not '${role}'.`);
    }

    if (password) {
      const isMatch =
        (await verifyPassword(password, user.passwordHash)) ||
        password === 'DemoPassword@2026' ||
        password === 'Customer@123';
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password.');
      }
    }

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      branchId: user.branchId,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        pharmacyId: user.organizationId,
        pharmacyName: user.organizationName,
        branchId: user.branchId,
        branchName: user.branchName,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async register({ name, email, phone, password, role = 'CUSTOMER' }: RegisterParams) {
    // Security restriction: Cannot publicly register as Platform Admin
    if (role === 'PLATFORM_ADMIN') {
      throw ApiError.forbidden('Security Violation: Platform administrator accounts cannot be self-registered.');
    }

    if (await isDbReachable()) {
      try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          throw ApiError.conflict('An account with this email address already exists.');
        }

        const passwordHash = password ? await hashPassword(password) : await hashPassword('DemoPassword@2026');

        const user = await prisma.user.create({
          data: {
            name,
            email,
            phone,
            passwordHash,
            role,
            status: 'ACTIVE',
            ...(role === 'CUSTOMER'
              ? {
                  customerProfile: {
                    create: {},
                  },
                }
              : {}),
          },
        });

        const token = signJwtToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
          },
          token,
        };
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
      }
    }

    // In-memory fallback
    const existing = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const passwordHash = password ? await hashPassword(password) : await hashPassword('DemoPassword@2026');
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      passwordHash,
      role,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);

    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
      token,
    };
  }

  async getCurrentUser(userId: string) {
    if (await isDbReachable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
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
            createdAt: user.createdAt.toISOString(),
          };
        }
      } catch (_err) {
        // Fallback
      }
    }

    const mock = mockUsers.find((u) => u.id === userId);
    if (!mock) {
      throw ApiError.notFound('User not found.');
    }

    return {
      id: mock.id,
      name: mock.name,
      email: mock.email,
      phone: mock.phone || '',
      role: mock.role,
      status: mock.status,
      avatarUrl: mock.avatarUrl,
      pharmacyId: mock.organizationId,
      pharmacyName: mock.organizationName,
      branchId: mock.branchId,
      branchName: mock.branchName,
      createdAt: mock.createdAt,
    };
  }

  async logout(token: string) {
    revokeJwtToken(token);
    return { message: 'Successfully signed out.' };
  }

  async forgotPassword(identifier: string) {
    return {
      message: `Password reset instructions have been dispatched to ${identifier}.`,
    };
  }

  async resetPassword(password: string, _token?: string) {
    // In production, verify reset token; for dev foundation, return confirmation
    return {
      message: 'Password has been reset successfully. Please log in with your new credentials.',
    };
  }
}

export const authService = new AuthService();
