import React from 'react';
import { ShoppingBasket, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export const PharmacyPurchasesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Purchases & Suppliers</h1>
          <p className="text-xs text-gray-500 mt-1">Purchase orders and wholesale distributor records</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>New Purchase Order</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Reference #</TableHead>
            <TableHead>Supplier Name</TableHead>
            <TableHead>Total Invoice</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-bold font-mono">PO-2026-091</TableCell>
            <TableCell>Cipla Wholesale Distributors Pvt Ltd</TableCell>
            <TableCell className="font-bold text-gray-900">₹45,200.00</TableCell>
            <TableCell>2026-09-28</TableCell>
            <TableCell><Badge variant="success" dot>Received & Stocked</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
