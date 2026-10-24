import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { purchaseApi } from '@/services/api/purchaseApi';
import { supplierApi } from '@/services/api/supplierApi';
import { PurchaseOrder, Supplier } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

export const PharmacyPurchasesPage: React.FC = () => {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  // New PO form
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState('Cipla Wholesale Distributors Pvt Ltd');
  const [itemsSummary, setItemsSummary] = useState('Dolo 650 (100 strips), Azithromycin 500 (50 strips)');
  const [itemsCount, setItemsCount] = useState(150);
  const [total, setTotal] = useState(38500.00);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [poData, supData] = await Promise.all([
        purchaseApi.getPurchases(),
        supplierApi.getSuppliers().catch(() => []),
      ]);
      setPurchases(poData);
      setSuppliers(supData);
      if (supData.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(supData[0].id);
        setSupplierName(supData[0].name);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch purchase orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = purchases.filter(
    (p) =>
      p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      p.purchaseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const newPO = await purchaseApi.createPurchase({
        supplierName,
        organizationId: 'pharm_1',
        branchId: 'br_1',
        branchName: 'Apothecary Main Branch - Pune Station',
        itemsCount: Number(itemsCount),
        itemsSummary,
        total: Number(total),
        items: [
          {
            medicineId: 'med_1',
            batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
            expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
            quantity: Number(itemsCount),
            unitPrice: Number(total) / (Number(itemsCount) || 1),
          },
        ],
      });

      setPurchases([newPO, ...purchases]);
      showToast('Purchase Order Created', `Generated ${newPO.purchaseNumber} for ${supplierName}.`, 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create purchase order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiveStock = async (id: string) => {
    try {
      setReceivingId(id);
      const updated = await purchaseApi.receivePurchase(id);
      setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Stock Received & Ingested', `Purchase Order items booked into single branch inventory.`, 'success');
    } catch (err: any) {
      showToast('Receive Failed', err.message || 'Failed to receive stock.', 'error');
    } finally {
      setReceivingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading procurement orders and wholesale deliveries..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Procurement Service Unavailable"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh purchases"
            className="p-1.5 rounded border border-sand-300 text-gray-600 hover:text-pine-800 hover:bg-sand-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-sand-300 rounded-md p-3 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
          <label htmlFor="purchases-search" className="sr-only">Search supplier or PO</label>
          <input
            id="purchases-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier, PO number..."
            className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Items Summary</th>
                <th className="py-2.5 px-3">Total Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 text-xs">
                    No purchase orders found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((po) => (
                  <tr key={po.id} className="hover:bg-sand-50/50 transition-colors">
                    {/* PO Number */}
                    <td className="py-2.5 px-3 font-mono font-bold text-pine-900">
                      {po.purchaseNumber}
                    </td>

                    {/* Supplier */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900">{po.supplierName}</div>
                      <div className="text-[10px] text-gray-500">Authorized Distributor</div>
                    </td>

                    {/* Branch */}
                    <td className="py-2.5 px-3 text-gray-700">
                      {po.branchName?.split('-')[1]?.trim() || po.branchName || 'Main Dispensary'}
                    </td>

                    {/* Items */}
                    <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate" title={po.itemsSummary}>
                      <span className="font-mono text-gray-900 font-semibold">{po.itemsCount} units</span> — {po.itemsSummary}
                    </td>

                    {/* Total */}
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      ₹{Number(po.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      {po.status === 'RECEIVED' ? (
                        <Badge variant="success" size="sm">Received</Badge>
                      ) : po.status === 'CANCELLED' ? (
                        <Badge variant="danger" size="sm">Cancelled</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pending Ingestion</Badge>
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
                          disabled={receivingId === po.id}
                          className="px-2.5 py-1 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {receivingId === po.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Receive Stock</span>
                        </button>
                      ) : (
                        <span className="font-mono text-[10px] text-gray-400">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Issue Purchase Order</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Wholesale Supplier</label>
              {suppliers.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => {
                      setSelectedSupplierId(e.target.value);
                      const sup = suppliers.find((s) => s.id === e.target.value);
                      if (sup) setSupplierName(sup.name);
                    }}
                    className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                    <option value="CUSTOM">-- Enter Custom Supplier --</option>
                  </select>
                  {selectedSupplierId === 'CUSTOM' && (
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="Enter supplier name..."
                      className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700 mt-1"
                      required
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                  required
                />
              )}
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
                  min={1}
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
                  min={1}
                  step="0.01"
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
