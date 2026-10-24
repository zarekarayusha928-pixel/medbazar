import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertTriangle, Eye, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { prescriptionApi } from '@/services/api/prescriptionApi';
import { Prescription } from '@/types';

export const PrescriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setLoading(true);
    prescriptionApi
      .getPrescriptions()
      .then((data) => setPrescriptions(data))
      .catch((_err) => {
        // Fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !doctorName) {
      showToast('Document Missing', 'Please select a file or specify the prescribing doctor.', 'error');
      return;
    }

    try {
      const newRx = await prescriptionApi.uploadPrescription({
        organizationId: 'pharm_1',
        doctorName: doctorName.trim() || 'Dr. Deshpande (MBBS, MD)',
        fileName: selectedFile ? selectedFile.name : 'Prescription_Scan.pdf',
        fileType: (selectedFile?.type.includes('image') ? 'IMAGE' : 'PDF') as 'IMAGE' | 'PDF',
        notes: patientNotes,
      });

      setPrescriptions([newRx, ...prescriptions]);
      setSelectedFile(null);
      setDoctorName('');
      setPatientNotes('');
      setIsUploading(false);
      showToast('Prescription Uploaded', 'Document transmitted securely to on-duty pharmacist for verification.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Failed to upload prescription.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/customer' }, { label: 'Prescription Records' }]} />

      {/* Header */}
      <div className="border-b border-sand-300 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-pine-800">Healthcare Documentation</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Prescription Upload & Verification</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Upload valid doctor prescriptions for pharmacist review. Regulated Schedule H & H1 medications require on-duty pharmacist verification before order dispatch.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploading(!isUploading)}
          className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Close Upload Form' : 'Upload New Prescription'}</span>
        </button>
      </div>

      {/* Upload Box Modal / Inline Panel */}
      {isUploading && (
        <form onSubmit={handleFileUpload} className="bg-white rounded-lg border border-sand-300 p-4 sm:p-6 space-y-5 shadow-sm">
          <div className="border-b border-sand-200 pb-3">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono">
              Upload Medical Document
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Clear photos or PDF copies showing doctor clinic letterhead, date, and doctor registration number.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="rx-doctor-name" className="block font-semibold text-gray-700 mb-1">Prescribing Doctor Name:</label>
              <input
                id="rx-doctor-name"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. A. V. Kulkarni (Cardiologist)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-sand-300 bg-sand-50 focus:bg-white focus:outline-none focus:border-pine-600 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="rx-notes" className="block font-semibold text-gray-700 mb-1">Doctor Registration / Clinic (Optional):</label>
              <input
                id="rx-notes"
                type="text"
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g. MMC Reg #84920 / City Clinic"
                className="w-full px-3.5 py-2.5 rounded-lg border border-sand-300 bg-sand-50 focus:bg-white focus:outline-none focus:border-pine-600 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>
          </div>

          {/* File Picker Zone */}
          <div className="p-6 sm:p-8 rounded-lg border-2 border-dashed border-sand-300 bg-sand-50 text-center space-y-3">
            <Upload className="w-8 h-8 text-pine-700 mx-auto" aria-hidden="true" />
            <div>
              <p className="font-bold text-gray-900 text-xs">Click or drag prescription scan here</p>
              <p className="text-[11px] text-gray-500 mt-0.5">JPG, PNG, or PDF formats up to 10MB</p>
            </div>
            <input
              type="file"
              aria-label="Upload prescription file (JPG, PNG, or PDF)"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pine-700 file:text-white hover:file:bg-pine-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            {selectedFile && (
              <p className="text-xs font-mono text-emerald-800 font-semibold">
                ✓ Ready to upload: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-4 py-2 rounded-lg border border-sand-300 text-gray-700 font-semibold text-xs hover:bg-sand-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-pine-700 hover:bg-pine-800 text-white font-semibold text-xs px-6 py-2 rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Submit for Pharmacist Review
            </button>
          </div>
        </form>
      )}

      {/* Uploaded History Table */}
      <div className="bg-white rounded-lg border border-sand-300 overflow-hidden shadow-sm">
        <div className="bg-sand-100 px-4 sm:px-6 py-3.5 border-b border-sand-300 font-mono text-xs uppercase tracking-wider text-gray-700 font-bold flex items-center justify-between">
          <span>Prescription Verification Records</span>
          <span className="text-[11px] text-gray-500 font-normal">
            {prescriptions.length} Records on file
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Prescriptions Uploaded"
              description="Upload your doctor prescription to purchase Schedule H and restricted medications."
              actionLabel="Upload First Prescription"
              onAction={() => setIsUploading(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sand-200 text-gray-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-4 sm:px-6 font-semibold">Document & Doctor</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Upload Date</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Verified Pharmacist</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold">Verification Status</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {prescriptions.map((p) => (
                  <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sand-100 text-pine-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{p.doctorName || 'Doctor Prescription'}</span>
                          <span className="font-mono text-[11px] text-gray-400">{p.fileName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-mono text-gray-600">
                      {new Date(p.uploadedAt || p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-sans text-gray-700">
                      {p.reviewedBy || <span className="font-mono text-gray-400">Queue Assignment Pending</span>}
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      {p.status === 'APPROVED' && (
                        <Badge variant="success" dot>Approved by Pharmacist</Badge>
                      )}
                      {p.status === 'PENDING_REVIEW' && (
                        <Badge variant="warning" dot>Pending Review</Badge>
                      )}
                      {p.status === 'REJECTED' && (
                        <Badge variant="danger" dot>Action Required</Badge>
                      )}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-pine-800 hover:text-pine-900 bg-sand-100 hover:bg-sand-200 px-3 py-1.5 rounded-lg border border-sand-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legal & Regulatory Guidelines */}
      <div className="bg-sand-100 rounded-lg border border-sand-300 p-4 sm:p-5 flex items-start gap-3.5 text-xs">
        <ShieldCheck className="w-5 h-5 text-pine-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900">Legal Compliance & Schedule H Guidelines</h4>
          <p className="text-gray-600 leading-relaxed">
            As mandated by the Drugs and Cosmetics Act, dispensing of prescription-only medications requires a valid prescription signed by a registered medical practitioner. All prescriptions are verified by licensed pharmacists before order preparation.
          </p>
        </div>
      </div>
    </div>
  );
};
