import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  MapPin,
  FileText,
  Package,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  Bell,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import { CustomerAddress } from '@/types';
import { MOCK_CUSTOMERS, MOCK_PRESCRIPTIONS, MOCK_ORDERS } from '@/services/api/mockData';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ADDRESSES' | 'PRESCRIPTIONS' | 'ORDERS' | 'SETTINGS'>('PROFILE');

  // Customer state
  const customer = MOCK_CUSTOMERS[0];
  const [name, setName] = useState(user?.name || customer.name);
  const [email, setEmail] = useState(user?.email || customer.email);
  const [phone, setPhone] = useState(user?.phone || customer.phone);
  const [addresses, setAddresses] = useState<CustomerAddress[]>(customer.addresses);
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);

  // Address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newType, setNewType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('Pune');
  const [newPincode, setNewPincode] = useState('411001');

  // Notification settings state
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    try {
      await new Promise(r => setTimeout(r, 600));
      showToast('Password Updated', 'Your customer password was changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    showToast('Signed Out', 'You have been signed out of your customer session.', 'info');
    navigate('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile Updated', 'Your customer account details have been saved.', 'success');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine.trim()) return;

    const newAddr: CustomerAddress = {
      id: `addr_${Date.now()}`,
      type: newType,
      addressLine: newLine.trim(),
      city: newCity.trim(),
      state: 'Maharashtra',
      pincode: newPincode.trim(),
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddAddress(false);
    setNewLine('');
    showToast('Address Added', `${newType} delivery address saved.`, 'success');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
    showToast('Address Removed', 'Delivery address deleted.', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    showToast('Default Address Set', 'Preferred shipping location updated.', 'success');
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/customer' }, { label: 'My Account & Profile' }]} />

      {/* Header */}
      <div className="border-b border-sand-300 pb-5">
        <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Customer Management</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Patient Profile & Preferences</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage saved addresses, prescription records, order history, and notification preferences.
        </p>
      </div>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar Tabs */}
        <div className="space-y-1.5 md:col-span-1">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'PROFILE'
                ? 'bg-pine-700 text-white shadow-2xs'
                : 'bg-white border border-sand-300 text-gray-700 hover:bg-sand-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ADDRESSES')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'ADDRESSES'
                ? 'bg-pine-700 text-white shadow-2xs'
                : 'bg-white border border-sand-300 text-gray-700 hover:bg-sand-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'ADDRESSES' ? 'bg-pine-800 text-white' : 'bg-sand-200 text-gray-700'}`}>
              {addresses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PRESCRIPTIONS')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'PRESCRIPTIONS'
                ? 'bg-pine-700 text-white shadow-2xs'
                : 'bg-white border border-sand-300 text-gray-700 hover:bg-sand-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Prescriptions</span>
            </div>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'PRESCRIPTIONS' ? 'bg-pine-800 text-white' : 'bg-sand-200 text-gray-700'}`}>
              {prescriptions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ORDERS')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'ORDERS'
                ? 'bg-pine-700 text-white shadow-2xs'
                : 'bg-white border border-sand-300 text-gray-700 hover:bg-sand-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </div>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'ORDERS' ? 'bg-pine-800 text-white' : 'bg-sand-200 text-gray-700'}`}>
              {MOCK_ORDERS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'SETTINGS'
                ? 'bg-pine-700 text-white shadow-2xs'
                : 'bg-white border border-sand-300 text-gray-700 hover:bg-sand-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          {/* TAB 1: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="border-b border-sand-200 pb-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sand-100 border border-sand-300 text-pine-800 flex items-center justify-center font-bold text-xl font-mono">
                  RS
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{customer.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">Registered Customer • ID #{customer.id}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-pine-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-pine-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-pine-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-2xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'ADDRESSES' && (
            <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sand-200 pb-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Saved Delivery Addresses</h3>
                  <p className="text-xs text-gray-500">Default address will be automatically populated during checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Add Address Form Modal / Drawer */}
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-sand-100 border border-sand-300 space-y-3 text-xs">
                  <span className="font-bold text-gray-900 block font-mono">New Delivery Location</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Address Label:</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as 'HOME' | 'WORK' | 'OTHER')}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white"
                      >
                        <option value="HOME">Home</option>
                        <option value="WORK">Work / Office</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">City:</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Street / House / Building Details:</label>
                    <input
                      type="text"
                      value={newLine}
                      onChange={(e) => setNewLine(e.target.value)}
                      placeholder="e.g. 402, Sunshine Villa, FC Road"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Pincode:</label>
                      <input
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="bg-pine-700 hover:bg-pine-800 text-white font-semibold px-4 py-2 rounded-xl"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="bg-white border border-sand-300 text-gray-700 font-semibold px-4 py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl border border-sand-300 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 font-sans">{addr.type}</span>
                        {addr.isDefault && (
                          <Badge variant="brand" size="sm">Default</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 font-sans">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-pine-800 font-semibold hover:underline"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'PRESCRIPTIONS' && (
            <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sand-200 pb-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Uploaded Prescriptions</h3>
                  <p className="text-xs text-gray-500">Prescription records stored safely for branch pharmacist verification.</p>
                </div>
                <Link
                  to="/customer/prescriptions"
                  className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New</span>
                </Link>
              </div>

              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-5 rounded-2xl border border-sand-300 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sand-100 text-pine-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{rx.doctorName || 'Doctor Prescription'}</span>
                          <Badge variant={rx.status === 'APPROVED' ? 'success' : 'warning'} size="sm">
                            {rx.status}
                          </Badge>
                        </div>
                        <p className="text-gray-500 font-mono text-[11px]">
                          Uploaded: {new Date(rx.uploadedAt || rx.createdAt).toLocaleDateString()} • Verified by: {rx.reviewedBy || 'Pharmacist'}
                        </p>
                        <p className="text-gray-700 text-[11px]">
                          Document: {rx.fileName} ({rx.fileType})
                        </p>
                      </div>
                    </div>

                    <a
                      href={rx.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl border border-sand-300 hover:border-pine-700 text-pine-800 font-semibold text-xs transition-colors shrink-0"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'ORDERS' && (
            <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sand-200 pb-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Recent Medicine Orders</h3>
                  <p className="text-xs text-gray-500">Live order fulfillment records across participating branches.</p>
                </div>
                <Link
                  to="/customer/orders"
                  className="text-xs font-semibold text-pine-800 hover:underline"
                >
                  View All Orders →
                </Link>
              </div>

              <div className="space-y-3">
                {MOCK_ORDERS.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-sand-300 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">#{ord.orderNumber}</span>
                        <Badge variant={ord.status === 'DELIVERED' ? 'success' : 'warning'} size="sm">
                          {ord.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 font-sans">{ord.branchName} • {new Date(ord.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-[11px]">
                        {ord.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="font-bold text-sm text-gray-900 font-sans">₹{ord.total.toFixed(2)}</span>
                      <Link
                        to={`/customer/orders/${ord.id}`}
                        className="bg-sand-100 hover:bg-sand-200 text-pine-800 font-semibold px-3 py-1.5 rounded-xl border border-sand-300"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="bg-white rounded-3xl border border-sand-300 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="border-b border-sand-200 pb-4">
                <h3 className="font-bold text-base text-gray-900">Notification & Account Settings</h3>
                <p className="text-xs text-gray-500">Configure how you receive order updates and security options.</p>
              </div>

              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-gray-800 uppercase font-mono text-[11px]">Fulfillment Notifications</h4>
                
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-sand-300 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 block">SMS Notifications</span>
                    <span className="text-gray-500">Receive SMS alerts when pharmacist confirms or dispatches order.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-pine-700 rounded border-sand-300 focus:ring-pine-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-sand-300 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 block">WhatsApp Order Updates</span>
                    <span className="text-gray-500">Receive real-time courier tracking and digital bill via WhatsApp.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 text-pine-700 rounded border-sand-300 focus:ring-pine-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-sand-300 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 block">Email Tax Receipts</span>
                    <span className="text-gray-500">Send itemized PDF receipts directly to {customer.email}.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReceipts}
                    onChange={(e) => setEmailReceipts(e.target.checked)}
                    className="w-4 h-4 text-pine-700 rounded border-sand-300 focus:ring-pine-600"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => showToast('Settings Saved', 'Notification preferences updated.', 'success')}
                  className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-2xs"
                >
                  Save Notification Preferences
                </button>
              </div>

              {/* Password & Security Section */}
              <div className="pt-6 border-t border-sand-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-pine-700" />
                  <h4 className="font-bold text-gray-800 uppercase font-mono text-[11px]">Security & Password</h4>
                </div>

                {passwordError && (
                  <p role="alert" className="text-xs text-red-600 font-medium">
                    {passwordError}
                  </p>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-pine-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">New Password (8+ chars)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-pine-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-pine-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Account Session & Logout */}
              <div className="pt-6 border-t border-sand-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 uppercase font-mono text-[11px]">Account Session</h4>
                  <p className="text-xs text-gray-500">Sign out of this browser session on your current device.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
