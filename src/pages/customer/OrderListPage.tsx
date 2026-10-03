import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MOCK_ORDERS } from '@/services/api/mockData';

export const OrderListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'My Orders' }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Medicine Orders</h1>
        <p className="text-xs text-gray-500 mt-1">Track status and review past pharmacy purchases</p>
      </div>

      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => (
          <Card key={order.id} hoverable>
            <CardBody className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{order.orderNumber}</span>
                    <Badge variant={order.status === 'PRESCRIPTION_REVIEW' ? 'warning' : 'success'} dot>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • Branch: {order.branchName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-brand-700">₹{order.total.toFixed(2)}</span>
                  <p className="text-[10px] text-gray-400 font-semibold">{order.paymentMethod} • {order.paymentStatus}</p>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1 text-xs text-gray-700">
                {order.items.map(i => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.quantity}x {i.medicineName}</span>
                    <span className="font-semibold text-gray-900">₹{i.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Link to={`/customer/orders/${order.id}`}>
                  <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    View Order Details
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
