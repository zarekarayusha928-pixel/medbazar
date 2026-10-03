import React from 'react';
import { User, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MOCK_CUSTOMERS } from '@/services/api/mockData';

export const ProfilePage: React.FC = () => {
  const customer = MOCK_CUSTOMERS[0];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'My Profile' }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Account</h1>
        <p className="text-xs text-gray-500 mt-1">Manage personal details and delivery addresses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardBody className="p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 font-extrabold text-2xl flex items-center justify-center mx-auto border-2 border-brand-200">
              RS
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
              <p className="text-xs text-gray-500">{customer.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
            </div>
          </CardBody>
        </Card>

        {/* Address Card */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-gray-50/60 flex items-center justify-between">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Saved Delivery Addresses</h3>
            <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Address</Button>
          </CardHeader>
          <CardBody className="p-5 space-y-3">
            {customer.addresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{addr.type}</span>
                  {addr.isDefault && <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded">Default</span>}
                </div>
                <p className="text-gray-600">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
