import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Tag,
  CheckCircle2,
  Plus,
  Minus,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, selectedBranch, subtotal, discount, deliveryFee, total, hasRxItems } = useCart();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'MEDBAZAR10' || code === 'SAVE25' || code === 'FIRSTCARE') {
      const disc = 25.00;
      setAppliedCoupon(code);
      setCouponDiscount(disc);
      showToast('Coupon Applied', `Code ${code} applied successfully! Saved ₹${disc.toFixed(2)}`, 'success');
    } else {
      showToast('Invalid Coupon', 'Code not recognized. Try MEDBAZAR10', 'error');
    }
  };

  const finalDiscount = discount + couponDiscount;
  const grandTotal = Math.max(0, subtotal + deliveryFee - finalDiscount);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/customer' }, { label: 'Shopping Cart' }]} />

      {/* Header */}
      <div className="border-b border-sand-300 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Order Pre-Checkout</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Review Your Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            Fulfilling branch: <span className="font-semibold text-gray-800">{selectedBranch.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            {items.length} {items.length === 1 ? 'Product' : 'Products'}
          </Badge>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-lg border border-sand-300 space-y-4 max-w-xl mx-auto p-6 sm:p-8 shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-sand-100 text-gray-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" aria-hidden="true" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your shopping cart is empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Browse our verified pharmacy inventory to add prescribed medicines or daily healthcare supplies.
          </p>
          <div className="pt-2">
            <Link
              to="/customer/medicines"
              className="inline-flex items-center gap-2 bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-6 py-3 rounded-lg transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span>Explore Medicine Catalogue</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prescription Warning Banner if applicable */}
            {hasRxItems && (
              <div className="p-4 sm:p-5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Prescription (Rx) Required for One or More Items</p>
                  <p className="text-amber-800">
                    Your cart contains Schedule H medicines. You will be able to attach an existing uploaded prescription or upload a new photo/PDF at checkout before order confirmation.
                  </p>
                </div>
              </div>
            )}

            {/* Dispensing Branch Summary Pill */}
            <div className="bg-sand-100 rounded-lg border border-sand-300 p-3.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-pine-700 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Dispensed by: <strong>{selectedBranch.name}</strong> ({selectedBranch.city})
                </span>
              </div>
              <Link
                to="/customer/pharmacies"
                className="text-pine-800 font-bold hover:underline shrink-0 text-[11px]"
              >
                Change Branch
              </Link>
            </div>

            {/* Items Table / List */}
            <div className="bg-white rounded-lg border border-sand-300 overflow-hidden divide-y divide-sand-200 shadow-sm">
              {items.map((item) => (
                <div
                  key={item.medicine.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Medicine Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.medicine.prescriptionRequired ? 'warning' : 'success'}
                        size="sm"
                      >
                        {item.medicine.prescriptionRequired ? 'Rx Required' : 'OTC'}
                      </Badge>
                      <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                        {item.medicine.dosageForm} • {item.medicine.strength}
                      </span>
                    </div>

                    <Link
                      to={`/customer/medicines/${item.medicine.id}`}
                      className="font-bold text-gray-900 text-sm sm:text-base hover:text-pine-800 transition-colors block"
                    >
                      {item.medicine.name}
                    </Link>

                    <p className="text-xs text-gray-500 font-sans">
                      Salt: <span className="text-gray-700">{item.medicine.genericName}</span>
                    </p>

                    <p className="font-mono text-[11px] text-gray-400">
                      ₹{item.unitPrice.toFixed(2)} per unit
                    </p>
                  </div>

                  {/* Quantity & Price Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-sand-200">
                    {/* Stepper */}
                    <div className="flex items-center border border-sand-300 rounded-lg bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                        className="w-8 h-8 rounded hover:bg-sand-100 flex items-center justify-center text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label={`Decrease quantity of ${item.medicine.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-9 text-center font-bold text-xs text-gray-900 font-mono" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                        className="w-8 h-8 rounded hover:bg-sand-100 flex items-center justify-center text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label={`Increase quantity of ${item.medicine.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Total for item & Remove */}
                    <div className="text-right min-w-[90px]">
                      <span className="font-bold text-base text-gray-900 block font-sans">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.medicine.id)}
                        aria-label={`Remove ${item.medicine.name} from cart`}
                        className="text-gray-400 hover:text-red-600 text-[11px] font-mono mt-0.5 transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/customer/medicines"
                className="text-xs font-semibold text-gray-600 hover:text-pine-800 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Continue shopping medicines</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-sand-300 p-5 sm:p-6 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 font-sans border-b border-sand-200 pb-3">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label htmlFor="cart-coupon-input" className="block text-xs font-semibold text-gray-700">Promo Code or Coupon:</label>
                <div className="flex gap-2">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. MEDBAZAR10"
                    aria-label="Enter promo code or coupon"
                    className="flex-1 px-3 py-2 rounded-lg border border-sand-300 text-xs font-mono uppercase bg-sand-50 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-gray-800 font-semibold text-xs rounded-lg transition-colors font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    <span>Coupon {appliedCoupon} active (₹{couponDiscount.toFixed(2)} off)</span>
                  </p>
                )}
              </form>

              {/* Price Calculations */}
              <div className="space-y-3 text-xs divide-y divide-sand-200 pt-1">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {finalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 pt-2 font-medium">
                    <span>Discount Savings</span>
                    <span className="font-mono font-semibold">-₹{finalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 pt-2">
                  <div>
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 && (
                      <span className="text-[10px] text-emerald-700 font-mono block">Free above ₹500</span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-gray-900">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-3 text-sm">
                  <div>
                    <span className="font-bold text-gray-900">Final Total</span>
                    <span className="text-[10px] text-gray-400 font-mono block">Inclusive of GST</span>
                  </div>
                  <span className="text-2xl font-extrabold text-pine-800 font-sans">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate('/customer/checkout')}
                className="w-full bg-pine-700 hover:bg-pine-800 text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Trust Metadata */}
              <div className="text-[11px] text-gray-500 space-y-1.5 pt-2 border-t border-sand-200 font-sans">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pine-700" />
                  <span>Licensed chemist branch packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pine-700" />
                  <span>Doorstep delivery or zero-cost counter pickup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
