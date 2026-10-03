import { Staff } from '@/types';
import { MOCK_STAFF } from './mockData';

export const staffService = {
  async getStaffMembers(organizationId?: string): Promise<Staff[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let staff = [...MOCK_STAFF];
        if (organizationId) staff = staff.filter(s => s.organizationId === organizationId);
        resolve(staff);
      }, 150);
    });
  }
};
