import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  TrendingDown, 
  Share2, 
  Printer, 
  Plus, 
  Check, 
  Copy, 
  HeartPulse, 
  Sparkles,
  FileText
} from 'lucide-react';
import { POPULAR_MEDICINES } from '../../data/popularMedicines';

export interface KitItem {
  id: string;
  brandName: string;
  genericName: string;
  saltComposition: string;
  dosageForm: string;
  pmbjpCode: string;
  brandPrice: number;
  genericPrice: number;
  monthlyPacks: number;
}

interface PrescriptionKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: KitItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onAddPreset: (presetItems: KitItem[]) => void;
  onSelectItem: (brandName: string) => void;
}

export const PrescriptionKitModal: React.FC<PrescriptionKitModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onAddPreset,
  onSelectItem,
}) => {
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  if (!isOpen) return null;

  // Calculate monthly totals
  const totalBrandMonthly = items.reduce(
    (sum, it) => sum + it.brandPrice * it.monthlyPacks,
    0
  );
  const totalGenericMonthly = items.reduce(
    (sum, it) => sum + it.genericPrice * it.monthlyPacks,
    0
  );
  const monthlySavings = Math.max(0, totalBrandMonthly - totalGenericMonthly);
  const annualSavings = monthlySavings * 12;
  const overallSavingsPercent = totalBrandMonthly > 0 
    ? Math.round((monthlySavings / totalBrandMonthly) * 100) 
    : 0;

  // Preset kits for quick workflow
  const loadDiabeticCardiacPreset = () => {
    const diabeticMed = POPULAR_MEDICINES.find(m => m.id === 'glycomet-500');
    const bpMed = POPULAR_MEDICINES.find(m => m.id === 'telma-40');
    const lipidMed = POPULAR_MEDICINES.find(m => m.id === 'atorva-10');

    const newItems: KitItem[] = [];
    if (diabeticMed) {
      newItems.push({
        id: diabeticMed.id,
        brandName: diabeticMed.brandName,
        genericName: diabeticMed.genericName,
        saltComposition: diabeticMed.saltComposition,
        dosageForm: diabeticMed.dosageForm,
        pmbjpCode: diabeticMed.pmbjpCode,
        brandPrice: diabeticMed.brandPrice,
        genericPrice: diabeticMed.genericPrice,
        monthlyPacks: 2,
      });
    }
    if (bpMed) {
      newItems.push({
        id: bpMed.id,
        brandName: bpMed.brandName,
        genericName: bpMed.genericName,
        saltComposition: bpMed.saltComposition,
        dosageForm: bpMed.dosageForm,
        pmbjpCode: bpMed.pmbjpCode,
        brandPrice: bpMed.brandPrice,
        genericPrice: bpMed.genericPrice,
        monthlyPacks: 2,
      });
    }
    if (lipidMed) {
      newItems.push({
        id: lipidMed.id,
        brandName: lipidMed.brandName,
        genericName: lipidMed.genericName,
        saltComposition: lipidMed.saltComposition,
        dosageForm: lipidMed.dosageForm,
        pmbjpCode: lipidMed.pmbjpCode,
        brandPrice: lipidMed.brandPrice,
        genericPrice: lipidMed.genericPrice,
        monthlyPacks: 3,
      });
    }
    onAddPreset(newItems);
  };

  // Generate Chemist substitution text
  const generateChemistSlip = () => {
    let slip = `=========================================\n`;
    slip += `   JAN AUSHADHI (PMBJP) PRESCRIPTION SLIP\n`;
    slip += `   Government Quality Subsidized Generics\n`;
    slip += `=========================================\n\n`;
    items.forEach((it, idx) => {
      slip += `${idx + 1}. Commercial Brand: ${it.brandName}\n`;
      slip += `   -> PMBJP Generic: ${it.genericName} [${it.pmbjpCode}]\n`;
      slip += `   -> Salt: ${it.saltComposition}\n`;
      slip += `   -> Quantity: ${it.monthlyPacks} unit(s) @ ₹${it.genericPrice.toFixed(2)}\n\n`;
    });
    slip += `-----------------------------------------\n`;
    slip += `Commercial Retail Value : ₹${totalBrandMonthly.toFixed(2)}/mo\n`;
    slip += `Jan Aushadhi Total Rate : ₹${totalGenericMonthly.toFixed(2)}/mo\n`;
    slip += `Patient Monthly Savings : ₹${monthlySavings.toFixed(2)} (${overallSavingsPercent}% cheaper)\n`;
    slip += `Annual Patient Savings  : ₹${annualSavings.toFixed(2)}/year\n`;
    slip += `=========================================\n`;
    slip += `Note: Verified bioequivalent under WHO-GMP & NABL lab testing.\n`;
    return slip;
  };

  const handleCopySlip = () => {
    const text = generateChemistSlip();
    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `*Jan Aushadhi Generic Savings Report*\n\n` +
      `I calculated my prescription savings using Generic Rx:\n\n` +
      items.map(it => `• *${it.brandName}* -> Generic: ${it.genericName} (Govt Price: ₹${it.genericPrice})`).join('\n') +
      `\n\n💰 *Total Monthly Savings:* ₹${monthlySavings.toFixed(2)} (${overallSavingsPercent}% cheaper)` +
      `\n🌟 *Annual Family Savings:* ₹${annualSavings.toFixed(2)}/year` +
      `\n\nFind your nearest Jan Aushadhi Kendra to get low-cost WHO-GMP certified medicines!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                Monthly Prescription Kit & Savings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidated family routine & Jan Aushadhi price comparison
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Your Prescription Kit is Empty
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Search any branded medicine and click &quot;Add to Monthly Rx Kit&quot; to calculate your household&apos;s cumulative monthly & annual savings.
                </p>
              </div>

              {/* Quick load template */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={loadDiabeticCardiacPreset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Sample Senior Chronic Care Kit (BP + Sugar + Heart)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Grand Cumulative Savings Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 shadow-md flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-100 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" /> Cumulative Household Savings
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono-numbers">
                    Save ₹{monthlySavings.toFixed(2)} <span className="text-sm font-semibold opacity-90">/ month</span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    That is <strong className="text-white font-extrabold">₹{annualSavings.toFixed(2)} saved every single year</strong> for your family ({overallSavingsPercent}% cheaper)!
                  </p>
                </div>

                <div className="text-right bg-emerald-800/40 rounded-xl p-3 border border-emerald-400/30">
                  <span className="text-[10px] text-emerald-100 uppercase tracking-wider block font-semibold">
                    Cost Breakdown
                  </span>
                  <div className="text-xs font-bold line-through text-emerald-200">
                    Retail: ₹{totalBrandMonthly.toFixed(2)}/mo
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono-numbers">
                    Jan Aushadhi: ₹{totalGenericMonthly.toFixed(2)}/mo
                  </div>
                </div>
              </div>

              {/* Medicine List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Medicines in Kit ({items.length})
                  </h4>
                  <button
                    onClick={loadDiabeticCardiacPreset}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Common Chronic Kit</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {items.map((item) => {
                    const itemSavings = (item.brandPrice - item.genericPrice) * item.monthlyPacks;
                    return (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => {
                                onSelectItem(item.brandName);
                                onClose();
                              }}
                              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-teal-600 dark:hover:text-teal-400"
                            >
                              {item.brandName}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {item.pmbjpCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Generic: {item.genericName}
                          </p>
                          <div className="flex items-center gap-3 text-xs mt-1.5 font-medium">
                            <span className="text-slate-500 dark:text-slate-400 line-through">
                              Brand: ₹{item.brandPrice.toFixed(2)}
                            </span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                              Govt: ₹{item.genericPrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              (Save ₹{itemSavings.toFixed(2)}/mo)
                            </span>
                          </div>
                        </div>

                        {/* Quantity and Remove */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 text-xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.monthlyPacks - 1))}
                              className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono-numbers font-bold text-slate-800 dark:text-slate-200">
                              {item.monthlyPacks} pk
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.monthlyPacks + 1)}
                              className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Remove from kit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySlip}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition shadow-2xs"
              >
                {copiedSlip ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Slip!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Chemist Slip</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-teal-600 hover:bg-slate-900 dark:hover:bg-teal-700 text-white text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
