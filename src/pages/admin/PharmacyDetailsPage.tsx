import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  GitBranch,
  Users2,
  Activity,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Plus,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/api/adminService';
import { Pharmacy, Branch, Staff, PharmacyActivity } from '@/types';

export const PharmacyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activities, setActivities] = useState<PharmacyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'staff' | 'activity'>('profile');

  // Modals
  const [addBranchModalOpen, setAddBranchModalOpen] = useState(false);
  const [confirmStatusModalOpen, setConfirmStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ACTIVE');

  // Add branch form
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '',
    operatingHours: '09:00 AM - 10:00 PM',
  });

  const loadPharmacyData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const pharm = await adminService.getPharmacyById(id);
      if (!pharm) {
        showToast('Not Found', 'Pharmacy record does not exist', 'error');
        navigate('/admin/pharmacies');
        return;
      }
      setPharmacy(pharm);

      const [bList, sList, aList] = await Promise.all([
        adminService.getPharmacyBranches(pharm.id),
        adminService.getPharmacyStaff(pharm.id),
        adminService.getPharmacyActivities(pharm.id),
      ]);
      setBranches(bList);
      setStaff(sList);
      setActivities(aList);
    } catch {
      showToast('Error', 'Failed to load pharmacy details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacyData();
  }, [id]);

  const handleStatusToggle = (targetStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED') => {
    setNextStatus(targetStatus);
    setConfirmStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pharmacy) return;
    try {
      const updated = await adminService.updatePharmacyStatus(pharmacy.id, nextStatus);
      setPharmacy(updated);
      showToast('Status Updated', `Pharmacy status transitioned to ${nextStatus}`, 'success');
      setConfirmStatusModalOpen(false);
      const refreshedActivities = await adminService.getPharmacyActivities(pharmacy.id);
      setActivities(refreshedActivities);
    } catch (err) {
      showToast('Status Update Failed', 'Could not modify pharmacy status', 'error');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy || !newBranch.name) return;
    try {
      await adminService.createBranch({
        organizationId: pharmacy.id,
        organizationName: pharmacy.name,
        ...newBranch,
        status: 'ACTIVE',
      });
      showToast('Branch Added', `Created ${newBranch.name} under ${pharmacy.name}`, 'success');
      setAddBranchModalOpen(false);
      setNewBranch({
        name: '',
        address: '',
        city: pharmacy.city || 'Pune',
        state: pharmacy.state || 'Maharashtra',
        pincode: pharmacy.pincode || '411001',
        phone: pharmacy.phone,
        operatingHours: '09:00 AM - 10:00 PM',
      });
      await loadPharmacyData();
    } catch (err) {
      showToast('Error', 'Unable to create branch', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading pharmacy business profile...</p>
      </div>
    );
  }

  if (!pharmacy) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <Link
            to="/admin/pharmacies"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Pharmacies
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{pharmacy.name}</h1>
            <Badge
              variant={
                pharmacy.status === 'ACTIVE'
                  ? 'success'
                  : pharmacy.status === 'PENDING'
                  ? 'warning'
                  : 'danger'
              }
              dot
              size="md"
            >
              {pharmacy.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            License: {pharmacy.licenseNumber} • Registered on {pharmacy.createdAt}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {pharmacy.status !== 'ACTIVE' ? (
            <Button
              size="sm"
              onClick={() => handleStatusToggle('ACTIVE')}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Activate Pharmacy
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusToggle('SUSPENDED')}
              leftIcon={<AlertTriangle className="w-4 h-4" />}
              className="text-amber-700 hover:bg-amber-50 border-amber-200"
            >
              Suspend / Deactivate
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddBranchModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Branch
          </Button>
        </div>
      </div>

      {/* Navigation Tabs: Business Profile | Branches | Staff | Status | Activity */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'profile', label: 'Business Profile', icon: <Building2 className="w-4 h-4" /> },
          { id: 'branches', label: 'Branches', count: branches.length, icon: <GitBranch className="w-4 h-4" /> },
          { id: 'staff', label: 'Staff Directory', count: staff.length, icon: <Users2 className="w-4 h-4" /> },
          { id: 'activity', label: 'Audit & Activity', count: activities.length, icon: <Activity className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Business Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="bg-gray-50/70 py-3.5 px-5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Statutory & Business Entity Profile
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Legal Entity Name</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{pharmacy.legalName}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Drug License Number</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm font-mono font-bold text-gray-900">{pharmacy.licenseNumber}</p>
                    <Badge variant="success" size="sm">Verified (Form 20B)</Badge>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">GST Identification Number</span>
                  <p className="text-sm font-mono text-gray-900 mt-0.5">{pharmacy.gstNumber || '27AABCA1234F1Z8'}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Operating Status</span>
                  <div className="mt-1">
                    <Badge
                      variant={
                        pharmacy.status === 'ACTIVE'
                          ? 'success'
                          : pharmacy.status === 'PENDING'
                          ? 'warning'
                          : 'danger'
                      }
                      dot
                    >
                      {pharmacy.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
                  Owner & Primary Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Authorized Owner</span>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{pharmacy.ownerName || 'Dr. Suresh Mehta'}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Registered Email</span>
                    <p className="text-sm text-gray-900 mt-0.5">{pharmacy.email}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Phone Helpline</span>
                    <p className="text-sm text-gray-900 mt-0.5">{pharmacy.phone}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
                  Headquarter Location
                </h3>
                <div className="flex items-start gap-2.5 text-xs text-gray-700 bg-gray-50 p-4 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{pharmacy.address || 'Shop 12-14, Central Plaza, Station Road'}</p>
                    <p className="text-gray-500 mt-0.5">
                      {pharmacy.city || 'Pune'}, {pharmacy.state || 'Maharashtra'} - {pharmacy.pincode || '411001'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Right Col: Quick Status & Compliance Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gray-50/70 py-3.5 px-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Compliance Status</h3>
              </CardHeader>
              <CardBody className="p-4 space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Retail Drug Authority</span>
                  <Badge variant="success" size="sm">FDA Approved</Badge>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Form 20B / 21B Validity</span>
                  <span className="font-mono text-gray-800 font-semibold">Dec 2028</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Total Branches Active</span>
                  <span className="font-mono font-bold text-gray-900">{branches.length} Branches</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Reg. Pharmacists</span>
                  <span className="font-mono text-gray-800 font-semibold">1 Licensed</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Platform Data Isolation</span>
                  <Badge variant="brand" size="sm">Dedicated Schema</Badge>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="bg-gray-50/70 py-3.5 px-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Tenant Controls</h3>
              </CardHeader>
              <CardBody className="p-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setActiveTab('branches')}
                  leftIcon={<GitBranch className="w-3.5 h-3.5" />}
                >
                  Manage {branches.length} Branches
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setActiveTab('staff')}
                  leftIcon={<Users2 className="w-3.5 h-3.5" />}
                >
                  View Staff Roster ({staff.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setActiveTab('activity')}
                  leftIcon={<Activity className="w-3.5 h-3.5" />}
                >
                  Inspect Audit Trail ({activities.length})
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Branches */}
      {activeTab === 'branches' && (
        <Card>
          <CardHeader className="flex items-center justify-between bg-gray-50/70 py-3.5 px-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Physical Branch Outlets</h2>
              <p className="text-xs text-gray-500">Retail branches operating under {pharmacy.name}</p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddBranchModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Branch
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Operating Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                    No branch locations registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-bold text-gray-900">
                      {b.name}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{b.address}</div>
                      <div className="text-gray-500">{b.city}, {b.state} ({b.pincode})</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{b.phone}</TableCell>
                    <TableCell className="text-xs text-gray-600 font-medium">
                      {b.operatingHours || '09:00 AM - 10:00 PM'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.status === 'ACTIVE' ? 'success' : 'neutral'} dot size="sm">
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 3: Staff */}
      {activeTab === 'staff' && (
        <Card>
          <CardHeader className="bg-gray-50/70 py-3.5 px-5">
            <h2 className="text-sm font-bold text-gray-900">Assigned Operational Staff</h2>
            <p className="text-xs text-gray-500">Personnel authorized to dispense, manage stock, and run POS</p>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Platform Role</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No staff records linked to this tenant.
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold text-gray-900">{s.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.role === 'PHARMACY_OWNER'
                            ? 'brand'
                            : s.role === 'PHARMACIST'
                            ? 'success'
                            : s.role === 'BRANCH_MANAGER'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {s.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {s.branchName || 'All Organization Branches'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{s.email}</div>
                      <div className="font-mono text-[11px] text-gray-500">{s.phone}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">{s.joinedAt}</TableCell>
                    <TableCell>
                      <Badge variant="success" dot size="sm">ACTIVE</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 4: Activity */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader className="bg-gray-50/70 py-3.5 px-5">
            <h2 className="text-sm font-bold text-gray-900">Tenant Activity & Compliance Audit Log</h2>
            <p className="text-xs text-gray-500">Immutable chronological record of business events and operator actions</p>
          </CardHeader>
          <CardBody className="p-6">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No activity entries found.</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
                {activities.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center shrink-0 z-10">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="flex-1 bg-gray-50/80 border border-gray-200/70 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                         <span className="text-sm font-bold text-gray-900">{act.title}</span>
                        <span className="font-mono text-[11px] text-gray-400">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{act.description}</p>
                      <div className="mt-2 text-[11px] text-brand-700 font-medium">
                        Actor: {act.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal: Add Branch */}
      <Modal
        isOpen={addBranchModalOpen}
        onClose={() => setAddBranchModalOpen(false)}
        title={`Add Branch to ${pharmacy.name}`}
        size="md"
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <Input
            label="Branch Name"
            placeholder="e.g. Wagholi Main Branch"
            required
            value={newBranch.name}
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
          />
          <Input
            label="Street Address"
            placeholder="Plot / Commercial Complex"
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
            label="Contact Phone"
            value={newBranch.phone}
            onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
          />
          <Input
            label="Operating Hours"
            value={newBranch.operatingHours}
            onChange={(e) => setNewBranch({ ...newBranch, operatingHours: e.target.value })}
          />
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setAddBranchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Branch</Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation: Change Status */}
      <ConfirmationDialog
        isOpen={confirmStatusModalOpen}
        onClose={() => setConfirmStatusModalOpen(false)}
        onConfirm={confirmStatusChange}
        title={`Transition Status to ${nextStatus}?`}
        message={`Are you sure you want to mark ${pharmacy.name} as ${nextStatus}? This will immediately take effect across all branches.`}
        confirmText={`Set as ${nextStatus}`}
        variant={nextStatus === 'ACTIVE' ? 'success' : 'warning'}
      />
    </div>
  );
};
