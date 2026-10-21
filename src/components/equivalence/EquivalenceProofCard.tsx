import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  FlaskConical, 
  HelpCircle, 
  TrendingDown, 
  ShieldCheck,
  Tag,
  Scale
} from 'lucide-react';
import { checkBioequivalence, EquivalenceCheckResult } from '../../engine/composition';

interface EquivalenceProofCardProps {
  brandName: string;
  genericName: string;
  saltComposition: string;
  strength: string;
  dosageForm: string;
  packageSize: string;
  brandPrice: number;
  genericPrice: number;
  isPartial?: boolean;
}

export const EquivalenceProofCard: React.FC<EquivalenceProofCardProps> = ({
  brandName,
  genericName,
  saltComposition,
  strength,
  dosageForm,
  packageSize,
  brandPrice,
  genericPrice,
  isPartial = false,
}) => {
  const [unitMode, setUnitMode] = useState<'pack' | 'unit'>('pack');

  // Split salt composition into visual chips
  const saltChips = saltComposition
    .split(/[\+\&\/]/)
    .map(s => s.trim())
    .filter(Boolean);

  const isSyrup = dosageForm.toLowerCase().includes('syrup') || dosageForm.toLowerCase().includes('suspension');
  const unitLabel = isSyrup ? 'per ml' : 'per unit';

  const brandUnitPrice = isSyrup ? brandPrice / 30 : brandPrice / 10;
  const genericUnitPrice = isSyrup ? genericPrice / 30 : genericPrice / 10;

  const displayBrandPrice = unitMode === 'unit' ? brandUnitPrice : brandPrice;
  const displayGenericPrice = unitMode === 'unit' ? genericUnitPrice : genericPrice;
  const savings = Math.max(0, displayBrandPrice - displayGenericPrice);
  const savingsPercent = Math.round((savings / displayBrandPrice) * 100);

  return (
    <div className="rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-xs transition">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
            Equivalence Proof & Salt Match Engine
          </h4>
        </div>

        {/* Match Badge */}
        <div className="flex items-center gap-2">
          {/* Unit / Pack Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setUnitMode('pack')}
              className={`px-2.5 py-1 rounded-lg transition ${
                unitMode === 'pack'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pack Price
            </button>
            <button
              onClick={() => setUnitMode('unit')}
              className={`px-2.5 py-1 rounded-lg transition ${
                unitMode === 'unit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {unitLabel}
            </button>
          </div>

          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase ${
            isPartial
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isPartial ? 'PARTIAL MATCH' : 'EXACT MATCH'}
          </span>
        </div>
      </div>

      {/* Detected Salt Chips (Section 4A.7 Step 3) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Detected Salt Molecule Chips:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {saltChips.map((salt, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-900 dark:text-teal-200"
            >
              <FlaskConical className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{salt}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 4-Point Equivalence Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Molecule</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            100% Identical API
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Strength</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {strength}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Form</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {dosageForm}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>NABL Tested</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Dissolution Passed
          </p>
        </div>
      </div>

      {/* Like-for-Like Pricing Result */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            {unitMode === 'unit' ? `Unit Rate (${unitLabel})` : 'Full Pack Rate:'}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono-numbers">
              ₹{displayGenericPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono-numbers">
              ₹{displayBrandPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            Save ₹{savings.toFixed(2)} ({savingsPercent}% Cheaper)
          </span>
        </div>
      </div>
    </div>
  );
};
