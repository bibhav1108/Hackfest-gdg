import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, Printer, FileText, Check, ShieldCheck } from 'lucide-react';
import { Prescription } from '../../types/pharmacy';

interface PrescriptionDetailModalProps {
  prescription: Prescription | null;
  onClose: () => void;
  onUpdateStatus: (rxId: string, status: Prescription['status']) => void;
}

export const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  prescription,
  onClose,
  onUpdateStatus,
}) => {
  if (!prescription) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-6 py-4 bg-[#0a1622]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono-numbers text-[10px] text-teal-400 font-semibold">
                {prescription.rxNumber}
              </span>
              <h3 className="font-semibold text-white tracking-wide text-sm">
                Prescription Details
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Patient Card */}
          <div className="rounded-xl border border-[#1b344d] bg-[#122334] p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient</span>
              <h4 className="text-base font-bold text-white">{prescription.patientName}</h4>
              <p className="text-xs text-slate-400">Age: {prescription.age} yrs • Prescribed: {prescription.prescribedTime}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Tariff</span>
              <div className="text-xl font-bold font-mono-numbers text-teal-300">
                ${prescription.amount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Clinical Specification */}
          <div className="rounded-xl border border-[#1b344d] bg-[#0b1622] p-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Medication & Regimen:</span>
              <span className="text-slate-100 font-semibold text-sm">
                {prescription.medicationName}
              </span>
              <p className="text-teal-300 font-mono-numbers mt-0.5">{prescription.dosage}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#162a3f]">
              <div>
                <span className="text-slate-400">Doctor / Prescriber:</span>
                <p className="text-slate-200 font-medium">{prescription.doctorName}</p>
              </div>
              <div>
                <span className="text-slate-400">Dispense Slot:</span>
                <p className="text-slate-200 font-medium font-mono-numbers">{prescription.frequency}</p>
              </div>
            </div>

            {prescription.notes && (
              <div className="pt-2 border-t border-[#162a3f]">
                <span className="text-slate-400 block mb-1">Pharmacist Caution / Notes:</span>
                <p className="text-amber-200 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-[11px]">
                  {prescription.notes}
                </p>
              </div>
            )}
          </div>

          {/* Change Status Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Set Dispensing Status:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(prescription.id, 'ready');
                  onClose();
                }}
                className={`py-2 rounded-lg text-xs font-medium transition ${
                  prescription.status === 'ready'
                    ? 'bg-sky-500/30 border border-sky-400 text-sky-200'
                    : 'bg-[#152a3d] border border-[#23425e] text-slate-300 hover:border-sky-400'
                }`}
              >
                Mark Ready
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(prescription.id, 'review');
                  onClose();
                }}
                className={`py-2 rounded-lg text-xs font-medium transition ${
                  prescription.status === 'review'
                    ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                    : 'bg-[#152a3d] border border-[#23425e] text-slate-300 hover:border-amber-400'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(prescription.id, 'dispensed');
                  onClose();
                }}
                className={`py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                  prescription.status === 'dispensed'
                    ? 'bg-teal-500/30 border border-teal-400 text-teal-200'
                    : 'bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Dispensed
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b344d] p-4 bg-[#0a1622] flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print Rx Label
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-[#142637] hover:bg-[#1a334a] rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
