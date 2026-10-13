import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

export const DEMO_USERS: Record<UserRole, User> = {
  CUSTOMER: {
    id: 'usr_cust_1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2025-05-10',
  },
  PHARMACIST: {
    id: 'usr_pharm_1',
    name: 'Amit Deshmukh (Reg. Pharmacist)',
    email: 'amit.d@apothecary.com',
    phone: '+91 98230 44556',
    role: 'PHARMACIST',
    status: 'ACTIVE',
    createdAt: '2025-02-01',
  },
  PHARMACY_OWNER: {
    id: 'usr_owner_1',
    name: 'Dr. Suresh Mehta',
    email: 'suresh.mehta@apothecary.com',
    phone: '+91 98230 11223',
    role: 'PHARMACY_OWNER',
    status: 'ACTIVE',
    createdAt: '2025-01-15',
  },
  BRANCH_MANAGER: {
    id: 'usr_mgr_1',
    name: 'Vikram Singhania',
    email: 'vikram.s@apothecary.com',
    phone: '+91 98230 77665',
    role: 'BRANCH_MANAGER',
    status: 'ACTIVE',
    createdAt: '2025-03-01',
  },
  CASHIER: {
    id: 'usr_cash_1',
    name: 'Kiran Kulkarni',
    email: 'kiran.k@apothecary.com',
    phone: '+91 98230 99887',
    role: 'CASHIER',
    status: 'ACTIVE',
    createdAt: '2025-03-15',
  },
  DELIVERY_STAFF: {
    id: 'usr_deliv_1',
    name: 'Ramesh Pawar',
    email: 'ramesh.p@apothecary.com',
    phone: '+91 98230 33221',
    role: 'DELIVERY_STAFF',
    status: 'ACTIVE',
    createdAt: '2025-04-10',
  },
  PLATFORM_ADMIN: {
    id: 'usr_admin_1',
    name: 'Neha Kapoor (Platform Admin)',
    email: 'admin@medbazar.com',
    phone: '+91 99999 00001',
    role: 'PLATFORM_ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-12-01',
  },
};

interface AuthContextType {
  user: User;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, phone: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  demoLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('medbazar_role');
    return (saved as UserRole) || 'CUSTOMER';
  });

  const [user, setUser] = useState<User>(() => {
    return DEMO_USERS[role] || DEMO_USERS.CUSTOMER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('medbazar_auth') === 'true';
  });

  useEffect(() => {
    setUser(DEMO_USERS[role] || DEMO_USERS.CUSTOMER);
    localStorage.setItem('medbazar_role', role);
  }, [role]);

  const login = async (email: string, _password?: string, preferredRole?: UserRole): Promise<boolean> => {
    const targetRole = preferredRole || role;
    setRole(targetRole);
    const targetUser = DEMO_USERS[targetRole] || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '+91 98765 00000',
      role: targetRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setUser(targetUser);
    setIsAuthenticated(true);
    localStorage.setItem('medbazar_auth', 'true');
    return true;
  };

  const register = async (name: string, email: string, phone: string, preferredRole?: UserRole): Promise<boolean> => {
    const targetRole = preferredRole || 'CUSTOMER';
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      role: targetRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setRole(targetRole);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('medbazar_auth', 'true');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medbazar_auth');
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(DEMO_USERS[newRole]);
    setIsAuthenticated(true);
    localStorage.setItem('medbazar_auth', 'true');
    localStorage.setItem('medbazar_role', newRole);
  };

  const demoLogin = (targetRole: UserRole) => {
    switchRole(targetRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        register,
        logout,
        switchRole,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
