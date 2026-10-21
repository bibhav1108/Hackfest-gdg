import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Search, 
  SlidersHorizontal,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import { matchMedicineHandwriting, MatchCandidate } from '../../engine/matcher';

interface BlankFillDecoderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (brandName: string) => void;
}

export const BlankFillDecoderModal: React.FC<BlankFillDecoderModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidate,
}) => {
  const [pattern, setPattern] = useState('D?lo 6?0');
  const [startsWith, setStartsWith] = useState('');
  const [endsWith, setEndsWith] = useState('');
  const [exactLength, setExactLength] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const candidates: MatchCandidate[] = matchMedicineHandwriting(pattern, {
    startsWith: startsWith || undefined,
    endsWith: endsWith || undefined,
    exactLength: exactLength || undefined
  });

  const samplePresets = [
    { label: 'D?lo 6?0', hint: 'Dolo / Crocin 650 fever tablet' },
    { label: 'Aug*tin 625', hint: 'Doctor scribbled Augmentin antibiotic' },
    { label: 'P?n 4?', hint: 'Acid reflux gastro tablet' },
    { label: 'T?lma 40', hint: 'Blood pressure medicine' },
    { label: 'Ator*a 10', hint: 'Cholesterol statin' },
    { label: 'डोलो ६५०', hint: 'Devanagari script input' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  Blank-Fill Prescription Decoder
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  Section 4A.1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Decode messy doctors&apos; handwriting using <code className="text-teal-600 font-bold font-mono">?</code> and <code className="text-teal-600 font-bold font-mono">*</code> wildcards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Rule callout */}
          <div className="rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-3.5 text-xs text-teal-900 dark:text-teal-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-teal-950 dark:text-white">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>How Handwriting-Aware Matching Works:</span>
            </div>
            <p className="leading-relaxed text-teal-800 dark:text-teal-300">
              Doctors often confuse letter pairs like <code className="font-bold">a/o/e</code>, <code className="font-bold">cl/d</code>, <code className="font-bold">rn/m</code>, or <code className="font-bold">0/6/8</code>. Type the letters you can read and place <strong className="text-teal-950 dark:text-white">?</strong> for unreadable letters or <strong className="text-teal-950 dark:text-white">*</strong> for scribbled chunks.
            </p>
          </div>

          {/* Input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Scribbled Pattern with Wildcards:
            </label>
            <div className="relative">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. D?lo 6?0 or Aug*tin 625"
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-teal-500 rounded-2xl px-4 py-3 text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                {candidates.length} match(es)
              </span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Try Sample Doctor Handwriting Cases:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPattern(p.label)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition ${
                    pattern === p.label
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={p.hint}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Narrowing aids toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Narrowing Aids' : 'Show Narrowing Aids (Starts with, Length)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Starts With:
                  </label>
                  <input
                    type="text"
                    value={startsWith}
                    onChange={(e) => setStartsWith(e.target.value)}
                    placeholder="e.g. D"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Ends With:
                  </label>
                  <input
                    type="text"
                    value={endsWith}
                    onChange={(e) => setEndsWith(e.target.value)}
                    placeholder="e.g. 0"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Approx Length:
                  </label>
                  <input
                    type="number"
                    value={exactLength || ''}
                    onChange={(e) => setExactLength(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 8"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resolved Candidates Chips */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Handwriting Match Candidates ({candidates.length})
            </h4>

            {candidates.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No matching commercial brands found for &quot;{pattern}&quot;. Try adjusting the wildcards or clearing narrowing aids.
              </div>
            ) : (
              <div className="space-y-2">
                {candidates.map((c, i) => (
                  <div
                    key={c.record.id}
                    onClick={() => {
                      onSelectCandidate(c.record.brandName);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-slate-800/80 cursor-pointer transition shadow-2xs flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 truncate">
                          {c.record.brandName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {c.confidencePercent}% confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Active Salt: <strong className="text-slate-700 dark:text-slate-300">{c.record.saltComposition}</strong>
                      </p>
                      <div className="flex items-center gap-3 text-xs mt-1 text-slate-600 dark:text-slate-400">
                        <span>Brand MRP: <strong>₹{c.record.brandPrice}</strong></span>
                        <span>Generic Rate: <strong className="text-emerald-600 dark:text-emerald-400">₹{c.record.genericPrice}</strong></span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                          {c.matchReason}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 shrink-0">
                      <span>Select</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <span>Targeting medical prescription handwriting confusion groups</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-teal-600 hover:bg-slate-900 text-white font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
