import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Building, GitBranch, Users, Pill, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { MOCK_PHARMACIES, MOCK_BRANCHES, MOCK_MEDICINES } from '@/services/api/mockData';

export const AdminOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Platform Control Overview</h1>
        <p className="text-xs text-gray-500 mt-1">Multi-tenant pharmacy network monitoring & administration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Onboarded Pharmacies</span>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{MOCK_PHARMACIES.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Active Physical Branches</span>
            <p className="text-2xl font-extrabold text-indigo-700 mt-1">{MOCK_BRANCHES.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Global Medicines Catalogue</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{MOCK_MEDICINES.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Pending Verifications</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">1 Pharmacy</p>
          </CardBody>
        </Card>
      </div>

      {/* Onboarding Applications */}
      <Card>
        <CardHeader className="bg-gray-50/60">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Recent Pharmacy Onboarding Applications</h3>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pharmacy Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PHARMACIES.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-gray-900">{p.name}</TableCell>
                <TableCell className="font-mono text-xs">{p.licenseNumber}</TableCell>
                <TableCell>{p.branchCount} Branches</TableCell>
                <TableCell>{p.createdAt}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'ACTIVE' ? 'success' : 'warning'} dot>
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
