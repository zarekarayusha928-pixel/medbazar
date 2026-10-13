import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PHARMACIES, MOCK_BRANCHES } from '@/services/api/mockData';

export const PharmacyListPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranch, setSelectedBranch } = useCart();
  const { showToast } = useToast();

  const [cityFilter, setCityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const branchesWithPharmacy = MOCK_BRANCHES.map(branch => {
    const pharm = MOCK_PHARMACIES.find(p => p.id === branch.organizationId);
    return {
      ...branch,
      pharmacy: pharm
    };
  });

  const filteredBranches = branchesWithPharmacy.filter(b => {
    if (cityFilter !== 'ALL' && b.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        (b.pharmacy?.name.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const handleSelectBranch = (branch: typeof MOCK_BRANCHES[0]) => {
    setSelectedBranch(branch);
    showToast('Active Branch Selected', `Orders will be fulfilled from ${branch.name}`, 'success');
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/customer' }, { label: 'Participating Pharmacies' }]} />

      {/* Header */}
      <div className="border-b border-sand-300 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Verified Dispensaries</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Participating Pharmacy Network</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Compare licensed partner pharmacies and physical branches. Select your dispensing chemist for transparent pricing and stock verification.
          </p>
        </div>

        {/* Selected Branch Status */}
        <div className="bg-sand-100 border border-sand-300 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-mono">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 block uppercase">Currently Dispensing From:</span>
            <span className="font-bold text-gray-900">{selectedBranch.name}</span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-sand-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pharmacy name, area, or branch street..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs text-gray-900 focus:outline-none focus:border-pine-600 font-sans"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 font-sans">
          <span className="text-gray-500 font-medium">City:</span>
          {['ALL', 'Pune', 'Mumbai'].map(c => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                cityFilter === c ? 'bg-pine-700 text-white' : 'bg-sand-100 text-gray-700 hover:bg-sand-200'
              }`}
            >
              {c === 'ALL' ? 'All Cities' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Comparison / List Structure (No card overload) */}
      <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sand-100 text-gray-700 font-mono text-[11px] uppercase tracking-wider border-b border-sand-300">
                <th className="py-3.5 px-5 font-bold">Pharmacy & Enterprise</th>
                <th className="py-3.5 px-5 font-bold">Branch & Location</th>
                <th className="py-3.5 px-5 font-bold">Operating Hours</th>
                <th className="py-3.5 px-5 font-bold">Fulfillment & Pricing</th>
                <th className="py-3.5 px-5 font-bold text-right">Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {filteredBranches.map((item) => {
                const isSelected = item.id === selectedBranch.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-sand-50/90 font-medium' : 'hover:bg-sand-50/40'
                    }`}
                  >
                    {/* Pharmacy Info */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm font-sans">{item.pharmacy?.name}</span>
                          <Badge variant="success" size="sm" dot>Verified</Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 font-sans">{item.pharmacy?.legalName}</p>
                        <p className="font-mono text-[10px] text-gray-400">
                          License: {item.pharmacy?.licenseNumber}
                        </p>
                      </div>
                    </td>

                    {/* Branch Location */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 font-sans">{item.name}</p>
                        <p className="text-gray-600 flex items-start gap-1 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-pine-700 shrink-0 mt-0.5" />
                          <span>{item.address}, {item.city} - {item.pincode}</span>
                        </p>
                        <p className="font-mono text-[11px] text-gray-400">Tel: {item.phone}</p>
                      </div>
                    </td>

                    {/* Availability / Operating Hours */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold font-mono">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.operatingHours || '08:00 AM - 11:00 PM'}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
                          Ready for Online Dispatch
                        </span>
                      </div>
                    </td>

                    {/* Pricing & Fulfillment */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 font-sans">Delivery: ₹40.00</p>
                        <p className="text-emerald-700 font-mono text-[11px] font-semibold">
                          Free for orders over ₹500
                        </p>
                        <p className="text-[11px] text-gray-500 font-sans">Store Pickup: Free (0 min wait)</p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        {isSelected ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pine-700 text-white font-mono text-[11px] font-bold shadow-2xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Active Dispenser</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectBranch(item)}
                            className="px-3.5 py-1.5 rounded-xl border border-sand-300 hover:border-pine-700 bg-white hover:bg-pine-50 text-pine-800 font-semibold text-xs transition-colors shadow-2xs"
                          >
                            Select Branch
                          </button>
                        )}

                        <Link
                          to={`/customer/medicines`}
                          className="text-[11px] text-gray-500 hover:text-pine-800 font-semibold flex items-center gap-1 mt-0.5"
                        >
                          <span>Browse Stock</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Guarantee Footnote */}
      <div className="bg-sand-100 rounded-2xl border border-sand-300 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-pine-700 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900">Guaranteed Compliance & Retail Pharmacy Security</h4>
            <p className="text-gray-600 mt-0.5">
              All listed branches are registered retail premises with on-duty licensed pharmacists maintaining real-time digital batch ledgers.
            </p>
          </div>
        </div>

        <Link
          to="/customer/medicines"
          className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shrink-0 shadow-2xs"
        >
          View All Medicines
        </Link>
      </div>
    </div>
  );
};
