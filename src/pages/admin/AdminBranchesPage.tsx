import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Building2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Ban,
  Clock,
  Phone
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/api/adminService';
import { Branch, Pharmacy } from '@/types';

export const AdminBranchesPage: React.FC = () => {
  const { showToast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add branch modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    organizationId: '',
    name: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '',
    operatingHours: '09:00 AM - 10:00 PM',
  });

  // Toggle status dialog
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [targetBranch, setTargetBranch] = useState<Branch | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bList, pList] = await Promise.all([
        adminService.getBranches(),
        adminService.getPharmacies(),
      ]);
      setBranches(bList);
      setPharmacies(pList);
      if (pList.length > 0 && !newBranch.organizationId) {
        setNewBranch((prev) => ({ ...prev, organizationId: pList[0].id }));
      }
    } catch {
      showToast('Error', 'Failed to retrieve branches directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.organizationName && b.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.pincode.includes(searchQuery);

    const matchesPharm = selectedPharmacyId === 'ALL' || b.organizationId === selectedPharmacyId;
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

    return matchesSearch && matchesPharm && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenToggle = (b: Branch) => {
    setTargetBranch(b);
    setConfirmToggleOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetBranch) return;
    const nextStatus = targetBranch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateBranchStatus(targetBranch.id, nextStatus);
      showToast(
        nextStatus === 'ACTIVE' ? 'Branch Activated' : 'Branch Deactivated',
        `${targetBranch.name} is now ${nextStatus.toLowerCase()}.`,
        'success'
      );
      setConfirmToggleOpen(false);
      setTargetBranch(null);
      await fetchData();
    } catch (err) {
      showToast('Action Failed', 'Could not update branch status', 'error');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const parentPharm = pharmacies.find((p) => p.id === newBranch.organizationId);
    if (!parentPharm || !newBranch.name) {
      showToast('Validation Error', 'Please select parent pharmacy and branch name', 'warning');
      return;
    }

    try {
      await adminService.createBranch({
        ...newBranch,
        organizationName: parentPharm.name,
        status: 'ACTIVE',
      });
      showToast('Branch Added', `New branch registered for ${parentPharm.name}.`, 'success');
      setAddModalOpen(false);
      setNewBranch({
        organizationId: pharmacies[0]?.id || '',
        name: '',
        address: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        phone: '',
        operatingHours: '09:00 AM - 10:00 PM',
      });
      await fetchData();
    } catch (err) {
      showToast('Creation Error', 'Unable to create branch', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              PHYSICAL NETWORK
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Branches Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Overview and controls for all physical pharmacy branches across the platform
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
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
            Add Branch
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search branch, city, pincode..."
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
            <span className="text-xs text-gray-500 font-medium">Pharmacy:</span>
            <select
              value={selectedPharmacyId}
              onChange={(e) => {
                setSelectedPharmacyId(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Pharmacies</option>
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
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
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Branches Table:
          Branch | Pharmacy | Location | Status */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  No branches found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((branch) => (
                <TableRow key={branch.id}>
                  {/* 1. Branch */}
                  <TableCell>
                    <div className="font-bold text-gray-900">{branch.name}</div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {branch.operatingHours || '09:00 AM - 10:00 PM'}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {branch.phone}
                      </span>
                    </div>
                  </TableCell>

                  {/* 2. Pharmacy */}
                  <TableCell>
                    <Link
                      to={`/admin/pharmacies/${branch.organizationId}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-xs text-brand-700 hover:text-brand-900 bg-brand-50/70 border border-brand-200/60 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>{branch.organizationName || 'Associated Pharmacy'}</span>
                    </Link>
                  </TableCell>

                  {/* 3. Location */}
                  <TableCell>
                    <div className="flex items-start gap-1.5 text-xs text-gray-800">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <div>{branch.address}</div>
                        <div className="text-[11px] text-gray-500">
                          {branch.city}, {branch.state} - <span className="font-mono font-medium">{branch.pincode}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* 4. Status */}
                  <TableCell>
                    <Badge variant={branch.status === 'ACTIVE' ? 'success' : 'neutral'} dot size="sm">
                      {branch.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenToggle(branch)}
                      className={`text-xs ${
                        branch.status === 'ACTIVE'
                          ? 'text-amber-700 hover:bg-amber-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {branch.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} branches
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Confirmation: Toggle Branch Status */}
      <ConfirmationDialog
        isOpen={confirmToggleOpen}
        onClose={() => setConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetBranch?.status === 'ACTIVE' ? 'Deactivate Branch?' : 'Activate Branch?'}
        message={`Are you sure you want to ${
          targetBranch?.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } ${targetBranch?.name}?`}
        confirmText={targetBranch?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={targetBranch?.status === 'ACTIVE' ? 'warning' : 'success'}
      />

      {/* Modal: Add Branch */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Physical Branch"
        size="md"
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Pharmacy</label>
            <select
              value={newBranch.organizationId}
              onChange={(e) => setNewBranch({ ...newBranch, organizationId: e.target.value })}
              className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            >
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Branch Name"
            placeholder="e.g. Pune Camp Branch"
            required
            value={newBranch.name}
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
          />

          <Input
            label="Street Address"
            placeholder="Shop / Unit number, Street"
            required
            value={newBranch.address}
            onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              value={newBranch.city}
              onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
            />
            <Input
              label="State"
              value={newBranch.state}
              onChange={(e) => setNewBranch({ ...newBranch, state: e.target.value })}
            />
            <Input
              label="Pincode"
              value={newBranch.pincode}
              onChange={(e) => setNewBranch({ ...newBranch, pincode: e.target.value })}
            />
          </div>

          <Input
            label="Branch Phone"
            placeholder="+91 98000 00000"
            value={newBranch.phone}
            onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
          />

          <Input
            label="Operating Hours"
            value={newBranch.operatingHours}
            onChange={(e) => setNewBranch({ ...newBranch, operatingHours: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Branch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
