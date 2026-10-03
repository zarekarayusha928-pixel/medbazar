import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export const PharmacyReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Sales & Stock Reports</h1>
          <p className="text-xs text-gray-500 mt-1">Daily breakdown of online orders vs offline store POS sales</p>
        </div>

        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Export Sales CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Monthly Sales</span>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">₹4,85,200.00</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">POS Store Revenue (72%)</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">₹3,49,344.00</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Online Order Revenue (28%)</span>
            <p className="text-2xl font-extrabold text-brand-700 mt-1">₹1,35,856.00</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gray-50/60">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Top Selling Medicines</h3>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>POS Units Sold</TableHead>
              <TableHead>Online Units Sold</TableHead>
              <TableHead>Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold text-gray-900">Paracetamol 650mg (Dolo)</TableCell>
              <TableCell>Analgesic</TableCell>
              <TableCell>340 units</TableCell>
              <TableCell>120 units</TableCell>
              <TableCell className="font-extrabold text-brand-700">₹14,950.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold text-gray-900">Augmentin 625mg</TableCell>
              <TableCell>Antibiotic</TableCell>
              <TableCell>85 units</TableCell>
              <TableCell>45 units</TableCell>
              <TableCell className="font-extrabold text-brand-700">₹27,300.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
