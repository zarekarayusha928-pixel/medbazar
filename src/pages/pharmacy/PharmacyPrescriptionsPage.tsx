import React, { useState } from 'react';
import { FileCheck, Check, X, Eye, HelpCircle, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PRESCRIPTIONS } from '@/services/api/mockData';
import { Prescription } from '@/types';

export const PharmacyPrescriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);

  // Modal states
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);
  const [rejectingRx, setRejectingRx] = useState<Prescription | null>(null);
  const [rejectReason, setRejectReason] = useState('Prescription date exceeds 6 months validity');
  const [requestInfoRx, setRequestInfoRx] = useState<Prescription | null>(null);
  const [infoRequestText, setInfoRequestText] = useState('Please upload a clear image showing doctor signature and medical registration number.');

  // Action: VIEW
  const handleView = (rx: Prescription) => {
    setViewingRx(rx);
  };

  // Action: APPROVE
  const handleApprove = (rx: Prescription) => {
    const updated = prescriptions.map(p =>
      p.id === rx.id
        ? {
            ...p,
            status: 'APPROVED' as const,
            reviewedBy: 'Amit Deshmukh (Reg. Pharmacist #MH-44091)',
            reviewedAt: new Date().toISOString()
          }
        : p
    );
    setPrescriptions(updated);
    showToast('Prescription Approved', `Approved Rx #${rx.id} for ${rx.customerName}. Order marked verified.`, 'success');
    if (viewingRx?.id === rx.id) setViewingRx(null);
  };

  // Action: REJECT
  const handleRejectConfirm = () => {
    if (!rejectingRx) return;
    const updated = prescriptions.map(p =>
      p.id === rejectingRx.id
        ? {
            ...p,
            status: 'REJECTED' as const,
            notes: `Rejected by pharmacist: ${rejectReason}`,
            reviewedBy: 'Amit Deshmukh (Reg. Pharmacist #MH-44091)',
            reviewedAt: new Date().toISOString()
          }
        : p
    );
    setPrescriptions(updated);
    showToast('Prescription Rejected', `Prescription #${rejectingRx.id} rejected. Reason logged.`, 'error');
    setRejectingRx(null);
    if (viewingRx?.id === rejectingRx.id) setViewingRx(null);
  };

  // Action: REQUEST INFORMATION
  const handleRequestInfoConfirm = () => {
    if (!requestInfoRx) return;
    const updated = prescriptions.map(p =>
      p.id === requestInfoRx.id
        ? {
            ...p,
            status: 'NEEDS_INFORMATION' as const,
            notes: `Requested information: ${infoRequestText}`,
            reviewedBy: 'Amit Deshmukh (Reg. Pharmacist)',
            reviewedAt: new Date().toISOString()
          }
        : p
    );
    setPrescriptions(updated);
    showToast('Information Requested', `SMS alert dispatched to ${requestInfoRx.customerName} requesting updated Rx details.`, 'info');
    setRequestInfoRx(null);
    if (viewingRx?.id === requestInfoRx.id) setViewingRx(null);
  };

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Prescription Verification Queue
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              Schedule H / H1 Drugs
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Mandatory pharmacist clinical review before order confirmation and dispensing
          </p>
        </div>
      </div>

      {/* Prescription Queue Table - Compact, Hairline Borders, Mono Numerals */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Uploaded Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reviewer</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-sand-50/50 transition-colors">
                  {/* Customer */}
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-gray-900 block">{rx.customerName}</span>
                    <span className="font-mono text-[10px] text-gray-500">{rx.customerPhone}</span>
                  </td>

                  {/* Order */}
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                    {rx.orderId ? `#MB-2026-8801` : 'Direct Upload'}
                  </td>

                  {/* Uploaded date */}
                  <td className="py-2.5 px-3 font-mono text-[10px] text-gray-600">
                    {new Date(rx.uploadedAt || rx.createdAt).toLocaleDateString()} {new Date(rx.uploadedAt || rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {rx.status === 'APPROVED' && <Badge variant="success" size="sm">Approved</Badge>}
                    {rx.status === 'PENDING_REVIEW' && <Badge variant="warning" size="sm">Pending Review</Badge>}
                    {rx.status === 'REJECTED' && <Badge variant="danger" size="sm">Rejected</Badge>}
                    {rx.status === 'NEEDS_INFORMATION' && <Badge variant="info" size="sm">Needs Info</Badge>}
                  </td>

                  {/* Reviewer */}
                  <td className="py-2.5 px-3 text-gray-700 text-[11px]">
                    {rx.reviewedBy ? (
                      <span className="font-mono text-[10px] text-gray-800">{rx.reviewedBy}</span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Action Buttons: VIEW, APPROVE, REJECT, REQUEST INFORMATION */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleView(rx)}
                        className="px-2 py-1 rounded bg-sand-100 hover:bg-sand-200 border border-sand-300 text-pine-800 font-semibold text-[11px] transition-colors"
                      >
                        VIEW
                      </button>

                      {rx.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(rx)}
                            className="px-2 py-1 rounded bg-pine-700 hover:bg-pine-800 text-white font-semibold text-[11px] transition-colors shadow-2xs"
                          >
                            APPROVE
                          </button>

                          <button
                            type="button"
                            onClick={() => setRejectingRx(rx)}
                            className="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-700 border border-red-300 font-semibold text-[11px] transition-colors"
                          >
                            REJECT
                          </button>

                          <button
                            type="button"
                            onClick={() => setRequestInfoRx(rx)}
                            className="px-2 py-1 rounded bg-white hover:bg-sand-100 text-gray-700 border border-sand-300 font-semibold text-[11px] transition-colors"
                          >
                            REQUEST INFO
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW Modal */}
      {viewingRx && (
        <Modal
          isOpen={true}
          onClose={() => setViewingRx(null)}
          title={`Prescription Record: ${viewingRx.customerName}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-[11px] text-gray-500">
                Uploaded: {new Date(viewingRx.createdAt).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                {viewingRx.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejectingRx(viewingRx)}
                      className="px-3 py-1.5 rounded border border-red-300 bg-red-50 text-red-700 text-xs font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestInfoRx(viewingRx)}
                      className="px-3 py-1.5 rounded border border-sand-300 bg-white text-gray-700 text-xs font-semibold"
                    >
                      Request Info
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(viewingRx)}
                      className="px-3 py-1.5 rounded bg-pine-700 text-white text-xs font-semibold"
                    >
                      Approve & Dispense
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setViewingRx(null)}
                  className="px-3 py-1.5 rounded border border-sand-300 bg-white text-gray-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 p-3 rounded border border-sand-200 bg-sand-50/70">
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase block">Patient Name</span>
                <p className="font-bold text-gray-900">{viewingRx.customerName}</p>
                <p className="font-mono text-gray-600">{viewingRx.customerPhone}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase block">Doctor & Notes</span>
                <p className="font-bold text-gray-900">{viewingRx.doctorName || 'Dr. Patil (MBBS, MD)'}</p>
                <p className="text-gray-600 text-[11px]">{viewingRx.notes || 'Schedule H Medication Order'}</p>
              </div>
            </div>

            <div className="border border-sand-300 rounded overflow-hidden bg-sand-100 flex items-center justify-center p-2 min-h-[260px]">
              <img
                src={viewingRx.fileUrl}
                alt="Prescription Document Preview"
                className="max-h-72 object-contain rounded"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT Modal */}
      {rejectingRx && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingRx(null)}
          title={`Reject Prescription #${rejectingRx.id}`}
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setRejectingRx(null)}
                className="px-3 py-1.5 rounded border border-sand-300 bg-white text-xs text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-gray-600">
              Please specify the clinical reason for rejecting prescription for <span className="font-bold">{rejectingRx.customerName}</span>:
            </p>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Reason for Rejection</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded bg-white text-xs text-gray-900 focus:outline-none focus:border-pine-700"
              >
                <option value="Prescription date exceeds 6 months validity">Prescription date exceeds 6 months validity</option>
                <option value="Doctor medical council registration number missing">Doctor medical council registration number missing</option>
                <option value="Illegible handwriting or dosage ambiguity">Illegible handwriting or dosage ambiguity</option>
                <option value="Medication dosage exceeds safe therapeutic limits">Medication dosage exceeds safe therapeutic limits</option>
                <option value="Prescription image cropped or incomplete">Prescription image cropped or incomplete</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* REQUEST INFORMATION Modal */}
      {requestInfoRx && (
        <Modal
          isOpen={true}
          onClose={() => setRequestInfoRx(null)}
          title={`Request Clarification: ${requestInfoRx.customerName}`}
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setRequestInfoRx(null)}
                className="px-3 py-1.5 rounded border border-sand-300 bg-white text-xs text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestInfoConfirm}
                className="px-3 py-1.5 rounded bg-pine-700 hover:bg-pine-800 text-white text-xs font-semibold"
              >
                Send Request
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-gray-600">
              An SMS and in-app message will be sent to the customer requesting the clarification below:
            </p>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Message to Patient</label>
              <textarea
                rows={3}
                value={infoRequestText}
                onChange={(e) => setInfoRequestText(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded bg-white text-xs text-gray-900 focus:outline-none focus:border-pine-700"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
