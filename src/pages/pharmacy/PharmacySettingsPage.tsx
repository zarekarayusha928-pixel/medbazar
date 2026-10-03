import React from 'react';
import { Settings, Building, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const PharmacySettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'Pharmacy configuration saved successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Branch Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Configure business profile, licensing, and POS counter receipt templates</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader className="bg-gray-50/60">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Business & Licensing Information</h3>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <Input label="Pharmacy Legal Name" defaultValue="Apothecary Healthcare Private Limited" />
            <Input label="Drug License Number" defaultValue="20B/MH-PUN-104928" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Phone" defaultValue="+91 98230 11223" />
              <Input label="Contact Email" defaultValue="contact@apothecary.com" />
            </div>
          </CardBody>
        </Card>

        <Button type="submit" size="lg" leftIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </form>
    </div>
  );
};
