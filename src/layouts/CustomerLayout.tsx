import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Pill,
  Search,
  ShoppingBag,
  FileText,
  Package,
  User as UserIcon,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Store,
  Home as HomeIcon,
  Check
} from 'lucide-react';
import { MOCK_BRANCHES } from '@/services/api/mockData';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, selectedBranch, setSelectedBranch } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Home', path: '/customer', icon: HomeIcon, exact: true },
    { label: 'Medicines', path: '/customer/medicines', icon: Pill },
    { label: 'Pharmacies', path: '/customer/pharmacies', icon: Store },
    { label: 'Orders', path: '/customer/orders', icon: Package },
    { label: 'Prescriptions', path: '/customer/prescriptions', icon: FileText },
    { label: 'Profile', path: '/customer/profile', icon: UserIcon },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/medicines?query=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isLinkActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand-50 text-gray-900 font-sans antialiased">
      {/* Platform Context Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-400">
              Verified Healthcare Marketplace • Real-Time Branch Inventory
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <Link to="/pharmacy" className="hover:text-white transition-colors duration-150">
              Pharmacy Partner Portal
            </Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-white transition-colors duration-150">
              Platform Admin Console
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo / Med Bazar Wordmark */}
          <Link to="/customer" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-brand-700 transition-colors duration-150">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight block leading-none">
                Med<span className="text-brand-600">Bazar</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase block mt-0.5">
                Pharmacy Marketplace
              </span>
            </div>
          </Link>

          {/* Location Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50/80 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-150 text-left"
              title="Change dispensing branch location"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <div className="hidden sm:block text-xs leading-tight">
                <span className="text-[10px] text-gray-400 block font-mono uppercase">Branch:</span>
                <span className="font-semibold text-gray-800 line-clamp-1 max-w-[130px]">
                  {selectedBranch.city} - {selectedBranch.name.split('-')[1] || selectedBranch.name}
                </span>
              </div>
              <span className="sm:hidden text-xs font-semibold text-gray-800 line-clamp-1 max-w-[80px]">
                {selectedBranch.city}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {locationDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setLocationDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white border border-gray-200 shadow-lg py-2 z-30 text-xs">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-gray-500 font-mono text-[10px] uppercase font-semibold">
                    Select Participating Branch
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {MOCK_BRANCHES.map((b) => {
                      const isSelected = b.id === selectedBranch.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedBranch(b);
                            setLocationDropdownOpen(false);
                          }}
                          className={clsx(
                            'w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-start justify-between gap-2 transition-colors duration-150',
                            isSelected && 'bg-teal-50/60'
                          )}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{b.name}</p>
                            <p className="text-[11px] text-gray-500">{b.address}, {b.city}</p>
                            <span className="font-mono text-[10px] text-brand-700 font-medium">
                              Open: {b.operatingHours || 'Standard hours'}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Medicine Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines, composition, or brand..."
              className="w-full pl-9 pr-20 py-2 rounded-full border border-gray-300 text-xs font-sans bg-gray-50/70 hover:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all duration-150"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-brand-600 text-white rounded-full text-xs font-semibold hover:bg-brand-700 transition-colors duration-150"
            >
              Search
            </button>
          </form>

          {/* Right Actions: Orders, Cart, Account, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Orders link */}
            <Link
              to="/customer/orders"
              className={clsx(
                'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150',
                isLinkActive('/customer/orders')
                  ? 'border-brand-300 bg-teal-50 text-brand-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/customer/cart"
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 flex items-center gap-2"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-gray-700 shrink-0" />
              <span className="hidden sm:inline text-xs font-semibold text-gray-800">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-brand-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Link */}
            <Link
              to="/customer/profile"
              className={clsx(
                'hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 border rounded-full transition-colors duration-150 text-xs font-medium',
                isLinkActive('/customer/profile')
                  ? 'border-brand-300 bg-teal-50 text-brand-800'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">
                RS
              </div>
              <span className="font-semibold text-gray-800">Rajesh</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation - Clean and Restrained */}
        <div className="border-t border-gray-100 bg-white hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-7 text-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path, link.exact);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'py-2.5 flex items-center gap-2 font-medium border-b-2 transition-colors duration-150',
                    active
                      ? 'border-brand-600 text-brand-700 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs font-sans"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.path, link.exact);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150',
                      active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-600 font-semibold hover:underline"
              >
                Sign In / Switch Account
              </Link>
              <Link
                to="/pharmacy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 font-mono text-[11px] hover:text-gray-900"
              >
                Pharmacy Portal →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 px-3 py-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1 text-center">
          <Link
            to="/customer"
            className={clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium py-1',
              isLinkActive('/customer', true) ? 'text-brand-600 font-bold' : 'text-gray-500'
            )}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link
            to="/customer/medicines"
            className={clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium py-1',
              isLinkActive('/customer/medicines') ? 'text-brand-600 font-bold' : 'text-gray-500'
            )}
          >
            <Pill className="w-4 h-4" />
            <span>Catalogue</span>
          </Link>
          <Link
            to="/customer/orders"
            className={clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium py-1',
              isLinkActive('/customer/orders') ? 'text-brand-600 font-bold' : 'text-gray-500'
            )}
          >
            <Package className="w-4 h-4" />
            <span>Orders</span>
          </Link>
          <Link
            to="/customer/cart"
            className={clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium py-1 relative',
              isLinkActive('/customer/cart') ? 'text-brand-600 font-bold' : 'text-gray-500'
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-3 w-4 h-4 bg-brand-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
            <span>Cart</span>
          </Link>
          <Link
            to="/customer/profile"
            className={clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium py-1',
              isLinkActive('/customer/profile') ? 'text-brand-600 font-bold' : 'text-gray-500'
            )}
          >
            <UserIcon className="w-4 h-4" />
            <span>Account</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
              <Pill className="w-5 h-5 text-teal-400" />
              <span>Med Bazar</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Professional multi-pharmacy infrastructure connecting verified local chemists directly with patients.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Customer Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/customer/medicines" className="hover:text-white transition-colors duration-150">Search Medicines</Link></li>
              <li><Link to="/customer/prescriptions" className="hover:text-white transition-colors duration-150">Prescription Upload</Link></li>
              <li><Link to="/customer/orders" className="hover:text-white transition-colors duration-150">Track Live Orders</Link></li>
              <li><Link to="/customer/pharmacies" className="hover:text-white transition-colors duration-150">Participating Chemist Branches</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Healthcare Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/pharmacy" className="hover:text-white transition-colors duration-150">Pharmacy Partner Console</Link></li>
              <li><Link to="/pharmacy/pos" className="hover:text-white transition-colors duration-150">Counter POS Terminal</Link></li>
              <li><Link to="/pharmacy/inventory" className="hover:text-white transition-colors duration-150">Real-time Batch Stock</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors duration-150">Platform Administration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Compliance & Quality</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Med Bazar mandates licensed pharmacist verification for all Schedule H & H1 medications. All sales comply with State Pharmacy Regulations.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900 text-center font-mono text-[11px] text-slate-500">
          © {new Date().getFullYear()} Med Bazar Platform. Registered healthcare multi-tenant infrastructure.
        </div>
      </footer>
    </div>
  );
};
