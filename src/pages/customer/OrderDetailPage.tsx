import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, MapPin, ShieldCheck, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MOCK_ORDERS } from '@/services/api/mockData';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const order = MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0];

  const statusSteps = [
    { key: 'PENDING', label: 'Order Created' },
    { key: 'PRESCRIPTION_REVIEW', label: 'Prescription Review' },
    { key: 'CONFIRMED', label: 'Confirmed by Pharmacy' },
    { key: 'PREPARING', label: 'Packed' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Customer', href: '/customer' },
          { label: 'Orders', href: '/customer/orders' },
          { label: order.orderNumber }
        ]}
      />

      <Link to="/customer/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <Badge variant={order.status === 'PRESCRIPTION_REVIEW' ? 'warning' : 'success'} dot>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Live Fulfillment Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="text-center space-y-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    order.status === step.key
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : index < 2
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-[11px] font-semibold text-gray-700 block leading-tight">{step.label}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="bg-gray-50/60">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Order Items</h3>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-sm">{item.medicineName}</h4>
                    <p className="text-xs text-gray-500">₹{item.unitPrice.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="bg-gray-50/60">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Pharmacy & Delivery Info</h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Dispensing Branch:</span>
                <span className="font-bold text-gray-900">{order.branchName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Delivery Address:</span>
                <span className="text-gray-700">{order.deliveryAddress}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-extrabold text-brand-700 text-base">₹{order.total.toFixed(2)}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
