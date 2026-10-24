import { User, UserRole } from '@/types';
import { apiClient, isMockMode, mockDelay, setAuthToken, clearAuthToken } from './client';
import { DEMO_USERS } from '@/context/AuthContext';

export interface LoginPayload {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (!isMockMode()) {
      const res = await apiClient.post<AuthResponse>('/auth/login', payload);
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    }

    // Mock Mode
    await mockDelay(200);
    const targetRole = payload.role || 'CUSTOMER';
    const mockUser = DEMO_USERS[targetRole] || {
      id: `usr_${Date.now()}`,
      name: payload.email.split('@')[0],
      email: payload.email,
      phone: '+91 98765 00000',
      role: targetRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const token = `mock_jwt_token_${mockUser.id}_${Date.now()}`;
    setAuthToken(token);
    return { user: mockUser, token };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!isMockMode()) {
      const res = await apiClient.post<AuthResponse>('/auth/register', payload);
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    }

    // Mock Mode
    await mockDelay(250);
    const targetRole = payload.role || 'CUSTOMER';
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: targetRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    setAuthToken(token);
    return { user: newUser, token };
  },

  async logout(): Promise<void> {
    if (!isMockMode()) {
      try {
        await apiClient.post('/auth/logout');
      } finally {
        clearAuthToken();
      }
      return;
    }

    await mockDelay(100);
    clearAuthToken();
  },

  async getCurrentUser(): Promise<User> {
    if (!isMockMode()) {
      return apiClient.get<User>('/auth/me');
    }

    await mockDelay(100);
    const savedRole = (localStorage.getItem('medbazar_role') as UserRole) || 'CUSTOMER';
    return DEMO_USERS[savedRole] || DEMO_USERS.CUSTOMER;
  },

  async forgotPassword(identifier: string): Promise<{ message: string }> {
    if (!isMockMode()) {
      return apiClient.post<{ message: string }>('/auth/forgot-password', { identifier });
    }

    await mockDelay(200);
    return { message: `Recovery instructions dispatched to ${identifier}` };
  },

  async resetPassword(password: string, resetToken?: string): Promise<{ message: string }> {
    if (!isMockMode()) {
      return apiClient.post<{ message: string }>('/auth/reset-password', { password, token: resetToken });
    }

    await mockDelay(200);
    return { message: 'Password updated successfully' };
  },
};
