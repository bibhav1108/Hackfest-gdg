import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  ShieldCheck, 
  TrendingDown, 
  AlertCircle, 
  Check, 
  FlaskConical, 
  Building2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { MedicineRecord, THERAPY_CATEGORIES } from '../../data/popularMedicines';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AddNewMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicineAdded: (medicine: MedicineRecord) => void;
  initialName?: string;
}

const CUSTOM_MEDICINES_KEY = 'jan_aushadhi_custom_medicines_v1';

export function getCustomMedicines(): MedicineRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MEDICINES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomMedicineLocally(med: MedicineRecord) {
  try {
    const existing = getCustomMedicines();
    const filtered = existing.filter((m) => m.id !== med.id);
    filtered.unshift(med);
    localStorage.setItem(CUSTOM_MEDICINES_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to save custom medicine locally:', e);
  }
}

export const AddNewMedicineModal: React.FC<AddNewMedicineModalProps> = ({
  isOpen,
  onClose,
  onMedicineAdded,
  initialName = '',
}) => {
  const [brandName, setBrandName] = useState(initialName);
  const [genericName, setGenericName] = useState('');
  const [saltComposition, setSaltComposition] = useState('');
  const [category, setCategory] = useState<MedicineRecord['category']>('antibiotic');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [packageSize, setPackageSize] = useState('Strip of 10 tablets');
  const [brandPrice, setBrandPrice] = useState<string>('');
  const [genericPrice, setGenericPrice] = useState<string>('');
  const [manufacturer, setManufacturer] = useState('');
  const [pmbjpCode, setPmbjpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numBrandPrice = parseFloat(brandPrice) || 0;
  const numGenericPrice = parseFloat(genericPrice) || (numBrandPrice > 0 ? Math.round(numBrandPrice * 0.22 * 100) / 100 : 0);
  const calculatedSavings = numBrandPrice > 0 
    ? Math.max(Math.round(((numBrandPrice - numGenericPrice) / numBrandPrice) * 100), 50)
    : 75;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brandName.trim()) {
      setError('Please provide the commercial brand name.');
      return;
    }
    if (!saltComposition.trim()) {
      setError('Please provide the active chemical salt composition.');
      return;
    }
    if (numBrandPrice <= 0) {
      setError('Please enter a valid commercial brand retail price (MRP).');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `custom-${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const finalGenericName = genericName.trim() || `${saltComposition.trim()} Tablets IP`;
    const finalPmbjpCode = pmbjpCode.trim() || `PMBJP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMed: MedicineRecord = {
      id: generatedId,
      brandName: brandName.trim(),
      category,
      categoryLabel: THERAPY_CATEGORIES.find((c) => c.id === category)?.label || 'General Care',
      manufacturer: manufacturer.trim() || 'Indian Pharma Manufacturer',
      saltComposition: saltComposition.trim(),
      strength: strength.trim() || 'Standard Strength',
      dosageForm: dosageForm.trim() || 'Tablet',
      packageSize: packageSize.trim() || 'Standard Pack',
      brandPrice: numBrandPrice,
      genericName: finalGenericName,
      pmbjpCode: finalPmbjpCode,
      genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
      genericPrice: numGenericPrice > 0 ? numGenericPrice : Math.round(numBrandPrice * 0.25 * 100) / 100,
      savingsPercentage: calculatedSavings,
      tags: [
        brandName.toLowerCase(),
        saltComposition.toLowerCase(),
        category,
        'custom-medicine',
        finalGenericName.toLowerCase()
      ],
    };

    // 1. Save locally to immediate custom cache
    saveCustomMedicineLocally(newMed);

    // 2. Persist to Firestore if available
    try {
      if (db) {
        await addDoc(collection(db, 'custom_medicines'), {
          ...newMed,
          userId: auth?.currentUser?.uid || 'guest-user',
          userEmail: auth?.currentUser?.email || 'guest@example.com',
          createdAt: serverTimestamp(),
        });
      }
    } catch (fsErr) {
      console.warn('Firestore custom medicine save fallback:', fsErr);
    }

    setIsSubmitting(false);
    onMedicineAdded(newMed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-base">
                  Add Medicine to PWA Catalog
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.2 text-[10px] font-bold">
                  Custom Entry
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Index any medicine brand & calculate PMBJP bioequivalent savings
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Brand & Salt Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Commercial Brand Name *
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Augmentin 625 Duo, Dolo 650, Pan 40"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Active Salt Composition *
                </label>
                <input
                  type="text"
                  required
                  value={saltComposition}
                  onChange={(e) => setSaltComposition(e.target.value)}
                  placeholder="e.g. Paracetamol IP 650mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Therapeutic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="antibiotic">Antibiotic & Infection</option>
                  <option value="cardiac">Cardiac & Blood Pressure</option>
                  <option value="diabetes">Diabetes Care</option>
                  <option value="acidity">Acidity & Gastro</option>
                  <option value="pain">Pain & Fever (Analgesic)</option>
                  <option value="respiratory">Respiratory & Allergy</option>
                  <option value="vitamins">Vitamins & Supplements</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Strength
                </label>
                <input
                  type="text"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="e.g. 625 mg"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dosage Form
                </label>
                <input
                  type="text"
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  placeholder="Tablet, Syrup, etc."
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Package Size
                </label>
                <input
                  type="text"
                  value={packageSize}
                  onChange={(e) => setPackageSize(e.target.value)}
                  placeholder="10 tabs / 100ml"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing Comparison & PMBJP Rate */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/30 p-3.5 space-y-3">
            <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Pricing & Generic Alternative</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Commercial MRP (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={brandPrice}
                  onChange={(e) => setBrandPrice(e.target.value)}
                  placeholder="e.g. 210.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                  PMBJP Generic Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={genericPrice}
                  onChange={(e) => setGenericPrice(e.target.value)}
                  placeholder={numBrandPrice > 0 ? (numBrandPrice * 0.22).toFixed(2) : 'Auto-calc'}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-black font-mono-numbers"
                />
              </div>
            </div>

            {numBrandPrice > 0 && (
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between pt-1 border-t border-emerald-200 dark:border-emerald-900/60">
                <span>Estimated Consumer Savings:</span>
                <span className="text-sm">
                  SAVE {calculatedSavings}% (₹{(numBrandPrice - numGenericPrice).toFixed(2)})
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Optional Brand & PMBJP Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Private Manufacturer
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Cipla, Sun Pharma"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Govt PMBJP Product Code
              </label>
              <input
                type="text"
                value={pmbjpCode}
                onChange={(e) => setPmbjpCode(e.target.value)}
                placeholder="e.g. PMBJP-01052"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding Medicine...' : 'Add to PWA & Compare'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
