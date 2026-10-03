import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pill, ShieldAlert, CheckCircle2, ShoppingBag, Upload, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { Medicine } from '@/types';
import { medicineService } from '@/services/api/medicineService';
import { MOCK_INVENTORY } from '@/services/api/mockData';

export const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    medicineService.getMedicineById(id).then((med) => {
      setMedicine(med || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingState message="Loading medicine details..." />;
  if (!medicine) return <ErrorState message="Medicine product not found" onRetry={() => navigate('/customer/medicines')} />;

  const branchStock = MOCK_INVENTORY.find(inv => inv.medicineId === medicine.id);

  const handleAddToCart = () => {
    showToast('Added to Cart', `${qty}x ${medicine.name} added to your shopping cart`, 'success');
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Customer', href: '/customer' },
          { label: 'Medicines', href: '/customer/medicines' },
          { label: medicine.name }
        ]}
      />

      <Link to="/customer/medicines" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={medicine.prescriptionRequired ? 'warning' : 'success'}>
                      {medicine.prescriptionRequired ? 'Prescription (Rx) Required' : 'Over The Counter (OTC)'}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{medicine.dosageForm}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-2">{medicine.name}</h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Generic Name: <span className="text-gray-900">{medicine.genericName}</span>
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-brand-700 flex items-center justify-center font-bold text-xl shrink-0">
                  <Pill className="w-8 h-8" />
                </div>
              </div>

              {medicine.prescriptionRequired && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">Pharmacist Review Required</p>
                    <p className="mt-0.5 text-amber-800">
                      As per healthcare regulations, valid prescription upload is required before your selected branch pharmacist can confirm and dispense this order.
                    </p>
                  </div>
                </div>
              )}

              {/* Specs Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-gray-50 px-4 py-2.5 font-bold text-gray-700 border-b border-gray-200">
                  Product Specifications
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-gray-500 font-medium">Brand / Manufacturer</span>
                    <span className="col-span-2 font-semibold text-gray-900">{medicine.brand} ({medicine.manufacturer})</span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-gray-500 font-medium">Active Composition</span>
                    <span className="col-span-2 text-gray-900">{medicine.composition}</span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-gray-500 font-medium">Form & Strength</span>
                    <span className="col-span-2 text-gray-900">{medicine.dosageForm} - {medicine.strength}</span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-gray-500 font-medium">Barcode / EAN</span>
                    <span className="col-span-2 text-gray-900">{medicine.barcode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-50/60">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">Branch Stock Status</span>
              </div>
            </CardHeader>

            <CardBody className="p-6 space-y-5">
              <div>
                <span className="text-xs text-gray-400 line-through">MRP ₹35.00</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-brand-700">₹32.50</span>
                  <span className="text-xs text-emerald-600 font-bold">Save 7%</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Price set by active branch: Apothecary Main</p>
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">In Stock at Branch</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {branchStock ? `${branchStock.quantity} units available` : '120 units'}
                </span>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase">Select Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-bold text-gray-900">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">Total: ₹{(32.50 * qty).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  Add to Cart
                </Button>

                {medicine.prescriptionRequired && (
                  <Link to="/customer/prescriptions" className="block">
                    <Button variant="outline" className="w-full" size="md" leftIcon={<Upload className="w-4 h-4" />}>
                      Upload Prescription Now
                    </Button>
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
