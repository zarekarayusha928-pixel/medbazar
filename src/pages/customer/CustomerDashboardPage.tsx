import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  ShieldCheck,
  Clock,
  Store,
  MapPin,
  Pill,
  ArrowRight,
  CheckCircle,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Medicine, Category } from '@/types';
import { medicineService } from '@/services/api/medicineService';
import { MOCK_BRANCHES, MOCK_INVENTORY, MOCK_PHARMACIES } from '@/services/api/mockData';

export const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, selectedBranch, setSelectedBranch } = useCart();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroBranchId, setHeroBranchId] = useState(selectedBranch.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      medicineService.getCategories(),
      medicineService.getAllMedicines()
    ])
      .then(([cats, meds]) => {
        setCategories(cats);
        setFeaturedMedicines(meds.slice(0, 6));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load medicine catalogue. Please verify connection.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const branchMatch = MOCK_BRANCHES.find(b => b.id === heroBranchId);
    if (branchMatch && branchMatch.id !== selectedBranch.id) {
      setSelectedBranch(branchMatch);
    }
    const queryParam = heroSearch.trim() ? `?query=${encodeURIComponent(heroSearch.trim())}` : '';
    navigate(`/customer/medicines${queryParam}`);
  };

  const handleQuickAdd = (medicine: Medicine, price: number) => {
    addToCart(medicine, 1, selectedBranch, price);
    showToast('Added to Cart', `${medicine.name} added to your cart`, 'success');
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <LoadingState message="Connecting to verified branch dispensary network..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Editorial Hero Section */}
      <section className="bg-sand-100 rounded-lg border border-sand-300 p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        <div className="max-w-3xl space-y-5 sm:space-y-6 relative z-10">
          {/* Small Mono Metadata */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200 border border-sand-300 text-pine-800 text-[11px] font-mono tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-pine-700 animate-pulse" aria-hidden="true" />
            Verified Dispensary Network • Real-Time Inventory
          </div>

          {/* Pharmacy-focused Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
            Genuine medicines from <span className="text-pine-700">verified local pharmacies</span>.
          </h1>

          <p className="text-xs sm:text-base text-gray-600 leading-relaxed max-w-2xl">
            Med Bazar synchronizes offline pharmacy stock with online availability. 
            Choose your community branch, upload valid prescriptions, and receive genuine batch-verified medications via fast doorstep delivery or store pickup.
          </p>

          {/* Integrated Search & Location Bar */}
          <form
            onSubmit={handleHeroSearch}
            role="search"
            className="bg-white p-2.5 sm:p-3 rounded-lg border border-sand-300 shadow-sm flex flex-col md:flex-row items-stretch gap-2.5 sm:gap-3"
          >
            {/* Search Input */}
            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" aria-hidden="true" />
              <label htmlFor="hero-medicine-search" className="sr-only">Search medicines, brand or salt</label>
              <input
                id="hero-medicine-search"
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search by medicine, brand, or salt (e.g. Paracetamol, Augmentin)..."
                aria-label="Search by medicine, brand, or salt"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg font-sans"
              />
            </div>

            <div className="h-px md:h-8 md:w-px bg-sand-200 my-auto hidden md:block" />

            {/* Location / Branch Selector */}
            <div className="relative flex items-center w-full md:min-w-[210px]">
              <MapPin className="w-4 h-4 text-pine-700 absolute left-3.5 shrink-0" aria-hidden="true" />
              <label htmlFor="hero-branch-selector" className="sr-only">Select fulfillment branch</label>
              <select
                id="hero-branch-selector"
                value={heroBranchId}
                onChange={(e) => {
                  setHeroBranchId(e.target.value);
                  const matched = MOCK_BRANCHES.find(b => b.id === e.target.value);
                  if (matched) setSelectedBranch(matched);
                }}
                aria-label="Select fulfillment branch"
                className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm text-gray-800 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 appearance-none cursor-pointer font-sans truncate"
              >
                {MOCK_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.city} — {b.name.split('-')[1] || b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Pine CTA */}
            <button
              type="submit"
              className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 shrink-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span>Find Medicines</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Quick Shortcuts & Metadata Counters */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-500 font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-pine-700" />
              <span>100% Licensed Chemists</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-pine-700" />
              <span>Real-time Branch Inventory</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/customer/prescriptions" className="text-pine-700 font-semibold hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Doctor Prescription</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle Watermark Art */}
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none hidden lg:block">
          <Pill className="w-96 h-96 text-pine-900" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="space-y-5">
        <div className="flex items-end justify-between border-b border-sand-300 pb-3">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 block">Therapeutic Categories</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">Explore by Health Requirement</h2>
          </div>
          <Link
            to="/customer/medicines"
            className="text-xs font-semibold text-pine-700 hover:text-pine-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/customer/medicines?category=${cat.id}`}
              className="p-3.5 sm:p-4 rounded-lg bg-white border border-sand-300 hover:border-pine-600 hover:shadow-sm transition-all duration-150 group flex flex-col justify-between"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sand-100 group-hover:bg-pine-50 text-pine-700 flex items-center justify-center transition-colors">
                <Pill className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm group-hover:text-pine-800 transition-colors">
                  {cat.name}
                </h3>
                <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 block">
                  {cat.medicineCount} products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Medicines (Discovery Grid) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-sand-300 pb-3">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500 block">Verified Inventory</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">Popular Medications & Supplies</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Dispensing from: <strong>{selectedBranch.name}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredMedicines.map((med) => {
            const inventory = MOCK_INVENTORY.find(
              (i) => i.medicineId === med.id && i.branchId === selectedBranch.id
            ) || MOCK_INVENTORY.find((i) => i.medicineId === med.id);

            const price = inventory?.sellingPrice || 32.50;
            const inStock = (inventory?.quantity ?? 0) > 0;

            return (
              <div
                key={med.id}
                className="bg-white rounded-lg border border-sand-300 hover:border-sand-400 p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={med.prescriptionRequired ? 'warning' : 'success'}
                      size="sm"
                    >
                      {med.prescriptionRequired ? 'Rx Required' : 'Over The Counter'}
                    </Badge>
                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                      {med.dosageForm} • {med.strength}
                    </span>
                  </div>

                  {/* Title & Generic Composition */}
                  <div>
                    <Link
                      to={`/customer/medicines/${med.id}`}
                      className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-pine-700 transition-colors line-clamp-1"
                    >
                      {med.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-sans">
                      Salt: <span className="text-gray-700 font-medium">{med.genericName}</span>
                    </p>
                  </div>

                  {/* Branch & Availability Tag */}
                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-gray-500 border-t border-sand-200">
                    <span className="truncate max-w-[170px] inline-flex items-center gap-1" title={selectedBranch.name}>
                      <MapPin className="w-3 h-3 text-pine-700 shrink-0" />
                      <span>{selectedBranch.name.split('-')[1] || selectedBranch.name}</span>
                    </span>
                    <span className={inStock ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {inStock ? `In Stock (${inventory?.quantity} units)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="mt-5 pt-4 border-t border-sand-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-gray-400 line-through mr-1.5">
                      ₹{(price * 1.15).toFixed(2)}
                    </span>
                    <span className="text-lg font-bold text-gray-900 font-sans">
                      ₹{price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customer/medicines/${med.id}`}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-sand-300 hover:bg-sand-50 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleQuickAdd(med, price)}
                      disabled={!inStock}
                      aria-label={`Add ${med.name} to shopping cart`}
                      className="bg-pine-700 hover:bg-pine-800 disabled:bg-sand-200 disabled:text-gray-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      title="Add to shopping cart"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Restrained Pharmacy Network Preview */}
      <section className="bg-white rounded-lg border border-sand-300 p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-pine-800 block">Verified Healthcare Network</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">Participating Community Pharmacies</h2>
            <p className="text-xs text-gray-500 mt-1">
              Every order is dispensed by licensed pharmacists operating licensed retail establishments.
            </p>
          </div>
          <Link
            to="/customer/pharmacies"
            className="text-xs font-semibold text-pine-700 hover:text-pine-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Compare All Pharmacies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_PHARMACIES.map((pharm) => (
            <div
              key={pharm.id}
              className="p-4 sm:p-5 rounded-lg bg-sand-50 border border-sand-300 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-gray-500 uppercase">
                    Reg #{pharm.licenseNumber}
                  </span>
                  <Badge variant="success" size="sm" dot>Verified</Badge>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mt-2">{pharm.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{pharm.legalName}</p>
              </div>

              <div className="pt-3 border-t border-sand-200 flex items-center justify-between text-xs font-mono text-gray-600">
                <span>{pharm.branchCount} Active Branches</span>
                <Link
                  to="/customer/pharmacies"
                  className="text-pine-700 font-semibold hover:underline"
                >
                  View Locations →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Quality Assurance */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 sm:p-6 rounded-lg bg-white border border-sand-300 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-sand-100 text-pine-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <h4 className="font-bold text-gray-900 text-sm">Genuine & Batch Verified</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            All medicines are procured from certified distributors and maintained with digital batch traceability.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-lg bg-white border border-sand-300 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-sand-100 text-pine-700 flex items-center justify-center">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h4 className="font-bold text-gray-900 text-sm">Fast Prescription Review</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Registered pharmacists review Schedule H prescription uploads within minutes before packing.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-lg bg-white border border-sand-300 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-sand-100 text-pine-700 flex items-center justify-center">
            <Store className="w-5 h-5" aria-hidden="true" />
          </div>
          <h4 className="font-bold text-gray-900 text-sm">Doorstep Delivery or Pickup</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Flexible fulfillment: quick home dispatch from your neighborhood branch or counter pickup at zero fee.
          </p>
        </div>
      </section>
    </div>
  );
};
