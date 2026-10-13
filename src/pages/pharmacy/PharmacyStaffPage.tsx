import React, { useState } from 'react';
import { UserCog, Plus, Search, CheckCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_STAFF, MOCK_BRANCHES } from '@/services/api/mockData';
import { Staff, UserRole } from '@/types';

export const PharmacyStaffPage: React.FC = () => {
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('PHARMACIST');
  const [branchId, setBranchId] = useState(MOCK_BRANCHES[0].id);

  // Edit / Role modal
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('PHARMACIST');

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setStaffList(staffList.map(s =>
      s.id === id
        ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
        : s
    ));
    showToast('Staff Status Toggled', 'User branch authorization updated.', 'info');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const branchObj = MOCK_BRANCHES.find(b => b.id === branchId);
    const newMember: Staff = {
      id: `stf_${Date.now()}`,
      organizationId: 'pharm_1',
      branchId,
      branchName: branchObj ? branchObj.name : 'Apothecary Main Branch',
      userId: `u_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      role,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString().split('T')[0]
    };

    setStaffList([...staffList, newMember]);
    showToast('Staff Member Invited', `Invitation dispatched to ${email}.`, 'success');
    setIsInviteOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleSaveRole = () => {
    if (!editingStaff) return;
    setStaffList(staffList.map(s =>
      s.id === editingStaff.id
        ? { ...s, role: editRole }
        : s
    ));
    showToast('Role Updated', `Updated ${editingStaff.name} role to ${editRole}.`, 'success');
    setEditingStaff(null);
  };

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Staff & Role Access Control
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              {filtered.length} members
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Branch pharmacists, dispensing operators, POS cashiers, and doorstep delivery personnel
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-sand-300 rounded-md p-3 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff name, email, role..."
            className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
          />
        </div>
      </div>

      {/* Table: Name, Role, Branch, Status, Actions */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-sand-50/50 transition-colors">
                  {/* Name */}
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-gray-900 block">{s.name}</span>
                    <span className="font-mono text-[10px] text-gray-500">{s.email} • {s.phone}</span>
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[11px] font-semibold text-pine-800 bg-pine-50 px-2 py-0.5 rounded border border-pine-200">
                      {s.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Branch */}
                  <td className="py-2.5 px-3 text-gray-700 text-[11px]">
                    {s.branchName?.split('-')[1]?.trim() || s.branchName || 'Pune Station'}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {s.status === 'ACTIVE' ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Inactive</Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStaff(s);
                          setEditRole(s.role);
                        }}
                        className="px-2 py-1 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-semibold text-xs transition-colors"
                      >
                        Change Role
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(s.id)}
                        className={`px-2 py-1 rounded border text-xs font-semibold transition-colors ${
                          s.status === 'ACTIVE'
                            ? 'bg-white hover:bg-sand-100 text-gray-700 border-sand-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsInviteOpen(false)}
          title="Invite Pharmacy Staff Member"
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInviteSubmit}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold"
              >
                Send Invite
              </button>
            </div>
          }
        >
          <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Pawar"
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@apothecary.com"
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98230 33221"
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                >
                  <option value="PHARMACIST">Licensed Pharmacist</option>
                  <option value="CASHIER">POS Cashier</option>
                  <option value="DELIVERY_STAFF">Delivery Agent</option>
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Assigned Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
                >
                  {MOCK_BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name.split('-')[1]?.trim() || b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Role Modal */}
      {editingStaff && (
        <Modal
          isOpen={true}
          onClose={() => setEditingStaff(null)}
          title={`Update Role: ${editingStaff.name}`}
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="px-3 py-1.5 rounded border border-sand-300 text-xs text-gray-700 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold"
              >
                Save Role
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-gray-600">
              Select access permissions role for <span className="font-bold">{editingStaff.name}</span>:
            </p>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full p-2 border border-sand-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
              >
                <option value="PHARMACIST">Licensed Pharmacist</option>
                <option value="CASHIER">POS Cashier</option>
                <option value="DELIVERY_STAFF">Delivery Agent</option>
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="PHARMACY_OWNER">Pharmacy Owner</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
