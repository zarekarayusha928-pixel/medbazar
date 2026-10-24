import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/api/adminService';
import { MOCK_CATEGORIES } from '@/services/api/mockData';
import { Medicine } from '@/types';

export const AdminMedicinesPage: React.FC = () => {
  const { showToast } = useToast();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRx, setSelectedRx] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Medicine Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    brand: '',
    manufacturer: '',
    dosageForm: 'TABLET' as const,
    strength: '500mg',
    categoryId: 'cat_pain',
    categoryName: 'Pain Relief',
    prescriptionRequired: false,
    status: 'ACTIVE' as const,
  });

  // Toggle Status
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [targetMedicine, setTargetMedicine] = useState<Medicine | null>(null);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await adminService.getGlobalMedicines();
      setMedicines(data);
    } catch {
      showToast('Error', 'Failed to retrieve medicine catalogue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const filtered = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.categoryId === selectedCategory;
    const matchesRx =
      selectedRx === 'ALL'
        ? true
        : selectedRx === 'RX'
        ? m.prescriptionRequired
        : !m.prescriptionRequired;

    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesRx && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenToggle = (m: Medicine) => {
    setTargetMedicine(m);
    setConfirmToggleOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetMedicine) return;
    const nextStatus = targetMedicine.status === 'ACTIVE' ? 'DISCONTINUED' : 'ACTIVE';
    try {
      await adminService.updateMedicineStatus(targetMedicine.id, nextStatus);
      showToast(
        nextStatus === 'ACTIVE' ? 'Medicine Activated' : 'Medicine Discontinued',
        `${targetMedicine.name} status updated to ${nextStatus}.`,
        'success'
      );
      setConfirmToggleOpen(false);
      setTargetMedicine(null);
      await fetchMedicines();
    } catch (err) {
      showToast('Action Failed', 'Could not update medicine status', 'error');
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.genericName) {
      showToast('Validation Error', 'Please enter medicine name and generic composition', 'warning');
      return;
    }

    const cat = MOCK_CATEGORIES.find((c) => c.id === newMed.categoryId);

    try {
      await adminService.createGlobalMedicine({
        ...newMed,
        categoryName: cat?.name || 'General Healthcare',
      });
      showToast('Catalogue Updated', `${newMed.name} added to global master repository.`, 'success');
      setAddModalOpen(false);
      setNewMed({
        name: '',
        genericName: '',
        brand: '',
        manufacturer: '',
        dosageForm: 'TABLET',
        strength: '500mg',
        categoryId: 'cat_pain',
        categoryName: 'Pain Relief',
        prescriptionRequired: false,
        status: 'ACTIVE',
      });
      await fetchMedicines();
    } catch (err) {
      showToast('Error', 'Unable to create global medicine definition', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              MASTER REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Global Medicine Catalogue</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Centralized dictionary of pharmaceutical formulations, salt compositions, and regulatory Rx requirements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMedicines}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Global Medicine
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search brand, generic, salt..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter catalogue by category"
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Categories</option>
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Schedule:</span>
            <select
              value={selectedRx}
              onChange={(e) => {
                setSelectedRx(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter catalogue by schedule type"
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Products</option>
              <option value="RX">Prescription (Rx)</option>
              <option value="OTC">Over-The-Counter (OTC)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter catalogue by active status"
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DISCONTINUED">DISCONTINUED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Global Medicines Table:
          Medicine | Generic Name | Brand | Category | Prescription Required | Status */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Generic Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Prescription Required</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                  No medicine formulations found matching query.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((med) => (
                <TableRow key={med.id}>
                  {/* 1. Medicine */}
                  <TableCell>
                    <div className="font-bold text-gray-900">{med.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                        {med.dosageForm}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{med.strength}</span>
                    </div>
                  </TableCell>

                  {/* 2. Generic Name */}
                  <TableCell>
                    <div className="text-xs font-medium text-gray-800 max-w-xs leading-relaxed">
                      {med.genericName}
                    </div>
                  </TableCell>

                  {/* 3. Brand */}
                  <TableCell>
                    <div className="text-xs font-semibold text-gray-900">{med.brand}</div>
                    <div className="text-[11px] text-gray-500 truncate max-w-xs">{med.manufacturer}</div>
                  </TableCell>

                  {/* 4. Category */}
                  <TableCell>
                    <Badge variant="brand" size="sm">
                      {med.categoryName || 'General'}
                    </Badge>
                  </TableCell>

                  {/* 5. Prescription Required */}
                  <TableCell>
                    {med.prescriptionRequired ? (
                      <Badge variant="warning" size="sm">
                        Yes (Rx Required)
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        No (OTC)
                      </Badge>
                    )}
                  </TableCell>

                  {/* 6. Status */}
                  <TableCell>
                    <Badge
                      variant={med.status === 'ACTIVE' ? 'success' : 'neutral'}
                      dot
                      size="sm"
                    >
                      {med.status}
                    </Badge>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenToggle(med)}
                      className={`text-xs ${
                        med.status === 'ACTIVE'
                          ? 'text-gray-600 hover:text-amber-800 hover:bg-amber-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {med.status === 'ACTIVE' ? 'Discontinue' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} medicines
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Confirmation: Toggle Status */}
      <ConfirmationDialog
        isOpen={confirmToggleOpen}
        onClose={() => setConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetMedicine?.status === 'ACTIVE' ? 'Discontinue Medicine?' : 'Reactivate Medicine?'}
        message={`Are you sure you want to mark ${targetMedicine?.name} as ${
          targetMedicine?.status === 'ACTIVE' ? 'DISCONTINUED' : 'ACTIVE'
        }? Discontinued medicines will not appear for new inventory imports.`}
        confirmText={targetMedicine?.status === 'ACTIVE' ? 'Discontinue' : 'Reactivate'}
        variant={targetMedicine?.status === 'ACTIVE' ? 'warning' : 'success'}
      />

      {/* Modal: Add Global Medicine */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Master Medicine Formulation"
        size="lg"
      >
        <form onSubmit={handleCreateMedicine} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Medicine Commercial Name"
              placeholder="e.g. Paracetamol 650mg (Dolo 650)"
              required
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            />
            <Input
              label="Generic Active Composition (Salt)"
              placeholder="e.g. Paracetamol / Acetaminophen"
              required
              value={newMed.genericName}
              onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Brand / Marketing Label"
              placeholder="e.g. Micro Labs"
              value={newMed.brand}
              onChange={(e) => setNewMed({ ...newMed, brand: e.target.value })}
            />
            <Input
              label="Manufacturing Entity"
              placeholder="e.g. Micro Labs Ltd"
              value={newMed.manufacturer}
              onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Therapeutic Category</label>
              <select
                value={newMed.categoryId}
                onChange={(e) => setNewMed({ ...newMed, categoryId: e.target.value })}
                className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage Form</label>
              <select
                value={newMed.dosageForm}
                onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value as any })}
                className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="TABLET">TABLET</option>
                <option value="CAPSULE">CAPSULE</option>
                <option value="SYRUP">SYRUP</option>
                <option value="INJECTION">INJECTION</option>
                <option value="CREAM">CREAM</option>
                <option value="DROPS">DROPS</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <Input
              label="Strength / Unit"
              placeholder="e.g. 650mg or 200ml"
              value={newMed.strength}
              onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newMed.prescriptionRequired}
                  onChange={(e) => setNewMed({ ...newMed, prescriptionRequired: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-900">
                  Prescription Required (Schedule H / Schedule X Drug)
                </span>
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5 ml-6">
                Consumers will be required to upload valid prescription verified by registered pharmacist before fulfillment.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Master Formulation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
