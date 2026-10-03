import React, { useState, useEffect } from 'react';
import { Calculator, Search, Plus, Trash2, Printer, CheckCircle, CreditCard, DollarSign, QrCode, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Medicine, Inventory, PosSaleItem, PosSale } from '@/types';
import { MOCK_INVENTORY } from '@/services/api/mockData';
import { posService } from '@/services/api/posService';

export const PharmacyPosPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<PosSaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<PosSale | null>(null);

  const [inventoryList, setInventoryList] = useState<Inventory[]>(MOCK_INVENTORY);

  const filteredInventory = inventoryList.filter(inv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.medicine?.name.toLowerCase().includes(q) ||
      inv.medicine?.genericName.toLowerCase().includes(q) ||
      inv.medicine?.brand.toLowerCase().includes(q) ||
      inv.medicine?.barcode?.includes(q)
    );
  });

  const addItemToPosCart = (inv: Inventory) => {
    if (inv.quantity <= 0) {
      showToast('Out of Stock', `${inv.medicine?.name} has 0 stock remaining`, 'error');
      return;
    }

    const existingIndex = cartItems.findIndex(i => i.medicineId === inv.medicineId);
    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      if (currentQty >= inv.quantity) {
        showToast('Stock Limit Reached', `Only ${inv.quantity} units available in branch stock`, 'warning');
        return;
      }
      const next = [...cartItems];
      next[existingIndex].quantity += 1;
      next[existingIndex].total = next[existingIndex].quantity * next[existingIndex].unitPrice;
      setCartItems(next);
    } else {
      const newItem: PosSaleItem = {
        id: `psi_${Date.now()}_${Math.random()}`,
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

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const item = cartItems[index];
    const inv = inventoryList.find(i => i.medicineId === item.medicineId);
    if (inv && newQty > inv.quantity) {
      showToast('Stock Limit Exceeded', `Cannot add more than ${inv.quantity} available stock`, 'warning');
      return;
    }
    const next = [...cartItems];
    next[index].quantity = newQty;
    next[index].total = newQty * next[index].unitPrice;
    setCartItems(next);
  };

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showToast('Empty POS Cart', 'Please add at least one medicine item to complete counter sale', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const sale = await posService.processSale({
        organizationId: 'pharm_1',
        branchId: 'branch_1',
        items: cartItems,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        discount
      });

      // Update local state to reflect reduced branch stock instantly
      setInventoryList([...MOCK_INVENTORY]);

      setCompletedSale(sale);
      setIsProcessing(false);
      showToast('Sale Completed', `Receipt ${sale.receiptNumber} generated. Branch inventory updated.`, 'success');
    } catch (err: any) {
      setIsProcessing(false);
      showToast('POS Sale Error', err.message || 'Transaction failed', 'error');
    }
  };

  const resetPosForm = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setCompletedSale(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900">Pharmacy Counter POS</h1>
            <Badge variant="success" size="sm" dot>Offline Store Terminal</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Branch: Apothecary Main Branch • Shared Branch Stock Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-180px)]">
        {/* Left 7 cols: Medicine Search & Quick Selection Grid */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Search bar */}
          <div className="p-3.5 bg-gray-50/80 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode or search medicine name, generic composition..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white font-medium focus:ring-2 focus:ring-brand-200 focus:border-brand-500 focus:outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Product Items Table / Grid */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredInventory.map((inv) => {
              const isOut = inv.quantity === 0;
              return (
                <div
                  key={inv.id}
                  onClick={() => !isOut && addItemToPosCart(inv)}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all select-none cursor-pointer ${
                    isOut
                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-brand-500 hover:bg-brand-50/20 shadow-2xs'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{inv.medicine?.name}</span>
                      {inv.medicine?.prescriptionRequired && <Badge variant="warning" size="sm">Rx</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">
                      Brand: {inv.medicine?.brand} • Batch: {inv.batches?.[0]?.batchNumber || 'N/A'} • Exp: {inv.batches?.[0]?.expiryDate || 'N/A'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-brand-700 block">₹{inv.sellingPrice.toFixed(2)}</span>
                    <span className={`text-[11px] font-bold ${isOut ? 'text-red-600' : inv.quantity <= inv.reorderLevel ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {isOut ? 'OUT OF STOCK' : `Stock: ${inv.quantity} units`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Active POS Cart & Billing Panel */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-400" />
              <h2 className="font-bold text-xs uppercase tracking-wider">Current Receipt Bill ({cartItems.length})</h2>
            </div>
            {cartItems.length > 0 && (
              <button onClick={() => setCartItems([])} className="text-xs text-red-400 hover:text-red-300">
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Table */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                <Calculator className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-xs font-semibold">POS Cart Empty</p>
                <p className="text-[11px] text-gray-400">Click medicines on the left list to add to counter sale</p>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={item.id} className="p-2.5 flex items-center justify-between text-xs gap-2">
                  <div className="flex-1 truncate">
                    <span className="font-bold text-gray-900 block truncate">{item.medicineName}</span>
                    <span className="text-[10px] text-gray-400">₹{item.unitPrice.toFixed(2)} / unit</span>
                  </div>

                  <div className="flex items-center border border-gray-300 rounded bg-white">
                    <button
                      onClick={() => updateCartQty(idx, item.quantity - 1)}
                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(idx, item.quantity + 1)}
                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <span className="font-bold text-gray-900 block">₹{item.total.toFixed(2)}</span>
                    <button onClick={() => removeFromCart(idx)} className="text-gray-400 hover:text-red-600 text-[10px]">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Payment Form */}
          <div className="p-3.5 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Walk-in Customer Name (Opt)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="py-1.5 text-xs bg-white"
              />
              <Input
                placeholder="Phone Number (Opt)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="py-1.5 text-xs bg-white"
              />
            </div>

            {/* Payment Mode */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'CASH', label: 'Cash', icon: DollarSign },
                { id: 'UPI', label: 'UPI QR', icon: QrCode },
                { id: 'CARD', label: 'Card', icon: CreditCard },
              ].map((pm) => {
                const Icon = pm.icon;
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all border ${
                      active ? 'bg-brand-600 text-white border-brand-700 shadow-xs' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Totals & Complete */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-16 px-2 py-0.5 border border-gray-300 rounded text-right font-bold text-xs bg-white"
                />
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-extrabold text-sm text-gray-900">Grand Total</span>
                <span className="font-extrabold text-xl text-brand-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              isLoading={isProcessing}
              disabled={cartItems.length === 0}
              className="w-full bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
              size="lg"
            >
              Complete Sale & Print Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {completedSale && (
        <Modal
          isOpen={true}
          onClose={resetPosForm}
          title="POS Counter Receipt Generated"
          size="sm"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Print Receipt
              </Button>
              <Button size="sm" onClick={resetPosForm}>
                Next Customer Sale
              </Button>
            </>
          }
        >
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-3 font-mono">
            <div className="text-center border-b border-gray-300 pb-2">
              <h3 className="font-bold text-sm text-gray-900 uppercase">Apothecary Healthcare</h3>
              <p className="text-[10px] text-gray-500">Pune Station Branch • Lic #20B/MH-PUN-104928</p>
              <p className="text-[10px] font-bold text-gray-700 mt-1">Receipt #{completedSale.receiptNumber}</p>
              <p className="text-[10px] text-gray-400">{new Date(completedSale.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-1">
              {completedSale.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.medicineName}</span>
                  <span className="font-bold">₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-2 space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{completedSale.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount:</span><span>-₹{completedSale.discount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-sm"><span>Total Paid ({completedSale.paymentMethod}):</span><span>₹{completedSale.total.toFixed(2)}</span></div>
            </div>

            <div className="text-center pt-2 text-[10px] text-emerald-700 font-sans font-bold">
              ✓ Single Branch Inventory Updated Automatically
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
