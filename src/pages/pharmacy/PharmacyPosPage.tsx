import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  AlertTriangle,
  History,
  ShoppingCart,
  User,
  UserPlus,
  X,
  RotateCcw,
  Barcode
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_INVENTORY, MOCK_CATEGORIES, MOCK_CUSTOMERS } from '@/services/api/mockData';
import { Inventory, PosSaleItem, PosSale } from '@/types';
import { posApi } from '@/services/api/posApi';
import { inventoryApi } from '@/services/api/inventoryApi';

interface SalesHistoryRecord {
  receipt: string;
  date: string;
  customer: string;
  items: string;
  itemsCount: number;
  amount: number;
  payment: 'CASH' | 'UPI' | 'CARD';
  cashier: string;
  itemsDetail: PosSaleItem[];
  subtotal: number;
  discount: number;
}

export const PharmacyPosPage: React.FC = () => {
  const { showToast } = useToast();

  // Active view: 'POS' or 'HISTORY'
  const [activeTab, setActiveTab] = useState<'POS' | 'HISTORY'>('POS');

  // Inventory State (Single Source of Truth)
  const [inventoryList, setInventoryList] = useState<Inventory[]>(MOCK_INVENTORY);

  // SEARCH STATES (Left Column)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // CART STATES (Center Column)
  const [cartItems, setCartItems] = useState<PosSaleItem[]>([]);

  // CHECKOUT & CUSTOMER STATES (Right Column)
  const [customerMode, setCustomerMode] = useState<'WALK_IN' | 'EXISTING' | 'NEW'>('WALK_IN');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [discount, setDiscount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt & Print Modal
  const [completedReceipt, setCompletedReceipt] = useState<SalesHistoryRecord | null>(null);

  // Load real inventory and history on mount
  useEffect(() => {
    let mounted = true;
    async function loadPosData() {
      try {
        const [invData, salesData] = await Promise.all([
          inventoryApi.getBranchInventory('br_1').catch(() => MOCK_INVENTORY),
          posApi.getSalesHistory({ branchId: 'br_1' }).catch(() => []),
        ]);
        if (mounted) {
          if (invData && invData.length > 0) setInventoryList(invData);
          if (salesData && salesData.length > 0) {
            const mapped: SalesHistoryRecord[] = salesData.map((s) => ({
              receipt: s.receiptNumber,
              date: s.createdAt.replace('T', ' ').substring(0, 16),
              customer: s.customerName || 'Walk-in Customer',
              items: s.items?.map((i) => `${i.medicineName.split(' ')[0]} (${i.quantity}x)`).join(', ') || 'Medication items',
              itemsCount: s.items?.reduce((acc, i) => acc + i.quantity, 0) || 1,
              amount: Number(s.total),
              payment: s.paymentMethod as any,
              cashier: (s as any).createdBy?.name || 'Kiran Kulkarni',
              subtotal: Number(s.subtotal),
              discount: Number(s.discount),
              itemsDetail: s.items || [],
            }));
            setSalesHistory((prev) => [...mapped, ...prev]);
          }
        }
      } catch (_err) {
        // Fallback
      }
    }
    loadPosData();
    return () => {
      mounted = false;
    };
  }, []);

  // SALES HISTORY
  const [salesHistory, setSalesHistory] = useState<SalesHistoryRecord[]>([
    {
      receipt: 'RCP-2026-1042',
      date: '2026-10-13 19:15',
      customer: 'Walk-in Customer',
      items: 'Dolo 650 (2x), Pan 40 (1x)',
      itemsCount: 3,
      amount: 202.00,
      payment: 'CASH',
      cashier: 'Kiran Kulkarni',
      subtotal: 202.00,
      discount: 0,
      itemsDetail: [
        { id: '1', medicineId: 'med_1', medicineName: 'Paracetamol 650mg (Dolo 650)', quantity: 2, unitPrice: 30.00, total: 60.00 },
        { id: '2', medicineId: 'med_8', medicineName: 'Pantoprazole Gastro-Resistant 40mg (Pan 40)', quantity: 1, unitPrice: 142.00, total: 142.00 }
      ]
    },
    {
      receipt: 'RCP-2026-1041',
      date: '2026-10-13 18:40',
      customer: 'Rajesh Sharma',
      items: 'Augmentin 625 (1x), Dolo 650 (1x)',
      itemsCount: 2,
      amount: 228.00,
      payment: 'UPI',
      cashier: 'Kiran Kulkarni',
      subtotal: 238.00,
      discount: 10.00,
      itemsDetail: [
        { id: '3', medicineId: 'med_2', medicineName: 'Amoxicillin & Clavulanate 625mg (Augmentin)', quantity: 1, unitPrice: 208.00, total: 208.00 },
        { id: '4', medicineId: 'med_1', medicineName: 'Paracetamol 650mg (Dolo 650)', quantity: 1, unitPrice: 30.00, total: 30.00 }
      ]
    },
    {
      receipt: 'RCP-2026-1040',
      date: '2026-10-13 17:22',
      customer: 'Priya Verma',
      items: 'Metformin HCl 500mg (2x)',
      itemsCount: 2,
      amount: 92.00,
      payment: 'CARD',
      cashier: 'Amit Deshmukh',
      subtotal: 92.00,
      discount: 0,
      itemsDetail: [
        { id: '5', medicineId: 'med_3', medicineName: 'Metformin HCl 500mg (Glycomet 500 SR)', quantity: 2, unitPrice: 46.00, total: 92.00 }
      ]
    },
    {
      receipt: 'RCP-2026-1039',
      date: '2026-10-13 16:05',
      customer: 'Walk-in Customer',
      items: 'Dettol Disinfectant 250ml (1x)',
      itemsCount: 1,
      amount: 135.00,
      payment: 'CASH',
      cashier: 'Kiran Kulkarni',
      subtotal: 135.00,
      discount: 0,
      itemsDetail: [
        { id: '6', medicineId: 'med_6', medicineName: 'Dettol Antiseptic Liquid 250ml', quantity: 1, unitPrice: 135.00, total: 135.00 }
      ]
    }
  ]);

  // Filter Search Results (by medicine name, barcode, generic name, category)
  const searchResults = inventoryList.filter((inv) => {
    // Category filter
    if (categoryFilter !== 'ALL' && inv.medicine?.categoryId !== categoryFilter) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const nameMatch = inv.medicine?.name.toLowerCase().includes(q) || false;
    const genericMatch = inv.medicine?.genericName.toLowerCase().includes(q) || false;
    const barcodeMatch = (inv.medicine?.barcode || '').includes(q);
    const brandMatch = inv.medicine?.brand.toLowerCase().includes(q) || false;

    return nameMatch || genericMatch || barcodeMatch || brandMatch;
  });

  // CART OPERATIONS
  const addToCart = (inv: Inventory) => {
    if (inv.quantity <= 0) {
      showToast('Out of Stock', `${inv.medicine?.name} is currently out of stock`, 'error');
      return;
    }

    const existingIdx = cartItems.findIndex(i => i.medicineId === inv.medicineId);
    if (existingIdx > -1) {
      const currentQty = cartItems[existingIdx].quantity;
      if (currentQty >= inv.quantity) {
        showToast('Stock Limit', `Cannot exceed ${inv.quantity} units available in branch inventory`, 'warning');
        return;
      }
      const updated = [...cartItems];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].total = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setCartItems(updated);
    } else {
      const newItem: PosSaleItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        medicineId: inv.medicineId,
        medicineName: inv.medicine?.name || 'Unknown',
        quantity: 1,
        unitPrice: inv.sellingPrice,
        total: inv.sellingPrice,
        batchNumber: inv.batches?.[0]?.batchNumber || 'BCH-2025-091'
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateQuantity = (idx: number, newQty: number) => {
    if (newQty < 1) return;
    const item = cartItems[idx];
    const inv = inventoryList.find(i => i.medicineId === item.medicineId);
    if (inv && newQty > inv.quantity) {
      showToast('Exceeds Stock', `Only ${inv.quantity} units in branch inventory`, 'warning');
      return;
    }
    const updated = [...cartItems];
    updated[idx].quantity = newQty;
    updated[idx].total = newQty * updated[idx].unitPrice;
    setCartItems(updated);
  };

  const removeFromCart = (idx: number) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  // CHECKOUT TOTALS
  const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const total = Math.max(0, subtotal - discount);

  // CUSTOMER RESOLUTION
  const getResolvedCustomer = (): { name: string; phone: string } => {
    if (customerMode === 'WALK_IN') {
      return { name: 'Walk-in Customer', phone: 'Counter Direct' };
    }
    if (customerMode === 'EXISTING') {
      const found = MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId);
      return {
        name: found ? found.name : 'Walk-in Customer',
        phone: found ? found.phone : 'Counter Direct'
      };
    }
    return {
      name: customCustomerName.trim() || 'Walk-in Customer',
      phone: customCustomerPhone.trim() || 'Counter Direct'
    };
  };

  // COMPLETE SALE
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      showToast('Cart is Empty', 'Please select at least one item to complete sale', 'warning');
      return;
    }

    try {
      setIsProcessing(true);
      const customer = getResolvedCustomer();
      const idempotencyKey = `pos_req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const paymentRef = paymentMethod !== 'CASH' ? `POS-TXN-${Date.now().toString().slice(-6)}` : undefined;

      const sale = await posApi.processSale({
        organizationId: 'pharm_1',
        branchId: 'br_1',
        items: cartItems,
        paymentMethod,
        paymentRef,
        customerName: customer.name,
        customerPhone: customer.phone,
        discount,
        idempotencyKey,
      });

      // 1. Deduct quantity from branch inventoryList
      const nextInv = inventoryList.map((inv) => {
        const cartMatch = cartItems.find((c) => c.medicineId === inv.medicineId);
        if (cartMatch) {
          const nextQty = Math.max(0, inv.quantity - cartMatch.quantity);
          return {
            ...inv,
            quantity: nextQty,
            status: (nextQty === 0 ? 'OUT_OF_STOCK' : nextQty <= inv.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK') as any,
          };
        }
        return inv;
      });
      setInventoryList(nextInv);

      // 2. Build receipt record
      const itemsSummary =
        sale.items?.map((i) => `${i.medicineName.split(' ')[0]} (${i.quantity}x)`).join(', ') ||
        cartItems.map((i) => `${i.medicineName.split(' ')[0]} (${i.quantity}x)`).join(', ');

      const record: SalesHistoryRecord = {
        receipt: sale.receiptNumber,
        date: sale.createdAt.replace('T', ' ').substring(0, 16),
        customer: sale.customerName || customer.name,
        items: itemsSummary,
        itemsCount: sale.items?.reduce((s, i) => s + i.quantity, 0) || cartItems.reduce((s, i) => s + i.quantity, 0),
        amount: Number(sale.total),
        payment: sale.paymentMethod as any,
        cashier: (sale as any).createdBy?.name || 'Kiran Kulkarni (Cashier)',
        itemsDetail: sale.items || [...cartItems],
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount),
      };

      setSalesHistory((prev) => [record, ...prev]);
      setCompletedReceipt(record);
      clearCart();
      showToast('Sale Completed', `Receipt ${sale.receiptNumber} generated. Stock deducted.`, 'success');
    } catch (err: any) {
      showToast('Sale Failed', err.message || 'Could not complete POS sale.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="space-y-3 font-sans text-gray-900 antialiased">
      {/* Top POS Utility Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-300 pb-2.5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Pharmacy Counter POS
          </h1>
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Terminal 01 • Pune Station Branch</span>
          </div>
        </div>

        {/* Tab switcher: Active POS vs Sales History */}
        <div className="flex rounded border border-sand-300 bg-white p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('POS')}
            className={`px-3 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'POS' ? 'bg-pine-700 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Billing Terminal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'bg-pine-700 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sales History ({salesHistory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'POS' ? (
        /* ========================================================================= */
        /* 3-COLUMN DESKTOP POS LAYOUT: LEFT, CENTER, RIGHT */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT: Medicine Search (4 cols) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 bg-white border border-sand-300 rounded-lg p-3 space-y-3 shadow-sm flex flex-col h-auto lg:h-[calc(100vh-175px)]">
            <div className="space-y-2 border-b border-sand-200 pb-2.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500 font-bold block">
                Medicine Catalogue Search
              </span>

              {/* Unified Search Input (Medicine name, barcode, generic name) */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" aria-hidden="true" />
                <label htmlFor="pos-search-input" className="sr-only">Search medicines</label>
                <input
                  id="pos-search-input"
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, barcode, generic composition..."
                  aria-label="Search medicines by name, barcode, or generic composition"
                  className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </div>

              {/* Category Filter */}
              <label htmlFor="pos-category-filter" className="sr-only">Filter by category</label>
              <select
                id="pos-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter catalogue by category"
                className="w-full px-2 py-1 rounded border border-sand-300 text-xs bg-white text-gray-700 focus:outline-none focus:border-pine-700 focus-visible:ring-2 focus-visible:ring-brand-500 font-sans"
              >
                <option value="ALL">All Categories ({MOCK_CATEGORIES.length})</option>
                {MOCK_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Search Results list */}
            <div className="flex-1 overflow-y-auto divide-y divide-sand-200 space-y-1 pr-1">
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No matching medicines found in branch stock.
                </div>
              ) : (
                searchResults.map((inv) => {
                  const isOut = inv.quantity === 0;
                  const isLow = inv.quantity > 0 && inv.quantity <= inv.reorderLevel;

                  return (
                    <div
                      key={inv.id}
                      onClick={() => !isOut && addToCart(inv)}
                      className={`p-2 rounded border transition-colors select-none cursor-pointer flex flex-col gap-1 ${
                        isOut
                          ? 'bg-sand-100/60 border-sand-200 opacity-60 cursor-not-allowed'
                          : 'bg-white border-sand-200 hover:border-pine-700 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-gray-900 block truncate" title={inv.medicine?.name}>
                            {inv.medicine?.name}
                          </span>
                          <span className="text-[10px] text-gray-500 block truncate">
                            {inv.medicine?.genericName} • {inv.medicine?.brand}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-gray-900 shrink-0">
                          ₹{inv.sellingPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Strength, Price, Stock & Availability */}
                      <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                        <span className="text-gray-500 text-[10px]">
                          Strength: {inv.medicine?.strength || 'Std'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-600">Stock: {inv.quantity}</span>
                          {isOut ? (
                            <span className="px-1 py-0.2 rounded bg-red-100 text-red-800 text-[9px] font-bold">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CENTER: Cart / Selected Items (5 cols) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 bg-white border border-sand-300 rounded-lg p-3 space-y-3 shadow-sm flex flex-col h-auto min-h-[320px] lg:h-[calc(100vh-175px)]">
            <div className="flex items-center justify-between border-b border-sand-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  Active POS Cart
                </span>
                <span className="font-mono text-[11px] bg-sand-200 text-gray-800 px-1.5 py-0.2 rounded">
                  {cartItems.length} lines
                </span>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold font-mono"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Table: Medicine, Quantity, Unit Price, Total, Remove */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="py-24 text-center text-xs text-gray-400 space-y-1">
                  <ShoppingCart className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
                  <p className="font-medium text-gray-500">Cart is empty</p>
                  <p className="text-[11px] text-gray-400">Select medications from the catalogue search on the left</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200 text-[10px] font-mono uppercase text-gray-500 bg-sand-50/70">
                      <th className="py-1.5 px-2">Medicine</th>
                      <th className="py-1.5 px-2 text-center">Qty</th>
                      <th className="py-1.5 px-2 text-right">Unit Price</th>
                      <th className="py-1.5 px-2 text-right">Total</th>
                      <th className="py-1.5 px-1 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {cartItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-sand-50/40 transition-colors">
                        {/* Medicine */}
                        <td className="py-2 px-2 max-w-[140px]">
                          <span className="font-bold text-gray-900 block truncate" title={item.medicineName}>
                            {item.medicineName}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            Batch: {item.batchNumber}
                          </span>
                        </td>

                        {/* Quantity with + / - controls */}
                        <td className="py-2 px-2 text-center">
                          <div className="inline-flex items-center border border-sand-300 rounded bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(idx, item.quantity - 1)}
                              aria-label={`Decrease quantity of ${item.medicineName}`}
                              className="px-1.5 py-0.5 text-gray-600 hover:bg-sand-100 font-mono text-[11px] focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono font-bold text-xs text-gray-900" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(idx, item.quantity + 1)}
                              aria-label={`Increase quantity of ${item.medicineName}`}
                              className="px-1.5 py-0.5 text-gray-600 hover:bg-sand-100 font-mono text-[11px] focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="py-2 px-2 text-right font-mono text-gray-700">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>

                        {/* Total */}
                        <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">
                          ₹{item.total.toFixed(2)}
                        </td>

                        {/* Remove */}
                        <td className="py-2 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeFromCart(idx)}
                            aria-label={`Remove ${item.medicineName} from POS cart`}
                            className="text-gray-400 hover:text-red-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick summary line at bottom of cart */}
            {cartItems.length > 0 && (
              <div className="pt-2 border-t border-sand-200 flex items-center justify-between font-mono text-xs text-gray-600">
                <span>{cartItems.reduce((acc, i) => acc + i.quantity, 0)} units across {cartItems.length} lines</span>
                <span className="font-bold text-gray-900">Subtotal: ₹{subtotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT: Sale Summary, Customer & Checkout (3 cols) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-3 bg-white border border-sand-300 rounded-lg p-3.5 space-y-3.5 shadow-sm flex flex-col h-auto lg:h-[calc(100vh-175px)] justify-between">
            <div className="space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500 font-bold block border-b border-sand-200 pb-1.5">
                Customer & Checkout
              </span>

              {/* CUSTOMER SELECTION: Walk-in / Existing / New */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 bg-sand-100 p-0.5 rounded border border-sand-200 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('WALK_IN')}
                    className={`py-1 rounded text-center font-semibold transition-colors ${
                      customerMode === 'WALK_IN' ? 'bg-pine-700 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('EXISTING')}
                    className={`py-1 rounded text-center font-semibold transition-colors ${
                      customerMode === 'EXISTING' ? 'bg-pine-700 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('NEW')}
                    className={`py-1 rounded text-center font-semibold transition-colors ${
                      customerMode === 'NEW' ? 'bg-pine-700 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    New +
                  </button>
                </div>

                {/* Walk-in note */}
                {customerMode === 'WALK_IN' && (
                  <p className="text-[11px] text-gray-500 font-mono">
                    Direct counter sale (anonymous cash receipt)
                  </p>
                )}

                {/* Existing customer select */}
                {customerMode === 'EXISTING' && (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700 font-sans"
                  >
                    <option value="">Select registered patient...</option>
                    {MOCK_CUSTOMERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                )}

                {/* New customer quick entry */}
                {customerMode === 'NEW' && (
                  <div className="space-y-1.5 text-xs">
                    <input
                      type="text"
                      placeholder="Patient Full Name"
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile (+91)"
                      value={customCustomerPhone}
                      onChange={(e) => setCustomCustomerPhone(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* PAYMENT OPTIONS: Cash / UPI / Card */}
              <div className="space-y-1.5 pt-1 border-t border-sand-200">
                <span className="font-mono text-[10px] uppercase font-bold text-gray-500 block">
                  Payment Method
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'UPI', label: 'UPI QR', icon: QrCode },
                    { id: 'CARD', label: 'Card', icon: CreditCard },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isActive = paymentMethod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 border transition-colors ${
                          isActive
                            ? 'bg-pine-700 text-white border-pine-700 shadow-sm'
                            : 'bg-white hover:bg-sand-100 text-gray-700 border-sand-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TOTALS: Subtotal, Discount, Total */}
              <div className="space-y-1.5 pt-2 border-t border-sand-200 text-xs">
                <div className="flex justify-between text-gray-600 font-mono">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600 font-mono">
                  <span>Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 border border-sand-300 rounded text-right font-bold text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                  />
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-sand-300 font-mono">
                  <span className="font-bold text-sm text-gray-900">Total Payable</span>
                  <span className="font-bold text-lg text-pine-800">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* PRIMARY CTA: COMPLETE SALE */}
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={isProcessing || cartItems.length === 0}
              className="w-full py-2.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processing Sale...' : 'COMPLETE SALE'}
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SALES HISTORY VIEW: Receipt, Date, Customer, Items, Amount, Payment, Cashier */
        /* ========================================================================= */
        <div className="bg-white border border-sand-300 rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 border-b border-sand-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase font-mono text-gray-900">
                Terminal Sales Audit Log
              </h2>
              <p className="text-xs text-gray-500">
                Completed counter receipts recorded in the branch ledger
              </p>
            </div>
            <span className="font-mono text-xs text-gray-600 font-bold">
              Total Revenue: ₹{salesHistory.reduce((s, r) => s + r.amount, 0).toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                  <th className="py-2.5 px-3">Receipt</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Cashier</th>
                  <th className="py-2.5 px-3 text-right">Reprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 font-sans">
                {salesHistory.map((s) => (
                  <tr key={s.receipt} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      {s.receipt}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                      {s.date}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {s.customer}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 max-w-[200px] truncate" title={s.items}>
                      {s.items}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      ₹{s.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sand-100 border border-sand-300 text-gray-800 font-bold">
                        {s.payment}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                      {s.cashier}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setCompletedReceipt(s)}
                        className="px-2 py-1 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-mono text-[11px] font-semibold"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLEAN PRINTABLE RECEIPT MODAL */}
      {/* ========================================================================= */}
      {completedReceipt && (
        <Modal
          isOpen={true}
          onClose={() => setCompletedReceipt(null)}
          title={`Counter Sale Slip — ${completedReceipt.receipt}`}
          size="sm"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="px-3 py-1.5 rounded border border-sand-300 bg-white text-xs font-semibold text-gray-700 hover:bg-sand-100"
              >
                Done
              </button>
            </div>
          }
        >
          {/* Printable Receipt Container */}
          <div className="p-4 bg-white border border-sand-300 rounded font-mono text-xs space-y-3 print:border-none print:p-0">
            {/* Header */}
            <div className="text-center border-b border-dashed border-gray-300 pb-2.5 space-y-0.5">
              <h2 className="font-extrabold text-sm text-gray-900 uppercase">
                Apothecary Healthcare
              </h2>
              <p className="text-[10px] text-gray-500">
                Pune Station Branch • Shop 12-14, Central Plaza, Pune
              </p>
              <p className="text-[10px] text-gray-500">
                Drug Lic: 20B/MH-PUN-104928 • GSTIN: 27AABCA1234F1Z5
              </p>
              <div className="pt-1.5 flex justify-between text-[10px] text-gray-600">
                <span>Receipt: <strong className="text-gray-900">{completedReceipt.receipt}</strong></span>
                <span>Date: {completedReceipt.date}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Customer: {completedReceipt.customer}</span>
                <span>Cashier: {completedReceipt.cashier.split(' ')[0]}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-1 border-b border-dashed border-gray-300 pb-2 text-[11px]">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Item</span>
                <span className="text-right">Qty × Price = Amount</span>
              </div>
              {completedReceipt.itemsDetail.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline">
                  <div className="truncate max-w-[170px]">
                    <span className="font-bold text-gray-900">{item.medicineName}</span>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    {item.quantity} × ₹{item.unitPrice.toFixed(2)} = <strong className="text-gray-900">₹{item.total.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal, Discount & Total */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{completedReceipt.subtotal.toFixed(2)}</span>
              </div>
              {completedReceipt.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span>-₹{completedReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-gray-300 text-gray-900">
                <span>Net Total Paid ({completedReceipt.payment}):</span>
                <span>₹{completedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-dashed border-gray-300 text-[10px] text-gray-500 space-y-0.5">
              <p>Verified by Registered Pharmacist</p>
              <p>Keep this receipt for medicine returns within 7 days</p>
              <p className="font-sans font-semibold text-emerald-700 pt-0.5">
                ✓ Branch stock updated in Med Bazar single stock engine
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
