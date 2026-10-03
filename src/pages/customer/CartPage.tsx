import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MOCK_MEDICINES } from '@/services/api/mockData';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { medicine: MOCK_MEDICINES[0], quantity: 2, price: 32.50 },
    { medicine: MOCK_MEDICINES[1], quantity: 1, price: 210.00 },
  ]);

  const updateQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const next = [...items];
    next[index].quantity = newQty;
    setItems(next);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const discount = 15.00;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const rxRequired = items.some(i => i.medicine.prescriptionRequired);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'Shopping Cart' }]} />

      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-1">Branch: Apothecary Main Branch - Pune Station</p>
        </div>
        <Badge variant="brand" size="md">{items.length} Items</Badge>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
          <p className="text-xs text-gray-500">Explore our catalogue to add medicines</p>
          <Link to="/customer/medicines">
            <Button size="sm">Browse Catalogue</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardBody className="p-0 divide-y divide-gray-100">
                {items.map((item, index) => (
                  <div key={item.medicine.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.medicine.prescriptionRequired ? 'warning' : 'success'} size="sm">
                          {item.medicine.prescriptionRequired ? 'Rx Required' : 'OTC'}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">{item.medicine.dosageForm}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{item.medicine.name}</h3>
                      <p className="text-xs text-gray-500">{item.medicine.brand} • ₹{item.price.toFixed(2)} per unit</p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQty(index, item.quantity - 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(index, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-extrabold text-brand-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-gray-400 hover:text-red-600 p-1 text-xs"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {rxRequired && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Prescription Required for Items in Cart</p>
                  <p className="mt-0.5 text-amber-800">
                    You will be prompted to attach an uploaded prescription during checkout so our pharmacist can review it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader className="bg-gray-50/60">
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Order Summary</h3>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Delivery Fee</span>
                    <span className="font-semibold text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Total Payable</span>
                  <span className="text-xl font-extrabold text-brand-700">₹{total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={() => navigate('/customer/checkout')}
                  className="w-full"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Checkout
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
