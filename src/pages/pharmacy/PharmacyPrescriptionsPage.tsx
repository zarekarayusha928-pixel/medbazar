import React, { useState } from 'react';
import { FileCheck, Check, X, Eye, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PRESCRIPTIONS } from '@/services/api/mockData';
import { Prescription } from '@/types';

export const PharmacyPrescriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [reviewItem, setReviewItem] = useState<Prescription | null>(null);

  const handleReviewAction = (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewItem) return;
    setPrescriptions(prescriptions.map(p => p.id === reviewItem.id ? { ...p, status } : p));
    showToast(`Prescription ${status}`, `Order prescription marked as ${status} by pharmacist`, 'success');
    setReviewItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacist Prescription Review</h1>
          <p className="text-xs text-gray-500 mt-1">Review uploaded doctor prescriptions for Schedule H & H1 medications</p>
        </div>
        <Badge variant="warning" size="md">Review Queue</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Uploaded On</TableHead>
            <TableHead>Linked Order #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-bold text-gray-900">
                {p.customerName}
                <span className="text-gray-400 block text-[10px]">{p.customerPhone}</span>
              </TableCell>
              <TableCell className="font-mono text-xs">{p.fileName}</TableCell>
              <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
              <TableCell><Badge variant="brand" size="sm">#MB-2026-8801</Badge></TableCell>
              <TableCell>
                <Badge variant={p.status === 'PENDING_REVIEW' ? 'warning' : 'success'} dot>
                  {p.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setReviewItem(p)}>
                  Inspect Rx
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {reviewItem && (
        <Modal
          isOpen={true}
          onClose={() => setReviewItem(null)}
          title={`Pharmacist Verification: ${reviewItem.customerName}`}
          size="lg"
          footer={
            <>
              <Button variant="danger" size="sm" onClick={() => handleReviewAction('REJECTED')} leftIcon={<X className="w-4 h-4" />}>
                Reject Prescription
              </Button>
              <Button variant="success" size="sm" onClick={() => handleReviewAction('APPROVED')} leftIcon={<Check className="w-4 h-4" />}>
                Approve & Dispense
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <p className="font-bold">Pharmacist Compliance Verification Rule:</p>
              <p className="mt-0.5">Verify doctor name, registration number, patient name, dosage instructions, and validity date before approving.</p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden h-64 bg-gray-100 flex items-center justify-center">
              <img src={reviewItem.fileUrl} alt="Prescription preview" className="max-h-full object-contain" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
