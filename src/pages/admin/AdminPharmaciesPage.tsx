import React from 'react';
import { Building, Plus, CheckCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOCK_PHARMACIES } from '@/services/api/mockData';

export const AdminPharmaciesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Onboarding & Verification</h1>
          <p className="text-xs text-gray-500 mt-1">Manage retail pharmacy partners and drug licensing approvals</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Onboard New Pharmacy</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pharmacy Business Name</TableHead>
            <TableHead>Drug License</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>Branches</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_PHARMACIES.map((pharm) => (
            <TableRow key={pharm.id}>
              <TableCell className="font-bold text-gray-900">{pharm.name}</TableCell>
              <TableCell className="font-mono text-xs">{pharm.licenseNumber}</TableCell>
              <TableCell>{pharm.phone}</TableCell>
              <TableCell>{pharm.branchCount} Active Branches</TableCell>
              <TableCell>
                <Badge variant={pharm.status === 'ACTIVE' ? 'success' : 'warning'} dot>
                  {pharm.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline">Inspect License</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
