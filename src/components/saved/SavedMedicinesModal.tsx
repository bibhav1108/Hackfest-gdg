import React from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  TrendingDown, 
  ArrowRight
} from 'lucide-react';
import { SavedMedicineItem } from '../../hooks/useFirebaseSavedMedicines';

interface SavedMedicinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedMedicineItem[];
  onRemove: (id: string) => void;
  onSelect: (brandName: string) => void;
  totalAnnualSavings: number;
  totalMonthlySavings: number;
  isAuthenticated: boolean;
}

export const SavedMedicinesModal: React.FC<SavedMedicinesModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onRemove,
  onSelect,
  totalAnnualSavings,
  totalMonthlySavings,
  isAuthenticated,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-4 bg-teal-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-base">
                  My Prescriptions & Saved Medicines
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  isAuthenticated
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  {isAuthenticated ? 'Firestore Cloud Synced' : 'Device Storage'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track therapy regimens and monitor your cumulative Jan Aushadhi savings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cumulative Savings Banner */}
          {savedItems.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4.5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Cumulative Jan Aushadhi Savings
                  </span>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                  {savedItems.length} Saved {savedItems.length === 1 ? 'Med' : 'Meds'}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers">
                    ₹{totalMonthlySavings.toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-100 block">Saved Every Month</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-emerald-200">
                    ₹{totalAnnualSavings.toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-100 block">Annual Savings</span>
                </div>
              </div>
            </div>
          )}

          {/* List of Saved Items */}
          {savedItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Saved Medicines Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Click the "Save Medicine" bookmark button when searching any commercial brand to track it here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 dark:bg-slate-800/80 p-4 space-y-3 shadow-2xs hover:border-teal-500 dark:hover:border-teal-400 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {item.brandName}
                        </h4>
                        <span className="rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 text-[10px] font-bold">
                          {item.dosageForm}
                        </span>
                      </div>
                      <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                        Generic: {item.genericName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Salt: {item.saltComposition}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing Comparison Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Brand MRP</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono-numbers">₹{item.brandPrice.toFixed(2)}</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-600">→</span>
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Jan Aushadhi</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono-numbers">₹{item.genericPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                        Save ₹{item.savingsAmount.toFixed(2)} ({item.savingsPercentage}%)
                      </span>
                      <button
                        onClick={() => {
                          onSelect(item.brandName);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg bg-teal-50 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-slate-600 text-teal-800 dark:text-teal-200 transition"
                        title="View Full Comparison"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAuthenticated ? 'Data securely stored in your personal Firestore database' : 'Sign in to sync your saved medicines with Google'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
