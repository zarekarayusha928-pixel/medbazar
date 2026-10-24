import React, { useState } from 'react';
import { Settings, Building, Store, ShieldCheck, Bell, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export const PharmacySettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'BRANCH' | 'STAFF' | 'NOTIFICATIONS'>('PROFILE');

  // Pharmacy Profile State
  const [legalName, setLegalName] = useState('Apothecary Healthcare Private Limited');
  const [tradeName, setTradeName] = useState('Apothecary Healthcare');
  const [licenseNumber, setLicenseNumber] = useState('20B/MH-PUN-104928');
  const [gstin, setGstin] = useState('27AABCA1234F1Z5');
  const [phone, setPhone] = useState('+91 98230 11223');
  const [email, setEmail] = useState('contact@apothecary.com');

  // Branch Configuration State
  const [branchName, setBranchName] = useState('Apothecary Main Branch - Pune Station');
  const [branchAddress, setBranchAddress] = useState('Shop 12-14, Central Plaza, Station Road');
  const [operatingHours, setOperatingHours] = useState('08:00 AM - 11:00 PM');
  const [deliveryRadius, setDeliveryRadius] = useState('8.5');
  const [minOrderValue, setMinOrderValue] = useState('199');

  // Staff Configuration State
  const [regPharmacistName, setRegPharmacistName] = useState('Amit Deshmukh');
  const [regCouncilNumber, setRegCouncilNumber] = useState('MH-44091 / Maharashtra State Pharmacy Council');
  const [requireRxConfirmation, setRequireRxConfirmation] = useState(true);
  const [allowCashierPriceOverride, setAllowCashierPriceOverride] = useState(false);

  // Notification Preferences State
  const [smsOnOrderConfirm, setSmsOnOrderConfirm] = useState(true);
  const [whatsappDeliveryUpdates, setWhatsappDeliveryUpdates] = useState(true);
  const [lowStockManagerAlerts, setLowStockManagerAlerts] = useState(true);
  const [dailySalesEmailReport, setDailySalesEmailReport] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Configuration Saved', 'Pharmacy and branch operational settings updated successfully.', 'success');
  };

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Pharmacy & Branch Configuration
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage pharmacy licensing, physical dispensary parameters, staff compliance, and alerts
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Pharmacy configuration tabs" className="flex border-b border-sand-300 gap-2 font-mono text-xs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'PROFILE'}
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-2 px-3 border-b-2 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-pine-600 ${
            activeTab === 'PROFILE'
              ? 'border-pine-700 text-pine-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Pharmacy Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'BRANCH'}
          onClick={() => setActiveTab('BRANCH')}
          className={`pb-2 px-3 border-b-2 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-pine-600 ${
            activeTab === 'BRANCH'
              ? 'border-pine-700 text-pine-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Branch Configuration
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'STAFF'}
          onClick={() => setActiveTab('STAFF')}
          className={`pb-2 px-3 border-b-2 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-pine-600 ${
            activeTab === 'STAFF'
              ? 'border-pine-700 text-pine-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Staff Configuration
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'NOTIFICATIONS'}
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`pb-2 px-3 border-b-2 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-pine-600 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-pine-700 text-pine-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Notification Preferences
        </button>
      </div>

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="bg-white border border-sand-300 rounded-md p-5 shadow-sm max-w-3xl space-y-5 text-xs">
        {/* 1. PHARMACY PROFILE */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 uppercase font-mono text-[11px]">
                Business Licensing & Legal Identity
              </h2>
              <p className="text-gray-500 text-[11px]">Commercial details registered under State Drug Control Administration</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Legal Registered Entity Name</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Marketplace Trade Name</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Drug License Number (Form 20B/21B)</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Official Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Official Support Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. BRANCH CONFIGURATION */}
        {activeTab === 'BRANCH' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 uppercase font-mono text-[11px]">
                Physical Branch Operations
              </h2>
              <p className="text-gray-500 text-[11px]">Operating hours, doorstep fulfillment radius, and location</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Active Branch Location Name</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Street Address</label>
              <input
                type="text"
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Dispensary Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Max Delivery Radius (km)</label>
                <input
                  type="number"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Min Free Order Value (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. STAFF CONFIGURATION */}
        {activeTab === 'STAFF' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 uppercase font-mono text-[11px]">
                Clinical Staff & POS Policy Configuration
              </h2>
              <p className="text-gray-500 text-[11px]">Registered supervising pharmacist and POS terminal restrictions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Lead Reg. Pharmacist</label>
                <input
                  type="text"
                  value={regPharmacistName}
                  onChange={(e) => setRegPharmacistName(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">State Council Reg. Number</label>
                <input
                  type="text"
                  value={regCouncilNumber}
                  onChange={(e) => setRegCouncilNumber(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-sand-200">
                <input
                  type="checkbox"
                  checked={requireRxConfirmation}
                  onChange={(e) => setRequireRxConfirmation(e.target.checked)}
                  className="w-4 h-4 text-pine-700 rounded border-sand-300"
                />
                <div>
                  <span className="font-bold text-gray-900 block">Strict Prescription Audit Lock</span>
                  <span className="text-gray-500 text-[11px]">Schedule H / H1 drugs cannot be dispensed via POS or delivery without pharmacist electronic sign-off.</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-sand-200">
                <input
                  type="checkbox"
                  checked={allowCashierPriceOverride}
                  onChange={(e) => setAllowCashierPriceOverride(e.target.checked)}
                  className="w-4 h-4 text-pine-700 rounded border-sand-300"
                />
                <div>
                  <span className="font-bold text-gray-900 block">Allow Cashier Counter Discounts</span>
                  <span className="text-gray-500 text-[11px]">Allows cashiers to apply discretionary item-level discounts up to 10% during offline POS sales.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 4. NOTIFICATION PREFERENCES */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 uppercase font-mono text-[11px]">
                Branch Alert & Notification Policies
              </h2>
              <p className="text-gray-500 text-[11px]">Control event dispatches to patients and internal branch staff</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded border border-sand-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">Patient SMS on Order Confirmation</span>
                  <span className="text-gray-500 text-[11px]">Send instant SMS when pharmacist reviews and confirms prescription order.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsOnOrderConfirm}
                  onChange={(e) => setSmsOnOrderConfirm(e.target.checked)}
                  className="w-4 h-4 text-pine-700 rounded border-sand-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded border border-sand-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">WhatsApp Courier Tracking Updates</span>
                  <span className="text-gray-500 text-[11px]">Broadcast delivery agent dispatch and estimated arrival via WhatsApp.</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappDeliveryUpdates}
                  onChange={(e) => setWhatsappDeliveryUpdates(e.target.checked)}
                  className="w-4 h-4 text-pine-700 rounded border-sand-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded border border-sand-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">Low Stock Threshold Notifications</span>
                  <span className="text-gray-500 text-[11px]">Trigger urgent alert when branch medicine inventory drops below reorder point.</span>
                </div>
                <input
                  type="checkbox"
                  checked={lowStockManagerAlerts}
                  onChange={(e) => setLowStockManagerAlerts(e.target.checked)}
                  className="w-4 h-4 text-pine-700 rounded border-sand-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded border border-sand-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">Daily Sales & Inventory Reconcile Report</span>
                  <span className="text-gray-500 text-[11px]">Email aggregated POS + Online revenue digest at 23:59 daily.</span>
                </div>
                <input
                  type="checkbox"
                  checked={dailySalesEmailReport}
                  onChange={(e) => setDailySalesEmailReport(e.target.checked)}
                  className="w-4 h-4 text-pine-700 rounded border-sand-300"
                />
              </label>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-sand-200">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
