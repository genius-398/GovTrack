import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
  Filter,
  RefreshCw,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  CreditCard,
  User,
  ExternalLink,
} from 'lucide-react';
import { DocumentRequest, DocumentStatus, Department, DocumentType, Priority, DeliveryMethod } from '../../types/index.ts';
import { DEPARTMENTS, DOCUMENT_CATALOG } from '../../config/departments.ts';
import { VisualStatusTracker } from './VisualStatusTracker.tsx';
import { AuditTrailDrawer } from '../common/AuditTrailDrawer.tsx';
import { DigitalSlipModal } from '../common/DigitalSlipModal.tsx';

interface CitizenDashboardProps {
  currentUserId: string;
  onSwitchToAdmin?: () => void;
  onDirectTrack?: (code: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUserId,
  onSwitchToAdmin,
}) => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'ready' | 'rejected'>('all');
  const [searchTrackingInput, setSearchTrackingInput] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // New Request Form states inside the Bento Grid
  const [selectedDept, setSelectedDept] = useState<Department>('Civil Registration Bureau');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Certified Birth Certificate');
  const [applicantName, setApplicantName] = useState('Elena Rostova');
  const [applicantNationalId, setApplicantNationalId] = useState('ID-99281-US');
  const [applicantEmail, setApplicantEmail] = useState('elena.rostova@example.gov');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [priority, setPriority] = useState<Priority>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [auditDrawerRequest, setAuditDrawerRequest] = useState<DocumentRequest | null>(null);
  const [slipModalRequest, setSlipModalRequest] = useState<DocumentRequest | null>(null);

  // Search lookup state for external tracking
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<DocumentRequest | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchCitizenRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/requests/${currentUserId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch requests');
      setRequests(data.data || []);
      if (data.data?.length > 0 && !selectedRequestId) {
        setSelectedRequestId(data.data[0].id || data.data[0]._id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenRequests();

    // Setup Server-Sent Events (SSE) for Real-Time synchronization
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.type === 'STATUS_UPDATED' ||
            payload.type === 'REQUEST_CREATED' ||
            payload.type === 'RESET'
          ) {
            fetchCitizenRequests();
          }
        } catch (e) {
          // ignore parsing error
        }
      };
    } catch (err) {
      console.warn('SSE subscription error in citizen panel');
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [currentUserId]);

  const handleTrackSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingInput.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const code = searchTrackingInput.trim().toUpperCase();
      const res = await fetch(`/api/requests/track/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tracking record not found');
      }
      setLookupResult(data.data);
    } catch (err: any) {
      setLookupError(err.message || 'Tracking identifier not located in civic registry');
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle department change in form
  const handleDepartmentChange = (dept: Department) => {
    setSelectedDept(dept);
    const matchingDocs = (Object.keys(DOCUMENT_CATALOG) as DocumentType[]).filter(
      (dt) => DOCUMENT_CATALOG[dt].department === dept
    );
    if (matchingDocs.length > 0) {
      setSelectedDocType(matchingDocs[0]);
    }
  };

  const currentDocInfo = DOCUMENT_CATALOG[selectedDocType] || DOCUMENT_CATALOG['Certified Birth Certificate'];
  const calculatedFee =
    currentDocInfo.baseFee + (priority === 'urgent' ? 30 : priority === 'expedited' ? 15 : 0);

  const handleInlineFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSuccessMessage(null);

    try {
      const payload = {
        userId: currentUserId,
        applicant: {
          fullName: applicantName,
          email: applicantEmail,
          phone: '+1 (555) 234-8901',
          nationalId: applicantNationalId,
          address: '742 Evergreen Terrace, Sector 4, Capital District',
        },
        department: selectedDept,
        documentType: selectedDocType,
        priority,
        deliveryMethod,
        feesPaid: calculatedFee,
        supportingDocuments: [
          { name: 'Identity_Affidavit_Scan.pdf', size: '2.1 MB', type: 'application/pdf' },
        ],
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

      setRequests((prev) => [data.data, ...prev]);
      setSelectedRequestId(data.data.id || data.data._id);
      setFormSuccessMessage(`Lodged successfully! Tracking #${data.data.trackingNumber}`);

      setTimeout(() => {
        setFormSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'active') {
      return r.status === 'submitted' || r.status === 'under_verification' || r.status === 'processing';
    }
    if (activeTab === 'ready') return r.status === 'ready_for_pickup';
    if (activeTab === 'rejected') return r.status === 'rejected';
    return true;
  });

  const selectedRequest =
    lookupResult ||
    requests.find((r) => r.id === selectedRequestId || r._id === selectedRequestId) ||
    requests[0] ||
    null;

  // Mini-status badge helper function with full dark mode contrast
  const renderStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Ready for Pickup
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Processing & Printing
          </span>
        );
      case 'under_verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Under Verification
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Request Submitted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Action Required
          </span>
        );
    }
  };

  const activeInFlightCount = requests.filter(
    (r) => r.status === 'submitted' || r.status === 'under_verification' || r.status === 'processing'
  ).length;

  const readyPickupCount = requests.filter((r) => r.status === 'ready_for_pickup').length;

  return (
    <div className="space-y-8">
      {/* 1. Bento Grid: Top Hero & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Greeting Tile */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                <Sparkles size={12} className="text-blue-500" />
                Verified Citizen Portal
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Civic Dispatch Synchronized
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{applicantName}</span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-xl leading-relaxed">
              Track the live milestone progress of your municipal and federal credentials in
              real-time. Physical counter visits are no longer required until your status transitions
              to ready.
            </p>
          </div>

          {/* Quick Search inside Hero */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleTrackSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTrackingInput}
                  onChange={(e) => setSearchTrackingInput(e.target.value)}
                  placeholder="Fast-track by code (e.g. GT-2026-9812)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-blue-600/20 disabled:opacity-50 whitespace-nowrap"
              >
                {lookupLoading ? 'Locating...' : 'Locate Dossier'}
              </button>
            </form>

            {lookupError && (
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-2 font-medium">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="mt-3 flex items-center gap-3 text-xs bg-blue-50/70 dark:bg-blue-950/50 p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/50">
                <span className="text-blue-700 dark:text-blue-300 font-semibold">Active search result:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{lookupResult.trackingNumber}</span>
                <span className="text-slate-600 dark:text-slate-400">· {lookupResult.documentType}</span>
                <button
                  onClick={() => setLookupResult(null)}
                  className="ml-auto text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Column Tiles */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Tile 1: Active in-flight */}
          <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex-1 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                In Active Flight
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {activeInFlightCount}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Under official review or physical printing
              </p>
            </div>
          </div>

          {/* Tile 2: Ready for Pickup */}
          <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex-1 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Ready for Pickup
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {readyPickupCount}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Available at designated dispatch desk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Masterpiece: The Visual Document Tracker */}
      {selectedRequest ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {lookupResult ? 'Search Result Visual Tracker' : 'Live Milestone Visual Tracker'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-time Socket Active</span>
            </div>
          </div>

          <VisualStatusTracker
            request={selectedRequest}
            onOpenAuditTrail={(req) => setAuditDrawerRequest(req)}
            onOpenDigitalSlip={(req) => setSlipModalRequest(req)}
          />
        </div>
      ) : loading ? (
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <RefreshCw size={24} className="mx-auto text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Retrieving official records...</p>
        </div>
      ) : null}

      {/* 3. Bento Bottom Section: New Request Card + Past Requests Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sleek New Request Card with Floating Labels & Subtle Focus Rings */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Direct Intake
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Request a Document</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official lodging with instantaneous tracking token.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus size={20} />
            </div>
          </div>

          {formSuccessMessage && (
            <div className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleInlineFormSubmit} className="mt-6 space-y-5">
            {/* Department Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Authorized Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => handleDepartmentChange(e.target.value as Department)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Document Category
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer font-medium"
              >
                {(Object.keys(DOCUMENT_CATALOG) as DocumentType[])
                  .filter((dt) => DOCUMENT_CATALOG[dt].department === selectedDept)
                  .map((dt) => (
                    <option key={dt} value={dt}>
                      {dt} · ${DOCUMENT_CATALOG[dt].baseFee.toFixed(2)} (est.{' '}
                      {DOCUMENT_CATALOG[dt].estimatedDays}d)
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{currentDocInfo.description}</p>
            </div>

            {/* Floating Label Style Inputs for Applicant Identity */}
            <div className="space-y-4 pt-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  id="full-name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-3.5 pt-5 pb-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
                <label
                  htmlFor="full-name"
                  className="absolute text-[11px] text-slate-400 dark:text-slate-500 duration-200 transform -translate-y-2 scale-75 top-3.5 z-10 origin-[0] left-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
                >
                  Applicant Full Legal Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  id="national-id"
                  value={applicantNationalId}
                  onChange={(e) => setApplicantNationalId(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-3.5 pt-5 pb-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
                <label
                  htmlFor="national-id"
                  className="absolute text-[11px] text-slate-400 dark:text-slate-500 duration-200 transform -translate-y-2 scale-75 top-3.5 z-10 origin-[0] left-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
                >
                  National Identifier / SSN
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  id="email-addr"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-3.5 pt-5 pb-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
                <label
                  htmlFor="email-addr"
                  className="absolute text-[11px] text-slate-400 dark:text-slate-500 duration-200 transform -translate-y-2 scale-75 top-3.5 z-10 origin-[0] left-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
                >
                  Notification Email Address
                </label>
              </div>
            </div>

            {/* Delivery Method & Processing Priority */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Collection Mode
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-700/60">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => setDeliveryMethod('pickup')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Counter Desk</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-700/60">
                    <input
                      type="radio"
                      name="delivery"
                      value="courier"
                      checked={deliveryMethod === 'courier'}
                      onChange={() => setDeliveryMethod('courier')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Courier (+ $8)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Processing Speed
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-700/60">
                    <input
                      type="radio"
                      name="priority"
                      value="standard"
                      checked={priority === 'standard'}
                      onChange={() => setPriority('standard')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Standard</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-700/60">
                    <input
                      type="radio"
                      name="priority"
                      value="expedited"
                      checked={priority === 'expedited'}
                      onChange={() => setPriority('expedited')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Expedited (+ $15)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Fee summary & Submit */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Total Statutory Cost</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  ${calculatedFee.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Lodging...' : 'Lodge Request'}</span>
                <Send size={13} />
              </button>
            </div>
          </form>
        </div>

        {/* Sleek Past Requests Summary Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Document Applications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any case card to activate its live status tracker.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'active'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('ready')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'ready'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ready
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <FileText size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No requests in this category</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Use the New Request panel on the left to lodge an official application.
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id || selectedRequest?._id === req._id;

                return (
                  <div
                    key={req.id || req._id}
                    onClick={() => {
                      setSelectedRequestId(req.id || req._id || null);
                      setLookupResult(null);
                    }}
                    className={`bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/30'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Document Icon Circle */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          req.status === 'ready_for_pickup'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : req.status === 'rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <FileText size={20} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.documentType}</h4>
                          {renderStatusBadge(req.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {req.trackingNumber}
                          </span>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span>{req.department}</span>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-400 dark:text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        <span>{isSelected ? 'Currently Viewing' : 'Track Status'}</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Audit Trail & Digital Slip Modals */}
      <AuditTrailDrawer
        isOpen={Boolean(auditDrawerRequest)}
        onClose={() => setAuditDrawerRequest(null)}
        request={auditDrawerRequest}
      />

      <DigitalSlipModal
        isOpen={Boolean(slipModalRequest)}
        onClose={() => setSlipModalRequest(null)}
        request={slipModalRequest}
      />
    </div>
  );
};
