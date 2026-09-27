import React from 'react';
import { X, ShieldCheck, History, ArrowRight, UserCheck, Clock, FileBadge } from 'lucide-react';
import { DocumentRequest } from '../../types/index.ts';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: DocumentRequest | null;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Immutable Chain of Custody</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{request.trackingNumber}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Official Audit Trail Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {request.documentType} · {request.department}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Request Quick Summary Bar */}
        <div className="px-6 py-3.5 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div>
            Applicant: <span className="font-bold text-slate-900 dark:text-white">{request.applicant.fullName}</span>
          </div>
          <div>
            Milestone:{' '}
            <span className="font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
              {request.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Audit Log Chronology */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-750 before:bg-slate-200 dark:before:bg-slate-700">
            {request.auditTrail
              .slice()
              .reverse()
              .map((entry, index) => {
                const isLatest = index === 0;
                return (
                  <div key={entry.id} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isLatest
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : entry.action === 'REJECTED'
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>

                    {/* Entry Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 transition-shadow hover:shadow-xs">
                      {/* Top Row: Timestamp & Actor */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {entry.changedBy}
                          </span>
                          {entry.officerBadge && (
                            <span className="text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              Badge #{entry.officerBadge}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
                            ({entry.officerRole})
                          </span>
                        </div>

                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(entry.timestamp).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {/* State Transition Badge */}
                      <div className="flex items-center gap-2 text-xs mb-2">
                        {entry.fromStatus ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="uppercase">{entry.fromStatus.replace('_', ' ')}</span>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white uppercase">
                              {entry.toStatus.replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] uppercase font-bold text-slate-900 dark:text-white">
                            Initial Intake: {entry.toStatus}
                          </span>
                        )}
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{entry.action}</span>
                      </div>

                      {/* Officer Remarks */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{entry.officerRemarks}"
                      </p>

                      {/* Location & Department */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{entry.department}</span>
                        {entry.counterLocation && (
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Station: {entry.counterLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
