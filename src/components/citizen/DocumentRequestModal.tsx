import React, { useState } from 'react';
import { X, Building2, FileText, User, MapPin, Shield, UploadCloud, Check, ArrowRight } from 'lucide-react';
import { Department, DocumentType, Priority, DeliveryMethod } from '../../types/index.ts';
import { DEPARTMENTS, DOCUMENT_CATALOG } from '../../config/departments.ts';

interface DocumentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newRequest: any) => void;
  currentUserId: string;
}

export const DocumentRequestModal: React.FC<DocumentRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  currentUserId,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('Civil Registration Bureau');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Certified Birth Certificate');
  const [priority, setPriority] = useState<Priority>('standard');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Applicant info state
  const [fullName, setFullName] = useState('Elena Rostova');
  const [email, setEmail] = useState('elena.rostova@example.gov');
  const [phone, setPhone] = useState('+1 (555) 234-8901');
  const [nationalId, setNationalId] = useState('ID-99281-US');
  const [address, setAddress] = useState('742 Evergreen Terrace, Sector 4, Capital District');

  // Supporting file uploads (simulated)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string }>>([
    { name: 'Identity_Verification_Scan.pdf', size: '1.8 MB', type: 'application/pdf' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter available document types based on selected department
  const availableDocs = (Object.keys(DOCUMENT_CATALOG) as DocumentType[]).filter(
    (docType) => DOCUMENT_CATALOG[docType].department === selectedDepartment
  );

  const currentDocInfo = DOCUMENT_CATALOG[selectedDocType] || DOCUMENT_CATALOG['Certified Birth Certificate'];

  const handleDepartmentChange = (dept: Department) => {
    setSelectedDepartment(dept);
    const matchingDocs = (Object.keys(DOCUMENT_CATALOG) as DocumentType[]).filter(
      (dt) => DOCUMENT_CATALOG[dt].department === dept
    );
    if (matchingDocs.length > 0) {
      setSelectedDocType(matchingDocs[0]);
    }
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: file.type || 'application/octet-stream',
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !nationalId.trim()) {
      setErrorMsg('Please complete all required identity credentials.');
      return;
    }

    if (deliveryMethod === 'courier' && !deliveryAddress.trim() && !address.trim()) {
      setErrorMsg('Please provide a valid delivery destination for registered courier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: currentUserId,
        applicant: {
          fullName,
          email,
          phone,
          nationalId,
          address,
        },
        department: selectedDepartment,
        documentType: selectedDocType,
        priority,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'courier' ? (deliveryAddress || address) : undefined,
        feesPaid: currentDocInfo.baseFee + (priority === 'urgent' ? 30 : priority === 'expedited' ? 15 : 0),
        supportingDocuments: uploadedFiles,
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit document application');
      }

      onSubmitSuccess(data.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error lodging application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Lodge Official Document Request</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit request directly to authorized municipal and federal registry desks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. Target Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              1. Government Department
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDepartment === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentChange(dept.id)}
                    className={`text-left p-3 rounded-md border text-xs transition-colors flex items-start justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{dept.name}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{dept.code} · {dept.badge}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-slate-900 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Document Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              2. Document Category
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {availableDocs.map((dt) => (
                <option key={dt} value={dt}>
                  {dt} (${DOCUMENT_CATALOG[dt].baseFee.toFixed(2)} · est. {DOCUMENT_CATALOG[dt].estimatedDays} days)
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {currentDocInfo.description}
            </p>
          </div>

          {/* 3. Applicant Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              3. Applicant Identity & Coordinates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-600 block mb-1">Full Legal Name *</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="Elena Rostova"
                />
              </div>

              <div>
                <span className="text-slate-600 block mb-1">National ID / Social Identifier *</span>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="ID-99281-US"
                />
              </div>

              <div>
                <span className="text-slate-600 block mb-1">Email (For milestone notifications) *</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="elena@example.gov"
                />
              </div>

              <div>
                <span className="text-slate-600 block mb-1">Telephone Contact</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="+1 (555) 234-8901"
                />
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-600 block mb-1">Residential Address</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="Street, City, State, Postal Code"
                />
              </div>
            </div>
          </div>

          {/* 4. Delivery & Fulfillment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                4. Fulfillment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="font-medium text-slate-900 block">In-Person Counter Collection</span>
                    <span className="text-[11px] text-slate-500">Pick up at designated Civic Desk with QR code</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="courier"
                    checked={deliveryMethod === 'courier'}
                    onChange={() => setDeliveryMethod('courier')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="font-medium text-slate-900 block">Registered Postal Courier</span>
                    <span className="text-[11px] text-slate-500">Direct courier to verified residential address</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Processing Cadence
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="priority"
                    value="standard"
                    checked={priority === 'standard'}
                    onChange={() => setPriority('standard')}
                    className="text-slate-900"
                  />
                  <div>
                    <span className="font-medium text-slate-900 block">Standard (3–5 Business Days)</span>
                    <span className="text-[11px] text-slate-500">Regular administrative review queue</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="priority"
                    value="expedited"
                    checked={priority === 'expedited'}
                    onChange={() => setPriority('expedited')}
                    className="text-slate-900"
                  />
                  <div>
                    <span className="font-medium text-slate-900 block">Expedited Priority (+ $15.00)</span>
                    <span className="text-[11px] text-slate-500">Accelerated examination & printing</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Supporting Verification Uploads */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              5. Supporting Verification Documentation
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-md p-4 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
              <UploadCloud size={24} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-600 font-medium">Attach Supporting Affidavits or Identity Scans</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG accepted (Max 15MB)</p>
              <label className="mt-2.5 inline-block px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                <span>Select Document File</span>
                <input
                  type="file"
                  onChange={handleSimulateUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-slate-400 shrink-0" />
                      <span className="text-slate-800 truncate">{file.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{file.size}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span>Total Statutory Fee: </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                $
                {(
                  currentDocInfo.baseFee +
                  (priority === 'urgent' ? 30 : priority === 'expedited' ? 15 : 0)
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                <span>{isSubmitting ? 'Lodging Request...' : 'Submit Official Request'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
