import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, X, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { MOCK_ORDERS } from '@/services/api/mockData';
import { Order, OrderStatus } from '@/types';

export const PharmacyOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast('Order Status Updated', `Order #${orderId} set to ${newStatus}`, 'success');
    if (selectedOrder) setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Online Customer Orders</h1>
          <p className="text-xs text-gray-500 mt-1">Manage online orders dispatched from Pune Station Branch</p>
        </div>
        <Badge variant="brand" size="md">{orders.length} Active Orders</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer Details</TableHead>
            <TableHead>Fulfillment</TableHead>
            <TableHead>Total Payable</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Current Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((ord) => (
            <TableRow key={ord.id}>
              <TableCell className="font-bold text-gray-900">{ord.orderNumber}</TableCell>
              <TableCell>
                <span className="font-semibold">{ord.customerName}</span>
                <span className="text-gray-400 block text-[10px]">{ord.customerPhone}</span>
              </TableCell>
              <TableCell><Badge variant="brand" size="sm">{ord.orderType}</Badge></TableCell>
              <TableCell className="font-extrabold text-brand-700">₹{ord.total.toFixed(2)}</TableCell>
              <TableCell><Badge variant="neutral" size="sm">{ord.paymentMethod} • {ord.paymentStatus}</Badge></TableCell>
              <TableCell>
                <Badge variant={ord.status === 'PRESCRIPTION_REVIEW' ? 'warning' : 'success'} dot>
                  {ord.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setSelectedOrder(ord)}>
                  Process
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Process Order #${selectedOrder.orderNumber}`}
          size="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="font-bold text-gray-900">Items to Dispense:</p>
              <ul className="mt-1 space-y-1">
                {selectedOrder.items.map(i => (
                  <li key={i.id} className="flex justify-between">
                    <span>{i.quantity}x {i.medicineName}</span>
                    <span className="font-bold">₹{i.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-900 block">Update Order Workflow Status:</label>
              <div className="flex flex-wrap gap-2">
                {['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={selectedOrder.status === st ? 'primary' : 'outline'}
                    onClick={() => updateStatus(selectedOrder.id, st as OrderStatus)}
                  >
                    {st.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
