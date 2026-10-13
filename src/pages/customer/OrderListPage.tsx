import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Search, Clock, ArrowRight, Store, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MOCK_ORDERS } from '@/services/api/mockData';

export const OrderListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" dot>Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="brand" dot>Out for Delivery</Badge>;
      case 'PREPARING':
        return <Badge variant="brand" dot>Preparing</Badge>;
      case 'READY':
        return <Badge variant="brand" dot>Ready</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info" dot>Confirmed</Badge>;
      case 'PRESCRIPTION_REVIEW':
        return <Badge variant="warning" dot>Prescription Review</Badge>;
      case 'PENDING':
        return <Badge variant="neutral" dot>Order Placed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" dot>Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        (order.branchName?.toLowerCase().includes(q) ?? false) ||
        order.items.some(i => i.medicineName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/customer' }, { label: 'Order History' }]} />

      {/* Header */}
      <div className="border-b border-sand-300 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Account Purchases</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Your Medicine Orders</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track real-time fulfillment timelines and review past pharmacy purchases.
          </p>
        </div>

        <div className="font-mono text-xs text-gray-500 bg-sand-100 px-3.5 py-1.5 rounded-xl border border-sand-300">
          Total: {MOCK_ORDERS.length} Orders
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-sand-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or medicine..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-sand-300 text-xs text-gray-900 focus:outline-none focus:border-pine-600 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-sans">
          <span className="text-gray-500 font-medium">Status:</span>
          {['ALL', 'PRESCRIPTION_REVIEW', 'CONFIRMED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-pine-700 text-white'
                  : 'bg-sand-100 text-gray-700 hover:bg-sand-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table Structure for Desktop, Responsive Cards for Mobile */}
      <div className="hidden md:block bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-sand-100 text-gray-700 font-mono text-[11px] uppercase tracking-wider border-b border-sand-300">
              <th className="py-3.5 px-5 font-bold">Order Number</th>
              <th className="py-3.5 px-5 font-bold">Pharmacy & Branch</th>
              <th className="py-3.5 px-5 font-bold">Date Placed</th>
              <th className="py-3.5 px-5 font-bold">Items Summary</th>
              <th className="py-3.5 px-5 font-bold">Amount</th>
              <th className="py-3.5 px-5 font-bold">Status</th>
              <th className="py-3.5 px-5 font-bold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 font-sans">
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-sand-50/50 transition-colors">
                  {/* Order Number */}
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-gray-900 block text-xs">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Type: {order.orderType}
                    </span>
                  </td>

                  {/* Pharmacy & Branch */}
                  <td className="py-4 px-5">
                    <p className="font-bold text-gray-900 font-sans">{order.pharmacyName || order.organizationName || 'Apothecary Healthcare'}</p>
                    <p className="text-gray-500 text-[11px] font-sans flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-pine-700" />
                      <span>{order.branchName || 'Main Branch'}</span>
                    </p>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-5 font-mono text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>

                  {/* Items summary */}
                  <td className="py-4 px-5 font-sans">
                    <p className="text-gray-800 line-clamp-1">
                      {order.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {order.items.length} {order.items.length === 1 ? 'line item' : 'line items'}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-gray-900 font-sans text-sm block">
                      ₹{order.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Action Link */}
                  <td className="py-4 px-5 text-right">
                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-pine-800 hover:text-pine-900 bg-sand-100 hover:bg-sand-200 px-3 py-1.5 rounded-xl border border-sand-300 transition-colors"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-sand-300 text-gray-500">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-sand-300 p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-sand-200 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-gray-900 block text-xs">
                    #{order.orderNumber}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-gray-900">{order.pharmacyName || order.organizationName || 'Apothecary Healthcare'}</p>
                <p className="text-gray-500 text-[11px]">{order.branchName || 'Main Branch'}</p>
                <p className="text-gray-700 pt-1 line-clamp-1">
                  {order.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}
                </p>
              </div>

              <div className="pt-2 border-t border-sand-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-gray-900 font-sans">
                    ₹{order.total.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {order.paymentMethod}
                  </span>
                </div>

                <Link
                  to={`/customer/orders/${order.id}`}
                  className="bg-pine-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
