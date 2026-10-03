import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Calculator,
  PackageCheck,
  FileCheck,
  Users,
  Truck,
  BarChart3,
  UserCog,
  Settings,
  Pill,
  ChevronDown,
  Building2,
  Bell,
  LogOut,
  ShoppingBasket,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { MOCK_PHARMACIES, MOCK_BRANCHES } from '@/services/api/mockData';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';

export const PharmacyDashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(MOCK_BRANCHES[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/pharmacy', icon: LayoutDashboard },
    { label: 'Online Orders', path: '/pharmacy/orders', icon: ShoppingBag, badge: '2' },
    { label: 'Store POS', path: '/pharmacy/pos', icon: Calculator, highlight: true },
    { label: 'Branch Inventory', path: '/pharmacy/inventory', icon: PackageCheck },
    { label: 'Prescription Reviews', path: '/pharmacy/prescriptions', icon: FileCheck, badge: '1' },
    { label: 'Customers', path: '/pharmacy/customers', icon: Users },
    { label: 'Purchases & Suppliers', path: '/pharmacy/purchases', icon: ShoppingBasket },
    { label: 'Deliveries', path: '/pharmacy/deliveries', icon: Truck },
    { label: 'Reports & Sales', path: '/pharmacy/reports', icon: BarChart3 },
    { label: 'Staff Management', path: '/pharmacy/staff', icon: UserCog },
    { label: 'Settings', path: '/pharmacy/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar - Desktop */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 z-30 fixed inset-y-0 left-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link to="/pharmacy" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-bold text-white tracking-tight block text-base leading-none">
                  Apothecary
                </span>
                <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase block mt-1">
                  Pharmacy Operations
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <ChevronLeft className={clsx('w-5 h-5 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : item.highlight
                    ? 'bg-slate-800 text-teal-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={clsx('w-5 h-5 shrink-0', isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400')} />
                {!sidebarCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              SM
            </div>
            {!sidebarCollapsed && (
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white truncate">Dr. Suresh Mehta</p>
                <p className="text-[10px] text-slate-400 truncate">Pharmacy Owner</p>
              </div>
            )}
            <Link to="/customer" title="Switch to Customer Store" className="text-slate-400 hover:text-white p-1">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={clsx('flex-1 flex flex-col min-w-0 transition-all duration-200', sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Branch Selector Header Context */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
              <div className="text-xs">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Active Branch:</span>
                <select
                  value={selectedBranch.id}
                  onChange={(e) => {
                    const b = MOCK_BRANCHES.find(item => item.id === e.target.value);
                    if (b) setSelectedBranch(b);
                  }}
                  className="bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
                >
                  {MOCK_BRANCHES.filter(b => b.organizationId === 'pharm_1').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Badge variant="success" size="sm" dot className="hidden sm:inline-flex">
              Single Inventory Active
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick POS Launcher Button */}
            <button
              onClick={() => navigate('/pharmacy/pos')}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Open POS Counter</span>
            </button>

            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 bg-slate-900 text-slate-300 flex flex-col z-10">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white">
                <Pill className="w-5 h-5 text-teal-400" />
                <span>Med Bazar Pharmacy</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                      location.pathname === item.path ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
