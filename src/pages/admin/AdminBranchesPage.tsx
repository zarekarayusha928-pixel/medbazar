import React from 'react';
import { GitBranch, MapPin } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOCK_BRANCHES } from '@/services/api/mockData';

export const AdminBranchesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">All Physical Branches Network</h1>
        <p className="text-xs text-gray-500 mt-1">Platform branch registry across all pharmacy tenants</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch Name</TableHead>
            <TableHead>Pharmacy Tenant</TableHead>
            <TableHead>City & Pincode</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_BRANCHES.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-bold text-gray-900">{b.name}</TableCell>
              <TableCell>{b.organizationName}</TableCell>
              <TableCell>{b.city} ({b.pincode})</TableCell>
              <TableCell>{b.phone}</TableCell>
              <TableCell><Badge variant="success" dot>{b.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
