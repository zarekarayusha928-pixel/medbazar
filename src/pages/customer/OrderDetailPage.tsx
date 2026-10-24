import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  FileText,
  Truck,
  Store,
  Phone,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';
import { MOCK_ORDERS, MOCK_MEDICINES } from '@/services/api/mockData';
import { orderApi } from '@/services/api/orderApi';
import { Order } from '@/types';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order>(() => {
    return MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderApi
      .getOrderById(id)
      .then((data) => {
        if (data) setOrder(data);
      })
      .catch((_err) => {
        // Fallback to initial state
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Exact 6 timeline stages required:
  // 1. Order placed
  // 2. Confirmed
  // 3. Preparing
  // 4. Ready
  // 5. Out for Delivery
  // 6. Delivered
  const timelineStages = [
    { key: 'PENDING', label: 'Order placed', time: '10:14 AM' },
    { key: 'CONFIRMED', label: 'Confirmed', time: '10:20 AM' },
    { key: 'PREPARING', label: 'Preparing', time: '10:35 AM' },
    { key: 'READY', label: 'Ready', time: '11:00 AM' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', time: '11:15 AM' },
    { key: 'DELIVERED', label: 'Delivered', time: '11:45 AM' },
  ];

  // Map order status to timeline step index
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 5;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'READY':
        return 3;
      case 'PREPARING':
        return 2;
      case 'CONFIRMED':
        return 1;
      case 'PRESCRIPTION_REVIEW':
        return 1; // Under review by pharmacist
      case 'PENDING':
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(order.status);
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    try {
      setReordering(true);
      const newOrder = await orderApi.reorder(order.id);
      showToast(
        'Reorder Placed Successfully',
        `New order #${newOrder.orderNumber} placed with current verified pricing and stock.`,
        'success'
      );
    } catch (err: any) {
      // Fallback: add items to cart for manual checkout
      (order.items || []).forEach((i: any) => {
        const med = MOCK_MEDICINES.find((m) => m.id === i.medicineId);
        if (med) {
          addToCart(med, i.quantity, undefined, Number(i.unitPrice));
        }
      });
      showToast('Items Added to Cart', err?.message || 'Items from this order have been added to your cart.', 'info');
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/customer' },
          { label: 'Orders', href: '/customer/orders' },
          { label: `#${order.orderNumber}` }
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-300 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/customer/orders"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-sand-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Back to orders list"
              title="Back to orders"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
              Order #{order.orderNumber}
            </h1>
            <Badge
              variant={
                order.status === 'DELIVERED'
                  ? 'success'
                  : order.status === 'PRESCRIPTION_REVIEW'
                  ? 'warning'
                  : 'brand'
              }
              dot
            >
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')} • Dispensing Branch: {order.branchName}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReorder}
          disabled={reordering}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-semibold text-xs transition-colors self-start sm:self-auto shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${reordering ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{reordering ? 'Placing Reorder...' : 'Reorder Items'}</span>
        </button>
      </div>

      {/* Minimal Visual Treatment Status Timeline */}
      <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <span className="font-mono text-xs uppercase tracking-wider text-pine-800 font-bold">
            Fulfillment Timeline
          </span>
          <span className="font-mono text-[11px] text-gray-400">
            Estimated Delivery: Within 45 Minutes
          </span>
        </div>

        {/* Restrained Step Timeline */}
        <div className="relative">
          {/* Timeline progress track behind items */}
          <div className="hidden sm:block absolute top-3.5 left-4 right-4 h-0.5 bg-sand-200 -z-0" />

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
            {timelineStages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col sm:items-center text-left sm:text-center space-y-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-pine-700 text-white'
                        : isCurrent
                        ? 'bg-pine-700 text-white ring-4 ring-pine-100'
                        : 'bg-sand-100 border border-sand-300 text-gray-400'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <div>
                    <span
                      className={`text-xs block font-sans ${
                        isCurrent
                          ? 'font-bold text-gray-900'
                          : isPast
                          ? 'font-medium text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                      {isPast || isCurrent ? stage.time : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription Status Banner if order has Rx */}
          {order.prescriptionId && (
            <div className="p-4 rounded-lg bg-sand-100 border border-sand-300 flex items-start gap-3 text-xs">
              <FileText className="w-5 h-5 text-pine-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block font-sans">
                  Attached Medical Prescription (Rx #{order.prescriptionId})
                </span>
                <p className="text-gray-600 font-sans">
                  Reviewed and verified by on-duty licensed pharmacist at {order.branchName}.
                </p>
              </div>
            </div>
          )}

          {/* Itemized Table */}
          <div className="bg-white rounded-lg border border-sand-300 overflow-hidden shadow-sm">
            <div className="bg-sand-100 px-4 sm:px-6 py-3.5 border-b border-sand-300 font-mono text-xs uppercase tracking-wider text-gray-700 font-bold">
              Dispensed Items ({order.items.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-gray-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-4 sm:px-6 font-semibold">Medicine Description</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Quantity</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 px-4 sm:px-6 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {(order.items || []).map((item: any) => (
                    <tr key={item.id} className="hover:bg-sand-50/40">
                      <td className="py-4 px-4 sm:px-6 font-sans">
                        <p className="font-bold text-gray-900">{item.medicineName}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          Item ID: {item.medicineId}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-semibold text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-600">
                        ₹{Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right font-sans font-bold text-gray-900">
                        ₹{Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Pharmacy Details & Financial Receipt */}
        <div className="space-y-6">
          {/* Pharmacy & Delivery Information Card */}
          <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-gray-900 border-b border-sand-200 pb-3 font-mono uppercase tracking-wider">
              Dispensing & Delivery Info
            </h3>

            <div className="space-y-2">
              <span className="font-mono text-[10px] text-gray-400 uppercase block">Dispensing Chemist:</span>
              <p className="font-bold text-gray-900 font-sans">{order.pharmacyName || order.organizationName || 'Apothecary Healthcare'}</p>
              <p className="text-gray-600 font-sans">{order.branchName || 'Main Branch'}</p>
            </div>

            <div className="pt-2 border-t border-sand-200 space-y-2">
              <span className="font-mono text-[10px] text-gray-400 uppercase block">Fulfillment Method:</span>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Truck className="w-4 h-4 text-pine-700" />
                <span>Doorstep Delivery</span>
              </div>
              <p className="text-gray-600 font-sans">
                {order.customerName} • {order.customerPhone}
              </p>
              <p className="text-gray-500 font-mono text-[11px]">
                {order.deliveryAddress || order.shippingAddress || 'Plot 402, MG Road, Pune, Maharashtra - 411001'}
              </p>
            </div>
          </div>

          {/* Receipt Breakdown */}
          <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-sm text-gray-900 border-b border-sand-200 pb-3 font-mono uppercase tracking-wider">
              Payment Summary
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-gray-900">₹{order.subtotal.toFixed(2)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Applied</span>
                  <span className="font-mono font-semibold">-₹{order.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery & Handling</span>
                <span className="font-mono font-semibold text-gray-900">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-sand-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-sm text-gray-900 font-sans">Total Paid</span>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {order.paymentMethod} • {order.paymentStatus}
                  </span>
                </div>
                <span className="text-2xl font-extrabold text-pine-800 font-sans">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-sand-200 text-[11px] text-gray-500 flex items-center gap-1.5 font-sans">
              <ShieldCheck className="w-4 h-4 text-pine-700 shrink-0" />
              <span>Tax invoice digitally recorded in pharmacy records</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
