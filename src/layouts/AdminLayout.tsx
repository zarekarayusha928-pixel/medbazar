import React from 'react';
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
  Bell
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const adminNav = [
    { label: 'Platform Overview', path: '/admin', icon: ShieldCheck },
    { label: 'Pharmacy Management', path: '/admin/pharmacies', icon: Building, badge: '3' },
    { label: 'Branch Network', path: '/admin/branches', icon: GitBranch },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Global Medicine Catalogue', path: '/admin/medicines', icon: Pill },
    { label: 'Platform Analytics', path: '/admin/reports', icon: BarChart },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 border-r border-slate-900 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-900">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-base leading-none">Med Bazar</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-1">Platform Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : 'text-slate-400')} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Admin Session Active</span>
            <Link to="/customer" className="hover:text-white flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              Exit
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">Platform Control Center</h2>
            <Badge variant="brand" size="sm">Superadmin Mode</Badge>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                A
              </div>
              <span>Platform System Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
