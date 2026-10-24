import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  Percent,
  Truck,
  FileCheck,
  Bell,
  RefreshCw,
  Lock,
  Globe,
  Sliders
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/api/adminService';
import { PlatformSettings } from '@/types';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'commercial' | 'compliance' | 'notifications'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await adminService.getPlatformSettings();
        setSettings(data);
      } catch {
        showToast('Error', 'Failed to retrieve platform settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      await adminService.updatePlatformSettings(settings);
      showToast('Settings Saved', 'Platform system configuration updated successfully.', 'success');
    } catch {
      showToast('Save Failed', 'Unable to persist configuration parameters', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading platform configuration parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              CORE CONTROLS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Platform Settings & Parameters</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure system parameters, take-rate commissions, regulatory compliance, and notification gateways
          </p>
        </div>

        <Button
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
        >
          Save All Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'general', label: 'General & Marketplace', icon: <Globe className="w-4 h-4" /> },
          { id: 'commercial', label: 'Commissions & Payouts', icon: <Percent className="w-4 h-4" /> },
          { id: 'compliance', label: 'Regulatory & Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'notifications', label: 'Alerts & Communications', icon: <Bell className="w-4 h-4" /> },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: General & Marketplace */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader className="bg-gray-50/70 py-3.5 px-5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                General System Parameters
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform Marketplace Brand Name"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  helperText="Displayed across consumer app, pharmacy receipts, and dispatch labels"
                />

                <Input
                  label="Default System Currency"
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform Support Email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  helperText="Recipient for regulatory inquiries and consumer escalations"
                />

                <Input
                  label="Platform Helpline Phone"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="System Timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                />

                <div className="flex flex-col justify-center">
                  <label className="text-xs font-semibold text-gray-700 mb-1">
                    System Maintenance Mode
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="text-xs text-gray-800">
                      Temporarily pause public marketplace transactions for scheduled maintenance
                    </span>
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tab 2: Commissions & Payouts */}
        {activeTab === 'commercial' && (
          <Card>
            <CardHeader className="bg-gray-50/70 py-3.5 px-5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Commercial Rules & Automated Payout Policies
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Platform Take-Rate Commission (%)"
                  type="number"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                  helperText="Default transaction fee deducted from retail partner gross sales"
                />

                <Input
                  label="Base Customer Delivery Fee (₹)"
                  type="number"
                  value={settings.deliveryFeeBase}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeBase: parseFloat(e.target.value) || 0 })}
                  helperText="Applied when order is below free delivery threshold"
                />

                <Input
                  label="Minimum Order Value (₹)"
                  type="number"
                  value={settings.minimumOrderValue}
                  onChange={(e) => setSettings({ ...settings, minimumOrderValue: parseFloat(e.target.value) || 0 })}
                  helperText="Minimum cart subtotal allowed for home delivery"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Automated Settlement & Payout Frequency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'WEEKLY', title: 'Weekly Cycle', desc: 'Settles every Monday 02:00 AM' },
                    { id: 'BIWEEKLY', title: 'Bi-Weekly Cycle', desc: 'Settles on 1st & 16th of each month' },
                    { id: 'MONTHLY', title: 'Monthly Cycle', desc: 'Settles on 1st calendar day' },
                  ].map((cycle) => (
                    <label
                      key={cycle.id}
                      className={`border rounded-xl p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        settings.payoutCycle === cycle.id
                          ? 'border-brand-600 bg-brand-50/40 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payoutCycle"
                        value={cycle.id}
                        checked={settings.payoutCycle === cycle.id}
                        onChange={() => setSettings({ ...settings, payoutCycle: cycle.id as any })}
                        className="text-brand-600 focus:ring-brand-500 mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">{cycle.title}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{cycle.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tab 3: Regulatory & Compliance */}
        {activeTab === 'compliance' && (
          <Card>
            <CardHeader className="bg-gray-50/70 py-3.5 px-5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Drug Regulatory Authority & Statutory Controls
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Central Drug Standard Authority Registration ID"
                  value={settings.drugRegulatoryAuthorityId}
                  onChange={(e) => setSettings({ ...settings, drugRegulatoryAuthorityId: e.target.value })}
                  helperText="Platform intermediary regulatory certificate code (CDSCO)"
                />

                <Input
                  label="Prescription & Dispensing Audit Retention (Years)"
                  type="number"
                  value={settings.rxRecordRetentionYears}
                  onChange={(e) => setSettings({ ...settings, rxRecordRetentionYears: parseInt(e.target.value) || 5 })}
                  helperText="Statutory requirement under Drugs and Cosmetics Act"
                />
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireDigitalRxVerification}
                    onChange={(e) => setSettings({ ...settings, requireDigitalRxVerification: e.target.checked })}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-900">
                      Enforce Mandatory Registered Pharmacist Verification for Schedule H / X Drugs
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Prevents order packing and payment collection until a pharmacist reviews the uploaded Rx.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.require2FAForOwners}
                    onChange={(e) => setSettings({ ...settings, require2FAForOwners: e.target.checked })}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-900">
                      Enforce Two-Factor Authentication (2FA) for Pharmacy Owners & Branch Managers
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Requires OTP verification on all pharmacy business profile modifications and bank payout changes.
                    </p>
                  </div>
                </label>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tab 4: Alerts & Communications */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader className="bg-gray-50/70 py-3.5 px-5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Platform Notifications & Gateway Integration
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer py-2 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={settings.smsGatewayEnabled}
                  onChange={(e) => setSettings({ ...settings, smsGatewayEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-900">SMS Gateway Integration</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Transmit automated OTP codes and delivery tracking SMS updates to customers.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer py-2 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) => setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-900">Tax Invoice & Email Receipts</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Send automated GST invoice PDFs to buyers and daily settlement summaries to pharmacy owners.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={settings.dispatchAlertsEnabled}
                  onChange={(e) => setSettings({ ...settings, dispatchAlertsEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-900">Urgent Dispatch Alerts</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Notify delivery personnel when priority prescription orders are marked Ready for Dispatch.
                  </p>
                </div>
              </label>
            </CardBody>
          </Card>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="submit"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
