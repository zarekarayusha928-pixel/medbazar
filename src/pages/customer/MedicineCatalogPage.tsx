import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Pill, Filter, CheckCircle } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Medicine, Category } from '@/types';
import { medicineService } from '@/services/api/medicineService';

export const MedicineCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [rxOnly, setRxOnly] = useState(false);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      medicineService.searchMedicines(query, selectedCategory),
      medicineService.getCategories()
    ]).then(([meds, cats]) => {
      let filtered = meds;
      if (rxOnly) filtered = filtered.filter(m => m.prescriptionRequired);
      setMedicines(filtered);
      setCategories(cats);
      setLoading(false);
    });
  }, [query, selectedCategory, rxOnly]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'Medicine Catalogue' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Catalogue</h1>
          <p className="text-xs text-gray-500 mt-1">Browse available pharmaceutical products and health supplies</p>
        </div>

        <Badge variant="brand" size="md">
          {medicines.length} Medicines Found
        </Badge>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="sm:col-span-1">
          <SearchInput
            value={query}
            onChange={(val) => {
              setQuery(val);
              setSearchParams(val ? { query: val } : {});
            }}
            placeholder="Search name, generic, brand..."
          />
        </div>

        <div>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rxOnly}
              onChange={(e) => setRxOnly(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span>Show Prescription (Rx) Only</span>
          </label>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading medicines catalogue..." />
      ) : medicines.length === 0 ? (
        <EmptyState
          title="No medicines matched your criteria"
          description="Try clearing your search terms or selecting a different category filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setQuery('');
            setSelectedCategory('');
            setRxOnly(false);
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med) => (
            <Card key={med.id} hoverable>
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={med.prescriptionRequired ? 'warning' : 'success'} size="sm">
                      {med.prescriptionRequired ? 'Rx Required' : 'OTC'}
                    </Badge>
                    <span className="text-xs font-bold text-gray-400 uppercase">{med.dosageForm}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug">{med.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Generic: <span className="text-gray-700">{med.genericName}</span>
                  </p>
                  <p className="text-xs text-gray-400">Brand: {med.brand} • {med.composition}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 line-through block">MRP ₹35.00</span>
                    <p className="text-lg font-extrabold text-brand-700">₹32.50</p>
                  </div>

                  <Link to={`/customer/medicines/${med.id}`}>
                    <Button size="sm" variant="primary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
