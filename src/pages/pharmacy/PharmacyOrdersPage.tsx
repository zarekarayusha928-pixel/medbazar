import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle2, Clock, X, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_ORDERS, MOCK_BRANCHES } from '@/services/api/mockData';
import { orderApi } from '@/services/api/orderApi';
import { Order, OrderStatus } from '@/types';

export const PharmacyOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    orderApi
      .getOrders()
      .then((data) => {
        if (data && data.length > 0) setOrders(data);
      })
      .catch((_err) => {
        // Fallback
      });
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((ord) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchCust = ord.customerName.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone.includes(q);
      const matchItem = ord.items.some(i => i.medicineName.toLowerCase().includes(q));
      if (!matchNum && !matchCust && !matchPhone && !matchItem) return false;
    }

    // Status
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) {
      return false;
    }

    // Branch
    if (branchFilter !== 'ALL' && ord.branchId !== branchFilter) {
      return false;
    }

    // Date
    if (dateFilter === 'TODAY') {
      const ordDate = new Date(ord.createdAt).toDateString();
      const today = new Date().toDateString();
      // allow recent mock dates as today
      if (ordDate !== today && !ord.createdAt.startsWith('2026-10-13')) return false;
    }

    return true;
  });

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast('Order Status Updated', `Order #${orderId} moved to ${newStatus}`, 'success');
      if (selectedOrder) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast('Status Update Failed', err?.message || 'Invalid status transition.', 'error');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="brand" size="sm">Out for Delivery</Badge>;
      case 'READY':
        return <Badge variant="brand" size="sm">Ready for Dispatch</Badge>;
      case 'PREPARING':
        return <Badge variant="warning" size="sm">Preparing</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info" size="sm">Confirmed</Badge>;
      case 'PRESCRIPTION_REVIEW':
        return <Badge variant="warning" size="sm">Prescription Review</Badge>;
      case 'CANCELLED':
      case 'REJECTED':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Orders Queue & Fulfillment
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              {filteredOrders.length} records
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Single repository for online store dispatches and counter delivery assignments
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-sand-300 rounded-md p-3 space-y-2.5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, customer, item..."
              aria-label="Search orders by ID, customer, or medicine"
              className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-pine-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter orders by fulfillment status"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-pine-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PRESCRIPTION_REVIEW">Prescription Review</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              aria-label="Filter orders by pharmacy branch"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-pine-600"
            >
              <option value="ALL">All Branches</option>
              {MOCK_BRANCHES.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter orders by creation date"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-pine-600"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table - Compact, Hairline Borders, Mono Numerals */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 text-xs">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-sand-50/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900">{ord.customerName}</div>
                      <div className="font-mono text-[10px] text-gray-500">{ord.customerPhone}</div>
                    </td>

                    {/* Branch */}
                    <td className="py-2.5 px-3 text-gray-700 text-[11px]">
                      {ord.branchName?.split('-')[1]?.trim() || ord.branchName || 'Pune Station'}
                    </td>

                    {/* Items */}
                    <td className="py-2.5 px-3 text-gray-600 max-w-[220px]">
                      <div className="truncate text-[11px]" title={ord.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}>
                        {ord.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
                        {ord.items.length} product{ord.items.length > 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      ₹{ord.total.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      {getStatusBadge(ord.status)}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-[10px] text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-semibold text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Process Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Inspection #${selectedOrder.orderNumber}`}
          size="md"
          footer={
            <div className="flex justify-between w-full items-center">
              <span className="font-mono text-xs text-gray-500">
                Created: {new Date(selectedOrder.createdAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs font-semibold text-gray-700 bg-white hover:bg-sand-100"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Customer & Branch Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded border border-sand-200 bg-sand-50/60">
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase block">Customer Details</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.customerName}</p>
                <p className="font-mono text-gray-600">{selectedOrder.customerPhone}</p>
                {selectedOrder.deliveryAddress && (
                  <p className="text-[11px] text-gray-600 mt-1">{selectedOrder.deliveryAddress}</p>
                )}
              </div>
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase block">Fulfillment Branch</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.branchName || 'Pune Station Branch'}</p>
                <p className="font-mono text-gray-600 mt-1">Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
            </div>

            {/* Prescribed Items Table */}
            <div>
              <span className="font-mono text-[10px] text-gray-500 uppercase block mb-1.5 font-bold">
                Items to Dispense
              </span>
              <div className="border border-sand-200 rounded divide-y divide-sand-200">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="p-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{item.medicineName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-gray-900">₹{item.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="p-2 bg-sand-50 flex items-center justify-between font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono text-sm text-pine-800">₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Workflow Transition Buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="font-mono text-[10px] text-gray-500 uppercase block font-bold">
                Update Status Transition
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateStatus(selectedOrder.id, st)}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition-colors ${
                      selectedOrder.status === st
                        ? 'bg-pine-700 text-white border-pine-700 shadow-sm'
                        : 'bg-white hover:bg-sand-100 text-gray-700 border-sand-300'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
