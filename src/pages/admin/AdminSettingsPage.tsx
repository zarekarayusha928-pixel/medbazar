import React from 'react';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Platform System Configuration</h1>
        <p className="text-xs text-gray-500 mt-1">Configure global platform parameters, subscription plans, and commission rules</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="bg-gray-50/60">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Global System Parameters</h3>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          <Input label="Platform Marketplace Name" defaultValue="Med Bazar" />
          <Input label="Platform Support Email" defaultValue="support@medbazar.com" />
          <Button onClick={() => showToast('Platform Settings Updated', 'System parameters updated successfully', 'success')}>
            Save Platform Settings
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
