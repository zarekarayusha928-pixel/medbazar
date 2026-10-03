import React from 'react';
import { BarChart, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Platform Global Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Platform GMV, transaction metrics, and subscription billing analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Platform Monthly GMV</span>
            <p className="text-2xl font-extrabold text-indigo-700 mt-1">₹18,45,000.00</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Active Pharmacies</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">12 Partners</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Orders Processed</span>
            <p className="text-2xl font-extrabold text-brand-700 mt-1">4,890 Orders</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
