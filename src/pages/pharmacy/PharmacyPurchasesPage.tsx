import React, { useState } from 'react';
import { ShoppingBasket, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PURCHASES } from '@/services/api/mockData';
import { PurchaseOrder } from '@/types';

export const PharmacyPurchasesPage: React.FC = () => {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(MOCK_PURCHASES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New PO form
  const [supplierName, setSupplierName] = useState('Cipla Wholesale Distributors Pvt Ltd');
  const [itemsSummary, setItemsSummary] = useState('Dolo 650 (100 strips), Azithromycin 500 (50 strips)');
  const [itemsCount, setItemsCount] = useState(150);
  const [total, setTotal] = useState(38500.00);

  const filtered = purchases.filter(p =>
    p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    p.purchaseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      purchaseNumber: `PO-2026-09${purchases.length + 1}`,
      supplierName,
      organizationId: 'pharm_1',
      branchId: 'branch_1',
      branchName: 'Apothecary Main Branch - Pune Station',
      itemsCount: Number(itemsCount),
      itemsSummary,
      total: Number(total),
      status: 'PENDING',
      purchaseDate: new Date().toISOString().split('T')[0]
    };

    setPurchases([newPO, ...purchases]);
    showToast('Purchase Order Created', `Generated ${newPO.purchaseNumber} for ${supplierName}.`, 'success');
    setIsModalOpen(false);
  };

  const handleReceiveStock = (id: string) => {
    setPurchases(purchases.map(p => p.id === id ? { ...p, status: 'RECEIVED' } : p));
    showToast('Stock Received & Ingested', `Purchase Order items booked into single branch inventory.`, 'success');
  };

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Procurement & Purchases
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              {filtered.length} purchase orders
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Wholesale pharmaceutical distributor purchase orders and batch intake
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-sand-300 rounded-md p-3 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier or PO #..."
            className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
          />
        </div>
      </div>

      {/* Table: Supplier, Purchase ID, Items, Total, Status, Date */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">Purchase ID</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-sand-50/50 transition-colors">
                  {/* Supplier */}
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-gray-900 block">{po.supplierName}</span>
                    <span className="text-[10px] text-gray-500">{po.branchName.split('-')[1]?.trim() || po.branchName}</span>
                  </td>

                  {/* Purchase ID */}
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                    {po.purchaseNumber}
                  </td>

                  {/* Items */}
                  <td className="py-2.5 px-3 text-gray-700 max-w-[240px]">
                    <div className="truncate text-[11px]" title={po.itemsSummary}>
                      {po.itemsSummary}
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">
                      {po.itemsCount} total units
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                    ₹{po.total.toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {po.status === 'RECEIVED' ? (
                      <Badge variant="success" size="sm">Received & Stocked</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Pending Delivery</Badge>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                    {po.purchaseDate}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-right">
                    {po.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => handleReceiveStock(po.id)}
                        className="px-2.5 py-1 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        Receive Stock
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] text-gray-400">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title="Create Distributor Purchase Order"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePO}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold"
              >
                Issue Purchase Order
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Wholesale Supplier</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Items & Quantities Description</label>
              <textarea
                rows={2}
                value={itemsSummary}
                onChange={(e) => setItemsSummary(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Total Unit Count</label>
                <input
                  type="number"
                  value={itemsCount}
                  onChange={(e) => setItemsCount(Number(e.target.value))}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Total Invoice Value (₹)</label>
                <input
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
