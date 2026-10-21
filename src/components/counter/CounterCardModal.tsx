import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  FlaskConical,
  Building2,
  FileText
} from 'lucide-react';

interface CounterCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  genericName: string;
  saltComposition: string;
  strength: string;
  dosageForm: string;
  brandPrice: number;
  genericPrice: number;
  pmbjpCode?: string;
}

export const CounterCardModal: React.FC<CounterCardModalProps> = ({
  isOpen,
  onClose,
  brandName,
  genericName,
  saltComposition,
  strength,
  dosageForm,
  brandPrice,
  genericPrice,
  pmbjpCode = 'PMBJP-01048'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const savings = Math.max(0, brandPrice - genericPrice);
  const savingsPercent = Math.round((savings / brandPrice) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `=========================================\n` +
      `   PRADHAN MANTRI BHARATIYA JANAUSHADHI\n` +
      `   PHARMACIST COUNTER SUBSTITUTION CARD\n` +
      `=========================================\n` +
      `PRESCRIPTION BRAND: ${brandName}\n` +
      `ACTIVE SALT: ${saltComposition}\n` +
      `STRENGTH & FORM: ${strength} (${dosageForm})\n\n` +
      `REQUESTED GENERIC EQUIVALENT:\n` +
      `-> ${genericName}\n` +
      `-> PMBJP Product Code: ${pmbjpCode}\n` +
      `-> Government MRP: ₹${genericPrice.toFixed(2)} (Private MRP: ₹${brandPrice.toFixed(2)})\n\n` +
      `POLITE SCRIPT FOR PHARMACIST:\n` +
      `Hindi: "क्या इस साल्ट और पावर वाली जेनरिक दवा उपलब्ध है?"\n` +
      `English: "Is a generic with the same molecule and strength available?"\n` +
      `=========================================\n` +
      `Note: Validated under WHO-GMP & NABL Lab Dissolution Protocols.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Jan Aushadhi Counter Card: ${genericName}`,
        text: `Showing this Jan Aushadhi substitution card to chemist: ${brandName} -> ${genericName} (₹${genericPrice.toFixed(2)})`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  Chemist Counter Card
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  Section 4A.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bilingual (English + हिंदी) card to hand across the counter
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

        {/* Printable Counter Card Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="border-2 border-dashed border-teal-500/80 dark:border-teal-500/60 rounded-3xl p-5 bg-gradient-to-b from-teal-50/40 via-white to-emerald-50/30 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-900 space-y-4 shadow-sm">
            
            {/* Top Emblem Row */}
            <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                  PMBJP
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-teal-950 dark:text-teal-100 tracking-tight">
                    Government of India Generic Substitution Request
                  </h4>
                  <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                    Department of Pharmaceuticals • Jan Aushadhi Pariyojana
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-300 dark:border-teal-800">
                {pmbjpCode}
              </span>
            </div>

            {/* Prescribed Commercial Brand */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                Prescribed Commercial Brand / पर्चे पर लिखी दवा:
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {brandName}
                </h3>
                <span className="text-xs line-through text-slate-400 font-mono-numbers">
                  ₹{brandPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Active Salt Box */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                Bioequivalent Active Salt Composition / साल्ट घटक:
              </span>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {saltComposition}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Strength: <strong>{strength}</strong></span>
                <span>Form: <strong>{dosageForm}</strong></span>
              </div>
            </div>

            {/* Jan Aushadhi Generic Request Hero */}
            <div className="p-3.5 rounded-2xl bg-emerald-600 text-white space-y-2 shadow-sm">
              <span className="text-[11px] uppercase font-bold text-emerald-100 tracking-wider block">
                Jan Aushadhi Generic Substitute / कृपया यह दवा दें:
              </span>
              <div className="flex items-baseline justify-between">
                <h4 className="text-base sm:text-lg font-extrabold leading-tight">
                  {genericName}
                </h4>
                <span className="text-2xl font-extrabold font-mono-numbers ml-2">
                  ₹{genericPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-emerald-100 font-medium pt-1 border-t border-emerald-500/60">
                Public Savings: Save ₹{savings.toFixed(2)} ({savingsPercent}% Cheaper)
              </div>
            </div>

            {/* Polite Scripts (English & Hindi) */}
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Polite Counter Request Scripts / काउंटर पर पूछने के लिए वाक्य:
              </span>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1.5 text-xs text-amber-950 dark:text-amber-100">
                <p className="font-semibold">
                  🇮🇳 <strong>हिंदी:</strong> &quot;क्या इस साल्ट और पावर वाली जन औषधि या जेनरिक दवा उपलब्ध है?&quot;
                </p>
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  🇬🇧 <strong>English:</strong> &quot;Is a generic with the same molecule and strength available?&quot;
                </p>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1">
              <span>WHO-GMP & NABL Tested Quality</span>
              <span>Indicative Price as of PMBJP National Formulary</span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print A4</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-teal-600 hover:bg-slate-900 text-white text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
