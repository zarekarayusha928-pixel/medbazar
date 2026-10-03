import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Upload, ShieldCheck, Truck, Pill, ArrowRight, Clock, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Medicine, Category } from '@/types';
import { medicineService } from '@/services/api/medicineService';
import { MOCK_PHARMACIES } from '@/services/api/mockData';

export const CustomerDashboardPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularMedicines, setPopularMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    medicineService.getCategories().then(setCategories);
    medicineService.getAllMedicines().then(setPopularMedicines);
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-teal-900 text-white p-8 sm:p-10 shadow-lg">
        <div className="max-w-2xl space-y-4 relative z-10">
          <Badge variant="brand" className="bg-brand-500/20 text-brand-200 border-brand-400/30">
            Verified Pharmacy Network
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Order Genuine Medicines from Verified Local Pharmacies
          </h1>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Same branch inventory powers both store sales and online orders. Upload prescriptions safely for instant pharmacist review.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/customer/medicines">
              <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 shadow-md">
                Browse Medicines
              </Button>
            </Link>
            <Link to="/customer/prescriptions">
              <Button size="lg" variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
                Upload Prescription
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Pill className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-brand-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">100% Genuine Medicines</h4>
              <p className="text-xs text-gray-500 mt-0.5">Dispensed directly by licensed pharmacists from registered branches.</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-brand-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Real-time Branch Stock</h4>
              <p className="text-xs text-gray-500 mt-0.5">Shared inventory guarantees accurate availability before checkout.</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-brand-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Fast Doorstep Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">Dispatched directly from your selected local branch store.</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Category Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Explore Categories</h2>
            <p className="text-xs text-gray-500">Find healthcare products by medical category</p>
          </div>
          <Link to="/customer/medicines" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/customer/medicines?category=${cat.id}`}>
              <Card hoverable className="h-full">
                <CardBody className="p-4 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{cat.name}</h3>
                  <span className="text-[10px] text-gray-500">{cat.medicineCount} items</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Medicines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Popular Medicines</h2>
            <p className="text-xs text-gray-500">Frequently ordered healthcare essentials</p>
          </div>
          <Link to="/customer/medicines" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Browse Catalogue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularMedicines.map((med) => (
            <Card key={med.id} hoverable>
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={med.prescriptionRequired ? 'warning' : 'success'} size="sm">
                      {med.prescriptionRequired ? 'Rx Required' : 'OTC'}
                    </Badge>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">{med.dosageForm}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{med.name}</h3>
                  <p className="text-xs text-gray-500">{med.brand} • {med.composition}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 line-through">₹40.00</span>
                    <p className="text-base font-extrabold text-brand-700">₹32.50</p>
                  </div>
                  <Link to={`/customer/medicines/${med.id}`}>
                    <Button size="sm" variant="secondary">View Item</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Pharmacy Partners */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Participating Pharmacy Networks</h2>
            <p className="text-xs text-gray-500">Verified retail chemist partners on Med Bazar</p>
          </div>
          <Link to="/customer/pharmacies" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            See All Pharmacies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_PHARMACIES.map((pharm) => (
            <Card key={pharm.id}>
              <CardBody className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-brand-800 flex items-center justify-center font-bold text-lg shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-sm">{pharm.name}</h3>
                  <p className="text-xs text-gray-500">License: {pharm.licenseNumber}</p>
                  <p className="text-xs font-semibold text-brand-600">{pharm.branchCount} Active Branches</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
