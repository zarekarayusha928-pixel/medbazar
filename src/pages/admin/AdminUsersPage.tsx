import React from 'react';
import { Users, Shield } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOCK_STAFF, MOCK_CUSTOMERS } from '@/services/api/mockData';

export const AdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Platform User Directory</h1>
        <p className="text-xs text-gray-500 mt-1">Unified user accounts across customers, pharmacy owners, and staff</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Platform Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_STAFF.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-bold text-gray-900">{s.name}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>{s.phone}</TableCell>
              <TableCell><Badge variant="brand" size="sm">{s.role}</Badge></TableCell>
            </TableRow>
          ))}
          {MOCK_CUSTOMERS.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-bold text-gray-900">{c.name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell><Badge variant="neutral" size="sm">CUSTOMER</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
