import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Pill, Search, ShoppingBag, FileText, Package, User as UserIcon, MapPin, Menu, X, ChevronDown, Store } from 'lucide-react';
import { MOCK_BRANCHES } from '@/services/api/mockData';
import { clsx } from 'clsx';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(MOCK_BRANCHES[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Medicines', path: '/customer/medicines', icon: Pill },
    { label: 'Pharmacies', path: '/customer/pharmacies', icon: Store },
    { label: 'Upload Prescription', path: '/customer/prescriptions', icon: FileText },
    { label: 'My Orders', path: '/customer/orders', icon: Package },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/medicines?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Top Banner for Branch context */}
      <div className="bg-brand-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-300 shrink-0" />
            <span className="text-gray-300">Ordering from branch:</span>
            <div className="relative inline-block text-left">
              <select
                value={selectedBranch.id}
                onChange={(e) => {
                  const b = MOCK_BRANCHES.find(item => item.id === e.target.value);
                  if (b) setSelectedBranch(b);
                }}
                className="bg-brand-800 text-white font-medium rounded px-2 py-0.5 border border-brand-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer"
              >
                {MOCK_BRANCHES.map((branch) => (
                  <option key={branch.id} value={branch.id} className="bg-white text-gray-900">
                    {branch.organizationName} ({branch.city} - {branch.name.split('-')[1] || branch.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-gray-300">
            <Link to="/pharmacy" className="hover:text-white transition-colors">Pharmacy Partner Login</Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-white transition-colors">Platform Admin</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/customer" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight block leading-none">
                Med<span className="text-brand-600">Bazar</span>
              </span>
              <span className="text-[10px] text-gray-500 tracking-wider font-semibold uppercase block mt-0.5">Healthcare Marketplace</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines, composition, generic names..."
              className="w-full pl-10 pr-24 py-2 rounded-full border border-gray-300 text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 bottom-1 px-3.5 bg-brand-600 text-white rounded-full text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/customer/cart"
              className="relative p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/customer/profile"
              className="hidden sm:flex items-center gap-2 pl-3 pr-4 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                RS
              </div>
              <span>Rajesh Sharma</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-100 bg-white hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 text-sm">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'py-2.5 flex items-center gap-2 font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-brand-600 text-brand-700 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/customer/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 text-xs py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Pill className="w-5 h-5 text-brand-500" />
              <span>Med Bazar</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Multi-pharmacy marketplace connecting registered local chemist branches directly with verified customers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">Customer Services</h4>
            <ul className="space-y-2">
              <li><Link to="/customer/medicines" className="hover:text-white transition-colors">Search Medicines</Link></li>
              <li><Link to="/customer/prescriptions" className="hover:text-white transition-colors">Upload Prescription</Link></li>
              <li><Link to="/customer/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/customer/pharmacies" className="hover:text-white transition-colors">Find Local Pharmacies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">Pharmacy Partners</h4>
            <ul className="space-y-2">
              <li><Link to="/pharmacy" className="hover:text-white transition-colors">Pharmacy Owner Portal</Link></li>
              <li><Link to="/pharmacy/pos" className="hover:text-white transition-colors">Store POS System</Link></li>
              <li><Link to="/pharmacy/inventory" className="hover:text-white transition-colors">Shared Branch Inventory</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Platform Admin Console</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">Healthcare Compliance</h4>
            <p className="text-gray-400 leading-relaxed">
              Med Bazar strictly enforces mandatory prescription review by registered pharmacists for all Schedule H & H1 medications.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-gray-800 text-center text-gray-500">
          © {new Date().getFullYear()} Med Bazar Platform. All rights reserved. Registered multi-tenant pharmacy infrastructure.
        </div>
      </footer>
    </div>
  );
};
