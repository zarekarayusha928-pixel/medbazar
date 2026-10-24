import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Store, ShieldCheck, ShoppingBag, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MockModeToggle } from '@/components/ui/MockModeToggle';

export const PortalLauncherPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-5xl mx-auto w-full space-y-10 my-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 text-slate-950 flex items-center justify-center mx-auto shadow-sm">
            <Pill className="w-10 h-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Med<span className="text-brand-400">Bazar</span> Platform
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Multi-Tenant Pharmacy Management & Customer Marketplace Infrastructure
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs text-teal-300">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Single Branch Inventory Rule Enforced Across Online & POS</span>
          </div>
        </div>

        {/* 3 Portals Launcher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Portal */}
          <Link to="/customer" className="group">
            <Card className="bg-slate-800 border-slate-700 hover:border-brand-500 transition-colors duration-150 h-full">
              <CardBody className="p-6 space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-brand-400 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <Badge variant="brand" size="sm">Marketplace Application</Badge>
                  <h2 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                    Customer Marketplace
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Search medicines, select branch stores, upload prescriptions, checkout online orders, and track deliveries.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-brand-400 font-bold text-xs">
                  <span>Launch Customer App</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardBody>
            </Card>
          </Link>

          {/* Pharmacy Management Portal */}
          <Link to="/pharmacy" className="group">
            <Card className="bg-slate-800 border-slate-700 hover:border-pine-600 transition-colors duration-150 h-full">
              <CardBody className="p-6 space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <Badge variant="success" size="sm">Pharmacy & POS Operations</Badge>
                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Pharmacy Management & POS
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Manage online order queue, offline counter POS sales, single branch inventory, pharmacist Rx review, and reports.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-emerald-400 font-bold text-xs">
                  <span>Open Pharmacy Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardBody>
            </Card>
          </Link>

          {/* Platform Admin Portal */}
          <Link to="/admin" className="group">
            <Card className="bg-slate-800 border-slate-700 hover:border-brand-500 transition-colors duration-150 h-full">
              <CardBody className="p-6 space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <Badge variant="brand" size="sm">Superadmin Console</Badge>
                  <h2 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                    Platform Administration
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pharmacy onboarding & licensing verification, branch network directory, global medicine catalogue, and analytics.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-brand-400 font-bold text-xs">
                  <span>Open Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>

        {/* Global API Environment & Mock Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <span className="text-xs text-slate-400">Data Source Mode:</span>
          <MockModeToggle showApiUrl />
        </div>
      </div>

      <div className="text-center text-slate-500 text-xs pt-8">
        Med Bazar Healthcare Platform — Multi-Tenant Pharmacy Infrastructure
      </div>
    </div>
  );
};
