import React from 'react';
import { Medication } from '../../types/pharmacy';
import { AlertCircle, Plus, Check } from 'lucide-react';

interface MedicineCardProps {
  medication: Medication;
  onSelect: (med: Medication) => void;
  onQuickRestock: (medId: string, amount: number) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medication,
  onSelect,
  onQuickRestock,
}) => {
  const isLowStock = medication.stock <= medication.minStock;

  // Render stylized pharmaceutical bottle matching the screenshot aesthetic
  const renderBottleGraphic = () => {
    switch (medication.category) {
      case 'Antibiotics':
        return (
          <svg className="w-16 h-20 sm:w-20 sm:h-24 drop-shadow-md" viewBox="0 0 100 120" fill="none">
            {/* White/Teal pharmacy pill bottle */}
            <rect x="25" y="10" width="50" height="12" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="28" y="22" width="44" height="6" fill="#94a3b8" />
            <rect x="18" y="28" width="64" height="84" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Teal label */}
            <rect x="18" y="44" width="64" height="48" fill="#0d9488" />
            <rect x="24" y="50" width="52" height="4" rx="2" fill="#ffffff" />
            <rect x="24" y="58" width="36" height="3" rx="1.5" fill="#99f6e4" />
            <rect x="24" y="65" width="24" height="2.5" rx="1" fill="#ccfbf1" />
            {/* Cross symbol on label */}
            <rect x="62" y="72" width="12" height="4" rx="1" fill="#ffffff" />
            <rect x="66" y="68" width="4" height="12" rx="1" fill="#ffffff" />
            {/* Secondary smaller companion bottle */}
            <rect x="66" y="48" width="22" height="6" rx="2" fill="#94a3b8" />
            <rect x="64" y="54" width="26" height="58" rx="6" fill="#0f766e" stroke="#115e59" strokeWidth="1" />
            <rect x="64" y="66" width="26" height="30" fill="#ffffff" />
            <rect x="67" y="74" width="20" height="2.5" fill="#0d9488" />
          </svg>
        );
      case 'Analgesics':
        return (
          <svg className="w-16 h-20 sm:w-20 sm:h-24 drop-shadow-md" viewBox="0 0 100 120" fill="none">
            {/* Cyan/Green pain relief bottle with tablet blister */}
            <rect x="20" y="8" width="44" height="12" rx="2" fill="#f59e0b" />
            <rect x="14" y="20" width="56" height="92" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
            <rect x="14" y="40" width="56" height="48" fill="#ec4899" fillOpacity="0.8" />
            <rect x="20" y="46" width="44" height="4" rx="2" fill="#ffffff" />
            <rect x="20" y="54" width="30" height="3" rx="1" fill="#fdf2f8" />
            <circle cx="42" cy="74" r="9" fill="#ffffff" />
            <circle cx="42" cy="74" r="5" fill="#f43f5e" />
            {/* Green companion bottle */}
            <rect x="58" y="28" width="32" height="8" rx="2" fill="#15803d" />
            <rect x="54" y="36" width="40" height="76" rx="6" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
            <rect x="54" y="50" width="40" height="40" fill="#f0fdf4" />
            <rect x="58" y="58" width="32" height="3" fill="#16a34a" />
          </svg>
        );
      case 'Cardiovascular':
        return (
          <svg className="w-16 h-20 sm:w-20 sm:h-24 drop-shadow-md" viewBox="0 0 100 120" fill="none">
            {/* Amber clinical bottle */}
            <rect x="15" y="14" width="48" height="10" rx="2" fill="#f8fafc" stroke="#94a3b8" />
            <rect x="12" y="24" width="54" height="88" rx="8" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <rect x="12" y="44" width="54" height="44" fill="#fef3c7" />
            <rect x="18" y="50" width="42" height="4" rx="2" fill="#78350f" />
            <rect x="18" y="58" width="28" height="3" rx="1.5" fill="#92400e" />
            {/* Golden companion bottle */}
            <rect x="56" y="20" width="36" height="8" rx="2" fill="#e2e8f0" />
            <rect x="52" y="28" width="44" height="84" rx="6" fill="#d97706" />
            <rect x="52" y="44" width="44" height="40" fill="#ffffff" />
            <rect x="56" y="52" width="36" height="3" fill="#b45309" />
            <rect x="56" y="60" width="24" height="2" fill="#b45309" />
          </svg>
        );
      case 'Respiratory':
      default:
        return (
          <svg className="w-16 h-20 sm:w-20 sm:h-24 drop-shadow-md" viewBox="0 0 100 120" fill="none">
            {/* Inhaler & spray canister */}
            <path d="M22 28 L50 28 L50 96 L22 96 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <path d="M50 70 L78 70 L78 96 L50 96 Z" fill="#0284c7" />
            <rect x="28" y="16" width="16" height="12" fill="#e0f2fe" />
            <circle cx="36" cy="48" r="6" fill="#38bdf8" />
            {/* Amber companion medicine */}
            <rect x="58" y="32" width="26" height="6" fill="#f8fafc" />
            <rect x="54" y="38" width="34" height="74" rx="5" fill="#7c2d12" />
            <rect x="54" y="50" width="34" height="34" fill="#ffedd5" />
            <rect x="58" y="56" width="26" height="3" fill="#9a3412" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(medication)}
      className="group relative cursor-pointer flex flex-col items-center justify-between rounded-xl border border-[#1a344d] bg-gradient-to-b from-[#112334] to-[#0d1c2b] p-3 hover:border-teal-500/50 hover:from-[#13283c] hover:to-[#0f2133] transition-all duration-200 shadow-sm"
    >
      {/* Top Category Badge */}
      <div className="w-full flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium truncate max-w-[85px]">
          {medication.category}
        </span>
        {isLowStock ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
            <AlertCircle className="w-2.5 h-2.5" /> Low
          </span>
        ) : (
          <span className="rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-medium text-teal-300">
            Active
          </span>
        )}
      </div>

      {/* Visual Medicine Packaging Illustration */}
      <div className="my-2 flex items-center justify-center h-24 w-full group-hover:scale-105 transition-transform">
        {renderBottleGraphic()}
      </div>

      {/* Medicine Info */}
      <div className="w-full text-center">
        <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-teal-200 transition">
          {medication.name}
        </h4>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">
          {medication.dosage} • {medication.form}
        </p>

        {/* Stock & Price Bar */}
        <div className="mt-2.5 pt-2 border-t border-[#1a344d] flex items-center justify-between text-[11px]">
          <span className="font-mono-numbers font-medium text-slate-300">
            {medication.stock} <span className="text-[10px] text-slate-400">units</span>
          </span>
          <span className="font-mono-numbers font-semibold text-teal-300">
            ${medication.unitPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
