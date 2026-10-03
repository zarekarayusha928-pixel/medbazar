import React from 'react';
import { Pill, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOCK_MEDICINES } from '@/services/api/mockData';

export const AdminMedicinesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Master Medicine Catalogue</h1>
          <p className="text-xs text-gray-500 mt-1">Master list of medicine definitions shared across all pharmacy tenants</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Add Global Medicine</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine Name</TableHead>
            <TableHead>Generic Composition</TableHead>
            <TableHead>Brand & Manufacturer</TableHead>
            <TableHead>Dosage Form</TableHead>
            <TableHead>Rx Required</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_MEDICINES.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-bold text-gray-900">{m.name}</TableCell>
              <TableCell className="text-xs">{m.composition}</TableCell>
              <TableCell>{m.brand} ({m.manufacturer})</TableCell>
              <TableCell><Badge variant="brand" size="sm">{m.dosageForm}</Badge></TableCell>
              <TableCell>
                <Badge variant={m.prescriptionRequired ? 'warning' : 'success'} size="sm">
                  {m.prescriptionRequired ? 'Yes (Rx)' : 'No (OTC)'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
