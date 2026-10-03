import React from 'react';
import { Users, Phone, Mail, MapPin } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { MOCK_CUSTOMERS } from '@/services/api/mockData';

export const PharmacyCustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Customer Records</h1>
        <p className="text-xs text-gray-500 mt-1">Customer database for Pune Station Branch</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Default Delivery Address</TableHead>
            <TableHead>Member Since</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_CUSTOMERS.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-bold text-gray-900">{c.name}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell className="text-xs text-gray-600">{c.addresses[0]?.addressLine || 'N/A'}</TableCell>
              <TableCell>{c.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
