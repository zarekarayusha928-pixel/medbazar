import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Eye,
  CheckCircle,
  Ban,
  Sliders,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/api/adminService';
import { Pharmacy } from '@/types';

export const AdminPharmaciesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  // Confirmation dialogs
  const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [targetPharmacy, setTargetPharmacy] = useState<Pharmacy | null>(null);

  // Form states for Onboard
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    legalName: '',
    licenseNumber: '',
    gstNumber: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    phone: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    status: 'ACTIVE' as const,
  });

  // Form state for Manage
  const [manageForm, setManageForm] = useState<Partial<Pharmacy>>({});

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPharmacies();
      setPharmacies(data);
    } catch {
      showToast('Error', 'Failed to retrieve pharmacies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  // Filtered pharmacies
  const filtered = pharmacies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.legalName && p.legalName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Action Handlers
  const handleView = (pharm: Pharmacy) => {
    navigate(`/admin/pharmacies/${pharm.id}`);
  };

  const handleOpenActivate = (pharm: Pharmacy) => {
    setTargetPharmacy(pharm);
    setConfirmActivateOpen(true);
  };

  const handleConfirmActivate = async () => {
    if (!targetPharmacy) return;
    try {
      await adminService.updatePharmacyStatus(targetPharmacy.id, 'ACTIVE');
      showToast('Pharmacy Activated', `${targetPharmacy.name} is now active and operational.`, 'success');
      setConfirmActivateOpen(false);
      setTargetPharmacy(null);
      await fetchPharmacies();
    } catch (err) {
      showToast('Activation Failed', 'Unable to activate pharmacy', 'error');
    }
  };

  const handleOpenDeactivate = (pharm: Pharmacy) => {
    setTargetPharmacy(pharm);
    setConfirmDeactivateOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!targetPharmacy) return;
    try {
      await adminService.updatePharmacyStatus(targetPharmacy.id, 'SUSPENDED');
      showToast('Pharmacy Suspended', `${targetPharmacy.name} has been suspended from taking platform orders.`, 'warning');
      setConfirmDeactivateOpen(false);
      setTargetPharmacy(null);
      await fetchPharmacies();
    } catch (err) {
      showToast('Action Failed', 'Unable to suspend pharmacy', 'error');
    }
  };

  const handleOpenManage = (pharm: Pharmacy) => {
    setSelectedPharmacy(pharm);
    setManageForm({
      name: pharm.name,
      legalName: pharm.legalName,
      licenseNumber: pharm.licenseNumber,
      gstNumber: pharm.gstNumber,
      ownerName: pharm.ownerName,
      ownerEmail: pharm.ownerEmail,
      ownerPhone: pharm.ownerPhone,
      phone: pharm.phone,
      email: pharm.email,
      address: pharm.address,
      city: pharm.city,
      state: pharm.state,
      pincode: pharm.pincode,
      status: pharm.status,
    });
    setManageModalOpen(true);
  };

  const handleSaveManage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacy) return;
    try {
      await adminService.updatePharmacy(selectedPharmacy.id, manageForm);
      showToast('Changes Saved', `Updated configuration for ${selectedPharmacy.name}.`, 'success');
      setManageModalOpen(false);
      setSelectedPharmacy(null);
      await fetchPharmacies();
    } catch (err) {
      showToast('Update Failed', 'Could not save pharmacy details', 'error');
    }
  };

  const handleCreateOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.licenseNumber) {
      showToast('Missing Fields', 'Please fill in pharmacy name and drug license number', 'warning');
      return;
    }
    try {
      const created = await adminService.createPharmacy(onboardForm);
      showToast('Pharmacy Onboarded', `${created.name} registered with 1 default branch and owner account.`, 'success');
      setOnboardModalOpen(false);
      setOnboardForm({
        name: '',
        legalName: '',
        licenseNumber: '',
        gstNumber: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        phone: '',
        email: '',
        address: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        status: 'ACTIVE',
      });
      await fetchPharmacies();
    } catch (err) {
      showToast('Onboarding Error', 'Unable to onboard pharmacy', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              TENANT REGISTRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Pharmacies Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Administer retail pharmacy organizations, owners, licenses, and operational status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPharmacies}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setOnboardModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Onboard New Pharmacy
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by pharmacy, owner, license..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status:</span>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-medium">
            {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-gray-900 font-bold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pharmacies Table: Exactly with required columns:
          Pharmacy | Owner | Branches | Status | Joined | Actions */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  No pharmacies found matching the criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((pharm) => (
                <TableRow key={pharm.id}>
                  {/* Column 1: Pharmacy */}
                  <TableCell>
                    <div>
                      <button
                        onClick={() => handleView(pharm)}
                        className="font-bold text-gray-900 hover:text-brand-600 transition-colors text-left flex items-center gap-1.5"
                      >
                        <span>{pharm.name}</span>
                      </button>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        Lic: <span className="text-gray-700 font-semibold">{pharm.licenseNumber}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs">{pharm.email}</div>
                    </div>
                  </TableCell>

                  {/* Column 2: Owner */}
                  <TableCell>
                    <div>
                      <span className="font-semibold text-gray-900 text-xs">
                        {pharm.ownerName || 'Dr. Suresh Mehta'}
                      </span>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {pharm.ownerPhone || pharm.phone}
                      </div>
                    </div>
                  </TableCell>

                  {/* Column 3: Branches */}
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {pharm.branchCount} {pharm.branchCount === 1 ? 'Branch' : 'Branches'}
                    </Badge>
                  </TableCell>

                  {/* Column 4: Status */}
                  <TableCell>
                    <Badge
                      variant={
                        pharm.status === 'ACTIVE'
                          ? 'success'
                          : pharm.status === 'PENDING'
                          ? 'warning'
                          : 'danger'
                      }
                      dot
                      size="sm"
                    >
                      {pharm.status}
                    </Badge>
                  </TableCell>

                  {/* Column 5: Joined */}
                  <TableCell className="font-mono text-xs text-gray-600">
                    {pharm.createdAt}
                  </TableCell>

                  {/* Column 6: Actions: View | Activate | Deactivate | Manage */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* View Action */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(pharm)}
                        title="View Pharmacy Details"
                        className="text-xs text-brand-700 hover:bg-brand-50 px-2 py-1"
                      >
                        View
                      </Button>

                      {/* Activate / Deactivate Actions */}
                      {pharm.status !== 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenActivate(pharm)}
                          title="Activate Pharmacy"
                          className="text-xs text-emerald-700 hover:bg-emerald-50 px-2 py-1"
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDeactivate(pharm)}
                          title="Deactivate Pharmacy"
                          className="text-xs text-amber-700 hover:bg-amber-50 px-2 py-1"
                        >
                          Deactivate
                        </Button>
                      )}

                      {/* Manage Action */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenManage(pharm)}
                        title="Manage Configuration"
                        className="text-xs px-2.5 py-1"
                      >
                        Manage
                      </Button>
                    </div>
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
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} pharmacies
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Confirmation: Activate */}
      <ConfirmationDialog
        isOpen={confirmActivateOpen}
        onClose={() => setConfirmActivateOpen(false)}
        onConfirm={handleConfirmActivate}
        title="Activate Pharmacy Organization?"
        message={`This will enable ${targetPharmacy?.name} to receive customer orders, synchronize live catalogue items, and permit operational staff logins.`}
        confirmText="Activate Pharmacy"
        variant="success"
      />

      {/* Confirmation: Deactivate */}
      <ConfirmationDialog
        isOpen={confirmDeactivateOpen}
        onClose={() => setConfirmDeactivateOpen(false)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate / Suspend Pharmacy?"
        message={`Are you sure you want to suspend ${targetPharmacy?.name}? Their branches will be hidden from consumer marketplaces and POS sales will require compliance revalidation.`}
        confirmText="Deactivate"
        variant="danger"
      />

      {/* Modal: Onboard New Pharmacy */}
      <Modal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        title="Onboard New Retail Pharmacy Organization"
        size="lg"
      >
        <form onSubmit={handleCreateOnboard} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Trade / Brand Name"
              placeholder="e.g. Apollo Pharma Solutions"
              required
              value={onboardForm.name}
              onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
            />
            <Input
              label="Registered Legal Entity Name"
              placeholder="e.g. Apollo Pharma Retail Pvt Ltd"
              value={onboardForm.legalName}
              onChange={(e) => setOnboardForm({ ...onboardForm, legalName: e.target.value })}
            />
            <Input
              label="Drug License Number (Form 20B/21B)"
              placeholder="e.g. 20B/MH-PUN-982100"
              required
              value={onboardForm.licenseNumber}
              onChange={(e) => setOnboardForm({ ...onboardForm, licenseNumber: e.target.value })}
            />
            <Input
              label="GST Identification Number (GSTIN)"
              placeholder="e.g. 27AABCA1234F1Z8"
              value={onboardForm.gstNumber}
              onChange={(e) => setOnboardForm({ ...onboardForm, gstNumber: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Owner Credentials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="Owner Full Name"
                placeholder="Dr. / Mr. Name"
                value={onboardForm.ownerName}
                onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
              />
              <Input
                label="Owner Email Address"
                type="email"
                placeholder="owner@domain.com"
                value={onboardForm.ownerEmail}
                onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })}
              />
              <Input
                label="Owner Mobile Phone"
                placeholder="+91 98000 00000"
                value={onboardForm.ownerPhone}
                onChange={(e) => setOnboardForm({ ...onboardForm, ownerPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Headquarter Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-3">
                <Input
                  label="Registered Address"
                  placeholder="Street / Unit Number"
                  value={onboardForm.address}
                  onChange={(e) => setOnboardForm({ ...onboardForm, address: e.target.value })}
                />
              </div>
              <Input
                label="City"
                value={onboardForm.city}
                onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
              />
              <Input
                label="State"
                value={onboardForm.state}
                onChange={(e) => setOnboardForm({ ...onboardForm, state: e.target.value })}
              />
              <Input
                label="Postal Pincode"
                value={onboardForm.pincode}
                onChange={(e) => setOnboardForm({ ...onboardForm, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setOnboardModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Complete Onboarding</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Manage Pharmacy */}
      <Modal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={`Manage Organization: ${selectedPharmacy?.name}`}
        size="lg"
      >
        <form onSubmit={handleSaveManage} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Pharmacy Trade Name"
              value={manageForm.name || ''}
              onChange={(e) => setManageForm({ ...manageForm, name: e.target.value })}
            />
            <Input
              label="Legal Entity Name"
              value={manageForm.legalName || ''}
              onChange={(e) => setManageForm({ ...manageForm, legalName: e.target.value })}
            />
            <Input
              label="Drug License Number"
              value={manageForm.licenseNumber || ''}
              onChange={(e) => setManageForm({ ...manageForm, licenseNumber: e.target.value })}
            />
            <Input
              label="GSTIN"
              value={manageForm.gstNumber || ''}
              onChange={(e) => setManageForm({ ...manageForm, gstNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Contact Phone"
              value={manageForm.phone || ''}
              onChange={(e) => setManageForm({ ...manageForm, phone: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              value={manageForm.email || ''}
              onChange={(e) => setManageForm({ ...manageForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Owner Name"
              value={manageForm.ownerName || ''}
              onChange={(e) => setManageForm({ ...manageForm, ownerName: e.target.value })}
            />
            <Input
              label="Owner Email"
              value={manageForm.ownerEmail || ''}
              onChange={(e) => setManageForm({ ...manageForm, ownerEmail: e.target.value })}
            />
            <Input
              label="Owner Phone"
              value={manageForm.ownerPhone || ''}
              onChange={(e) => setManageForm({ ...manageForm, ownerPhone: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Operational Status</label>
            <div className="flex items-center gap-3">
              {(['ACTIVE', 'PENDING', 'SUSPENDED'] as const).map((st) => (
                <label key={st} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pharmacyStatus"
                    value={st}
                    checked={manageForm.status === st}
                    onChange={() => setManageForm({ ...manageForm, status: st })}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setManageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
