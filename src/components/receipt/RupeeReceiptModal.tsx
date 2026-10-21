import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Share2, 
  Copy, 
  Check, 
  TrendingDown, 
  Download,
  Calendar,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';

interface RupeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  genericName: string;
  brandPrice: number;
  genericPrice: number;
  saltComposition: string;
}

export const RupeeReceiptModal: React.FC<RupeeReceiptModalProps> = ({
  isOpen,
  onClose,
  brandName,
  genericName,
  brandPrice,
  genericPrice,
  saltComposition,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const savings = Math.max(0, brandPrice - genericPrice);
  const savingsPercent = Math.round((savings / brandPrice) * 100);
  const monthlySavings = savings;
  const annualSavings = savings * 12;
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const generateReceiptText = () => {
    return `🧾 *RUPEE RECEIPT - JAN AUSHADHI GENERIC SAVINGS*\n` +
      `Date: ${todayFormatted}\n` +
      `-----------------------------------------\n` +
      `Commercial Brand : ${brandName}\n` +
      `Market MRP       : ₹${brandPrice.toFixed(2)}\n\n` +
      `Jan Aushadhi Sub : ${genericName}\n` +
      `Govt Price       : ₹${genericPrice.toFixed(2)}\n` +
      `-----------------------------------------\n` +
      `💰 YOU SAVED     : ₹${savings.toFixed(2)} (${savingsPercent}%)\n` +
      `🌟 Annual Saving : ₹${annualSavings.toFixed(2)}/year\n` +
      `-----------------------------------------\n` +
      `Quality Guarantee: WHO-GMP & NABL Lab Assayed\n` +
      `Verified via Generic Rx`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReceiptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = generateReceiptText();
    if (navigator.share) {
      navigator.share({
        title: `Jan Aushadhi Rupee Receipt - Saved ₹${savings.toFixed(2)}`,
        text: text,
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  Rupee Savings Receipt
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Section 4A.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shareable proof of medicine cost saved before paying
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

        {/* Receipt Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Authentic Receipt Stylized Container */}
          <div className="relative bg-amber-50/50 dark:bg-slate-800/90 border-2 border-dashed border-amber-300/80 dark:border-slate-700 rounded-3xl p-6 font-mono text-slate-800 dark:text-slate-200 space-y-4 shadow-sm">
            {/* Top Seal */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="inline-block p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                PRADHAN MANTRI JAN AUSHADHI
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Patient Cost Reduction Certificate
              </p>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-1">
                <Calendar className="w-3 h-3" />
                <span>{todayFormatted}</span>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-slate-400 block">Commercial Retail Brand</span>
                  <span className="font-bold text-slate-900 dark:text-white">{brandName}</span>
                </div>
                <span className="line-through text-slate-400 font-bold">₹{brandPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-start pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block font-bold">Jan Aushadhi Generic</span>
                  <span className="font-bold text-slate-900 dark:text-white">{genericName}</span>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{genericPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Savings Big Banner */}
            <div className="p-4 rounded-2xl bg-emerald-600 text-white text-center space-y-1 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold block">
                Total Rupee Saved On This Prescription
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-tight">
                Save ₹{savings.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                {savingsPercent}% Cheaper than private brand
              </p>
            </div>

            {/* Projections */}
            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Annual Family Savings:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{annualSavings.toFixed(2)} / year</span>
            </div>

            {/* Privacy notice banner */}
            <div className="text-[10px] text-center text-slate-400 leading-tight pt-1">
              No patient name or clinical history recorded • 100% on-device
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Receipt</span>
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
