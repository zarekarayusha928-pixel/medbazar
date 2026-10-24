import { UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  organizationName?: string;
  branchId?: string;
  branchName?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  branchId?: string;
}
