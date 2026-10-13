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
  Building2,
  Bell,
  LogOut,
  ShoppingBasket,
  ChevronLeft,
  Menu,
  X,
  Store,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MOCK_PHARMACIES, MOCK_BRANCHES } from '@/services/api/mockData';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';

export const PharmacyDashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(MOCK_PHARMACIES[0].id);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(MOCK_BRANCHES[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const availableBranches = MOCK_BRANCHES.filter(
    (b) => b.organizationId === selectedPharmacyId
  );

  const activeBranch =
    availableBranches.find((b) => b.id === selectedBranchId) || availableBranches[0] || MOCK_BRANCHES[0];

  const navigationItems = [
    { label: 'Dashboard', path: '/pharmacy', icon: LayoutDashboard },
    { label: 'Orders', path: '/pharmacy/orders', icon: ShoppingBag, badge: '2' },
    { label: 'POS', path: '/pharmacy/pos', icon: Calculator, highlight: true },
    { label: 'Inventory', path: '/pharmacy/inventory', icon: PackageCheck },
    { label: 'Prescriptions', path: '/pharmacy/prescriptions', icon: FileCheck, badge: '1' },
    { label: 'Purchases', path: '/pharmacy/purchases', icon: ShoppingBasket },
    { label: 'Customers', path: '/pharmacy/customers', icon: Users },
    { label: 'Deliveries', path: '/pharmacy/deliveries', icon: Truck },
    { label: 'Reports', path: '/pharmacy/reports', icon: BarChart3 },
    { label: 'Staff', path: '/pharmacy/staff', icon: UserCog },
    { label: 'Settings', path: '/pharmacy/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-sand-50 text-gray-900 font-sans antialiased">
      {/* Sidebar - Desktop */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-slate-950 text-slate-300 border-r border-slate-900 transition-all duration-150 z-30 fixed inset-y-0 left-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header with Med Bazar Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-900 shrink-0">
          <Link to="/pharmacy" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-md bg-pine-700 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Pill className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-white tracking-tight block text-base leading-none">
                  Med<span className="text-sand-300">Bazar</span>
                </span>
                <span className="text-[10px] text-sand-400 font-mono tracking-wider uppercase block mt-1">
                  Dispensary Console
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors duration-150"
          >
            <ChevronLeft
              className={clsx('w-5 h-5 transition-transform duration-150', sidebarCollapsed && 'rotate-180')}
            />
          </button>
        </div>

        {/* Navigation Links - 11 modules */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150 relative group',
                  isActive
                    ? 'bg-pine-700 text-white font-semibold shadow-2xs'
                    : item.highlight
                    ? 'bg-slate-900 text-emerald-400 hover:bg-slate-850 hover:text-white'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={clsx(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'
                  )}
                />
                {!sidebarCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 font-mono text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              SM
            </div>
            {!sidebarCollapsed && (
              <div className="truncate flex-1 text-left">
                <p className="text-xs font-semibold text-white truncate">Dr. Suresh Mehta</p>
                <p className="text-[10px] text-teal-400 font-mono truncate">Reg. Pharmacist</p>
              </div>
            )}
            <Link
              to="/customer"
              title="Switch to Customer Store"
              className="text-slate-400 hover:text-white p-1 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0 transition-all duration-150',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-sand-300 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 text-gray-600 hover:bg-sand-100 rounded border border-sand-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Med Bazar wordmark in top bar for tablet/desktop */}
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-sand-300">
              <span className="font-extrabold text-sm text-gray-900 tracking-tight">
                Med<span className="text-pine-700">Bazar</span>
              </span>
            </div>

            {/* Pharmacy Selector */}
            <div className="flex items-center gap-1.5 bg-sand-50 border border-sand-300 rounded px-2.5 py-1 text-xs">
              <Store className="w-3.5 h-3.5 text-pine-700 shrink-0" />
              <label htmlFor="pharmacy-selector" className="text-[10px] text-gray-500 font-mono uppercase font-semibold">
                Pharmacy:
              </label>
              <select
                id="pharmacy-selector"
                value={selectedPharmacyId}
                onChange={(e) => {
                  setSelectedPharmacyId(e.target.value);
                  const firstBranch = MOCK_BRANCHES.find((b) => b.organizationId === e.target.value);
                  if (firstBranch) setSelectedBranchId(firstBranch.id);
                }}
                className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                {MOCK_PHARMACIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <label htmlFor="branch-selector" className="text-[10px] text-gray-400 font-mono uppercase font-semibold">
                Branch:
              </label>
              <select
                id="branch-selector"
                value={activeBranch.id}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                {availableBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name.split('-')[1]?.trim() || b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            <Badge variant="success" size="sm" dot className="hidden xl:inline-flex">
              Single Inventory Active
            </Badge>
          </div>

          {/* Right: Quick POS Counter, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Quick POS Launcher Button */}
            <button
              onClick={() => navigate('/pharmacy/pos')}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors duration-150"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Launch POS Counter</span>
              <span className="sm:hidden">POS</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View notifications"
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-150 border border-gray-200"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-gray-200 shadow-xl py-2 z-30 text-xs">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-gray-900">Branch Notifications</span>
                      <span className="font-mono text-[10px] text-teal-600 font-semibold">2 New</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="p-3 hover:bg-gray-50 flex items-start gap-2.5 transition-colors duration-150">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Low Stock Alert: Augmentin 625mg</p>
                          <p className="text-[11px] text-gray-500">Only 14 units left in Pune Station branch.</p>
                          <span className="font-mono text-[10px] text-gray-400">12 mins ago</span>
                        </div>
                      </div>
                      <div className="p-3 hover:bg-gray-50 flex items-start gap-2.5 transition-colors duration-150">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">New Online Order #MB-2026-8801</p>
                          <p className="text-[11px] text-gray-500">Requires pharmacist prescription review.</p>
                          <span className="font-mono text-[10px] text-gray-400">25 mins ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-left"
              >
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                  SM
                </div>
                <div className="hidden md:block text-xs leading-none">
                  <p className="font-semibold text-gray-900">Dr. Suresh</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">Owner</p>
                </div>
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-xl py-1 z-30 text-xs">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">Dr. Suresh Mehta</p>
                      <p className="text-[11px] text-gray-500">Apothecary Healthcare</p>
                    </div>
                    <Link
                      to="/pharmacy/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      Store Settings
                    </Link>
                    <Link
                      to="/customer"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      Switch to Customer Store
                    </Link>
                    <div className="border-t border-gray-100 pt-1">
                      <Link
                        to="/login"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-3 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        Sign Out
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity duration-150"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-slate-950 text-slate-300 flex flex-col z-10 border-r border-slate-900">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-900">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Pill className="w-5 h-5 text-teal-400" />
                <span>Med Bazar Pharmacy</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150',
                      isActive ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
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
