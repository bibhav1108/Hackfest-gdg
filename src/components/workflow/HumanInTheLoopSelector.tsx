import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  SlidersHorizontal, 
  Layers, 
  RefreshCw, 
  Database, 
  Cpu, 
  Check, 
  Sparkles,
  ChevronDown,
  Info,
  Scale
} from 'lucide-react';
import { 
  MultiSourceSearchResult, 
  CandidateAlternative, 
  SourceOrigin 
} from '../../engine/multiSourceFallback';

interface HumanInTheLoopSelectorProps {
  searchResult: MultiSourceSearchResult;
  onSelectCandidate: (candidate: CandidateAlternative) => void;
  onUpdateStrengthForm: (strength: string, form: string) => void;
  onConfirmVerification: (confirmed: boolean) => void;
  isConfirmed: boolean;
  onToggleForceFallback: () => void;
  forceFallbackActive: boolean;
}

export const HumanInTheLoopSelector: React.FC<HumanInTheLoopSelectorProps> = ({
  searchResult,
  onSelectCandidate,
  onUpdateStrengthForm,
  onConfirmVerification,
  isConfirmed,
  onToggleForceFallback,
  forceFallbackActive,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    searchResult.candidateAlternatives?.[0]?.id || 'curr'
  );

  const brand = searchResult.brand_details;
  const generic = searchResult.cheapest_generic;
  const candidates = searchResult.candidateAlternatives || [];

  const handleCandidateClick = (cand: CandidateAlternative) => {
    setSelectedCandidateId(cand.id);
    onSelectCandidate(cand);
  };

  const getSourceBadge = (source: SourceOrigin) => {
    switch (source) {
      case 'LIVE_API':
        return {
          label: 'Source 1: Primary Live API',
          icon: Cpu,
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'LOCAL_MASTER_DB':
        return {
          label: 'Source 2: Master Jan Aushadhi DB (Multi-Source Fallback)',
          icon: Database,
          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'OFFLINE_CACHE':
        return {
          label: 'Source 3: Offline Device Cache (Zero Latency)',
          icon: RefreshCw,
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
    }
  };

  const sourceMeta = getSourceBadge(searchResult.sourceUsed);
  const SourceIcon = sourceMeta.icon;

  return (
    <div className="w-full rounded-2xl border-2 border-teal-500/40 dark:border-teal-500/30 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-teal-950/30 shadow-md p-4 sm:p-5 transition-all">
      
      {/* Top Banner: Verification Status + Multi-Source provenance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-teal-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-teal-950 dark:text-teal-200">
                Human-in-the-Loop Clinical Verification
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
                  isConfirmed
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                }`}
              >
                {isConfirmed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified by User / Pharmacist</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Pending Your Confirmation</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Review prescribed salt & choose from candidate formulations before dispensing
            </p>
          </div>
        </div>

        {/* Multi-Source Provenance & Fallback Switcher */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${sourceMeta.bg}`}
            title="Multi-source engine automatically resolves across Live API, Local Master DB, and Offline Cache"
          >
            <span className={`w-2 h-2 rounded-full ${sourceMeta.dot} animate-pulse`} />
            <SourceIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{sourceMeta.label}</span>
            <span className="md:hidden">
              {searchResult.sourceUsed === 'LIVE_API' ? 'Live API' : 'Fallback DB'}
            </span>
            <span className="opacity-60 text-[10px]">({searchResult.latencyMs}ms)</span>
          </div>

          <button
            type="button"
            onClick={onToggleForceFallback}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition flex items-center gap-1 ${
              forceFallbackActive
                ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
            }`}
            title="Toggle offline/fallback mode to test resilient multisource operation"
          >
            <RefreshCw className={`w-3 h-3 ${forceFallbackActive ? 'animate-spin' : ''}`} />
            <span>{forceFallbackActive ? 'Fallback ON' : 'Test Fallback'}</span>
          </button>
        </div>
      </div>

      {/* Main Selection Area: Prescribed vs Jan Aushadhi Generic with Candidate Switcher */}
      <div className="pt-3.5 space-y-3.5">
        
        {/* Candidate Alternatives Carousel / Badges */}
        {candidates.length > 1 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Detected Medicine Candidates ({candidates.length} variants available)</span>
              </span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                Tap candidate to select:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {candidates.slice(0, 3).map((cand) => {
                const isSelected = selectedCandidateId === cand.id || brand.brand_name.includes(cand.brandName);
                return (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => handleCandidateClick(cand)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-100/70 dark:bg-teal-950/80 border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cand.brandName}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cand.strength} • {cand.dosageForm}
                      </p>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        Save {cand.savingsPercentage}% with generic
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {Math.round(cand.confidence * 100)}% Match
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Salt & Formulation Clinical Details */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-white/80 dark:bg-slate-800/60 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Active Chemical Salt: {brand.salt_composition}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
              <span>Strength: <strong>{brand.strength}</strong></span>
              <span>•</span>
              <span>Dosage Form: <strong>{brand.dosage_form}</strong></span>
              <span>•</span>
              <span>Pack: <strong>{brand.package_size}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                PMBJP Generic Code: {generic.pmbjp_code || 'PMBJP-1048'}
              </span>
            </div>
          </div>

          {/* Quick Strength Modifier Dropdown / Options */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Adjust Strength / Form</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Adjuster Panel */}
        {isExpanded && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 space-y-3 animate-in fade-in">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Exact Prescribed Strength:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['228.5 mg/5ml', '625 mg', '375 mg', '1000 mg', '40 mg', '650 mg', '500 mg'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStrengthForm(st, brand.dosage_form)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      brand.strength.includes(st)
                        ? 'bg-teal-600 text-white border-teal-700'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-teal-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Dosage Form:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Oral Suspension / Syrup', 'Tablet', 'Film-Coated Tablet', 'Capsule', 'Dry Syrup'].map((form) => (
                  <button
                    key={form}
                    type="button"
                    onClick={() => onUpdateStrengthForm(brand.strength, form)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      brand.dosage_form.toLowerCase().includes(form.toLowerCase().slice(0, 4))
                        ? 'bg-teal-600 text-white border-teal-700'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-teal-400'
                    }`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification Check & Approval CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => onConfirmVerification(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              I have checked and confirmed that the active salt and strength match the doctor's prescription.
            </span>
          </label>

          <button
            type="button"
            onClick={() => onConfirmVerification(!isConfirmed)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0 ${
              isConfirmed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isConfirmed ? (
              <>
                <Check className="w-4 h-4" />
                <span>Generic Substitution Approved</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Human-in-the-Loop Approval</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
