import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Calculator,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MOCK_ORDERS, MOCK_INVENTORY, MOCK_PRESCRIPTIONS, MOCK_BRANCHES } from '@/services/api/mockData';
import { reportApi } from '@/services/api/reportApi';

export const PharmacyDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [telemetry, setTelemetry] = useState<any>(null);
  const activeBranch = MOCK_BRANCHES[0];

  useEffect(() => {
    reportApi.getDashboardTelemetry({ period: timeRange.toLowerCase() as any })
      .then((data) => {
        if (data) setTelemetry(data);
      })
      .catch(() => {});
  }, [timeRange]);

  // Priority action queues and stock items
  const pendingRx = MOCK_PRESCRIPTIONS.filter((p) => p.status === 'PENDING_REVIEW');
  const lowStockItems = MOCK_INVENTORY.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');

  // Derived counts from telemetry or isolated mock data
  const pendingRxCount = telemetry?.pendingPrescriptionsCount ?? pendingRx.length;
  const lowStockCount = telemetry?.lowStockCount ?? lowStockItems.length;
  const expiringSoonCount = telemetry?.expiringBatchesCount ?? 3; // Batches expiring within 90 days
  const todayTotalSales = telemetry?.sales?.todayTotal ?? 18450;
  const todayOnlineSales = telemetry?.sales?.todayOnline ?? 5820;
  const todayOfflineSales = telemetry?.sales?.todayOffline ?? 12630;
  const totalOrdersCount = telemetry?.sales?.totalOrders ?? 24;

  // Hourly sales points for the restrained pine line chart (no gridlines, single highlighted peak)
  // X: 09:00, 11:00, 13:00, 15:00, 17:00 (Peak), 19:00, 21:00
  const salesData = [
    { time: '09:00', total: 1200, online: 350, offline: 850, x: 20, y: 130 },
    { time: '11:00', total: 2450, online: 800, offline: 1650, x: 100, y: 95 },
    { time: '13:00', total: 2100, online: 650, offline: 1450, x: 180, y: 105 },
    { time: '15:00', total: 2900, online: 1100, offline: 1800, x: 260, y: 80 },
    { time: '17:00', total: 3950, online: 1220, offline: 2730, x: 340, y: 40, isPeak: true }, // Highlighted point
    { time: '19:00', total: 3400, online: 950, offline: 2450, x: 420, y: 60 },
    { time: '21:00', total: 2450, online: 750, offline: 1700, x: 500, y: 95 }
  ];

  const svgPath = salesData.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  const areaPath = `${svgPath} L 500 170 L 20 170 Z`;

  return (
    <div className="space-y-6 font-sans antialiased text-gray-900">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Pharmacy Operations Console
            </h1>
            <span className="font-mono text-[11px] text-gray-600 bg-sand-200/80 px-2 py-0.5 rounded border border-sand-300">
              Single Stock Mode
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Real-time branch telemetry: <span className="font-medium text-gray-900">{activeBranch.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded border border-sand-300 bg-white p-0.5 text-xs font-mono">
            {(['TODAY', 'WEEK', 'MONTH'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setTimeRange(tab)}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                  timeRange === tab ? 'bg-pine-700 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            to="/pharmacy/pos"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Launch POS</span>
          </Link>
        </div>
      </div>

      {/* KPI Disciplined Grid - 7 specific metrics, no excessive cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* 1. Today's Sales */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">
            Today's Sales
          </span>
          <div className="font-mono text-base font-bold text-gray-900">₹{todayTotalSales.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-700 font-mono font-medium block">
            ↑ 12.4% vs yest.
          </span>
        </div>

        {/* 2. Online Sales */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">
            Online Sales
          </span>
          <div className="font-mono text-base font-bold text-pine-800">₹{todayOnlineSales.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-gray-500 font-mono block">6 orders (31.5%)</span>
        </div>

        {/* 3. Offline Sales */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">
            Offline Sales
          </span>
          <div className="font-mono text-base font-bold text-gray-900">₹{todayOfflineSales.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-gray-500 font-mono block">18 counter sales</span>
        </div>

        {/* 4. Orders */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">
            Orders
          </span>
          <div className="font-mono text-base font-bold text-gray-900">{totalOrdersCount}</div>
          <span className="text-[10px] text-gray-500 font-mono block">4 fulfillment ready</span>
        </div>

        {/* 5. Pending Prescriptions */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-800 block">
            Pending Rx
          </span>
          <div className="font-mono text-base font-bold text-amber-700">{pendingRxCount}</div>
          <Link to="/pharmacy/prescriptions" className="text-[10px] text-pine-800 font-semibold hover:underline block">
            Review queue →
          </Link>
        </div>

        {/* 6. Low Stock */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-red-800 block">
            Low Stock
          </span>
          <div className="font-mono text-base font-bold text-red-600">{lowStockCount}</div>
          <Link to="/pharmacy/inventory" className="text-[10px] text-pine-800 font-semibold hover:underline block">
            Reorder items →
          </Link>
        </div>

        {/* 7. Expiring Soon */}
        <div className="bg-white border border-sand-300 rounded-md p-3 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-800 block">
            Expiring Soon
          </span>
          <div className="font-mono text-base font-bold text-amber-700">{expiringSoonCount}</div>
          <span className="text-[10px] text-gray-500 font-mono block">&lt; 90 days shelf</span>
        </div>
      </div>

      {/* Sales Overview Area - Disciplined Grid with Restrained Pine Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Sales Overview & Restrained Line Chart */}
        <div className="lg:col-span-2 bg-white border border-sand-300 rounded-md p-4 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-mono">
                Sales Velocity Overview
              </h2>
              <p className="text-xs text-gray-500">
                Single inventory throughput across counter POS and digital marketplace orders
              </p>
            </div>

            {/* Sales breakdown badges */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pine-700" />
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-gray-900">₹18,450</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-gray-600">Online:</span>
                <span className="font-bold text-gray-900">₹5,820</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span className="text-gray-600">Offline:</span>
                <span className="font-bold text-gray-900">₹12,630</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas: Restrained Line Chart (No gridlines, single highlighted peak point, pine accent) */}
          <div className="relative pt-2">
            {/* SVG line chart */}
            <div className="w-full h-44 flex items-center justify-center">
              <svg viewBox="0 0 520 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Subtle base baseline only (No gridlines) */}
                <line x1="20" y1="170" x2="500" y2="170" stroke="#DDD5C2" strokeWidth="1" />

                {/* Filled Area (Subtle flat pine tint, no gradients) */}
                <path d={areaPath} fill="#1B4332" fillOpacity="0.04" />

                {/* Main Smooth Curve Line (Restrained Pine #1B4332) */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#1B4332"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Normal data dots (subtle) */}
                {salesData.map((pt) => {
                  if (pt.isPeak) return null;
                  return (
                    <circle
                      key={pt.time}
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill="#FFFFFF"
                      stroke="#1B4332"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Single Highlighted Peak Point */}
                <g>
                  {/* Subtle pulsing outer ring */}
                  <circle cx="340" cy="40" r="8" fill="#1B4332" fillOpacity="0.15" />
                  {/* Solid dot */}
                  <circle cx="340" cy="40" r="4.5" fill="#1B4332" stroke="#FFFFFF" strokeWidth="2" />
                  {/* Peak Marker Tag Box */}
                  <rect x="285" y="10" width="110" height="20" rx="3" fill="#143427" />
                  <text x="340" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontFamily="monospace" fontWeight="600">
                    Peak: 17:00 • ₹3,950
                  </text>
                  {/* Pointer line */}
                  <line x1="340" y1="30" x2="340" y2="35" stroke="#143427" strokeWidth="1.5" />
                </g>
              </svg>
            </div>

            {/* X-Axis Time Labels */}
            <div className="flex justify-between px-2 pt-1 font-mono text-[10px] text-gray-500 border-t border-sand-200">
              {salesData.map(pt => (
                <span key={pt.time} className={pt.isPeak ? 'font-bold text-pine-800' : ''}>
                  {pt.time}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Priority Action Queue */}
        <div className="bg-white border border-sand-300 rounded-md p-4 space-y-3.5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sand-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-mono">
                Prescription Action Queue
              </h2>
              <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {pendingRx.length} Pending
              </span>
            </div>

            <div className="space-y-2">
              {pendingRx.map((p: any) => (
                <div key={p.id} className="p-2.5 rounded border border-sand-200 bg-sand-50/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{p.customerName}</span>
                    <span className="font-mono text-[10px] text-gray-500">Order #MB-2026-8801</span>
                  </div>
                  <p className="text-[11px] text-gray-600 truncate">{p.fileName}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-amber-800 font-medium">Pharmacist sign-off required</span>
                    <Link
                      to="/pharmacy/prescriptions"
                      className="text-[11px] font-bold text-pine-700 hover:text-pine-800 hover:underline"
                    >
                      Review Rx →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-sand-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-gray-500 uppercase font-semibold">Low Stock Threshold</span>
              <span className="font-mono text-xs font-bold text-red-600">{lowStockItems.length} items critical</span>
            </div>
            <Link
              to="/pharmacy/inventory"
              className="block w-full text-center py-2 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-xs font-semibold text-gray-800 transition-colors"
            >
              Open Branch Stock Master
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Compact Table */}
      <div className="bg-white border border-sand-300 rounded-md p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-sand-200 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-mono">
              Live Order Stream (Online & Store POS)
            </h2>
            <span className="text-[10px] font-mono text-gray-500">Showing last 4 transactions</span>
          </div>
          <Link to="/pharmacy/orders" className="text-xs font-bold text-pine-700 hover:underline font-mono">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/70">
                <th className="py-2 px-3">Order ID</th>
                <th className="py-2 px-3">Channel</th>
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Items Summary</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {MOCK_ORDERS.slice(0, 4).map(ord => (
                <tr key={ord.id} className="hover:bg-sand-50/50 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                  <td className="py-2 px-3">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sand-100 border border-sand-300 text-gray-700">
                      {ord.orderType}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-900">{ord.customerName}</td>
                  <td className="py-2 px-3 text-gray-600 text-[11px] truncate max-w-[200px]">
                    {ord.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-gray-900">₹{ord.total.toFixed(2)}</td>
                  <td className="py-2 px-3">
                    <Badge variant={ord.status === 'PRESCRIPTION_REVIEW' ? 'warning' : 'success'} size="sm">
                      {ord.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 font-mono text-[10px] text-gray-500">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
