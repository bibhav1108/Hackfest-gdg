import React from 'react';
import { X, PackagePlus, AlertTriangle, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { Medication } from '../../types/pharmacy';

interface MedicineDetailModalProps {
  medication: Medication | null;
  onClose: () => void;
  onRestock: (medId: string, addedUnits: number) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medication,
  onClose,
  onRestock,
}) => {
  if (!medication) return null;

  const isLowStock = medication.stock <= medication.minStock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-6 py-4 bg-[#0a1622]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
              {medication.category} • {medication.form}
            </span>
            <h3 className="font-semibold text-white tracking-wide text-base">
              {medication.name}
            </h3>
            <p className="text-xs text-slate-400 italic">
              {medication.genericName}
            </p>
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
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#1b344d] bg-[#122334] p-3 text-center">
              <span className="text-[11px] text-slate-400">Current Stock</span>
              <div className="text-2xl font-bold font-mono-numbers text-slate-100 mt-1">
                {medication.stock} <span className="text-xs text-slate-400">units</span>
              </div>
              {isLowStock ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium mt-1">
                  <AlertTriangle className="w-3 h-3" /> Under Min ({medication.minStock})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 font-medium mt-1">
                  <ShieldCheck className="w-3 h-3" /> Optimal Reserve
                </span>
              )}
            </div>

            <div className="rounded-xl border border-[#1b344d] bg-[#122334] p-3 text-center">
              <span className="text-[11px] text-slate-400">Retail Unit Price</span>
              <div className="text-2xl font-bold font-mono-numbers text-teal-300 mt-1">
                ${medication.unitPrice.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Dispensing tariff</span>
            </div>
          </div>

          {/* Details Specification */}
          <div className="rounded-xl border border-[#1b344d] bg-[#0b1622] p-3.5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#162a3f]">
              <span className="text-slate-400">Batch / LOT Number:</span>
              <span className="font-mono-numbers text-slate-200 font-medium">
                {medication.batchNumber}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#162a3f]">
              <span className="text-slate-400">Expiry Date:</span>
              <span className="font-mono-numbers text-slate-200 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" /> {medication.expiryDate}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Form & Dosage:</span>
              <span className="text-slate-200 font-medium">
                {medication.dosage} {medication.form}
              </span>
            </div>
          </div>

          {/* Quick Restock Action Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <PackagePlus className="w-3.5 h-3.5 text-teal-400" /> Quick Stock Replenishment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onRestock(medication.id, 25)}
                className="py-2 rounded-lg bg-[#152a3d] border border-[#23425e] hover:border-teal-400 hover:text-teal-300 text-xs font-mono-numbers font-medium transition"
              >
                +25 Units
              </button>
              <button
                onClick={() => onRestock(medication.id, 50)}
                className="py-2 rounded-lg bg-[#152a3d] border border-[#23425e] hover:border-teal-400 hover:text-teal-300 text-xs font-mono-numbers font-medium transition"
              >
                +50 Units
              </button>
              <button
                onClick={() => onRestock(medication.id, 100)}
                className="py-2 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 text-xs font-mono-numbers font-medium transition"
              >
                +100 Units
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b344d] p-4 bg-[#0a1622] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#142637] hover:bg-[#1a334a] rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
