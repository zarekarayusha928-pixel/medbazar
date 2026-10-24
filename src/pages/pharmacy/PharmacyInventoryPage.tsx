import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, Plus, Edit2, AlertTriangle, ArrowUpDown, Filter, Loader2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { inventoryApi } from '@/services/api/inventoryApi';
import { medicineApi } from '@/services/api/medicineApi';
import { pharmacyApi } from '@/services/api/pharmacyApi';
import { Inventory, Category, Branch } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

export const PharmacyInventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  const [expiryFilter, setExpiryFilter] = useState('ALL'); // ALL, EXPIRING, VALID

  // Stock Adjustment modal
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Audit Correction');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Add batch modal
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState('Paracetamol 650mg');
  const [newBatchNo, setNewBatchNo] = useState('BCH-2026-108');
  const [newExpiry, setNewExpiry] = useState('2028-06-30');
  const [newQuantity, setNewQuantity] = useState(100);
  const [newPrice, setNewPrice] = useState(30.00);
  const [isAddingBatch, setIsAddingBatch] = useState(false);

  // Transfer stock modal
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferItem, setTransferItem] = useState<Inventory | null>(null);
  const [destBranchId, setDestBranchId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState(10);
  const [transferNotes, setTransferNotes] = useState('Inter-branch stock rebalancing');
  const [isTransferring, setIsTransferring] = useState(false);

  // Load Inventory data from API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [invData, catData, branchData] = await Promise.all([
        inventoryApi.getInventory(),
        medicineApi.getCategories().catch(() => []),
        pharmacyApi.getBranches().catch(() => []),
      ]);
      setInventory(invData);
      setCategories(catData);
      setBranches(branchData);
    } catch (err: any) {
      setError(err.message || 'Failed to load branch inventory. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to check if expiring soon (< 90 days)
  const isExpiringSoon = (item: Inventory) => {
    const expStr = item.batches?.[0]?.expiryDate || '2027-08-31';
    const expDate = new Date(expStr).getTime();
    const now = Date.now();
    const diffDays = (expDate - now) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 90;
  };

  const getComputedState = (item: Inventory): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING' => {
    if (isExpiringSoon(item)) return 'EXPIRING';
    if (item.quantity === 0) return 'OUT_OF_STOCK';
    if (item.quantity <= item.reorderLevel) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  const filtered = inventory.filter((item) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const mName = item.medicine?.name.toLowerCase() || '';
      const bBrand = item.medicine?.brand.toLowerCase() || '';
      const batchNo = (item.batches?.[0]?.batchNumber || '').toLowerCase();
      if (!mName.includes(q) && !bBrand.includes(q) && !batchNo.includes(q)) {
        return false;
      }
    }

    // Branch filter
    if (branchFilter !== 'ALL' && item.branchId !== branchFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && item.medicine?.categoryId !== categoryFilter) {
      return false;
    }

    // Stock filter
    if (stockFilter !== 'ALL') {
      if (stockFilter === 'OUT_OF_STOCK' && item.quantity !== 0) return false;
      if (stockFilter === 'LOW_STOCK' && (item.quantity === 0 || item.quantity > item.reorderLevel)) return false;
      if (stockFilter === 'IN_STOCK' && item.quantity <= item.reorderLevel) return false;
    }

    // Expiry filter
    if (expiryFilter === 'EXPIRING') {
      if (!isExpiringSoon(item)) return false;
    } else if (expiryFilter === 'VALID') {
      if (isExpiringSoon(item)) return false;
    }

    return true;
  });

  const handleSaveAdjustment = async () => {
    if (!editingItem) return;
    const q = Number(adjustQty);
    if (q < 0) {
      showToast('Validation Error', 'Stock quantity cannot be negative.', 'error');
      return;
    }

    try {
      setIsAdjusting(true);
      const updatedItem = await inventoryApi.adjustStock(editingItem.id, q, adjustReason);

      setInventory((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...item, ...updatedItem } : item))
      );
      showToast(
        'Inventory Updated',
        `Adjusted ${editingItem.medicine?.name} stock to ${q} units (${adjustReason}). Logged in stock movements.`,
        'success'
      );
      setEditingItem(null);
    } catch (err: any) {
      showToast('Adjustment Failed', err.message || 'Could not adjust stock.', 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingBatch(true);
      // If there's an existing item for this medicine, add batch to it
      const targetItem = inventory.find(
        (i) =>
          i.medicine?.name.toLowerCase() === newMedicineName.toLowerCase() ||
          (branchFilter !== 'ALL' && i.branchId === branchFilter)
      ) || inventory[0];

      if (targetItem) {
        const updated = await inventoryApi.addBatch(targetItem.id, {
          batchNumber: newBatchNo,
          expiryDate: newExpiry,
          quantity: Number(newQuantity),
          purchasePrice: Number(newPrice) * 0.75,
        });
        setInventory((prev) =>
          prev.map((item) => (item.id === targetItem.id ? { ...item, ...updated } : item))
        );
      } else {
        // Mock fallback insertion
        const newItem: Inventory = {
          id: `inv_${Date.now()}`,
          organizationId: 'pharm_1',
          branchId: branchFilter !== 'ALL' ? branchFilter : (branches[0]?.id || 'br_1'),
          branchName: branches[0]?.name || 'Apothecary Main Branch',
          medicineId: 'med_1',
          medicine: {
            id: 'med_1',
            name: newMedicineName,
            genericName: 'Paracetamol',
            brand: 'Direct Batch',
            composition: '500mg',
            dosageForm: 'TABLET',
            strength: '500mg',
            categoryId: categories[0]?.id || 'cat_pain',
            prescriptionRequired: false,
            manufacturer: 'Pharma Lab',
            status: 'ACTIVE',
          },
          quantity: Number(newQuantity),
          reorderLevel: 20,
          sellingPrice: Number(newPrice),
          mrp: Number(newPrice) * 1.15,
          status: 'IN_STOCK',
          batches: [
            {
              id: `bch_${Date.now()}`,
              inventoryId: `inv_${Date.now()}`,
              batchNumber: newBatchNo,
              expiryDate: newExpiry,
              quantity: Number(newQuantity),
              purchasePrice: Number(newPrice) * 0.75,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
        setInventory([newItem, ...inventory]);
      }

      showToast('Batch Registered', `Batch ${newBatchNo} added to branch stock.`, 'success');
      setIsAddBatchOpen(false);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add batch.', 'error');
    } finally {
      setIsAddingBatch(false);
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem || !destBranchId) return;

    if (transferItem.branchId === destBranchId) {
      showToast('Validation Error', 'Source and destination branches must be different.', 'error');
      return;
    }

    try {
      setIsTransferring(true);
      await inventoryApi.transferStock({
        sourceBranchId: transferItem.branchId,
        destinationBranchId: destBranchId,
        medicineId: transferItem.medicineId,
        quantity: Number(transferQuantity),
        notes: transferNotes,
      });

      showToast(
        'Stock Transferred',
        `Successfully transferred ${transferQuantity} units of ${transferItem.medicine?.name}.`,
        'success'
      );
      setIsTransferOpen(false);
      setTransferItem(null);
      await loadData();
    } catch (err: any) {
      showToast('Transfer Failed', err.message || 'Failed to execute transfer.', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const renderStateBadge = (state: ReturnType<typeof getComputedState>) => {
    switch (state) {
      case 'IN_STOCK':
        return <Badge variant="success" size="sm">In Stock</Badge>;
      case 'LOW_STOCK':
        return <Badge variant="warning" size="sm">Low Stock</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge variant="danger" size="sm">Out of Stock</Badge>;
      case 'EXPIRING':
        return <Badge variant="warning" size="sm">Expiring</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading branch stock and inventory..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Inventory Sync Error"
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
              Branch Stock & Inventory
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              Single Inventory Mode
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Single source of truth inventory shared in real-time across POS counter and online marketplace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh Inventory"
            className="p-1.5 rounded border border-sand-300 text-gray-600 hover:text-pine-800 hover:bg-sand-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsAddBatchOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock Batch</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: branch, category, stock, expiry, search */}
      <div className="bg-white border border-sand-300 rounded-md p-3 space-y-2.5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
            <label htmlFor="inventory-search" className="sr-only">Search inventory</label>
            <input
              id="inventory-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine, batch..."
              aria-label="Search medicine name, brand, or batch number"
              className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <label htmlFor="inventory-branch-filter" className="sr-only">Filter by branch</label>
            <select
              id="inventory-branch-filter"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              aria-label="Filter inventory by branch"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name.split('-')[1]?.trim() || b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="inventory-category-filter" className="sr-only">Filter by category</label>
            <select
              id="inventory-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter inventory by category"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter (In Stock, Low Stock, Out of Stock) */}
          <div>
            <label htmlFor="inventory-stock-filter" className="sr-only">Filter by stock level</label>
            <select
              id="inventory-stock-filter"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter inventory by stock level"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* Expiry Filter (Expiring, Valid) */}
          <div>
            <label htmlFor="inventory-expiry-filter" className="sr-only">Filter by expiry date</label>
            <select
              id="inventory-expiry-filter"
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              aria-label="Filter inventory by expiry date"
              className="w-full px-2.5 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <option value="ALL">All Expiry Dates</option>
              <option value="EXPIRING">Expiring &lt; 90 Days</option>
              <option value="VALID">Valid Shelf Life</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table: Medicine, Batch, Branch, Stock, Reorder Level, Expiry, Price, Status */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3">Reorder Level</th>
                <th className="py-2.5 px-3">Expiry</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500 text-xs">
                    No medicine inventory matches the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const state = getComputedState(item);
                  return (
                    <tr key={item.id} className="hover:bg-sand-50/50 transition-colors">
                      {/* Medicine */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-900">{item.medicine?.name}</div>
                        <div className="text-[10px] text-gray-500">{item.medicine?.brand} • {item.medicine?.composition}</div>
                      </td>

                      {/* Batch */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-700">
                        {item.batches?.[0]?.batchNumber || 'BCH-2025-091'}
                      </td>

                      {/* Branch */}
                      <td className="py-2.5 px-3 text-gray-700 text-[11px]">
                        {item.branchName?.split('-')[1]?.trim() || item.branchName || 'Pune Station'}
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900 text-xs">
                        {item.quantity} units
                      </td>

                      {/* Reorder Level */}
                      <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                        {item.reorderLevel} units
                      </td>

                      {/* Expiry */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-700">
                        {item.batches?.[0]?.expiryDate?.split('T')[0] || '2027-08-31'}
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                        ₹{Number(item.sellingPrice).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {renderStateBadge(state)}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTransferItem(item);
                              const other = branches.find((b) => b.id !== item.branchId);
                              setDestBranchId(other?.id || '');
                              setTransferQuantity(Math.min(10, item.quantity));
                              setIsTransferOpen(true);
                            }}
                            title="Transfer stock to another branch"
                            className="px-2 py-1 rounded bg-sand-50 hover:bg-sand-200 border border-sand-300 text-gray-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-pine-700" />
                            <span>Transfer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setAdjustQty(item.quantity);
                            }}
                            className="px-2.5 py-1 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-semibold text-xs transition-colors"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          title={`Stock Adjustment: ${editingItem.medicine?.name}`}
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustment}
                disabled={isAdjusting}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isAdjusting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Save Adjustment</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">New Verified Count (units)</label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                min={0}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
              />
              <span className="text-[10px] text-gray-500 font-mono">Current system count: {editingItem.quantity} units</span>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Audit Reason</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
              >
                <option value="Physical Shelf Count Correction">Physical Shelf Count Correction</option>
                <option value="Damaged / Broken Packaging">Damaged / Broken Packaging</option>
                <option value="Expired Stock Removal">Expired Stock Removal</option>
                <option value="Supplier Replacement Adjustment">Supplier Replacement Adjustment</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Stock Batch Modal */}
      {isAddBatchOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddBatchOpen(false)}
          title="Add New Stock Batch to Branch"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsAddBatchOpen(false)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBatchSubmit}
                disabled={isAddingBatch}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isAddingBatch && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Register Batch</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleAddBatchSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Medicine Product Name</label>
              <input
                type="text"
                value={newMedicineName}
                onChange={(e) => setNewMedicineName(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Batch Number</label>
                <input
                  type="text"
                  value={newBatchNo}
                  onChange={(e) => setNewBatchNo(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Expiry Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Quantity (units)</label>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  min={1}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  min={0.01}
                  step="0.01"
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Transfer Stock Modal */}
      {isTransferOpen && transferItem && (
        <Modal
          isOpen={true}
          onClose={() => setIsTransferOpen(false)}
          title={`Inter-Branch Transfer: ${transferItem.medicine?.name}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={isTransferring}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isTransferring && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Execute Transfer</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
            <div className="p-2.5 bg-sand-50 rounded border border-sand-200">
              <div className="font-semibold text-gray-800">Source Stock Available: {transferItem.quantity} units</div>
              <div className="text-[11px] text-gray-500">Source Branch: {transferItem.branchName || transferItem.branchId}</div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Destination Branch</label>
              <select
                value={destBranchId}
                onChange={(e) => setDestBranchId(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                required
              >
                <option value="">Select receiving branch...</option>
                {branches
                  .filter((b) => b.id !== transferItem.branchId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Transfer Quantity (units)</label>
              <input
                type="number"
                value={transferQuantity}
                onChange={(e) => setTransferQuantity(Number(e.target.value))}
                min={1}
                max={transferItem.quantity}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Transfer Reason / Audit Notes</label>
              <input
                type="text"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
