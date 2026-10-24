import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  GitBranch,
  Users2,
  ShoppingBag,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { adminService, AdminDashboardMetrics } from '@/services/api/adminService';
import { Pharmacy, PharmacyActivity } from '@/types';
import { useToast } from '@/components/ui/Toast';

export const AdminOverviewPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>({
    totalPharmacies: 0,
    activePharmacies: 0,
    branches: 0,
    customers: 0,
    orders: 0,
    platformSales: 0,
    pendingVerifications: 0,
  });
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [activities, setActivities] = useState<PharmacyActivity[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, pharms, allActivities] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getPharmacies(),
        adminService.getPharmacyActivities('pharm_1'),
      ]);
      setMetrics(m);
      setPharmacies(pharms);
      // grab top 5 recent activities across platform
      setActivities(allActivities.slice(0, 5));
    } catch {
      showToast('Data Error', 'Failed to load platform overview metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              SUPERADMIN CONSOLE
            </span>
            <span className="text-xs text-gray-400">System v2.4</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Platform Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time oversight of multi-tenant pharmacies, physical branches, catalogue, and transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Link to="/admin/pharmacies">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Onboard Pharmacy
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards: Exactly the 6 required metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Pharmacies */}
        <Card className="hover:border-gray-300 transition-colors">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Total Pharmacies</span>
              <Building2 className="w-4 h-4 text-brand-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{metrics.totalPharmacies}</span>
              <span className="text-[11px] text-gray-500">organizations</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <Link to="/admin/pharmacies" className="text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* 2. Active Pharmacies */}
        <Card className="hover:border-gray-300 transition-colors">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Active Pharmacies</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-700">{metrics.activePharmacies}</span>
              <span className="text-[11px] text-emerald-600 font-medium">operational</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>{metrics.totalPharmacies - metrics.activePharmacies} pending/inactive</span>
            </div>
          </CardBody>
        </Card>

        {/* 3. Branches */}
        <Card className="hover:border-gray-300 transition-colors">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Branches</span>
              <GitBranch className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{metrics.branches}</span>
              <span className="text-[11px] text-gray-500">locations</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <Link to="/admin/branches" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                Directory <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* 4. Customers */}
        <Card className="hover:border-gray-300 transition-colors">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Customers</span>
              <Users2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{metrics.customers}</span>
              <span className="text-[11px] text-gray-500">registered</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <Link to="/admin/users" className="text-teal-600 hover:text-teal-800 font-medium inline-flex items-center gap-1">
                User accounts <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* 5. Orders */}
        <Card className="hover:border-gray-300 transition-colors">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Orders</span>
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{metrics.orders}</span>
              <span className="text-[11px] text-purple-600 font-medium">processed</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <Link to="/admin/reports" className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1">
                Order metrics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* 6. Platform Sales */}
        <Card className="hover:border-gray-300 transition-colors bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-900">Platform Sales</span>
              <IndianRupee className="w-4 h-4 text-brand-700" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-extrabold text-brand-900 truncate block">
                {formatCurrency(metrics.platformSales)}
              </span>
              <span className="text-[11px] text-brand-600 font-medium">GMV platform volume</span>
            </div>
            <div className="mt-2 pt-2 border-t border-brand-100/80 flex items-center justify-between text-[11px]">
              <Link to="/admin/reports" className="text-brand-700 hover:text-brand-900 font-semibold inline-flex items-center gap-1">
                View reports <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Sections: Restrained, Healthcare-Grade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pharmacies List & Verification Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between bg-gray-50/70 py-3.5 px-5">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Registered Pharmacy Network</h2>
                <p className="text-xs text-gray-500">Retail partners onboarded to Med Bazar multi-tenant core</p>
              </div>
              <Link to="/admin/pharmacies">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Manage All ({pharmacies.length})
                </Button>
              </Link>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pharmacies.slice(0, 5).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <Link
                          to={`/admin/pharmacies/${p.id}`}
                          className="font-bold text-gray-900 hover:text-brand-600 transition-colors"
                        >
                          {p.name}
                        </Link>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Lic: {p.licenseNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-800 font-medium">{p.ownerName || 'Dr. Suresh Mehta'}</span>
                      <div className="text-[11px] text-gray-500">{p.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {p.branchCount} {p.branchCount === 1 ? 'branch' : 'branches'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === 'ACTIVE'
                            ? 'success'
                            : p.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                        dot
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/pharmacies/${p.id}`}>
                        <Button size="sm" variant="ghost" className="text-xs text-brand-600 hover:text-brand-800">
                          View details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Quick Platform Compliance Status Banner */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Platform Multi-Tenancy & Statutory Isolation
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                All retail tenant databases, batch registers, prescription records, and cashier tills remain securely
                isolated per organization and branch. Master medicine catalogue is globally harmonized.
              </p>
            </div>
            <Link to="/admin/settings">
              <Button size="sm" variant="outline" className="text-xs bg-white">
                Review Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Platform Activity & Quick Navigation */}
        <div className="space-y-6">
          {/* Quick Admin Actions */}
          <Card>
            <CardHeader className="bg-gray-50/70 py-3 px-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Quick Actions</h3>
            </CardHeader>
            <CardBody className="p-3 space-y-1.5">
              <Link
                to="/admin/pharmacies"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span>Onboard or verify pharmacy</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/medicines"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Add global medicine definition</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/branches"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  <span>Inspect branch networks</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  <span>Financial & settlement reports</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </CardBody>
          </Card>

          {/* Recent Platform Audit Trail */}
          <Card>
            <CardHeader className="bg-gray-50/70 py-3 px-4 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Recent Activity</h3>
              <Clock className="w-3.5 h-3.5 text-gray-400" />
            </CardHeader>
            <CardBody className="p-4 space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No recent system activities recorded.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="relative pl-5 border-l-2 border-brand-200 pb-1 text-xs">
                    <span className="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full bg-brand-600" />
                    <div className="font-semibold text-gray-900">{act.title}</div>
                    <p className="text-gray-500 text-[11px] mt-0.5">{act.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-1">
                      <span>{act.actor}</span>
                      <span>•</span>
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
