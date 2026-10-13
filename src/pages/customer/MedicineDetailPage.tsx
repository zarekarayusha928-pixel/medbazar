import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  ShieldAlert,
  CheckCircle2,
  Store,
  ArrowLeft,
  Plus,
  Minus,
  MapPin,
  Clock,
  Building2,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';
import { Medicine, Branch } from '@/types';
import { medicineService } from '@/services/api/medicineService';
import { MOCK_INVENTORY, MOCK_BRANCHES, MOCK_PHARMACIES } from '@/services/api/mockData';

export const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, selectedBranch, setSelectedBranch } = useCart();
  const { showToast } = useToast();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeBranch, setActiveBranch] = useState<Branch>(selectedBranch);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    medicineService.getMedicineById(id).then((med) => {
      setMedicine(med || null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    setActiveBranch(selectedBranch);
  }, [selectedBranch]);

  if (loading) return <LoadingState message="Retrieving medicine monograph & pharmacy stock..." />;
  if (!medicine) return <ErrorState message="Medicine product not found" onRetry={() => navigate('/customer/medicines')} />;

  // Find all inventory items for this medicine across all registered branches
  const inventoriesForMedicine = MOCK_INVENTORY.filter(inv => inv.medicineId === medicine.id);
  
  // Current active branch stock
  const currentBranchStock = inventoriesForMedicine.find(inv => inv.branchId === activeBranch.id) 
    || inventoriesForMedicine[0];

  const currentPrice = currentBranchStock?.sellingPrice || 32.50;
  const inStock = (currentBranchStock?.quantity ?? 0) > 0;

  const handleAddToCart = () => {
    addToCart(medicine, qty, activeBranch, currentPrice);
    showToast('Added to Cart', `${qty}x ${medicine.name} added from ${activeBranch.name.split('-')[1] || activeBranch.name}`, 'success');
  };

  const handleSelectBranch = (branchId: string) => {
    const b = MOCK_BRANCHES.find(br => br.id === branchId);
    if (b) {
      setActiveBranch(b);
      setSelectedBranch(b);
      showToast('Branch Switched', `Now dispensing from ${b.name}`, 'info');
    }
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/customer' },
          { label: 'Medicines', href: '/customer/medicines' },
          { label: medicine.name }
        ]}
      />

      <Link
        to="/customer/medicines"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-pine-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to pharmaceutical catalogue</span>
      </Link>

      {/* Main Two-Column Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Monograph, Composition, Available Pharmacies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Monograph Card */}
          <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={medicine.prescriptionRequired ? 'warning' : 'success'}>
                    {medicine.prescriptionRequired ? 'Prescription (Rx) Required' : 'Over The Counter (OTC)'}
                  </Badge>
                  <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                    {medicine.dosageForm} • {medicine.strength}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  {medicine.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Active Salt / Composition: <span className="font-semibold text-gray-900">{medicine.genericName}</span>
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-sand-100 text-pine-700 flex items-center justify-center shrink-0">
                <Pill className="w-8 h-8" />
              </div>
            </div>

            {/* Prescription Requirement Box */}
            {medicine.prescriptionRequired ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-bold">Prescription Review Required Before Dispensing</p>
                  <p className="text-amber-800">
                    This medication is governed by Schedule H drug regulations. You will be prompted to upload a valid doctor prescription at checkout. A registered pharmacist at your selected branch will verify the dosage before preparation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">Over-The-Counter Medicine (OTC)</p>
                  <p className="text-emerald-800 mt-0.5">
                    No doctor prescription is required. Genuine sealed pack dispensed directly from licensed store stock.
                  </p>
                </div>
              </div>
            )}

            {/* Technical Specifications / Composition Breakdown */}
            <div className="border border-sand-300 rounded-2xl overflow-hidden text-xs">
              <div className="bg-sand-100 px-4 py-2.5 font-bold text-gray-800 border-b border-sand-300 font-mono uppercase tracking-wider text-[11px]">
                Technical & Composition Specifications
              </div>
              <div className="divide-y divide-sand-200 bg-white">
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Composition</span>
                  <span className="col-span-2 font-semibold text-gray-900">{medicine.composition || medicine.genericName}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Dosage Form</span>
                  <span className="col-span-2 font-semibold text-gray-900">{medicine.dosageForm}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Strength</span>
                  <span className="col-span-2 font-semibold text-gray-900">{medicine.strength}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Brand / Marketer</span>
                  <span className="col-span-2 font-semibold text-gray-900">{medicine.brand}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Manufacturer</span>
                  <span className="col-span-2 font-semibold text-gray-900">{medicine.manufacturer}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Category</span>
                  <span className="col-span-2 font-semibold text-gray-900">{medicine.categoryName}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-3">
                  <span className="text-gray-500 font-medium">Batch Barcode</span>
                  <span className="col-span-2 font-mono text-gray-700">{medicine.barcode || '8901234567890'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Pharmacies / Clean Comparison List */}
          <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-pine-800 block">Branch Stock Comparison</span>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">Available Participating Pharmacies</h3>
              <p className="text-xs text-gray-500">
                Compare prices and real-time inventory at registered pharmacy locations stocking this item.
              </p>
            </div>

            <div className="border border-sand-300 rounded-2xl overflow-hidden divide-y divide-sand-200">
              {inventoriesForMedicine.length === 0 ? (
                <div className="p-4 text-xs text-gray-500 text-center">
                  Currently out of stock at registered branches.
                </div>
              ) : (
                inventoriesForMedicine.map((inv) => {
                  const branch = MOCK_BRANCHES.find(b => b.id === inv.branchId);
                  const isCurrent = activeBranch.id === inv.branchId;

                  return (
                    <div
                      key={inv.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isCurrent ? 'bg-sand-50/80' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{inv.branchName}</span>
                          {isCurrent && (
                            <Badge variant="brand" size="sm">Selected</Badge>
                          )}
                        </div>
                        <p className="text-gray-500 flex items-center gap-1 font-mono text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{branch?.city} • {branch?.address}</span>
                        </p>
                        <p className="text-emerald-700 font-semibold font-mono text-[11px]">
                          ✓ {inv.quantity} units ready in store
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="font-bold text-sm text-gray-900 block font-sans">
                            ₹{inv.sellingPrice.toFixed(2)}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            MRP: ₹{inv.mrp.toFixed(2)}
                          </span>
                        </div>

                        {isCurrent ? (
                          <span className="px-3 py-1.5 rounded-lg bg-pine-100 text-pine-800 font-semibold text-[11px] font-mono">
                            Current Branch
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectBranch(inv.branchId)}
                            className="px-3 py-1.5 rounded-lg border border-sand-300 hover:border-pine-700 text-gray-700 hover:text-pine-800 text-[11px] font-semibold transition-colors"
                          >
                            Switch to this branch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: Price, Quantity, Cart & Branch Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-sand-300 p-6 space-y-6 lg:sticky lg:top-24 shadow-2xs">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400 block">Dispensing Price</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-gray-900 font-sans">
                  ₹{currentPrice.toFixed(2)}
                </span>
                <span className="font-mono text-sm text-gray-400 line-through">
                  ₹{(currentPrice * 1.15).toFixed(2)}
                </span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 font-medium block mt-1">
                Inclusive of all taxes & verified batch tracking
              </span>
            </div>

            {/* Selected Branch Fulfillment Box */}
            <div className="p-3.5 rounded-xl bg-sand-100 border border-sand-300 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-gray-500 uppercase">Dispensing Branch:</span>
                <span className="text-emerald-700 font-bold">
                  {inStock ? 'Available Now' : 'Out of Stock'}
                </span>
              </div>
              <p className="font-bold text-gray-900">{activeBranch.name}</p>
              <p className="text-gray-500 font-mono text-[11px]">{activeBranch.address}, {activeBranch.city}</p>
              <div className="pt-1 flex items-center gap-1.5 text-gray-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Operating hours: {activeBranch.operatingHours || '08:00 AM - 11:00 PM'}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Select Quantity:</label>
              <div className="flex items-center border border-sand-300 rounded-xl bg-white p-1 w-full justify-between">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-lg hover:bg-sand-100 flex items-center justify-center text-gray-600 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-gray-900 font-mono">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 rounded-lg hover:bg-sand-100 flex items-center justify-center text-gray-600 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full bg-pine-700 hover:bg-pine-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm py-3.5 px-4 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 shadow-xs"
              >
                <span>ADD TO CART</span>
                <span className="font-mono text-xs opacity-80">(₹{(currentPrice * qty).toFixed(2)})</span>
              </button>

              <Link
                to="/customer/pharmacies"
                className="w-full block text-center border border-sand-300 hover:border-gray-400 text-gray-700 font-semibold text-xs py-3 px-4 rounded-xl transition-colors"
              >
                VIEW PHARMACY DETAILS
              </Link>
            </div>

            {/* Regulatory & Safety Assurance */}
            <div className="pt-4 border-t border-sand-200 text-[11px] text-gray-500 space-y-2 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pine-700 shrink-0" />
                <span>Original manufacturer tamper-proof seal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pine-700 shrink-0" />
                <span>Stored in regulated temperature conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pine-700 shrink-0" />
                <span>Complies with Central & State Drug Rules</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
