import React from 'react';
import { UserCog, Plus, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOCK_STAFF } from '@/services/api/mockData';

export const PharmacyStaffPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Staff & Roles</h1>
          <p className="text-xs text-gray-500 mt-1">Manage licensed pharmacists, cashiers, and branch staff members</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Invite Staff Member</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Assigned Role</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_STAFF.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-bold text-gray-900">{member.name}</TableCell>
              <TableCell><Badge variant="brand" size="sm">{member.role}</Badge></TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell><Badge variant="success" dot>{member.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
