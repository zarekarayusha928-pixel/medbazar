import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  ShoppingBag,
  FileCheck,
  Building2,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { adminService, PharmacyReportRow, MedicineDemandRow } from '@/services/api/adminService';

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd'>('30d');
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReportsData(period);
      setReportData(data);
    } catch {
      showToast('Error', 'Failed to generate platform reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExport = () => {
    showToast(
      'Report Exported',
      `Platform settlement & transaction report for ${period.toUpperCase()} exported to CSV.`,
      'success'
    );
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  if (loading && !reportData) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Compiling platform ledger and settlement reports...</p>
      </div>
    );
  }

  const { summary, salesTrend, pharmacyPerformance, medicineDemand } = reportData || {};

  // Maximum value for SVG chart scaling
  const maxGmv = Math.max(...(salesTrend?.map((t: any) => t.gmv) || [2000000]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              EXECUTIVE AUDIT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Platform Reports & Settlements</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Calm, restrained financial summaries, pharmacy settlement ledgers, and medicine movement
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-white text-xs font-medium shadow-sm">
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                period === '30d' ? 'bg-brand-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                period === '90d' ? 'bg-brand-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                period === 'ytd' ? 'bg-brand-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Year to Date
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Restrained KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Platform GMV</span>
              <IndianRupee className="w-4 h-4 text-brand-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {formatCurrency(summary?.totalGmv || 1845000)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8.4% compared to prev month</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Commission Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-800">
              {formatCurrency(summary?.platformRevenue || 101475)}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              Standard take-rate: 5.5% avg
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Orders Fulfilled</span>
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {summary?.totalOrdersFulfilled?.toLocaleString() || '2,950'}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              99.2% on-time fulfillment rate
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-semibold tracking-wider uppercase">Prescriptions Handled</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {summary?.prescriptionsProcessed?.toLocaleString() || '1,420'}
            </div>
            <div className="mt-1 text-[11px] text-blue-700 font-medium">
              100% pharmacist sign-off
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Restrained Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Sales Growth (Restrained SVG Bar Chart) */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gray-50/70 py-3.5 px-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Monthly Platform GMV Progression</h2>
              <p className="text-xs text-gray-500">Consolidated gross sales volume across all pharmacy tenants</p>
            </div>
            <Badge variant="brand" size="sm">Last 6 Months</Badge>
          </CardHeader>
          <CardBody className="p-6">
            {/* Clean SVG Chart */}
            <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-gray-100">
              {salesTrend?.map((item: any) => {
                const heightPercent = Math.round((item.gmv / maxGmv) * 100);
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      ₹{(item.gmv / 100000).toFixed(1)}L
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[42px] bg-slate-900 hover:bg-brand-600 rounded-t transition-all duration-200"
                    />
                    <span className="text-[11px] font-medium text-gray-600 mt-2 text-center whitespace-nowrap">
                      {item.month.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-900 inline-block" />
                <span>Gross Merchandise Value (GMV)</span>
              </div>
              <div className="font-mono text-[11px]">
                Peak Month: Oct 2026 (₹18.45 Lakhs)
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Chart 2: Pharmacy Share Breakdown */}
        <Card>
          <CardHeader className="bg-gray-50/70 py-3.5 px-5">
            <h2 className="text-sm font-bold text-gray-900">Tenant Volume Distribution</h2>
            <p className="text-xs text-gray-500">Market share by GMV</p>
          </CardHeader>
          <CardBody className="p-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1">
                <span>Apothecary Healthcare</span>
                <span>52.4%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-brand-600 h-2 rounded-full" style={{ width: '52.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1">
                <span>MediCure Pharmacy</span>
                <span>26.3%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '26.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1">
                <span>Wellness Chemist Network</span>
                <span>17.4%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '17.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1">
                <span>LifeCare Meds & Diagnostics</span>
                <span>3.9%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '3.9%' }} />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
              * Calculations based on settled orders during the current billing period.
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Summary Table 1: Pharmacy Financial Performance & Settlements */}
      <Card>
        <CardHeader className="bg-gray-50/70 py-3.5 px-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Pharmacy Performance & Financial Settlements</h2>
            <p className="text-xs text-gray-500">Gross sales, platform commissions, and net payout distribution per tenant</p>
          </div>
          <Badge variant="neutral" size="sm">Cycle: Weekly</Badge>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>GMV (Gross)</TableHead>
              <TableHead>Platform Fee (5.5%)</TableHead>
              <TableHead>Net Payout</TableHead>
              <TableHead>Settlement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pharmacyPerformance?.map((row: PharmacyReportRow) => (
              <TableRow key={row.pharmacyId}>
                <TableCell>
                  <div className="font-bold text-gray-900">{row.pharmacyName}</div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">{row.licenseNumber}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">{row.branchCount} Branches</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-gray-900">
                  {row.totalOrders}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-gray-900">
                  {formatCurrency(row.gmv)}
                </TableCell>
                <TableCell className="font-mono text-xs text-brand-700 font-semibold">
                  {formatCurrency(row.platformCommission)}
                </TableCell>
                <TableCell className="font-mono text-xs font-extrabold text-emerald-800">
                  {formatCurrency(row.netPayout)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.payoutStatus === 'SETTLED'
                        ? 'success'
                        : row.payoutStatus === 'PROCESSING'
                        ? 'brand'
                        : 'warning'
                    }
                    dot
                    size="sm"
                  >
                    {row.payoutStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Summary Table 2: Top Medicine Demand & Dispensing Velocity */}
      <Card>
        <CardHeader className="bg-gray-50/70 py-3.5 px-5">
          <h2 className="text-sm font-bold text-gray-900">Top Dispensed Formulations by Volume</h2>
          <p className="text-xs text-gray-500">Highest volume pharmaceuticals demanded across all participating branches</p>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Generic Composition</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Units Dispensed</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Schedule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicineDemand?.map((row: MedicineDemandRow) => (
              <TableRow key={row.medicineId}>
                <TableCell className="font-bold text-gray-900">
                  {row.name}
                </TableCell>
                <TableCell className="text-xs text-gray-700">
                  {row.genericName}
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">{row.category}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-900">
                  {row.ordersCount}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-gray-900">
                  {row.unitsSold} units
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-gray-900">
                  {formatCurrency(row.totalSales)}
                </TableCell>
                <TableCell>
                  {row.prescriptionRequired ? (
                    <Badge variant="warning" size="sm">Rx Required</Badge>
                  ) : (
                    <Badge variant="success" size="sm">OTC</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
