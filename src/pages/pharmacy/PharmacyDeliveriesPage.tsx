import React, { useState } from 'react';
import { Truck, Search, CheckCircle2, Clock, UserCheck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_DELIVERIES, MOCK_STAFF } from '@/services/api/mockData';
import { DeliveryAssignment } from '@/types';

export const PharmacyDeliveriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>(MOCK_DELIVERIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Staff members eligible for delivery
  const deliveryAgents = MOCK_STAFF.filter(s => s.role === 'DELIVERY_STAFF' || s.role === 'CASHIER');

  // Reassign modal
  const [editingDelivery, setEditingDelivery] = useState<DeliveryAssignment | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState(deliveryAgents[0]?.name || 'Ramesh Pawar');

  const filtered = deliveries.filter(d => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!d.orderNumber.toLowerCase().includes(q) &&
          !d.customerName.toLowerCase().includes(q) &&
          !d.deliveryStaffName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'ALL' && d.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleUpdateStatus = (id: string, nextStatus: DeliveryAssignment['status']) => {
    const updated = deliveries.map(d =>
      d.id === id
        ? {
            ...d,
            status: nextStatus,
            completedTime: nextStatus === 'DELIVERED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.completedTime
          }
        : d
    );
    setDeliveries(updated);
    showToast('Dispatch Status Updated', `Delivery #${id} updated to ${nextStatus}.`, 'success');
  };

  const handleReassignSubmit = () => {
    if (!editingDelivery) return;
    const updated = deliveries.map(d =>
      d.id === editingDelivery.id
        ? { ...d, deliveryStaffName: selectedAgentName }
        : d
    );
    setDeliveries(updated);
    showToast('Staff Reassigned', `Assigned ${selectedAgentName} to Order ${editingDelivery.orderNumber}.`, 'success');
    setEditingDelivery(null);
  };

  const renderStatusBadge = (status: DeliveryAssignment['status']) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="brand" size="sm">Out for Delivery</Badge>;
      case 'ASSIGNED':
        return <Badge variant="warning" size="sm">Assigned / Dispatched</Badge>;
      case 'FAILED':
        return <Badge variant="danger" size="sm">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Delivery Logistics & Dispatches
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              {filtered.length} shipments
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Local branch courier dispatch, agent assignment, and delivery proof tracking
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-sand-300 rounded-md p-3 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, customer, staff..."
              className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700"
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table: Order, Customer, Delivery Staff, Branch, Status, Time */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Delivery Staff</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-sand-50/50 transition-colors">
                  {/* Order */}
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                    {d.orderNumber}
                  </td>

                  {/* Customer */}
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-gray-900 block">{d.customerName}</span>
                    <span className="text-[10px] text-gray-500 truncate block max-w-[200px]" title={d.deliveryAddress}>
                      {d.deliveryAddress}
                    </span>
                  </td>

                  {/* Delivery Staff */}
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-gray-900 block">{d.deliveryStaffName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDelivery(d);
                        setSelectedAgentName(d.deliveryStaffName);
                      }}
                      className="text-[10px] font-mono text-pine-700 hover:underline"
                    >
                      Reassign →
                    </button>
                  </td>

                  {/* Branch */}
                  <td className="py-2.5 px-3 text-gray-700 text-[11px]">
                    {d.branchName.split('-')[1]?.trim() || d.branchName}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {renderStatusBadge(d.status)}
                  </td>

                  {/* Time */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                    <div>{d.assignedTime}</div>
                    {d.completedTime && (
                      <span className="text-[10px] text-emerald-700 block">Done: {d.completedTime}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    {d.status === 'ASSIGNED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(d.id, 'OUT_FOR_DELIVERY')}
                        className="px-2.5 py-1 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-semibold text-xs transition-colors"
                      >
                        Start Delivery
                      </button>
                    )}
                    {d.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(d.id, 'DELIVERED')}
                        className="px-2.5 py-1 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {d.status === 'DELIVERED' && (
                      <span className="font-mono text-[10px] text-gray-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Agent Modal */}
      {editingDelivery && (
        <Modal
          isOpen={true}
          onClose={() => setEditingDelivery(null)}
          title={`Reassign Courier: ${editingDelivery.orderNumber}`}
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setEditingDelivery(null)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassignSubmit}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold"
              >
                Confirm Assignment
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-gray-600">
              Select delivery staff member for doorstep dispatch to <span className="font-bold">{editingDelivery.customerName}</span>:
            </p>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Select Delivery Agent</label>
              <select
                value={selectedAgentName}
                onChange={(e) => setSelectedAgentName(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
              >
                <option value="Ramesh Pawar">Ramesh Pawar (Delivery Staff)</option>
                <option value="Sunil Shinde">Sunil Shinde (Delivery Staff)</option>
                <option value="Kiran Kulkarni">Kiran Kulkarni (Counter / Backup Dispatch)</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
