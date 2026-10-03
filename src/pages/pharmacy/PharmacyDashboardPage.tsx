import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Calculator,
  AlertTriangle,
  FileCheck,
  ArrowUpRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { MOCK_ORDERS, MOCK_INVENTORY, MOCK_PRESCRIPTIONS } from '@/services/api/mockData';

export const PharmacyDashboardPage: React.FC = () => {
  const lowStockCount = MOCK_INVENTORY.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length;
  const pendingRxCount = MOCK_PRESCRIPTIONS.filter(p => p.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Branch Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Branch: Apothecary Main Branch - Pune Station</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/pharmacy/pos">
            <Button variant="primary" leftIcon={<Calculator className="w-4 h-4" />}>
              Open POS Counter
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Today's Total Sales</span>
              <p className="text-2xl font-extrabold text-gray-900">₹14,850.00</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +12.5% vs yesterday
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Online vs POS Sales</span>
              <p className="text-sm font-bold text-gray-900">Online: ₹4,200 | POS: ₹10,650</p>
              <span className="text-[11px] text-gray-500 block">Single Shared Stock Engine</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Prescriptions Queue</span>
              <p className="text-2xl font-extrabold text-amber-600">{pendingRxCount} Pending</p>
              <Link to="/pharmacy/prescriptions" className="text-[11px] font-semibold text-brand-600 hover:underline">
                Pharmacist review needed →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Low Stock Alerts</span>
              <p className="text-2xl font-extrabold text-red-600">{lowStockCount} Items</p>
              <Link to="/pharmacy/inventory" className="text-[11px] font-semibold text-brand-600 hover:underline">
                Reorder inventory →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Queue */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="bg-gray-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                <h2 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Recent Online Customer Orders</h2>
              </div>
              <Link to="/pharmacy/orders" className="text-xs font-semibold text-brand-600 hover:underline">View All</Link>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ORDERS.map((ord) => (
                  <TableRow key={ord.id}>
                    <TableCell className="font-bold text-gray-900">{ord.orderNumber}</TableCell>
                    <TableCell>
                      <span className="font-medium">{ord.customerName}</span>
                      <span className="text-gray-400 block text-[10px]">{ord.customerPhone}</span>
                    </TableCell>
                    <TableCell><Badge variant="brand" size="sm">{ord.orderType}</Badge></TableCell>
                    <TableCell className="font-bold text-gray-900">₹{ord.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={ord.status === 'PRESCRIPTION_REVIEW' ? 'warning' : 'success'} size="sm" dot>
                        {ord.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to="/pharmacy/orders">
                        <Button size="sm" variant="outline">Manage</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Low Stock Alert Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="bg-gray-50/60 flex items-center justify-between">
              <h2 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Low Stock Inventory Warnings</h2>
              <Badge variant="danger" size="sm">{lowStockCount}</Badge>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {MOCK_INVENTORY.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-red-50/60 border border-red-200/80 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.medicine?.name}</h4>
                    <span className="text-red-700 font-semibold">Current Stock: {item.quantity} (Min: {item.reorderLevel})</span>
                  </div>
                  <Link to="/pharmacy/inventory">
                    <Button size="sm" variant="outline" className="border-red-300 text-red-800 hover:bg-red-100">
                      Adjust
                    </Button>
                  </Link>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
