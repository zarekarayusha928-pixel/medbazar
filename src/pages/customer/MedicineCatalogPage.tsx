import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Pill, Search, SlidersHorizontal, Plus, Check, ArrowRight, MapPin, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Medicine, Category } from '@/types';
import { medicineService } from '@/services/api/medicineService';
import { MOCK_BRANCHES, MOCK_INVENTORY } from '@/services/api/mockData';

export const MedicineCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, selectedBranch, setSelectedBranch } = useCart();
  const { showToast } = useToast();

  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [rxFilter, setRxFilter] = useState<'ALL' | 'RX' | 'OTC'>('ALL');
  const [stockOnly, setStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [activeBranchId, setActiveBranchId] = useState(selectedBranch.id);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync category or query when URL params change
  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || '');
    }
    if (searchParams.get('query')) {
      setQuery(searchParams.get('query') || '');
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      medicineService.searchMedicines(query, selectedCategory),
      medicineService.getCategories()
    ]).then(([meds, cats]) => {
      let filtered = [...meds];

      if (rxFilter === 'RX') {
        filtered = filtered.filter(m => m.prescriptionRequired);
      } else if (rxFilter === 'OTC') {
        filtered = filtered.filter(m => !m.prescriptionRequired);
      }

      if (stockOnly) {
        filtered = filtered.filter(m => {
          const inv = MOCK_INVENTORY.find(i => i.medicineId === m.id && i.branchId === activeBranchId);
          return (inv?.quantity ?? 0) > 0;
        });
      }

      // Sorting
      if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'price_asc') {
        filtered.sort((a, b) => {
          const pA = MOCK_INVENTORY.find(i => i.medicineId === a.id)?.sellingPrice ?? 30;
          const pB = MOCK_INVENTORY.find(i => i.medicineId === b.id)?.sellingPrice ?? 30;
          return pA - pB;
        });
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => {
          const pA = MOCK_INVENTORY.find(i => i.medicineId === a.id)?.sellingPrice ?? 30;
          const pB = MOCK_INVENTORY.find(i => i.medicineId === b.id)?.sellingPrice ?? 30;
          return pB - pA;
        });
      }

      setMedicines(filtered);
      setCategories(cats);
      setLoading(false);
    }).catch(() => {
      setError('Unable to load medications from dispensary network. Please try again.');
      setLoading(false);
    });
  }, [query, selectedCategory, rxFilter, stockOnly, sortBy, activeBranchId]);

  const handleCategoryClick = (catId: string) => {
    const next = selectedCategory === catId ? '' : catId;
    setSelectedCategory(next);
    if (next) {
      setSearchParams(prev => {
        const p = new URLSearchParams(prev);
        p.set('category', next);
        return p;
      });
    } else {
      setSearchParams(prev => {
        const p = new URLSearchParams(prev);
        p.delete('category');
        return p;
      });
    }
  };

  const handleAddToCart = (medicine: Medicine, price: number) => {
    const curBranch = MOCK_BRANCHES.find(b => b.id === activeBranchId) || selectedBranch;
    addToCart(medicine, 1, curBranch, price);
    showToast('Added to Cart', `${medicine.name} added from ${curBranch.name.split('-')[1] || curBranch.name}`, 'success');
  };

  const currentBranchObj = MOCK_BRANCHES.find(b => b.id === activeBranchId) || selectedBranch;

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/customer' }, { label: 'Medicine Discovery' }]} />

      {/* Header & Context Title */}
      <div className="border-b border-sand-300 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Pharmaceutical Catalogue</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Discover Medicines & Healthcare Products</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Live prices and verified branch inventory. Prescriptions reviewed by licensed pharmacists.
          </p>
        </div>

        {/* Selected Branch Indicator */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-sand-300 text-xs font-mono">
          <MapPin className="w-4 h-4 text-pine-700 shrink-0" aria-hidden="true" />
          <div>
            <span className="text-[10px] text-gray-400 block uppercase">Fulfillment Branch:</span>
            <label htmlFor="catalog-branch-select" className="sr-only">Select fulfillment branch</label>
            <select
              id="catalog-branch-select"
              value={activeBranchId}
              aria-label="Select fulfillment branch"
              onChange={(e) => {
                setActiveBranchId(e.target.value);
                const b = MOCK_BRANCHES.find(br => br.id === e.target.value);
                if (b) setSelectedBranch(b);
              }}
              className="font-semibold text-gray-800 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
            >
              {MOCK_BRANCHES.map(b => (
                <option key={b.id} value={b.id}>
                  {b.city} — {b.name.split('-')[1] || b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search & Category Discovery Bar */}
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <label htmlFor="catalog-medicine-search" className="sr-only">Search medicines</label>
          <input
            id="catalog-medicine-search"
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setSearchParams(prev => {
                const p = new URLSearchParams(prev);
                if (val) p.set('query', val);
                else p.delete('query');
                return p;
              });
            }}
            placeholder="Search by brand name, generic composition, or salt (e.g. Paracetamol, Metformin, Dolo)..."
            aria-label="Search by brand name, generic composition, or salt"
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-sand-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 hover:border-sand-400 focus:outline-none focus:border-pine-600 focus-visible:ring-2 focus-visible:ring-brand-500 font-sans shadow-sm"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
              selectedCategory === ''
                ? 'bg-pine-700 text-white font-semibold shadow-sm'
                : 'bg-white border border-sand-300 text-gray-700 hover:border-sand-400 hover:bg-sand-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategoryClick(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                selectedCategory === c.id
                  ? 'bg-pine-700 text-white font-semibold shadow-sm'
                  : 'bg-white border border-sand-300 text-gray-700 hover:border-sand-400 hover:bg-sand-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Refined Filters Row */}
        <div className="bg-sand-100 p-3 sm:p-4 rounded-lg border border-sand-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Rx Filter Toggle */}
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-gray-500 font-medium">Type:</span>
              <div className="inline-flex rounded-lg border border-sand-300 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setRxFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    rxFilter === 'ALL' ? 'bg-pine-700 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setRxFilter('OTC')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    rxFilter === 'OTC' ? 'bg-pine-700 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  OTC Only
                </button>
                <button
                  type="button"
                  onClick={() => setRxFilter('RX')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    rxFilter === 'RX' ? 'bg-pine-700 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rx Only
                </button>
              </div>
            </div>

            {/* In-Stock Only */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="rounded border-sand-300 text-pine-700 focus:ring-pine-600 w-3.5 h-3.5"
              />
              <span className="font-medium text-gray-700">In-Stock Only</span>
            </label>
          </div>

          {/* Sort By & Count */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-gray-500">
              {medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'} found
            </span>
            <label htmlFor="catalog-sort-select" className="sr-only">Sort medicines</label>
            <select
              id="catalog-sort-select"
              value={sortBy}
              aria-label="Sort medicines"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs font-sans text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <option value="featured">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicine Cards Grid */}
      {loading ? (
        <LoadingState message="Accessing verified pharmacy inventory..." />
      ) : error ? (
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-red-600" />}
          title="Failed to load catalogue"
          description={error}
          actionLabel="Retry"
          onAction={() => {
            setQuery(query);
          }}
        />
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={<Pill className="w-8 h-8 text-pine-700" />}
          title="No medicines match your criteria"
          description="Try clearing search filters or switching your preferred dispensing branch."
          actionLabel="Reset Filters"
          onAction={() => {
            setQuery('');
            setSelectedCategory('');
            setRxFilter('ALL');
            setStockOnly(false);
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.map((med) => {
            const inventory = MOCK_INVENTORY.find(
              (i) => i.medicineId === med.id && i.branchId === activeBranchId
            ) || MOCK_INVENTORY.find((i) => i.medicineId === med.id);

            const price = inventory?.sellingPrice || 32.50;
            const inStock = (inventory?.quantity ?? 0) > 0;

            return (
              <div
                key={med.id}
                className="bg-white rounded-lg border border-sand-300 hover:border-sand-400 p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm group"
              >
                <div className="space-y-3.5">
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

                  {/* Medicine Name & Composition */}
                  <div>
                    <Link
                      to={`/customer/medicines/${med.id}`}
                      className="font-bold text-gray-900 text-base group-hover:text-pine-700 transition-colors line-clamp-1"
                    >
                      {med.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1 font-sans space-y-0.5">
                      <p className="line-clamp-1">
                        <span className="text-gray-400">Composition:</span>{' '}
                        <span className="text-gray-800 font-medium">{med.composition || med.genericName}</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Brand: <span className="text-gray-600">{med.brand}</span> • Mfr: {med.manufacturer}
                      </p>
                    </div>
                  </div>

                  {/* Branch & Availability Information */}
                  <div className="pt-2 border-t border-sand-200 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-600 truncate max-w-[160px] inline-flex items-center gap-1" title={currentBranchObj.name}>
                      <MapPin className="w-3 h-3 text-pine-700 shrink-0" />
                      <span>{currentBranchObj.name.split('-')[1] || currentBranchObj.name}</span>
                    </span>
                    <span className={inStock ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {inStock ? `In Stock (${inventory?.quantity} units)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Price and Add to Cart */}
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
                      onClick={() => handleAddToCart(med, price)}
                      disabled={!inStock}
                      aria-label={`Add ${med.name} to cart`}
                      className="bg-pine-700 hover:bg-pine-800 disabled:bg-sand-200 disabled:text-gray-400 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      title="Add to cart"
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
      )}
    </div>
  );
};
