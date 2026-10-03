import React from 'react';
import { Store, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MOCK_PHARMACIES, MOCK_BRANCHES } from '@/services/api/mockData';

export const PharmacyListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'Participating Pharmacies' }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registered Pharmacy Network</h1>
        <p className="text-xs text-gray-500 mt-1">Discover verified pharmacy partners and physical branches on Med Bazar</p>
      </div>

      <div className="space-y-6">
        {MOCK_PHARMACIES.map((pharmacy) => {
          const branches = MOCK_BRANCHES.filter(b => b.organizationId === pharmacy.id);
          return (
            <Card key={pharmacy.id}>
              <CardBody className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-brand-800 flex items-center justify-center font-bold text-lg shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">{pharmacy.name}</h2>
                        <Badge variant="success" size="sm" dot>Verified Partner</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{pharmacy.legalName} • License: {pharmacy.licenseNumber}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {pharmacy.phone}</div>
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {pharmacy.email}</div>
                  </div>
                </div>

                {/* Branches List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Physical Store Branches ({branches.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {branches.map((branch) => (
                      <div key={branch.id} className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-xs">{branch.name}</h4>
                          <Badge variant="brand" size="sm">Active Branch</Badge>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                            <span>{branch.address}, {branch.city}, {branch.state} - {branch.pincode}</span>
                          </p>
                          {branch.operatingHours && (
                            <p className="flex items-center gap-1.5 text-gray-500">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>Hours: {branch.operatingHours}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
