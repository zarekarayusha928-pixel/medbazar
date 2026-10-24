import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  Store,
  Upload,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
  AlertCircle,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';
import { MOCK_CUSTOMERS, MOCK_PRESCRIPTIONS } from '@/services/api/mockData';
import { orderApi } from '@/services/api/orderApi';
import { prescriptionApi } from '@/services/api/prescriptionApi';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, selectedBranch, subtotal, discount, deliveryFee, total, hasRxItems, clearCart } = useCart();
  const { showToast } = useToast();

  const customer = MOCK_CUSTOMERS[0];
  const [selectedAddressId, setSelectedAddressId] = useState(customer.addresses[0]?.id || 'addr_1');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState(selectedBranch.city);
  const [newPincode, setNewPincode] = useState('411001');

  const [fulfillmentType, setFulfillmentType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentOption, setPaymentOption] = useState<'ONLINE_UPI' | 'COD' | 'CARD'>('ONLINE_UPI');
  
  // Prescription requirement state
  const [prescriptionChoice, setPrescriptionChoice] = useState<'EXISTING' | 'UPLOAD_NEW'>(
    MOCK_PRESCRIPTIONS.length > 0 ? 'EXISTING' : 'UPLOAD_NEW'
  );
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(MOCK_PRESCRIPTIONS[0]?.id || '');
  const [newPrescriptionFile, setNewPrescriptionFile] = useState<File | null>(null);
  const [newDoctorName, setNewDoctorName] = useState('Dr. S. K. Joshi (MD Medicine)');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect back
  if (items.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 bg-white rounded-lg border border-sand-300 max-w-lg mx-auto p-6 sm:p-8 space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your cart is empty</h3>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/customer/medicines"
          className="inline-block bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-6 py-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Browse Medicines
        </Link>
      </div>
    );
  }

  const effectiveDeliveryFee = fulfillmentType === 'PICKUP' ? 0 : deliveryFee;
  const grandPayable = Math.max(0, subtotal - discount + effectiveDeliveryFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasRxItems && prescriptionChoice === 'UPLOAD_NEW' && !newPrescriptionFile && !newDoctorName) {
      showToast('Prescription Required', 'Please attach a valid doctor prescription file for Schedule H items.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalRxId = hasRxItems ? selectedPrescriptionId : undefined;

      if (hasRxItems && prescriptionChoice === 'UPLOAD_NEW') {
        const uploaded = await prescriptionApi.uploadPrescription({
          organizationId: selectedBranch.organizationId || 'pharm_1',
          doctorName: newDoctorName.trim() || 'Consulting Physician',
          fileName: newPrescriptionFile ? newPrescriptionFile.name : 'prescription_upload.pdf',
          fileType: newPrescriptionFile?.type.includes('image') ? 'IMAGE' : 'PDF',
        });
        finalRxId = uploaded.id;
      }

      const selectedAddr = customer.addresses.find(a => a.id === selectedAddressId) || customer.addresses[0];
      const deliveryAddress = fulfillmentType === 'DELIVERY'
        ? (isAddingNewAddress
            ? `${newAddressLine}, ${newCity} - ${newPincode}`
            : `${selectedAddr.addressLine}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`)
        : undefined;

      const orderPayload = {
        branchId: selectedBranch.id,
        organizationId: selectedBranch.organizationId,
        items: items.map(i => ({ medicineId: i.medicine.id, quantity: i.quantity })),
        orderType: fulfillmentType,
        paymentMethod: paymentOption === 'ONLINE_UPI' ? 'UPI' : (paymentOption === 'COD' ? 'COD' : 'CARD'),
        paymentRef: paymentOption === 'COD' ? undefined : `PAY-${Date.now()}`,
        deliveryAddress,
        prescriptionId: finalRxId,
        customerName: customer.name,
        customerPhone: customer.phone,
        idempotencyKey: `idemp_order_${Date.now()}`,
      };

      const created = await orderApi.createOrder(orderPayload);
      clearCart();
      showToast('Order Placed Successfully', `Your medicine order #${created.orderNumber} has been received.`, 'success');
      navigate(`/customer/orders/${created.id}`);
    } catch (err: any) {
      showToast('Order Failed', err?.message || 'Could not place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/customer' },
          { label: 'Cart', href: '/customer/cart' },
          { label: 'Order Checkout' }
        ]}
      />

      <div className="border-b border-sand-300 pb-5">
        <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Final Verification</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Order Checkout & Fulfillment</h1>
        <p className="text-xs text-gray-500 mt-1">
          Dispensing Pharmacy Branch: <strong className="text-gray-800">{selectedBranch.name}</strong>
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Two Columns: Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Fulfillment Method (Delivery vs Pickup) */}
          <div className="bg-white rounded-lg border border-sand-300 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono">
                1. Select Fulfillment Method
              </h3>
              <span className="font-mono text-[11px] text-gray-500">Step 1 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  fulfillmentType === 'DELIVERY'
                    ? 'border-pine-700 bg-sand-100 ring-2 ring-pine-600/30'
                    : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${fulfillmentType === 'DELIVERY' ? 'bg-pine-700 text-white' : 'bg-sand-100 text-gray-600'}`}>
                  <Truck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-sm block">Doorstep Delivery</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    Delivered safely to your registered address from {selectedBranch.city}.
                  </span>
                  <span className="font-mono text-[11px] text-pine-800 font-semibold mt-1 block">
                    {deliveryFee === 0 ? 'Free Delivery' : `Standard fee: ₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  fulfillmentType === 'PICKUP'
                    ? 'border-pine-700 bg-sand-100 ring-2 ring-pine-600/30'
                    : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${fulfillmentType === 'PICKUP' ? 'bg-pine-700 text-white' : 'bg-sand-100 text-gray-600'}`}>
                  <Store className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-sm block">Pharmacy Counter Pickup</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    Collect directly from {selectedBranch.name.split('-')[1] || selectedBranch.name}.
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700 font-semibold mt-1 block">
                    Free (Ready within 30 mins)
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Address (If Delivery chosen) */}
          {fulfillmentType === 'DELIVERY' && (
            <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono">
                  2. Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-semibold text-pine-800 hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewAddress ? 'Cancel' : 'Add New Address'}</span>
                </button>
              </div>

              {/* Saved Addresses List */}
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-3.5 sm:p-4 rounded-lg border flex items-start justify-between cursor-pointer transition-colors ${
                      selectedAddressId === addr.id && !isAddingNewAddress
                        ? 'border-pine-700 bg-sand-100 ring-1 ring-pine-700'
                        : 'border-sand-300 bg-white hover:border-sand-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="delivery_address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id && !isAddingNewAddress}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setIsAddingNewAddress(false);
                        }}
                        className="mt-1 text-pine-700 focus:ring-pine-600"
                      />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{addr.type}</span>
                          {addr.isDefault && (
                            <Badge variant="brand" size="sm">Default</Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-gray-500 font-mono text-[11px]">Recipient: {customer.name} ({customer.phone})</p>
                      </div>
                    </div>
                  </label>
                ))}

                {/* Inline New Address Form */}
                {isAddingNewAddress && (
                  <div className="p-4 rounded-lg border border-pine-600 bg-sand-50 space-y-3 text-xs">
                    <span className="font-bold text-gray-900 block font-mono">Enter Delivery Address</span>
                    <div>
                      <label className="block text-gray-600 mb-1">Street Address / Apartment / Flat:</label>
                      <input
                        type="text"
                        value={newAddressLine}
                        onChange={(e) => setNewAddressLine(e.target.value)}
                        placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                        className="w-full px-3 py-2 rounded-lg border border-sand-300 bg-white text-xs focus:outline-none focus:border-pine-600"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-600 mb-1">City:</label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-sand-300 bg-white text-xs focus:outline-none focus:border-pine-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">Pincode:</label>
                        <input
                          type="text"
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-sand-300 bg-white text-xs focus:outline-none focus:border-pine-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Prescription Requirement Section */}
          <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono">
                  3. Doctor Prescription Requirement
                </h3>
                {hasRxItems ? (
                  <Badge variant="warning" size="sm">Mandatory</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Optional</Badge>
                )}
              </div>
              <span className="font-mono text-[11px] text-gray-500">Step 3 of 4</span>
            </div>

            {hasRxItems && (
              <div className="p-3.5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Your order includes regulated medications. Please attach an approved prescription. Your dispensing pharmacist will verify the doctor’s details before packing.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrescriptionChoice('EXISTING')}
                  className={`p-3.5 rounded-lg border text-left text-xs transition-colors ${
                    prescriptionChoice === 'EXISTING'
                      ? 'border-pine-700 bg-sand-100 font-bold text-pine-900 ring-1 ring-pine-700'
                      : 'border-sand-300 bg-white text-gray-700 hover:border-sand-400'
                  }`}
                >
                  <span className="block font-bold">Select Saved Prescription</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Use existing verified document on file</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrescriptionChoice('UPLOAD_NEW')}
                  className={`p-3.5 rounded-lg border text-left text-xs transition-colors ${
                    prescriptionChoice === 'UPLOAD_NEW'
                      ? 'border-pine-700 bg-sand-100 font-bold text-pine-900 ring-1 ring-pine-700'
                      : 'border-sand-300 bg-white text-gray-700 hover:border-sand-400'
                  }`}
                >
                  <span className="block font-bold">Upload New Prescription</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Upload doctor note (JPG/PDF)</span>
                </button>
              </div>

              {prescriptionChoice === 'EXISTING' ? (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-gray-700">Choose from profile prescriptions:</label>
                  <div className="space-y-2">
                    {MOCK_PRESCRIPTIONS.map((rx) => (
                      <label
                        key={rx.id}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          selectedPrescriptionId === rx.id ? 'border-pine-700 bg-sand-50' : 'border-sand-300 bg-white hover:border-sand-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="rx_choice"
                            value={rx.id}
                            checked={selectedPrescriptionId === rx.id}
                            onChange={() => setSelectedPrescriptionId(rx.id)}
                            className="text-pine-700 focus:ring-pine-600"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{rx.doctorName || 'Doctor Prescription'}</span>
                            <span className="text-gray-500 font-mono text-[11px]">
                              Uploaded on {new Date(rx.uploadedAt || rx.createdAt).toLocaleDateString()} • Verified format: {rx.fileType}
                            </span>
                          </div>
                        </div>
                        <Badge variant={rx.status === 'APPROVED' ? 'success' : 'warning'} size="sm">
                          {rx.status}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border-2 border-dashed border-sand-300 bg-sand-50 text-center space-y-3">
                  <Upload className="w-8 h-8 text-pine-700 mx-auto" />
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="font-bold text-gray-900">Upload Doctor Prescription File</p>
                    <p className="text-[11px] text-gray-500">Supports Clear Photos, Scans, PNG, JPG or PDF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewPrescriptionFile(e.target.files[0]);
                        showToast('Document Attached', `${e.target.files[0].name} attached to order`, 'info');
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pine-700 file:text-white hover:file:bg-pine-800 cursor-pointer"
                  />
                  {newPrescriptionFile && (
                    <div className="text-xs text-emerald-800 font-mono font-medium flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Attached: {newPrescriptionFile.name} ({(newPrescriptionFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Payment Method Placeholder */}
          <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono">
                4. Payment Method
              </h3>
              <span className="font-mono text-[11px] text-gray-500">Step 4 of 4</span>
            </div>

            <div className="space-y-3">
              <label
                className={`p-3.5 sm:p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentOption === 'ONLINE_UPI' ? 'border-pine-700 bg-sand-100 ring-1 ring-pine-700' : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE_UPI"
                    checked={paymentOption === 'ONLINE_UPI'}
                    onChange={() => setPaymentOption('ONLINE_UPI')}
                    className="text-pine-700 focus:ring-pine-600"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">UPI / Instant Online Payment</span>
                    <span className="text-[11px] text-gray-500 font-mono">Google Pay, PhonePe, Paytm, or UPI ID</span>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-pine-700" />
              </label>

              <label
                className={`p-3.5 sm:p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentOption === 'CARD' ? 'border-pine-700 bg-sand-100 ring-1 ring-pine-700' : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentOption === 'CARD'}
                    onChange={() => setPaymentOption('CARD')}
                    className="text-pine-700 focus:ring-pine-600"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">Credit / Debit Cards</span>
                    <span className="text-[11px] text-gray-500 font-mono">Visa, MasterCard, RuPay</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-gray-500" />
              </label>

              <label
                className={`p-3.5 sm:p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentOption === 'COD' ? 'border-pine-700 bg-sand-100 ring-1 ring-pine-700' : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentOption === 'COD'}
                    onChange={() => setPaymentOption('COD')}
                    className="text-pine-700 focus:ring-pine-600"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">
                      {fulfillmentType === 'PICKUP' ? 'Pay at Counter on Pickup' : 'Cash on Delivery (COD)'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">Pay with cash or UPI on receiving goods</span>
                  </div>
                </div>
                <Banknote className="w-5 h-5 text-gray-500" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-6 lg:sticky lg:top-24 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 border-b border-sand-200 pb-3">
              Order Summary
            </h3>

            {/* Itemized preview */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-sand-100 text-xs pr-1">
              {items.map((i) => (
                <div key={i.medicine.id} className="pt-2 first:pt-0 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900 line-clamp-1">{i.medicine.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Qty: {i.quantity} × ₹{i.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 font-sans">
                    ₹{(i.quantity * i.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div className="border-t border-sand-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discounts</span>
                  <span className="font-mono font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Fulfillment Fee</span>
                <span className="font-mono font-semibold text-gray-900">
                  {effectiveDeliveryFee === 0 ? 'FREE' : `₹${effectiveDeliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-sand-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-sm text-gray-900">Total Payable</span>
                  <span className="text-[10px] text-gray-400 font-mono block">All taxes included</span>
                </div>
                <span className="text-2xl font-extrabold text-pine-800 font-sans">
                  ₹{grandPayable.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pine-700 hover:bg-pine-800 disabled:bg-sand-200 disabled:text-gray-400 text-white font-semibold text-sm py-3.5 sm:py-4 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isSubmitting ? (
                <span>CREATING ORDER...</span>
              ) : (
                <>
                  <span>CONFIRM & PLACE ORDER</span>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>

            {/* Regulatory Footer */}
            <div className="text-[11px] text-gray-500 space-y-1.5 pt-2 border-t border-sand-200 font-sans">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pine-700 shrink-0" />
                <span>Dispensed by licensed pharmacist from <strong>{selectedBranch.name}</strong></span>
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                By placing this order you consent to branch pharmacists reviewing attached medical prescriptions.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
