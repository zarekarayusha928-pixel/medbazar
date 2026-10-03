import React from 'react';
import { Truck, CheckCircle2, MapPin } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export const PharmacyDeliveriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Branch Delivery Dispatches</h1>
        <p className="text-xs text-gray-500 mt-1">Assign delivery agents and track local doorstep fulfillment</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Delivery Address</TableHead>
            <TableHead>Delivery Agent</TableHead>
            <TableHead>Dispatch Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-bold">#MB-2026-8802</TableCell>
            <TableCell>Priya Verma</TableCell>
            <TableCell className="text-xs">Bungalow 12, Lane 5, Koregaon Park, Pune</TableCell>
            <TableCell className="font-medium">Ramesh Pawar (Delivery Agent)</TableCell>
            <TableCell><Badge variant="info" dot>Out For Delivery</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
