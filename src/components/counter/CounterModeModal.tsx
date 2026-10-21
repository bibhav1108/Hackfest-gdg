import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Delete, 
  FileText, 
  Plus, 
  Trash2, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { POPULAR_MEDICINES } from '../../data/popularMedicines';

export interface CounterItem {
  id: string;
  brandName: string;
  genericName: string;
  brandPrice: number;
  genericPrice: number;
  quotedPrice: number;
  quantity: number;
}

interface CounterModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandPrice: number;
  genericPrice: number;
  genericName: string;
  onOpenCounterCard: () => void;
  onBatchAddToKit?: (items: any[]) => void;
}

interface SavedAuditRecord {
  id: string;
  timestamp: string;
  itemsCount: number;
  totalQuoted: number;
  totalGeneric: number;
  totalSaved: number;
}

const COUNTER_AUDIT_KEY = 'jan_aushadhi_multi_counter_audits_v1';

export const CounterModeModal: React.FC<CounterModeModalProps> = ({
  isOpen,
  onClose,
  brandName,
  brandPrice,
  genericPrice,
  genericName,
  onOpenCounterCard,
  onBatchAddToKit,
}) => {
  // Multiple medicines in counter bill
  const [items, setItems] = useState<CounterItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string>('');
  const [quotedInput, setQuotedInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showAddDropdown, setShowAddDropdown] = useState<boolean>(false);
  const [auditHistory, setAuditHistory] = useState<SavedAuditRecord[]>(() => {
    try {
      const raw = localStorage.getItem(COUNTER_AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Initialize with initial medicine when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialItem: CounterItem = {
        id: 'initial-' + Date.now().toString(36),
        brandName: brandName || 'Augmentin 228.5 mg/5ml',
        genericName: genericName || 'Amoxycillin & Potassium Clavulanate IP',
        brandPrice: brandPrice || 210.0,
        genericPrice: genericPrice || 46.88,
        quotedPrice: brandPrice || 210.0,
        quantity: 1,
      };
      setItems([initialItem]);
      setActiveItemId(initialItem.id);
      setQuotedInput(String(initialItem.quotedPrice));
    }
  }, [isOpen, brandName, brandPrice, genericPrice, genericName]);

  if (!isOpen) return null;

  const activeItem = items.find((i) => i.id === activeItemId) || items[0];

  const handleSelectActiveItem = (item: CounterItem) => {
    setActiveItemId(item.id);
    setQuotedInput(item.quotedPrice ? String(item.quotedPrice) : '');
  };

  const handlePadPress = (val: string) => {
    if (!activeItem) return;

    let nextInput = quotedInput;
    if (val === 'C') {
      nextInput = '';
    } else if (val === 'DEL') {
      nextInput = nextInput.slice(0, -1);
    } else if (val === '.') {
      if (!nextInput.includes('.')) {
        nextInput = nextInput ? nextInput + '.' : '0.';
      }
    } else {
      if (nextInput.length < 7) {
        nextInput = nextInput + val;
      }
    }

    setQuotedInput(nextInput);
    const parsed = parseFloat(nextInput) || 0;

    // Update active medicine's quoted price
    setItems((prev) =>
      prev.map((i) => (i.id === activeItem.id ? { ...i, quotedPrice: parsed } : i))
    );
  };

  const handleAddMedicine = (med: typeof POPULAR_MEDICINES[0]) => {
    const newItem: CounterItem = {
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      brandName: med.brandName,
      genericName: med.genericName,
      brandPrice: med.brandPrice,
      genericPrice: med.genericPrice,
      quotedPrice: med.brandPrice,
      quantity: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setActiveItemId(newItem.id);
    setQuotedInput(String(newItem.quotedPrice));
    setShowAddDropdown(false);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return; // Keep at least one item
    const remaining = items.filter((i) => i.id !== id);
    setItems(remaining);
    if (activeItemId === id && remaining.length > 0) {
      setActiveItemId(remaining[0].id);
      setQuotedInput(String(remaining[0].quotedPrice));
    }
  };

  // Grand Totals across all medicines
  const totalQuoted = items.reduce((acc, i) => acc + (i.quotedPrice * i.quantity), 0);
  const totalBrandMrp = items.reduce((acc, i) => acc + (i.brandPrice * i.quantity), 0);
  const totalGeneric = items.reduce((acc, i) => acc + (i.genericPrice * i.quantity), 0);
  const totalSaved = Math.max(0, totalQuoted - totalGeneric);
  const totalSavingsPercent = totalQuoted > 0 ? Math.round((totalSaved / totalQuoted) * 100) : 0;

  // Single Item Verdict
  const getItemVerdict = (item: CounterItem) => {
    const q = item.quotedPrice;
    const g = item.genericPrice;
    const b = item.brandPrice;

    if (q <= 0) return { label: 'Enter Quoted Price', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' };
    if (q <= g * 1.15) {
      return { label: 'Generic Fair Price', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80' };
    }
    if (q > b * 1.05) {
      return { label: `Overcharging (${Math.round(((q - b) / b) * 100)}% above MRP)`, color: 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80' };
    }
    const extraVsGeneric = Math.round(((q - g) / g) * 100);
    return { label: `Brand Premium: +${extraVsGeneric}% vs PMBJP`, color: 'text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80' };
  };

  const handleSaveAudit = () => {
    const newRecord: SavedAuditRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      itemsCount: items.length,
      totalQuoted,
      totalGeneric,
      totalSaved,
    };
    const updated = [newRecord, ...auditHistory].slice(0, 5);
    setAuditHistory(updated);
    try {
      localStorage.setItem(COUNTER_AUDIT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleCopySummary = () => {
    const lines = items.map(
      (it, idx) =>
        `${idx + 1}. ${it.brandName}\n   Chemist Quote: ₹${it.quotedPrice.toFixed(2)} | PMBJP Generic: ₹${it.genericPrice.toFixed(2)} (Save ₹${(it.quotedPrice - it.genericPrice).toFixed(2)})`
    );
    const slip = `PHARMACY COUNTER AUDIT SLIP (PMBJP):\n------------------------------------\n` +
      lines.join('\n') +
      `\n------------------------------------\n` +
      `Total Chemist Quoted: ₹${totalQuoted.toFixed(2)}\n` +
      `Total Jan Aushadhi Rate: ₹${totalGeneric.toFixed(2)}\n` +
      `YOU CAN SAVE: ₹${totalSaved.toFixed(2)} (${totalSavingsPercent}% Saved!)\n` +
      `Ask for bioequivalent PMBJP generic substitutes at the counter.`;

    navigator.clipboard.writeText(slip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBatchAddAllToKit = () => {
    if (onBatchAddToKit) {
      onBatchAddToKit(
        items.map((i) => ({
          brandName: i.brandName,
          genericName: i.genericName,
          brandPrice: i.brandPrice,
          genericPrice: i.genericPrice,
          strength: 'Standard Dosage',
          form: 'Tablet / Syrup',
        }))
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-amber-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Chemist Counter Audit Mode
                </h3>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.2 text-[10px] font-bold">
                  {items.length} {items.length === 1 ? 'Medicine' : 'Medicines'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit prices before paying at the retail chemist counter
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* MULTI-MEDICINE LIST CARDS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Prescription Items at Counter:
              </span>

              {/* Add Medicine Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Medicine to Bill</span>
                </button>

                {showAddDropdown && (
                  <div className="absolute right-0 top-8 z-30 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 space-y-1 animate-in fade-in">
                    <span className="text-[10px] font-bold uppercase text-slate-400 px-2 block">
                      Select Medicine to Add:
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {POPULAR_MEDICINES.slice(0, 8).map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => handleAddMedicine(med)}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
                        >
                          <span className="font-semibold truncate">{med.brandName}</span>
                          <span className="text-emerald-600 font-mono text-[11px] shrink-0 font-bold">
                            ₹{med.genericPrice}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Render Each Medicine in the Bill */}
            <div className="space-y-2">
              {items.map((item, index) => {
                const isSelected = item.id === activeItem.id;
                const verdict = getItemVerdict(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectActiveItem(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-400/30'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {item.brandName}
                          </h4>
                          {isSelected && (
                            <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">
                              Editing
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-teal-800 dark:text-teal-300 truncate mt-0.5">
                          Generic: {item.genericName}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Chemist Quoted</span>
                          <span className="text-base font-black font-mono-numbers text-slate-900 dark:text-white">
                            ₹{item.quotedPrice ? item.quotedPrice.toFixed(2) : '0.00'}
                          </span>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Remove this medicine from counter mode"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        PMBJP Govt Rate: <strong className="text-emerald-700 dark:text-emerald-400 font-mono-numbers">₹{item.genericPrice.toFixed(2)}</strong> (MRP: ₹{item.brandPrice.toFixed(2)})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${verdict.color}`}>
                        {verdict.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LARGE TOUCH NUMPAD FOR QUOTE ENTRY ON ACTIVE MEDICINE */}
          {activeItem && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter Chemist Quoted Price for: <strong className="text-amber-800 dark:text-amber-300">{activeItem.brandName}</strong>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Standard MRP: ₹{activeItem.brandPrice.toFixed(2)}
                </span>
              </div>

              {/* Display Box */}
              <div className="rounded-xl border border-amber-300 dark:border-amber-600/60 bg-amber-50/50 dark:bg-slate-900 p-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">₹</span>
                <div className="text-2xl font-black font-mono-numbers text-slate-900 dark:text-white">
                  {quotedInput || '0'}
                </div>
              </div>

              {/* 3x4 Touch Numeric Keypad */}
              <div className="grid grid-cols-3 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handlePadPress(k)}
                    className={`py-2 rounded-xl text-sm font-bold transition active:scale-95 border ${
                      k === 'DEL'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 hover:bg-rose-100'
                        : 'bg-slate-50 dark:bg-slate-700/80 text-slate-800 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {k === 'DEL' ? '⌫' : k}
                  </button>
                ))}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between gap-1.5 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const val = activeItem.brandPrice.toFixed(2);
                    setQuotedInput(val);
                    setItems((prev) =>
                      prev.map((i) => (i.id === activeItem.id ? { ...i, quotedPrice: activeItem.brandPrice } : i))
                    );
                  }}
                  className="flex-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Set Full MRP (₹{activeItem.brandPrice.toFixed(0)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = (activeItem.brandPrice * 0.9).toFixed(2);
                    setQuotedInput(val);
                    setItems((prev) =>
                      prev.map((i) => (i.id === activeItem.id ? { ...i, quotedPrice: activeItem.brandPrice * 0.9 } : i))
                    );
                  }}
                  className="flex-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  10% Chemist Discount
                </button>
                <button
                  type="button"
                  onClick={() => handlePadPress('C')}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-semibold hover:bg-slate-100"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* GRAND TOTAL MULTI-MEDICINE COUNTER VERDICT */}
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/60">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Overall Counter Verdict ({items.length} Medicines)</span>
              </span>
              <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-black">
                SAVE {totalSavingsPercent}% GENERIC
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Quoted</span>
                <span className="text-lg font-black font-mono-numbers text-slate-800 dark:text-slate-200">
                  ₹{totalQuoted.toFixed(2)}
                </span>
              </div>

              <div className="bg-emerald-100/70 dark:bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-900 dark:text-emerald-300 block">Jan Aushadhi</span>
                <span className="text-lg font-black font-mono-numbers text-emerald-700 dark:text-emerald-300">
                  ₹{totalGeneric.toFixed(2)}
                </span>
              </div>

              <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-100 block">Total You Save</span>
                <span className="text-lg font-black font-mono-numbers">
                  ₹{totalSaved.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              💡 <strong>Pharmacist Notice:</strong> Instead of paying ₹{totalQuoted.toFixed(2)} for private brands, you can get these exact bioequivalent medicines under the Jan Aushadhi (PMBJP) scheme for only <strong>₹{totalGeneric.toFixed(2)}</strong>.
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Slip!' : 'Copy Counter Slip'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onBatchAddToKit && (
              <button
                type="button"
                onClick={handleBatchAddAllToKit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add All to Kit</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleSaveAudit();
                onOpenCounterCard();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Show Chemist Card</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
