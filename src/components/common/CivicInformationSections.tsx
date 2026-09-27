import React from 'react';
import {
  ShieldCheck,
  Clock,
  Printer,
  PackageCheck,
  Building2,
  FileCheck2,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { DEPARTMENTS, FIXED_MILESTONES } from '../../config/departments.ts';

export const CivicInformationSections: React.FC = () => {
  return (
    <div className="space-y-16 pt-12 border-t border-slate-200 dark:border-slate-800">
      {/* 4 Fixed Milestones Reference Section */}
      <section id="milestones" className="scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 mb-2">
            <Workflow size={13} />
            <span>Deterministic Workflow</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The 4 Fixed Public Service Milestones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Every civic document request follows a deterministic verification lifecycle.
            Citizens no longer have to guess when to visit government counters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {FIXED_MILESTONES.map((m) => (
            <div
              key={m.key}
              className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block mb-2">
                  STATE 0{m.stepNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{m.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Target SLA</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {m.estimatedHours > 0 ? `~${m.estimatedHours}h` : 'Immediate'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Authorized Departments Section */}
      <section id="departments" className="scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 mb-2">
            <Building2 size={13} />
            <span>Connected Registries</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Integrated Civil Service Bureaus
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            GovTrack federates requests directly across vital records, vehicular licensing,
            biometric passports, revenue compliance, and commercial bureaus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                  {dept.code}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{dept.badge}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{dept.name}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{dept.directorate}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{dept.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance & Audit Transparency */}
      <section id="compliance" className="scroll-mt-20">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-slate-800/60">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <ShieldCheck size={14} />
                <span>Accountability By Design</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Cryptographic Audit Custody & Public Verification
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Every milestone transition, rejection reason, and officer remark is cryptographically
                registered into an immutable custody chain. Citizens can print verified vouchers with
                barcodes for instant desk verification.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-xs space-y-3.5 font-mono">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider pb-2 border-b border-slate-800">
                Civil Ledger Verification Guarantees
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>Zero undocumented status modifications permitted</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>Real-time Server-Sent Events push notifications</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>Printable digital slips with scannable barcode verification</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>Full citizen access to official examiner comments</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
