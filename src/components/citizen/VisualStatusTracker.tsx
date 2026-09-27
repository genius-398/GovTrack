import React, { useState } from 'react';
import {
  Check,
  Clock,
  Printer,
  PackageCheck,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  History,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { DocumentRequest, DocumentStatus } from '../../types/index.ts';
import { FIXED_MILESTONES } from '../../config/departments.ts';

interface VisualStatusTrackerProps {
  request: DocumentRequest;
  onOpenAuditTrail?: (request: DocumentRequest) => void;
  onOpenDigitalSlip?: (request: DocumentRequest) => void;
}

export const VisualStatusTracker: React.FC<VisualStatusTrackerProps> = ({
  request,
  onOpenAuditTrail,
  onOpenDigitalSlip,
}) => {
  const [showTimelineExpanded, setShowTimelineExpanded] = useState(false);

  // 4 Core Fixed States
  const milestoneOrder: DocumentStatus[] = [
    'submitted',
    'under_verification',
    'processing',
    'ready_for_pickup',
  ];

  const isRejected = request.status === 'rejected';
  const currentStepIndex = milestoneOrder.indexOf(request.status);
  const currentStepNumber = isRejected ? -1 : currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  // Compute friendly time string for "Last Updated: [Time]"
  const formattedLastUpdated = new Date(request.updatedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

  const getStepIcon = (key: DocumentStatus, isCompleted: boolean, isCurrent: boolean) => {
    const size = 20;
    if (isCompleted) {
      return <Check size={size} strokeWidth={2.5} className="text-white" />;
    }
    if (isCurrent) {
      if (key === 'submitted') return <FileText size={size} className="text-white" />;
      if (key === 'under_verification') return <Clock size={size} className="text-white" />;
      if (key === 'processing') return <Printer size={size} className="text-white" />;
      if (key === 'ready_for_pickup') return <PackageCheck size={size} className="text-white" />;
    }
    // Pending future states
    if (key === 'submitted') return <FileText size={size} className="text-slate-400 dark:text-slate-500" />;
    if (key === 'under_verification') return <UserCheck size={size} className="text-slate-400 dark:text-slate-500" />;
    if (key === 'processing') return <Printer size={size} className="text-slate-400 dark:text-slate-500" />;
    return <PackageCheck size={size} className="text-slate-400 dark:text-slate-500" />;
  };

  const getMilestoneTimestamp = (key: DocumentStatus) => {
    const entry = request.auditTrail.find((a) => a.toStatus === key);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300">
      {/* Header Info Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
              {request.trackingNumber}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{request.department}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="capitalize font-medium text-slate-600 dark:text-slate-400">{request.priority} Processing</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {request.documentType}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>
              Applicant: <span className="font-semibold text-slate-800 dark:text-slate-200">{request.applicant.fullName}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono text-slate-600 dark:text-slate-400">ID: {request.applicant.nationalId}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Lodged:{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(request.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onOpenDigitalSlip && (
            <button
              onClick={() => onOpenDigitalSlip(request)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:scale-[1.02] shadow-2xs"
            >
              <QrCode size={15} className="text-slate-600 dark:text-slate-400" />
              <span>Digital Claim Voucher</span>
            </button>
          )}

          {onOpenAuditTrail && (
            <button
              onClick={() => onOpenAuditTrail(request)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 rounded-xl transition-all hover:scale-[1.02] shadow-2xs"
            >
              <History size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Chain of Custody</span>
            </button>
          )}
        </div>
      </div>

      {/* Rejection Notification if halted */}
      {isRejected && (
        <div className="mt-6 p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <AlertCircle size={20} />
            </div>
            <div className="text-sm">
              <h3 className="font-bold text-rose-950 dark:text-rose-200">Application Suspended · Action Required</h3>
              <p className="text-rose-800 dark:text-rose-300 text-xs mt-1 leading-relaxed">
                {request.rejectionReason || 'The application was not authorized by the examining authority.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-rose-900 dark:text-rose-300 font-medium">
                <span>Please review examiner remarks in the official ledger.</span>
                <span aria-hidden="true">·</span>
                <span>You may lodge an amendment at the central registry desk.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The Visual Document Tracker (The Masterpiece) */}
      <div className="mt-10 mb-8">
        <div className="relative">
          {/* Timeline Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {FIXED_MILESTONES.map((milestone, idx) => {
              const isCompleted = !isRejected && currentStepNumber > milestone.stepNumber;
              const isCurrent = !isRejected && currentStepNumber === milestone.stepNumber;
              const isFuture = !isRejected && currentStepNumber < milestone.stepNumber;
              const timestamp = getMilestoneTimestamp(milestone.key);
              const isLast = idx === FIXED_MILESTONES.length - 1;

              return (
                <div key={milestone.key} className="relative flex md:flex-col items-start md:items-center text-left md:text-center group">
                  {/* Connecting Line between steps (Desktop) */}
                  {!isLast && (
                    <div className="hidden md:block absolute top-6 left-1/2 w-full -z-10">
                      {isCompleted ? (
                        /* Completed steps: solid emerald green connecting line */
                        <div className="h-1 bg-emerald-500 w-full transition-all duration-500" />
                      ) : (
                        /* Future steps: dashed connecting line to indicate pending */
                        <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 w-full" />
                      )}
                    </div>
                  )}

                  {/* Step Icon / Circle Indicator */}
                  <div className="relative shrink-0 mr-4 md:mr-0 md:mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40 ring-4 ring-blue-100 dark:ring-blue-900/60 animate-pulse scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {getStepIcon(milestone.key, isCompleted, isCurrent)}
                    </div>

                    {/* Step Number Tag */}
                    <span className="hidden md:block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">
                      0{milestone.stepNumber}
                    </span>
                  </div>

                  {/* Step Text Information */}
                  <div className="flex-1 md:w-full">
                    <div className="flex items-center gap-2 md:justify-center">
                      <span className="md:hidden font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Step 0{milestone.stepNumber}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                          <span>Active Milestone</span>
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold mt-1 leading-snug transition-colors ${
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                          : isCompleted
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {milestone.label}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xs md:mx-auto">
                      {milestone.description}
                    </p>

                    {/* Timestamps & Last Updated indicator */}
                    {timestamp ? (
                      <span className="inline-block text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded mt-2">
                        {timestamp}
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-block text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                        Last Updated: {formattedLastUpdated}
                      </span>
                    ) : (
                      <span className="inline-block text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                        Pending examination
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Operational Metrics & Fulfillment Coordinates */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Clock size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Operational Milestone</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {isRejected
              ? 'Suspended for Clarification'
              : request.status === 'submitted'
              ? 'Intake Logged · Awaiting Officer Assignment'
              : request.status === 'under_verification'
              ? 'Official Record Examination'
              : request.status === 'processing'
              ? 'Security Parchment Printing & Biometrics'
              : 'Available for Citizen Collection'}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Last Updated: {formattedLastUpdated}
          </span>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Designated Collection Counter</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {request.deliveryMethod === 'pickup'
              ? request.pickupCounter || 'Central Public Service Archive'
              : 'Registered Postal Courier'}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block truncate">
            {request.deliveryMethod === 'pickup'
              ? 'Window verification with photo ID'
              : request.deliveryAddress || 'Verified residential destination'}
          </span>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <ShieldCheck size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Digital Custody & Integrity</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {request.auditTrail.length} Certified Entries
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Cryptographically sealed under national registry guidelines
          </span>
        </div>
      </div>

      {/* Expandable Activity Accordion */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowTimelineExpanded(!showTimelineExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={14} className="text-slate-400" />
            <span>Historical Custody Trail ({request.auditTrail.length} actions)</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            <span>{showTimelineExpanded ? 'Hide Recent Logs' : 'View Officer Remarks'}</span>
            {showTimelineExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {showTimelineExpanded && (
          <div className="mt-4 space-y-2.5">
            {request.auditTrail
              .slice()
              .reverse()
              .map((audit) => (
                <div
                  key={audit.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{audit.changedBy}</span>
                        {audit.officerBadge && (
                          <span className="font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            #{audit.officerBadge}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {new Date(audit.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{audit.officerRemarks}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
