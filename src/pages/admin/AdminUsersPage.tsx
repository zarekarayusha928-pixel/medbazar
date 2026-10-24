import React, { useState, useEffect } from 'react';
import {
  Users2,
  Shield,
  Plus,
  RefreshCw,
  Search,
  Building2,
  GitBranch,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Edit
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
import { User, UserRole, Pharmacy, Branch } from '@/types';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PHARMACIST' as UserRole,
    pharmacyId: '',
    branchId: '',
    status: 'ACTIVE' as const,
  });

  // Edit Role Modal
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('PHARMACIST');

  // Toggle Status Confirmation
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uList, pList, bList] = await Promise.all([
        adminService.getUsers(),
        adminService.getPharmacies(),
        adminService.getBranches(),
      ]);
      setUsers(uList);
      setPharmacies(pList);
      setBranches(bList);
      if (pList.length > 0 && !newUser.pharmacyId) {
        setNewUser((prev) => ({ ...prev, pharmacyId: pList[0].id }));
      }
    } catch {
      showToast('Error', 'Failed to retrieve platform users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      (u.pharmacyName && u.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenToggle = (u: User) => {
    setTargetUser(u);
    setConfirmToggleOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(targetUser.id, nextStatus);
      showToast(
        nextStatus === 'ACTIVE' ? 'User Activated' : 'User Suspended',
        `${targetUser.name} is now ${nextStatus.toLowerCase()}.`,
        'success'
      );
      setConfirmToggleOpen(false);
      setTargetUser(null);
      await fetchData();
    } catch (err) {
      showToast('Action Failed', 'Could not update user status', 'error');
    }
  };

  const handleOpenEditRole = (u: User) => {
    setEditingUser(u);
    setTargetRole(u.role);
    setEditRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminService.updateUserRole(editingUser.id, targetRole);
      showToast('Role Updated', `${editingUser.name} has been assigned the role ${targetRole}.`, 'success');
      setEditRoleModalOpen(false);
      setEditingUser(null);
      await fetchData();
    } catch (err) {
      showToast('Update Failed', 'Could not update user role', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      showToast('Validation Error', 'Name and Email are required', 'warning');
      return;
    }

    const assignedPharm = pharmacies.find((p) => p.id === newUser.pharmacyId);
    const assignedBranch = branches.find((b) => b.id === newUser.branchId);

    try {
      await adminService.createUser({
        ...newUser,
        pharmacyName: assignedPharm ? assignedPharm.name : undefined,
        branchName: assignedBranch ? assignedBranch.name : undefined,
      });
      showToast('User Created', `Account for ${newUser.name} created successfully.`, 'success');
      setAddModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'PHARMACIST',
        pharmacyId: pharmacies[0]?.id || '',
        branchId: '',
        status: 'ACTIVE',
      });
      await fetchData();
    } catch (err) {
      showToast('Error', 'Unable to create user', 'error');
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return 'danger';
      case 'PHARMACY_OWNER':
        return 'brand';
      case 'BRANCH_MANAGER':
        return 'info';
      case 'PHARMACIST':
        return 'success';
      case 'CASHIER':
        return 'neutral';
      case 'DELIVERY_STAFF':
        return 'warning';
      case 'CUSTOMER':
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-mono font-semibold">
              ACCESS CONTROL
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Platform Users & Roles</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Directory of administrative, pharmacy operational, staff, and customer accounts
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
            Add User
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search by name, email, phone..."
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
            <span className="text-xs text-gray-500 font-medium">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Roles</option>
              <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              <option value="PHARMACY_OWNER">PHARMACY_OWNER</option>
              <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
              <option value="PHARMACIST">PHARMACIST</option>
              <option value="CASHIER">CASHIER</option>
              <option value="DELIVERY_STAFF">DELIVERY_STAFF</option>
              <option value="CUSTOMER">CUSTOMER</option>
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

      {/* Users Table:
          User | Role | Pharmacy | Branch | Status */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  No users found matching query.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
                <TableRow key={user.id}>
                  {/* 1. User */}
                  <TableCell>
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span className="truncate max-w-xs">{user.email}</span>
                      <span>•</span>
                      <span className="font-mono">{user.phone}</span>
                    </div>
                  </TableCell>

                  {/* 2. Role */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* 3. Pharmacy */}
                  <TableCell>
                    {user.pharmacyName ? (
                      <span className="text-xs font-medium text-gray-900">
                        {user.pharmacyName}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        {user.role === 'PLATFORM_ADMIN' ? 'Platform Core' : 'Direct Consumer'}
                      </span>
                    )}
                  </TableCell>

                  {/* 4. Branch */}
                  <TableCell>
                    {user.branchName ? (
                      <span className="text-xs text-gray-700">
                        {user.branchName}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {user.role === 'PHARMACY_OWNER' ? 'All Organization Branches' : '—'}
                      </span>
                    )}
                  </TableCell>

                  {/* 5. Status */}
                  <TableCell>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'neutral'} dot size="sm">
                      {user.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditRole(user)}
                        className="text-xs text-brand-700 hover:bg-brand-50 px-2 py-1"
                      >
                        Edit Role
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenToggle(user)}
                        className={`text-xs px-2 py-1 ${
                          user.status === 'ACTIVE'
                            ? 'text-gray-600 hover:text-amber-800 hover:bg-amber-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} users
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
        title={targetUser?.status === 'ACTIVE' ? 'Deactivate User Account?' : 'Reactivate User Account?'}
        message={`Are you sure you want to ${
          targetUser?.status === 'ACTIVE' ? 'deactivate' : 'reactivate'
        } ${targetUser?.name}?`}
        confirmText={targetUser?.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
        variant={targetUser?.status === 'ACTIVE' ? 'warning' : 'success'}
      />

      {/* Modal: Edit Role */}
      <Modal
        isOpen={editRoleModalOpen}
        onClose={() => setEditRoleModalOpen(false)}
        title={`Change Role: ${editingUser?.name}`}
        size="sm"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Platform Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole)}
              className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="PLATFORM_ADMIN">PLATFORM_ADMIN (Full Platform Privileges)</option>
              <option value="PHARMACY_OWNER">PHARMACY_OWNER (All Branches & Sales)</option>
              <option value="BRANCH_MANAGER">BRANCH_MANAGER (Assigned Branch Operations)</option>
              <option value="PHARMACIST">PHARMACIST (Rx Verification & Dispensing)</option>
              <option value="CASHIER">CASHIER (Physical POS Billing)</option>
              <option value="DELIVERY_STAFF">DELIVERY_STAFF (Assigned Deliveries)</option>
              <option value="CUSTOMER">CUSTOMER (Consumer Account)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setEditRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Role</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add User */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create New User Account"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            required
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98000 00000"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Platform Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              <option value="PHARMACY_OWNER">PHARMACY_OWNER</option>
              <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
              <option value="PHARMACIST">PHARMACIST</option>
              <option value="CASHIER">CASHIER</option>
              <option value="DELIVERY_STAFF">DELIVERY_STAFF</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          {newUser.role !== 'PLATFORM_ADMIN' && newUser.role !== 'CUSTOMER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-gray-100 pt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Pharmacy</label>
                <select
                  value={newUser.pharmacyId}
                  onChange={(e) => setNewUser({ ...newUser, pharmacyId: e.target.value })}
                  className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {pharmacies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Branch (Optional)</label>
                <select
                  value={newUser.branchId}
                  onChange={(e) => setNewUser({ ...newUser, branchId: e.target.value })}
                  className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">All Branches</option>
                  {branches
                    .filter((b) => !newUser.pharmacyId || b.organizationId === newUser.pharmacyId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
