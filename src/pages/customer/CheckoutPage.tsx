import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import { MOCK_CUSTOMERS, MOCK_PRESCRIPTIONS } from '@/services/api/mockData';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [deliveryType, setDeliveryType] = useState<'ONLINE' | 'PICKUP'>('ONLINE');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD' | 'UPI'>('ONLINE');
  const [selectedPrescription, setSelectedPrescription] = useState(MOCK_PRESCRIPTIONS[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = MOCK_CUSTOMERS[0];
  const address = customer.addresses[0];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Order Created Successfully', 'Your order #MB-2026-8801 has been sent to the pharmacy for verification', 'success');
      navigate('/customer/orders/ord_101');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'Cart', href: '/customer/cart' }, { label: 'Checkout' }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">Review delivery address, prescription and payment method</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type */}
          <Card>
            <CardHeader className="bg-gray-50/60">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Fulfillment Method</h3>
            </CardHeader>
            <CardBody className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('ONLINE')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'ONLINE' ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-200' : 'border-gray-200 bg-white'
                  }`}
                >
                  <MapPin className={`w-5 h-5 ${deliveryType === 'ONLINE' ? 'text-brand-600' : 'text-gray-400'}`} />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">Home Delivery</span>
                    <span className="text-xs text-gray-500">Delivered directly to your door</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('PICKUP')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'PICKUP' ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-200' : 'border-gray-200 bg-white'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${deliveryType === 'PICKUP' ? 'text-brand-600' : 'text-gray-400'}`} />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">Store Pickup</span>
                    <span className="text-xs text-gray-500">Collect directly from branch counter</span>
                  </div>
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Delivery Address */}
          {deliveryType === 'ONLINE' && (
            <Card>
              <CardHeader className="bg-gray-50/60">
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Delivery Address</h3>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                <div className="p-4 rounded-xl border border-brand-200 bg-teal-50/30 flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{customer.name}</span>
                      <Badge variant="brand" size="sm">{address.type}</Badge>
                    </div>
                    <p className="text-gray-600">{address.addressLine}, {address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-gray-500 font-medium">Phone: {customer.phone}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Prescription Upload / Select */}
          <Card>
            <CardHeader className="bg-gray-50/60 flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Attach Prescription</h3>
              <Badge variant="warning" size="sm">Required for Augmentin 625mg</Badge>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              <Select
                label="Select Uploaded Prescription"
                value={selectedPrescription}
                onChange={(e) => setSelectedPrescription(e.target.value)}
                options={[
                  { value: 'presc_1', label: 'Rx_Dr_Patil_Augmentin.jpg (Uploaded Oct 02, 2026)' },
                  { value: 'new', label: '+ Upload New Prescription File' }
                ]}
              />

              {selectedPrescription === 'new' && (
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center bg-gray-50/50">
                  <Upload className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-800">Click to upload prescription file (Image or PDF)</p>
                  <p className="text-[10px] text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="bg-gray-50/60">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Payment Method</h3>
            </CardHeader>
            <CardBody className="p-5 space-y-3">
              <div className="space-y-2">
                {[
                  { id: 'ONLINE', title: 'Online Payment (UPI, Credit/Debit Card, Netbanking)', desc: 'Instant confirmation' },
                  { id: 'UPI', title: 'UPI QR / GPay / PhonePe', desc: 'Fast UPI payment' },
                  { id: 'COD', title: 'Cash on Delivery / Pickup Counter', desc: 'Pay when delivered' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === pm.id ? 'border-brand-600 bg-brand-50/30' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id as any)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="font-bold text-gray-900 text-xs block">{pm.title}</span>
                      <span className="text-[11px] text-gray-500">{pm.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader className="bg-gray-50/60">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Payment Summary</h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between"><span>Items Subtotal</span><span className="font-semibold text-gray-900">₹275.00</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span className="font-semibold text-gray-900">₹40.00</span></div>
                <div className="flex justify-between text-emerald-600"><span>Coupon Discount</span><span>-₹15.00</span></div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                <span className="text-xl font-extrabold text-brand-700">₹300.00</span>
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                Confirm & Place Order
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
};
