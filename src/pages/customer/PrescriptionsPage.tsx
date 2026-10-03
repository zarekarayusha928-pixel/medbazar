import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PRESCRIPTIONS } from '@/services/api/mockData';

export const PrescriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions] = useState(MOCK_PRESCRIPTIONS);

  const handleUploadNew = () => {
    showToast('Prescription Uploaded', 'Your prescription file has been uploaded for pharmacist review.', 'success');
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customer', href: '/customer' }, { label: 'My Prescriptions' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Upload & Verification</h1>
          <p className="text-xs text-gray-500 mt-1">Upload valid doctor prescriptions for pharmacist review</p>
        </div>

        <Button onClick={handleUploadNew} leftIcon={<Upload className="w-4 h-4" />}>
          Upload New File
        </Button>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardBody className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Drag & Drop prescription file here</h3>
            <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, or PDF formats up to 10MB</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleUploadNew}>
            Select File from Device
          </Button>
        </CardBody>
      </Card>

      {/* Uploaded History Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Upload History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead>Linked Order</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span>{p.fileName}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {p.orderId ? (
                    <Badge variant="brand" size="sm">#MB-2026-8801</Badge>
                  ) : (
                    <span className="text-gray-400">Unlinked</span>
                  )}
                </TableCell>
                <TableCell>
                  {p.status === 'PENDING_REVIEW' && <Badge variant="warning" dot>Pending Review</Badge>}
                  {p.status === 'APPROVED' && <Badge variant="success" dot>Approved by Pharmacist</Badge>}
                  {p.status === 'REJECTED' && <Badge variant="danger" dot>Rejected</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
