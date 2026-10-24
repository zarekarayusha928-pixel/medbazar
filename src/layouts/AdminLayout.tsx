import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building,
  GitBranch,
  Users,
  Pill,
  BarChart,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';
import { MockModeToggle } from '@/components/ui/MockModeToggle';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: ShieldCheck },
    { label: 'Pharmacies', path: '/admin/pharmacies', icon: Building },
    { label: 'Branches', path: '/admin/branches', icon: GitBranch },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Medicines', path: '/admin/medicines', icon: Pill },
    { label: 'Reports', path: '/admin/reports', icon: BarChart },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-sand-50 text-gray-900 font-sans antialiased">
      {/* Accessible skip link */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:shadow-sm font-semibold text-xs focus:outline-none"
      >
        Skip to admin control center
      </a>

      {/* Sidebar - Desktop */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-slate-950 text-slate-300 border-r border-slate-900 transition-all duration-150 z-30 fixed inset-y-0 left-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-900 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-extrabold text-white tracking-tight text-sm leading-none">
                  Med<span className="text-brand-400">Bazar</span>
                </h1>
                <span className="text-[10px] text-brand-400 font-mono font-bold uppercase tracking-wider block mt-1">
                  Platform Admin
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-900 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <ChevronLeft
              className={clsx('w-4 h-4 transition-transform duration-150', sidebarCollapsed && 'rotate-180')}
            />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center justify-between text-xs text-slate-400">
            {!sidebarCollapsed && <span className="font-mono text-[10px]">Superadmin Mode</span>}
            <Link
              to="/customer"
              title="Exit Admin to Customer Store"
              className="hover:text-white flex items-center gap-1 transition-colors duration-150 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Exit</span>}
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
        <header className="h-16 bg-white border-b border-sand-300 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation sidebar"
              className="lg:hidden p-2 text-gray-600 hover:bg-sand-100 rounded-lg border border-sand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Platform Control Center</h2>
            <Badge variant="brand" size="sm" className="hidden sm:inline-flex">
              Multi-tenant Core
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <button 
              aria-label="Platform alerts"
              className="p-2 text-gray-500 hover:bg-sand-100 rounded-lg relative border border-sand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />
            </button>
            <MockModeToggle />
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-sand-100 border border-sand-200 px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px] font-mono">
                A
              </div>
              <span className="hidden sm:inline">Platform Superadmin</span>
            </div>
          </div>
        </header>

        <main id="admin-main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-slate-950 text-slate-300 flex flex-col z-10 border-r border-slate-900">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-900">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                <span>Med Bazar Admin</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} aria-label="Close mobile sidebar" className="text-slate-400 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      isActive ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-900'
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
