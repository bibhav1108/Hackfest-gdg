import React, { useState } from 'react';
import { Prescription } from '../../types/pharmacy';
import { 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Check, 
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface PrescriptionsTableProps {
  prescriptions: Prescription[];
  onSelectPrescription: (rx: Prescription) => void;
  onUpdateStatus: (rxId: string, newStatus: Prescription['status']) => void;
  onOpenNewRx: () => void;
}

export const PrescriptionsTable: React.FC<PrescriptionsTableProps> = ({
  prescriptions,
  onSelectPrescription,
  onUpdateStatus,
  onOpenNewRx,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filtered = prescriptions.filter((rx) => {
    if (filterStatus === 'all') return true;
    return rx.status === filterStatus;
  }).sort((a, b) => {
    return sortAsc 
      ? a.patientName.localeCompare(b.patientName)
      : b.patientName.localeCompare(a.patientName);
  });

  const getStatusBadge = (status: Prescription['status']) => {
    switch (status) {
      case 'dispensed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[11px] font-medium text-teal-300">
            <CheckCircle2 className="w-3 h-3 text-teal-400" /> Dispensed
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[11px] font-medium text-sky-300">
            <Check className="w-3 h-3 text-sky-400" /> Ready
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-400" /> In Review
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 border border-slate-600/50 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#183149] bg-gradient-to-b from-[#112334] to-[#0d1c2b] p-4 sm:p-5 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#183149]">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide uppercase">
            Prescriptions
          </h3>
          <span className="rounded-full bg-[#183149] px-2 py-0.5 text-[11px] font-mono-numbers text-teal-300 font-semibold">
            {filtered.length} active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status filter pills */}
          <div className="hidden sm:flex items-center bg-[#0d1a27] border border-[#183149] rounded-lg p-0.5 text-[11px]">
            {['all', 'ready', 'pending', 'dispensed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                  filterStatus === st
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 rounded-lg border border-[#183149] text-slate-400 hover:text-slate-200 hover:bg-[#183149] transition"
            title="Sort by Patient Name"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prescriptions List Table */}
      <div className="mt-3 divide-y divide-[#162a3f] overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No prescriptions match the filter.
          </div>
        ) : (
          filtered.map((rx) => (
            <div
              key={rx.id}
              onClick={() => onSelectPrescription(rx)}
              className="group flex items-center justify-between py-2.5 px-1.5 hover:bg-[#14283c]/60 rounded-lg cursor-pointer transition-all duration-150"
            >
              {/* Patient and Medication */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-[#162d42] border border-teal-500/20 flex items-center justify-center font-serif-classic text-teal-300 font-bold text-xs shrink-0 group-hover:border-teal-400/50">
                  {rx.patientName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-slate-100 group-hover:text-teal-200 truncate">
                      {rx.patientName}
                    </span>
                    <span className="font-mono-numbers text-[10px] text-slate-400 hidden md:inline">
                      ({rx.rxNumber})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {rx.medicationName} • {rx.dosage}
                  </p>
                </div>
              </div>

              {/* Timing */}
              <div className="text-right px-3 shrink-0 hidden sm:block">
                <span className="text-xs font-mono-numbers text-slate-300">
                  {rx.frequency}
                </span>
                <p className="text-[10px] text-slate-400">
                  {rx.doctorName}
                </p>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-2 shrink-0">
                {getStatusBadge(rx.status)}

                {/* Quick toggle dispense if ready or pending */}
                {rx.status !== 'dispensed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(rx.id, 'dispensed');
                    }}
                    className="p-1 rounded bg-teal-500/10 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 transition text-[10px] font-medium hidden md:inline-flex items-center gap-1"
                    title="Mark Dispensed"
                  >
                    <Check className="w-3 h-3" /> Dispense
                  </button>
                )}

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-300 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table Footer */}
      <div className="mt-3 pt-3 border-t border-[#183149] flex items-center justify-between text-xs text-slate-400">
        <span>Showing {filtered.length} of {prescriptions.length} entries</span>
        <button
          onClick={onOpenNewRx}
          className="text-teal-400 hover:text-teal-300 font-medium text-xs transition"
        >
          + Add New Prescription
        </button>
      </div>
    </div>
  );
};
