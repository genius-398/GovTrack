import React, { useState, useEffect } from 'react';
import {
  Kanban,
  ListFilter,
  Search,
  Check,
  ArrowRight,
  Clock,
  Printer,
  PackageCheck,
  AlertCircle,
  FileText,
  RotateCcw,
  User,
  Shield,
  Eye,
  X,
  BadgeAlert,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { DocumentRequest, DocumentStatus, Department } from '../../types/index.ts';
import { DEPARTMENTS, FIXED_MILESTONES } from '../../config/departments.ts';
import { AuditTrailDrawer } from '../common/AuditTrailDrawer.tsx';
import { DigitalSlipModal } from '../common/DigitalSlipModal.tsx';

interface AdminDashboardProps {
  currentOfficerName?: string;
  currentBadgeNumber?: string;
  onViewCitizenPortal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentOfficerName = 'Officer Marcus Vance',
  currentBadgeNumber = 'CRB-8812',
  onViewCitizenPortal,
}) => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected request for deep inspection drawer
  const [inspectingRequest, setInspectingRequest] = useState<DocumentRequest | null>(null);

  // Status transition dialog state
  const [transitionTarget, setTransitionTarget] = useState<{
    request: DocumentRequest;
    nextStatus: DocumentStatus;
  } | null>(null);
  const [officerRemarkInput, setOfficerRemarkInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [counterLocationInput, setCounterLocationInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Drawers
  const [auditDrawerRequest, setAuditDrawerRequest] = useState<DocumentRequest | null>(null);
  const [slipModalRequest, setSlipModalRequest] = useState<DocumentRequest | null>(null);

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDept !== 'all') params.append('department', selectedDept);
      if (selectedStatusFilter !== 'all') params.append('status', selectedStatusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/requests?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRequests();

    // Listen to real-time events via Server-Sent Events (SSE)
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
            fetchAdminRequests();
          }
        } catch (e) {
          // ignore parsing error
        }
      };
    } catch (err) {
      console.warn('SSE subscription error in admin panel');
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [selectedDept, selectedStatusFilter, searchQuery]);

  // Determine next milestone for 1-click advancement
  const getNextMilestone = (status: DocumentStatus): DocumentStatus | null => {
    if (status === 'submitted') return 'under_verification';
    if (status === 'under_verification') return 'processing';
    if (status === 'processing') return 'ready_for_pickup';
    return null;
  };

  const handleOpenAdvanceDialog = (request: DocumentRequest, targetStatus: DocumentStatus) => {
    setTransitionTarget({ request, nextStatus: targetStatus });
    setOfficerRemarkInput('');
    setRejectionReasonInput('');
    setCounterLocationInput(request.pickupCounter || 'Central Public Service Archive - Desk 02');
  };

  const handleConfirmStatusUpdate = async () => {
    if (!transitionTarget) return;
    const { request, nextStatus } = transitionTarget;

    if (nextStatus === 'rejected' && !rejectionReasonInput.trim()) {
      alert('Please provide a legal justification or reason for rejection.');
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        status: nextStatus,
        changedBy: `${currentOfficerName} (Desk Officer)`,
        officerBadge: currentBadgeNumber,
        officerRole: 'official',
        officerRemarks:
          officerRemarkInput.trim() ||
          (nextStatus === 'under_verification'
            ? 'Application accepted into identity verification workflow.'
            : nextStatus === 'processing'
            ? 'Verification approved. Physical production and cryptographic seal issued.'
            : nextStatus === 'ready_for_pickup'
            ? 'Document quality check passed. Available at pickup window.'
            : rejectionReasonInput.trim()),
        rejectionReason: nextStatus === 'rejected' ? rejectionReasonInput.trim() : undefined,
        counterLocation: counterLocationInput.trim(),
      };

      const res = await fetch(`/api/admin/requests/${request.id || request._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update request milestone');
      }

      setRequests((prev) =>
        prev.map((r) => ((r.id === request.id || r._id === request._id) ? data.data : r))
      );
      if (inspectingRequest && (inspectingRequest.id === request.id || inspectingRequest._id === request._id)) {
        setInspectingRequest(data.data);
      }

      setTransitionTarget(null);
    } catch (err: any) {
      alert(err.message || 'Error executing status transition');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset the registry database to standard 5 baseline civic records?')) {
      await fetch('/api/seed/reset', { method: 'POST' });
      fetchAdminRequests();
    }
  };

  // Helper for computing readable elapsed time
  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Helper for citizen avatar initials
  const getInitials = (name: string) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const counts = {
    total: requests.length,
    submitted: requests.filter((r) => r.status === 'submitted').length,
    under_verification: requests.filter((r) => r.status === 'under_verification').length,
    processing: requests.filter((r) => r.status === 'processing').length,
    ready_for_pickup: requests.filter((r) => r.status === 'ready_for_pickup').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Officer Header */}
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              <Sparkles size={11} className="text-blue-500" />
              Government Administration Desk
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{currentOfficerName}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">[{currentBadgeNumber}]</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Document Request Registry
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage incoming citizen cases, verify supporting affidavits, advance physical
            manufacturing milestones, and maintain complete cryptographic chain of custody.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={handleResetDemoData}
            title="Reset database to default seed state"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all hover:scale-[1.02] shadow-2xs"
          >
            <RotateCcw size={14} />
            <span>Reset Demo DB</span>
          </button>

          {onViewCitizenPortal && (
            <button
              onClick={onViewCitizenPortal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-blue-600/20"
            >
              <span>Citizen Tracker</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Department Selector */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking #, citizen name, doc..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-mono"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="all">All Milestone States</option>
            <option value="submitted">State 1: Submitted</option>
            <option value="under_verification">State 2: Under Verification</option>
            <option value="processing">State 3: Processing/Printing</option>
            <option value="ready_for_pickup">State 4: Ready/Dispatched</option>
            <option value="rejected">Rejected / Action Needed</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-center">
          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListFilter size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Modern List</span>
          </button>
        </div>
      </div>

      {/* Main Viewport: Kanban Board or Modern List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FIXED_MILESTONES.map((milestone) => {
            const columnRequests = requests.filter((r) => r.status === milestone.key);
            const nextStatus = getNextMilestone(milestone.key);

            return (
              <div
                key={milestone.key}
                className="bg-slate-100/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col max-h-[850px] p-3"
              >
                {/* Column Header */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      0{milestone.stepNumber}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {milestone.shortLabel}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full font-bold">
                    {columnRequests.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {columnRequests.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/40">
                      No applications currently in this milestone.
                    </div>
                  ) : (
                    columnRequests.map((req) => (
                      <div
                        key={req.id || req._id}
                        className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 space-y-3.5 group"
                      >
                        {/* Card Header: Avatar Initials + Time Elapsed */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {/* Citizen Initials Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {getInitials(req.applicant.fullName)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                                {req.applicant.fullName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">
                                {req.applicant.nationalId}
                              </span>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {timeAgo(req.createdAt)}
                          </span>
                        </div>

                        {/* Document Type & Department */}
                        <div>
                          <div className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {req.trackingNumber}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                            {req.documentType}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {req.department}
                          </p>
                        </div>

                        {/* Highly Visible Satisfying Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          {/* Main Advance / Approve Button with checkmark / arrow */}
                          {nextStatus && (
                            <button
                              onClick={() => handleOpenAdvanceDialog(req, nextStatus)}
                              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md ${
                                milestone.key === 'submitted'
                                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                              }`}
                            >
                              {milestone.key === 'submitted' ? (
                                <>
                                  <Check size={14} strokeWidth={2.5} />
                                  <span>Accept Case</span>
                                </>
                              ) : (
                                <>
                                  <span>Advance Stage</span>
                                  <ArrowRight size={14} strokeWidth={2.5} />
                                </>
                              )}
                            </button>
                          )}

                          {/* Quick Inspect Button */}
                          <button
                            onClick={() => setInspectingRequest(req)}
                            title="Inspect Dossier"
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Quick Reject Button */}
                          {milestone.key !== 'ready_for_pickup' && (
                            <button
                              onClick={() => handleOpenAdvanceDialog(req, 'rejected')}
                              title="Reject Application"
                              className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Modern List View */
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
              No applications match your filter query.
            </div>
          ) : (
            requests.map((req) => {
              const nextStatus = getNextMilestone(req.status);

              return (
                <div
                  key={req.id || req._id}
                  className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(req.applicant.fullName)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {req.trackingNumber}
                        </span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{req.applicant.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {timeAgo(req.createdAt)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{req.documentType}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{req.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono font-semibold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      {req.status.replace('_', ' ')}
                    </span>

                    {nextStatus && (
                      <button
                        onClick={() => handleOpenAdvanceDialog(req, nextStatus)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1"
                      >
                        <span>{req.status === 'submitted' ? 'Accept' : 'Advance'}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => setInspectingRequest(req)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                    >
                      Dossier
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Advance / Reject Confirmation Modal */}
      {transitionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Custody Transition
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {transitionTarget.nextStatus === 'rejected'
                    ? 'Reject Application'
                    : 'Advance Milestone Status'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dossier #{transitionTarget.request.trackingNumber} · {transitionTarget.request.applicant.fullName}
                </p>
              </div>
              <button
                onClick={() => setTransitionTarget(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono uppercase">
                  Current: {transitionTarget.request.status.replace('_', ' ')}
                </span>
                <ArrowRight size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-slate-900 dark:text-white font-mono uppercase">
                  Target: {transitionTarget.nextStatus.replace('_', ' ')}
                </span>
              </div>

              {transitionTarget.nextStatus === 'rejected' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Formal Legal Reason for Rejection *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Specify missing document, invalid jurisdiction, or failed clearance..."
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Official Remarks (Cryptographically logged into public audit ledger)
                    </label>
                    <textarea
                      rows={2}
                      value={officerRemarkInput}
                      onChange={(e) => setOfficerRemarkInput(e.target.value)}
                      placeholder="e.g. Identity affidavit verified against civil archives. Raised seal approved."
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>

                  {transitionTarget.nextStatus === 'ready_for_pickup' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Designated Collection Counter Desk
                      </label>
                      <input
                        type="text"
                        value={counterLocationInput}
                        onChange={(e) => setCounterLocationInput(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800"
                        placeholder="e.g. Central Public Service Archive - Desk 02"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                <span>Signing Officer: {currentOfficerName}</span>
                <span>Badge #{currentBadgeNumber}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTransitionTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmStatusUpdate}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md ${
                  transitionTarget.nextStatus === 'rejected'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {isUpdating ? 'Recording...' : 'Commit Status Transition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dossier Inspection Drawer */}
      {inspectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Dossier #{inspectingRequest.trackingNumber}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {inspectingRequest.documentType}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{inspectingRequest.department}</p>
              </div>
              <button
                onClick={() => setInspectingRequest(null)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stepper / Status Action Bar */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                  Transition Current State
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {FIXED_MILESTONES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => handleOpenAdvanceDialog(inspectingRequest, m.key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between font-semibold transition-all ${
                        inspectingRequest.status === m.key
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <span>{m.label}</span>
                      {inspectingRequest.status === m.key && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Applicant Dossier */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Applicant Identity & Records
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Full Legal Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{inspectingRequest.applicant.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">National ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{inspectingRequest.applicant.nationalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Email:</span>
                    <span className="text-slate-800 dark:text-slate-200">{inspectingRequest.applicant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Collection Counter:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {inspectingRequest.deliveryMethod === 'pickup'
                        ? inspectingRequest.pickupCounter || 'Central Dispatch'
                        : 'Registered Courier'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSlipModalRequest(inspectingRequest)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                >
                  Digital Claim Voucher
                </button>
                <button
                  onClick={() => setAuditDrawerRequest(inspectingRequest)}
                  className="flex-1 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 rounded-xl transition-all"
                >
                  Inspect Full Audit Trail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
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
