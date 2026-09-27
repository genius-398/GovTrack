import React from 'react';
import { X, Printer, Shield, CheckCircle2, Download, Building2 } from 'lucide-react';
import { DocumentRequest } from '../../types/index.ts';
import { OfficialSeal } from './OfficialSeal.tsx';

interface DigitalSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DocumentRequest | null;
}

export const DigitalSlipModal: React.FC<DigitalSlipModalProps> = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl my-8 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 print:hidden">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Official Document Intake Voucher
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Voucher Paper Slip Content */}
        <div className="p-8 font-sans bg-white relative">
          {/* Watermark seal in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <OfficialSeal size={280} />
          </div>

          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <OfficialSeal size={40} />
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  GOVTRACK CIVIC REGISTRY
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  PUBLIC SERVICE INTAKE CERTIFICATE
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">SECURITY HASH</span>
              <span className="text-[11px] font-mono font-semibold text-slate-900">
                #GT-{request.trackingNumber.slice(-4)}-SEC
              </span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="my-6 text-center">
            <div className="inline-block p-3 bg-slate-50 border border-slate-200 rounded">
              {/* Simulated Crisp Barcode Lines */}
              <div className="flex items-center justify-center gap-[2px] h-10 px-4">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2].map(
                  (width, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{ width: `${width * 1.5}px` }}
                    />
                  )
                )}
              </div>
              <div className="text-xs font-mono font-bold tracking-widest text-slate-900 mt-1">
                {request.trackingNumber}
              </div>
            </div>
          </div>

          {/* Key Slip Fields */}
          <div className="grid grid-cols-2 gap-4 text-xs py-4 border-y border-dashed border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Document Requested
              </span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {request.documentType}
              </span>
              <span className="text-slate-500 text-[11px] block">{request.department}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Applicant Name
              </span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {request.applicant.fullName}
              </span>
              <span className="text-slate-500 font-mono text-[11px] block">
                ID: {request.applicant.nationalId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Collection Station
              </span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {request.deliveryMethod === 'pickup'
                  ? request.pickupCounter || 'Central Service Hall'
                  : 'Postal Courier Delivery'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Lodged Date
              </span>
              <span className="font-mono text-slate-800 block mt-0.5">
                {new Date(request.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Status Stamp */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <div className="text-xs">
                <span className="font-medium text-slate-900 block">Verified Official Intake</span>
                <span className="text-[11px] text-slate-500">
                  Audit Events: {request.auditTrail.length} recorded
                </span>
              </div>
            </div>

            <div className="border border-slate-300 rounded px-2.5 py-1 text-center font-mono text-[10px] uppercase font-semibold text-slate-700 bg-slate-50">
              State: {request.status.replace('_', ' ')}
            </div>
          </div>

          <div className="mt-6 text-[10px] text-slate-400 text-center leading-normal border-t border-slate-100 pt-3">
            Present this voucher with a valid government photo credential at the fulfillment counter.
            For electronic status updates, scan tracking code at any civic terminal.
          </div>
        </div>
      </div>
    </div>
  );
};
