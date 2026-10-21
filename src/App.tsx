/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Camera, 
  MapPin, 
  Navigation, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingDown, 
  Building2, 
  AlertCircle, 
  Sparkles, 
  Loader2, 
  FlaskConical, 
  Award, 
  Bookmark, 
  BookmarkCheck,
  ExternalLink,
  Clock,
  HeartPulse,
  Radio,
  Bot,
  Globe,
  Compass,
  Atom,
  Share2,
  Copy,
  Check,
  ShoppingBag,
  Plus,
  Zap,
  Activity,
  Wind,
  FileQuestion,
  Calculator,
  FileText,
  Receipt,
  BarChart3,
  Languages,
  Scale,
  QrCode,
  PlusCircle
} from 'lucide-react';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { PrescriptionScannerModal } from './components/scanner/PrescriptionScannerModal';
import { AuthButton } from './components/auth/AuthButton';
import { BioscienceModal } from './components/science/BioscienceModal';
import { LiveVoiceConsultationModal } from './components/voice/LiveVoiceConsultationModal';
import { GoogleMapsGroundingModal } from './components/maps/GoogleMapsGroundingModal';
import { RegulatorySearchGroundingModal } from './components/regulatory/RegulatorySearchGroundingModal';
import { GeminiPharmacistChatModal } from './components/chat/GeminiPharmacistChatModal';
import { SavedMedicinesModal } from './components/saved/SavedMedicinesModal';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { StepWorkflowBar } from './components/workflow/StepWorkflowBar';
import { MedicineAutocomplete } from './components/search/MedicineAutocomplete';
import { PrescriptionKitModal } from './components/prescription/PrescriptionKitModal';
import { BlankFillDecoderModal } from './components/decode/BlankFillDecoderModal';
import { CounterModeModal } from './components/counter/CounterModeModal';
import { CounterCardModal } from './components/counter/CounterCardModal';
import { RupeeReceiptModal } from './components/receipt/RupeeReceiptModal';
import { PriceLadderView } from './components/ladder/PriceLadderView';
import { EquivalenceProofCard } from './components/equivalence/EquivalenceProofCard';
import { GoldenTestSetModal } from './components/bench/GoldenTestSetModal';
import { HumanInTheLoopSelector } from './components/workflow/HumanInTheLoopSelector';
import { MedicineQrModal } from './components/qr/MedicineQrModal';
import { AddNewMedicineModal } from './components/medicine/AddNewMedicineModal';
import { 
  fetchMedicineMultiSource, 
  MultiSourceSearchResult, 
  CandidateAlternative 
} from './engine/multiSourceFallback';
import { useFirebaseSavedMedicines } from './hooks/useFirebaseSavedMedicines';
import { usePrescriptionKit } from './hooks/usePrescriptionKit';
import { 
  POPULAR_MEDICINES, 
  THERAPY_CATEGORIES, 
  INDIAN_CITIES, 
  MedicineRecord 
} from './data/popularMedicines';
import { TRANSLATIONS, Language } from './i18n/translations';
import { initPWA } from './registerServiceWorker';
import { testFirestoreConnection } from './firebase';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultiSourceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  
  // Human-in-the-Loop & Multi-source states
  const [isHitlConfirmed, setIsHitlConfirmed] = useState<boolean>(true);
  const [forceFallbackActive, setForceFallbackActive] = useState<boolean>(false);

  // Workflow step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [storeFilter, setStoreFilter] = useState<'all' | 'open'>('all');
  const [showPriceLadder, setShowPriceLadder] = useState<boolean>(true);

  // Quick Action notification states
  const [copiedChemistText, setCopiedChemistText] = useState(false);

  // Standout Feature Modals state
  const [isBlankFillOpen, setIsBlankFillOpen] = useState(false);
  const [isCounterModeOpen, setIsCounterModeOpen] = useState(false);
  const [isCounterCardOpen, setIsCounterCardOpen] = useState(false);
  const [isRupeeReceiptOpen, setIsRupeeReceiptOpen] = useState(false);
  const [isGoldenBenchOpen, setIsGoldenBenchOpen] = useState(false);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [addMedicineInitialName, setAddMedicineInitialName] = useState('');

  // Core Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBioscienceOpen, setIsBioscienceOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isMapsGroundingOpen, setIsMapsGroundingOpen] = useState(false);
  const [isRegulatoryOpen, setIsRegulatoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Section references for smooth scrolling workflow
  const searchInputSectionRef = useRef<HTMLDivElement>(null);
  const comparisonSectionRef = useRef<HTMLDivElement>(null);
  const ladderSectionRef = useRef<HTMLDivElement>(null);
  const locatorSectionRef = useRef<HTMLDivElement>(null);

  // i18n helper
  const t = TRANSLATIONS[lang];

  // Firestore Saved Medicines hook
  const {
    savedItems,
    saveMedicine,
    removeMedicine,
    isSaved,
    totalAnnualSavings: savedAnnualSavings,
    totalMonthlySavings: savedMonthlySavings,
    user
  } = useFirebaseSavedMedicines();

  // Prescription Kit hook (Multi-Medicine Routine & Household Savings)
  const {
    kitItems,
    addToKit,
    removeFromKit,
    updateQuantity,
    addPreset,
    isInKit,
    totalMonthlySavings: kitMonthlySavings,
    totalAnnualSavings: kitAnnualSavings,
  } = usePrescriptionKit();

  // Multi-Source Search Execution (Live API -> Master DB -> Offline Cache)
  const executeSearch = async (queryToSearch: string, overrideFallbackMode?: boolean) => {
    if (!queryToSearch || !queryToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setSearchQuery(queryToSearch);

    try {
      const isFallback = overrideFallbackMode !== undefined ? overrideFallbackMode : forceFallbackActive;
      const multiResult = await fetchMedicineMultiSource(queryToSearch, {
        forceFallback: isFallback,
      });
      setResult(multiResult);
      setCurrentStep(2);
      
      // Smooth scroll to comparison on mobile
      setTimeout(() => {
        comparisonSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Error communicating with generic lookup service');
    } finally {
      setLoading(false);
    }
  };

  // Human-in-the-Loop: Candidate Formulation Selection
  const handleSelectCandidate = (cand: CandidateAlternative) => {
    if (!result) return;
    const newBrandPrice = cand.brandPrice;
    const newGenericPrice = cand.genericPrice;
    const savings = cand.savingsPercentage;

    setResult({
      ...result,
      brand_details: {
        ...result.brand_details,
        brand_name: cand.brandName,
        salt_composition: cand.saltComposition,
        strength: cand.strength,
        dosage_form: cand.dosageForm,
        price_inr: newBrandPrice,
      },
      cheapest_generic: {
        ...result.cheapest_generic,
        salt_composition: cand.saltComposition,
        strength: cand.strength,
        dosage_form: cand.dosageForm,
        price_inr: newGenericPrice,
        savings_percentage: savings,
      },
      humanConfirmed: true,
    });
    setIsHitlConfirmed(true);
  };

  // Human-in-the-Loop: Strength & Dosage Form Adjustment
  const handleUpdateStrengthForm = (newStrength: string, newForm: string) => {
    if (!result) return;
    setResult({
      ...result,
      brand_details: {
        ...result.brand_details,
        strength: newStrength,
        dosage_form: newForm,
      },
      cheapest_generic: {
        ...result.cheapest_generic,
        strength: newStrength,
        dosage_form: newForm,
      },
      humanConfirmed: true,
    });
    setIsHitlConfirmed(true);
  };

  // Human-in-the-Loop: Verification Confirmation
  const handleConfirmVerification = (confirmed: boolean) => {
    setIsHitlConfirmed(confirmed);
    if (result) {
      setResult({
        ...result,
        humanConfirmed: confirmed,
      });
    }
  };

  // Multi-source Fallback Toggle
  const handleToggleForceFallback = () => {
    const nextMode = !forceFallbackActive;
    setForceFallbackActive(nextMode);
    if (result) {
      executeSearch(result.brand_details.brand_name, nextMode);
    }
  };

  // Batch Add Verified Medicines to Prescription Kit (from Scanner)
  const handleBatchAddToKit = (
    medicines: Array<{
      brandName: string;
      genericName: string;
      brandPrice: number;
      genericPrice: number;
      strength: string;
      form: string;
    }>
  ) => {
    medicines.forEach((m) => {
      const id = m.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);
      addToKit(
        {
          id,
          brandName: m.brandName,
          genericName: m.genericName,
          saltComposition: result?.brand_details.salt_composition || 'Active Salt IP',
          dosageForm: m.form,
          pmbjpCode: 'PMBJP-' + Math.floor(1000 + Math.random() * 9000),
          brandPrice: m.brandPrice,
          genericPrice: m.genericPrice,
        },
        1
      );
    });
  };

  // Open Add Medicine to PWA Modal
  const handleOpenAddMedicine = (initialName?: string) => {
    setAddMedicineInitialName(initialName || '');
    setIsAddMedicineOpen(true);
  };

  // Test Firestore connectivity & pre-load featured comparison on mount
  useEffect(() => {
    initPWA();
    testFirestoreConnection().catch(console.error);

    // Initial featured load so the user lands on a fully populated, instructive experience
    executeSearch('Augmentin 228.5 mg/5ml suspension');
  }, []);

  // Step Workflow Navigation
  const handleStepClick = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
    if (step === 1) {
      searchInputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (step === 2) {
      comparisonSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (step === 3) {
      locatorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Quick Action: Copy details for showing to local chemist
  const handleCopyForChemist = () => {
    if (!result) return;
    const text = `JAN AUSHADHI GENERIC EQUIVALENT:\n` +
      `Commercial Brand: ${result.brand_details.brand_name}\n` +
      `Generic Substitute: ${result.cheapest_generic.generic_name}\n` +
      `PMBJP Product Code: ${result.cheapest_generic.pmbjp_code || 'PMBJP-01048'}\n` +
      `Active Salt: ${result.cheapest_generic.salt_composition}\n` +
      `Govt Subsidized Rate: ₹${result.cheapest_generic.price_inr.toFixed(2)} (Save ${savingsPercentage}%)\n` +
      `WHO-GMP Certified & NABL Tested.`;

    navigator.clipboard.writeText(text);
    setCopiedChemistText(true);
    setTimeout(() => setCopiedChemistText(false), 2500);
  };

  // Quick Action: Share to WhatsApp
  const handleShareWhatsApp = () => {
    if (!result) return;
    const text = `*Jan Aushadhi Generic Substitution:*\n\n` +
      `💊 *Brand:* ${result.brand_details.brand_name} (₹${result.brand_details.price_inr})\n` +
      `✅ *Jan Aushadhi Generic:* ${result.cheapest_generic.generic_name} (₹${result.cheapest_generic.price_inr})\n` +
      `💰 *You Save:* ₹${savingsAmount.toFixed(2)} (${savingsPercentage}% Cheaper!)\n` +
      `🧪 *Exact Salt:* ${result.cheapest_generic.salt_composition}\n\n` +
      `Available at your nearest Pradhan Mantri Bharatiya Janaushadhi Kendra.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Toggle saving to Firebase
  const handleToggleSaveCurrent = () => {
    if (!result) return;
    const bName = result.brand_details.brand_name;
    const id = bName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);
    if (isSaved(bName)) {
      removeMedicine(id);
    } else {
      saveMedicine({
        brandName: bName,
        saltComposition: result.brand_details.salt_composition,
        dosageForm: result.brand_details.dosage_form,
        strength: result.brand_details.strength,
        brandPrice: result.brand_details.price_inr,
        genericName: result.cheapest_generic.generic_name,
        pmbjpCode: result.cheapest_generic.pmbjp_code || 'PMBJP-1048',
        genericPrice: result.cheapest_generic.price_inr,
        savingsAmount: Math.max(0, result.brand_details.price_inr - result.cheapest_generic.price_inr),
        savingsPercentage: result.cheapest_generic.savings_percentage ?? savingsPercentage,
      });
    }
  };

  // Toggle adding to Prescription Kit
  const handleToggleKitCurrent = () => {
    if (!result) return;
    const bName = result.brand_details.brand_name;
    const id = bName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);
    if (isInKit(bName)) {
      removeFromKit(id);
    } else {
      addToKit({
        id,
        brandName: bName,
        genericName: result.cheapest_generic.generic_name,
        saltComposition: result.cheapest_generic.salt_composition,
        dosageForm: result.cheapest_generic.dosage_form,
        pmbjpCode: result.cheapest_generic.pmbjp_code || 'PMBJP-01048',
        brandPrice: result.brand_details.price_inr,
        genericPrice: result.cheapest_generic.price_inr,
      }, 1);
    }
  };

  // Pricing values
  const brandPrice = result?.brand_details.price_inr || 210.0;
  const genericPrice = result?.cheapest_generic.price_inr || 46.88;
  const savingsAmount = Math.max(0, brandPrice - genericPrice);
  const savingsPercentage = Math.round(((brandPrice - genericPrice) / brandPrice) * 100);

  const isCurrentMedicineSaved = result ? isSaved(result.brand_details.brand_name) : false;
  const isCurrentInKit = result ? isInKit(result.brand_details.brand_name) : false;

  // Filtered popular chips based on selected therapy category
  const displayedCategoryMeds: MedicineRecord[] = activeCategory === 'all'
    ? POPULAR_MEDICINES
    : POPULAR_MEDICINES.filter((m) => m.category === activeCategory);

  // Store filtering
  const displayedStores = (result?.nearby_stores || []).filter((s) => {
    if (storeFilter === 'open' && !s.open_now) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* TOP GOVERNMENT HEALTHCARE PORTAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-teal-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
        {/* Top Flag / Ministry Bar */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white text-[11px] px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)</span>
          </div>
          <div className="flex items-center gap-3 text-teal-100 font-medium">
            {/* Bilingual Language Switcher (EN | हिं) */}
            <button
              onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] font-bold transition"
              title="Toggle English / हिंदी"
            >
              <Languages className="w-3 h-3" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
            <span className="hidden sm:inline">Department of Pharmaceuticals • GoI</span>
          </div>
        </div>

        {/* Main App Navigation Bar */}
        <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Brand & Crest */}
          <div 
            onClick={() => executeSearch('Augmentin 228.5 mg/5ml suspension')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-teal-950 dark:text-white tracking-tight">
                  Jan Aushadhi <span className="text-teal-600 dark:text-teal-400">Generic Rx</span>
                </h1>
                <span className="hidden sm:inline-flex rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  PMBJP Verified
                </span>
                {/* Multi-Source Status Indicator */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleForceFallback();
                  }}
                  className={`hidden md:inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border transition ${
                    forceFallbackActive || result?.isFallback
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  }`}
                  title="Multi-Source Fallback Active. Click to toggle fallback mode for testing."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{forceFallbackActive || result?.isFallback ? 'Fallback DB' : 'Multi-Source: Live'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block -mt-0.5">
                Decode → Check → Act • Pharmacist Price Visibility
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Add Medicine to PWA Button */}
            <button
              onClick={() => handleOpenAddMedicine()}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition active:scale-95 shadow-2xs"
              title="Add New Medicine to PWA Database"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Medicine</span>
            </button>

            {/* Blank-Fill Decoder Button */}
            <button
              onClick={() => setIsBlankFillOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50 dark:bg-slate-800/90 hover:bg-teal-100 text-teal-900 dark:text-teal-200 text-xs font-bold transition shadow-2xs"
              title="Decode Doctor Handwriting with Blank-Fill wildcards"
            >
              <FileQuestion className="w-3.5 h-3.5 text-teal-600" />
              <span>Blank-Fill</span>
            </button>

            {/* Chemist Counter Mode Button */}
            <button
              onClick={() => setIsCounterModeOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-bold transition active:scale-95 shadow-2xs"
              title="Open Chemist Counter Mode (Check Quoted Price)"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Counter Mode</span>
            </button>

            {/* Monthly Prescription Kit Button */}
            <button
              onClick={() => setIsKitModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition active:scale-95 shadow-2xs"
              title="Open Monthly Prescription Kit & Household Savings"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Rx Kit ({kitItems.length})</span>
            </button>

            {/* Golden Test Bench Button (Section 4A.6) */}
            <button
              onClick={() => setIsGoldenBenchOpen(true)}
              className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 text-purple-900 dark:text-purple-200 text-xs font-bold transition shadow-2xs"
              title="Golden Test Bench (Judges Accuracy Metric)"
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Golden Bench</span>
            </button>

            {/* Global Dark Mode Toggle */}
            <ThemeToggle showLabel={false} />

            {/* Firebase Google Auth Button */}
            <AuthButton />

            {/* Install PWA Button */}
            <PWAInstallButton compact={true} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* INTERACTIVE 3-STEP CONSUMER WORKFLOW ROADMAP */}
        <StepWorkflowBar
          currentStep={currentStep}
          onStepClick={handleStepClick}
          hasResult={Boolean(result)}
          isHitlConfirmed={isHitlConfirmed}
        />

        {/* 1. HERO & SMART SEARCH SECTION (DECODE) */}
        <section ref={searchInputSectionRef} className="text-center space-y-4">
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Decode → Check → Act • Make Cost Visible Before It Is Paid</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t.appTitle}
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* LARGE SMART AUTOCOMPLETE SEARCH INPUT (WITH WILDCARD & DECODER) */}
          <div className="max-w-2xl mx-auto mt-4">
            <MedicineAutocomplete
              query={searchQuery}
              onChangeQuery={setSearchQuery}
              onSearch={executeSearch}
              onScanClick={() => setIsScannerOpen(true)}
              onOpenBlankFill={() => setIsBlankFillOpen(true)}
              loading={loading}
              placeholderText={t.searchPlaceholder}
            />

            {/* SAMPLE HANDWRITING WILDCARDS SHORTCUTS */}
            <div className="mt-2.5 flex items-center justify-center flex-wrap gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] mr-1 flex items-center gap-1">
                <FileQuestion className="w-3 h-3 text-teal-600" /> Doctor Scribble Presets:
              </span>
              {[
                { label: 'D?lo 6?0', query: 'D?lo 6?0' },
                { label: 'Aug*tin 625', query: 'Aug*tin 625' },
                { label: 'P?n 4?', query: 'P?n 4?' },
                { label: 'डोलो ६५०', query: 'डोलो ६५०' },
                { label: 'Benadryl 100 ml', query: 'Benadryl 100 ml' },
              ].map((med, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSearch(med.query)}
                  className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-slate-700 px-2.5 py-0.5 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold transition shadow-2xs"
                >
                  {med.label}
                </button>
              ))}
            </div>

            {/* THERAPY CATEGORY SWITCHER TABS */}
            <div className="mt-3.5 flex items-center justify-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {THERAPY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap text-xs shadow-2xs ${
                    activeCategory === cat.id
                      ? 'bg-teal-700 text-white dark:bg-teal-600'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. CORE RESULTS: SALT MATCH & SIDE-BY-SIDE EQUIVALENCE (CHECK) */}
        {result && (
          <section ref={comparisonSectionRef} className="space-y-5 animate-in fade-in duration-200">
            
            {/* HUMAN-IN-THE-LOOP CANDIDATE SELECTOR & CLINICAL VERIFICATION */}
            <HumanInTheLoopSelector
              searchResult={result}
              onSelectCandidate={handleSelectCandidate}
              onUpdateStrengthForm={handleUpdateStrengthForm}
              onConfirmVerification={handleConfirmVerification}
              isConfirmed={isHitlConfirmed}
              onToggleForceFallback={handleToggleForceFallback}
              forceFallbackActive={forceFallbackActive}
            />

            {/* EQUIVALENCE PROOF & SALT MATCH CHIPS */}
            <EquivalenceProofCard
              brandName={result.brand_details.brand_name}
              genericName={result.cheapest_generic.generic_name}
              saltComposition={result.cheapest_generic.salt_composition}
              strength={result.brand_details.strength}
              dosageForm={result.brand_details.dosage_form}
              packageSize={result.brand_details.package_size}
              brandPrice={result.brand_details.price_inr}
              genericPrice={result.cheapest_generic.price_inr}
              isPartial={false}
            />

            {/* ACTION TOOLBAR: Standout Action Buttons (Counter Mode, Counter Card, Rupee Receipt, Price Ladder) */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Instant Action Tools:
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Chemist Quoted Counter Mode Button */}
                <button
                  onClick={() => setIsCounterModeOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-xl shadow-2xs transition"
                  title="Check what chemist quoted at the counter"
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chemist Quoted…</span>
                </button>

                {/* 2. Counter Card Button */}
                <button
                  onClick={() => setIsCounterCardOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 hover:bg-teal-100 px-3 py-1.5 rounded-xl shadow-2xs transition"
                  title="Open bilingual card to show to chemist"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Counter Card</span>
                </button>

                {/* 3. Rupee Receipt Button */}
                <button
                  onClick={() => setIsRupeeReceiptOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl shadow-2xs transition"
                  title="Generate shareable Rupee Savings Receipt"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rupee Receipt</span>
                </button>

                {/* 4. Medicine QR Code Button */}
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-slate-800 border border-teal-300 dark:border-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-xl shadow-2xs transition"
                  title="Generate & view official PMBJP verification QR code"
                >
                  <QrCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Medicine QR</span>
                </button>

                {/* 5. Price Ladder Toggle Button */}
                <button
                  onClick={() => setShowPriceLadder(!showPriceLadder)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-xl shadow-2xs transition"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showPriceLadder ? 'Hide Ladder' : 'Price Ladder'}</span>
                </button>

                {/* Copy for Chemist */}
                <button
                  onClick={handleCopyForChemist}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl shadow-2xs transition"
                >
                  {copiedChemistText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedChemistText ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Share via WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl shadow-2xs transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share</span>
                </button>

                {/* Save Medicine to Firestore */}
                <button
                  onClick={handleToggleSaveCurrent}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl shadow-2xs transition"
                >
                  {isCurrentMedicineSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SIDE-BY-SIDE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* LEFT CARD: Branded Medicine */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.commercialBrand}
                    </span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                      Private Brand
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {result.brand_details.brand_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Mfg: {result.brand_details.manufacturer}
                    </p>
                  </div>

                  {/* Salt Composition */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 p-3.5 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                        {t.activeSalt}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {result.brand_details.salt_composition}
                      </p>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs">
                      <span>Dosage Form: <strong className="text-slate-800 dark:text-slate-200">{result.brand_details.dosage_form}</strong></span>
                      <span>Pack: <strong className="text-slate-800 dark:text-slate-200">{result.brand_details.package_size}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Branded Price */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      {t.standardBrandPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Regular pharmacy MRP</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-slate-900 dark:text-white">
                    ₹{result.brand_details.price_inr.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* RIGHT CARD: Jan Aushadhi Generic Equivalent */}
              <div className="relative rounded-3xl border-2 border-emerald-500 dark:border-emerald-500 bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-6 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition">
                <div className="space-y-3">
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/60">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {t.genericEquivalent}
                    </span>
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                      {result.cheapest_generic.pmbjp_code || 'PMBJP Code: #1048'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-teal-950 dark:text-white">
                      {result.cheapest_generic.generic_name}
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                      Available at: {result.cheapest_generic.manufacturer}
                    </p>
                  </div>

                  {/* Equivalent Salt Composition */}
                  <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Same Exact Salt Composition:
                      </span>
                      <p className="font-semibold text-emerald-950 dark:text-emerald-100 leading-snug">
                        {result.cheapest_generic.salt_composition}
                      </p>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs font-medium">
                      <span>Dosage Form: <strong>{result.cheapest_generic.dosage_form}</strong></span>
                      <span>Pack: <strong>{result.cheapest_generic.package_size}</strong></span>
                    </div>
                  </div>
                </div>

                {/* HIGHLIGHT SAVINGS BADGE & JAN AUSHADHI PRICE */}
                <div className="space-y-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/60">
                  {/* Bold Green Highlight Savings Badge as specified in brief */}
                  <div className="rounded-2xl bg-emerald-600 dark:bg-emerald-600 text-white p-3.5 shadow-md flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-emerald-100 shrink-0" />
                      <span className="font-extrabold text-xs sm:text-sm tracking-tight">
                        Save ₹{savingsAmount.toFixed(2)} ({savingsPercentage}% Cheaper with Jan Aushadhi)
                      </span>
                    </div>
                    <span className="hidden sm:inline-block rounded-full bg-emerald-700/90 px-2.5 py-0.5 text-[11px] font-bold">
                      Govt Price
                    </span>
                  </div>

                  {/* Jan Aushadhi Price */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                        {t.govtGenericPrice}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Fixed subsidized public rate</span>
                    </div>
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono-numbers text-emerald-700 dark:text-emerald-400">
                      ₹{result.cheapest_generic.price_inr.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* STANDOUT FEATURE: PRICE LADDER VIEW */}
            {showPriceLadder && (
              <div ref={ladderSectionRef} className="pt-2">
                <PriceLadderView
                  brandName={result.brand_details.brand_name}
                  saltComposition={result.brand_details.salt_composition}
                  strength={result.brand_details.strength}
                  dosageForm={result.brand_details.dosage_form}
                  brandPrice={result.brand_details.price_inr}
                  genericPrice={result.cheapest_generic.price_inr}
                  genericName={result.cheapest_generic.generic_name}
                />
              </div>
            )}

            {/* Annual Savings Projection Callout & Direct Next-Step Button */}
            <div className="rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-teal-950 dark:text-teal-100">
                    Annual Therapy Savings Projection
                  </h4>
                  <p className="text-xs text-teal-800 dark:text-teal-300">
                    Switching this medicine saves you approximately <strong className="text-teal-950 dark:text-white font-bold">₹{(savingsAmount * 12).toFixed(2)} per year</strong> for a regular monthly course.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(3)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 shadow-2xs transition flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locate Kendra to Buy</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 3. NEARBY JAN AUSHADHI KENDRA LOCATOR (ACT) */}
        {result && (
          <section ref={locatorSectionRef} className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                    {t.locateKendra}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Government authorized generic pharmacies near your current location
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {/* Real Google Maps Grounding Search Button */}
                <button
                  onClick={() => setIsMapsGroundingOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition"
                  title="Search real Kendras across India with Google Maps Platform Grounding"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Live Maps Grounding</span>
                </button>

                {/* Open / All Filter */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setStoreFilter('all')}
                    className={`px-3 py-1 font-bold transition ${
                      storeFilter === 'all'
                        ? 'bg-slate-800 text-white dark:bg-teal-600'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    All ({result.nearby_stores.length})
                  </button>
                  <button
                    onClick={() => setStoreFilter('open')}
                    className={`px-3 py-1 font-bold transition ${
                      storeFilter === 'open'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Open Now
                  </button>
                </div>
              </div>
            </div>

            {/* Quick City Selector Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
                Major Hubs:
              </span>
              {INDIAN_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setIsMapsGroundingOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-300 text-xs font-semibold whitespace-nowrap shadow-2xs transition"
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Store Listing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedStores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {store.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                        {store.store_type}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {store.distance_display}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {store.address}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <strong className={store.open_now ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                        {store.open_now ? t.openToday : t.closedToday}
                      </strong>
                    </span>
                    <a
                      href={`tel:${store.contact.replace(/\s+/g, '')}`}
                      className="flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:underline font-mono-numbers font-medium"
                    >
                      <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" /> {store.contact}
                    </a>
                  </div>

                  {/* Dual Action Buttons: Call & Navigate */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${store.contact.replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{t.callStore}</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-white" />
                      <span>{t.navigateMaps}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. PUBLIC EDUCATION & TRUST: "WHY JAN AUSHADHI?" */}
        <section className="rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs transition">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
              Government Quality Guarantee
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.whyJanAushadhi}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Every medicine in the PMBJP basket meets the highest standards of safety, quality, and therapeutic equivalence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Feature 1: WHO-GMP */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-5 space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {t.whoGmp}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Procured strictly from World Health Organization Good Manufacturing Practices (WHO-GMP) compliant production plants.
              </p>
            </div>

            {/* Feature 2: NABL Lab Testing */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-5 space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-2xs">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {t.nablTested}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Every batch undergoes rigorous independent quality, dissolution, and purity assays in NABL accredited labs before dispatch.
              </p>
            </div>

            {/* Feature 3: Same Active Salts */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-5 space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center mx-auto shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {t.bioequivalent}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Contains the identical active pharmaceutical chemical ingredient and dosage strength as expensive commercial brands.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PROMINENT MEDICAL DISCLAIMER BANNER */}
        <footer className="rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/30 p-5 text-amber-950 dark:text-amber-200 space-y-2 shadow-xs transition">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>Important Clinical Safety & Regulatory Notice</span>
          </div>
          <p className="text-xs sm:text-[13px] leading-relaxed text-amber-900/90 dark:text-amber-200/90 font-medium">
            {t.disclaimer}
          </p>
        </footer>

      </main>

      {/* STANDOUT FEATURE MODALS */}

      {/* 1. Blank-Fill Handwriting Decoder Modal (Section 4A.1) */}
      <BlankFillDecoderModal
        isOpen={isBlankFillOpen}
        onClose={() => setIsBlankFillOpen(false)}
        onSelectCandidate={(brandName) => {
          executeSearch(brandName);
        }}
      />

      {/* 2. Chemist Counter Mode Modal (Section 4A.3) */}
      <CounterModeModal
        isOpen={isCounterModeOpen}
        onClose={() => setIsCounterModeOpen(false)}
        brandName={result?.brand_details.brand_name || 'Searched Medicine'}
        brandPrice={result?.brand_details.price_inr || 210}
        genericPrice={result?.cheapest_generic.price_inr || 46.88}
        genericName={result?.cheapest_generic.generic_name || 'Jan Aushadhi Generic'}
        onOpenCounterCard={() => {
          setIsCounterModeOpen(false);
          setIsCounterCardOpen(true);
        }}
        onBatchAddToKit={handleBatchAddToKit}
      />

      {/* 3. Bilingual Counter Card Modal (Section 4A.5) */}
      <CounterCardModal
        isOpen={isCounterCardOpen}
        onClose={() => setIsCounterCardOpen(false)}
        brandName={result?.brand_details.brand_name || 'Augmentin 228.5 mg/5ml'}
        genericName={result?.cheapest_generic.generic_name || 'Amoxycillin & Potassium Clavulanate'}
        saltComposition={result?.brand_details.salt_composition || 'Amoxycillin & Potassium Clavulanate'}
        strength={result?.brand_details.strength || '228.5 mg/5ml'}
        dosageForm={result?.brand_details.dosage_form || 'Suspension'}
        brandPrice={result?.brand_details.price_inr || 210}
        genericPrice={result?.cheapest_generic.price_inr || 46.88}
        pmbjpCode={result?.cheapest_generic.pmbjp_code || 'PMBJP-01048'}
      />

      {/* 4. Rupee Savings Receipt Modal (Section 4A.5) */}
      <RupeeReceiptModal
        isOpen={isRupeeReceiptOpen}
        onClose={() => setIsRupeeReceiptOpen(false)}
        brandName={result?.brand_details.brand_name || 'Augmentin 228.5 mg/5ml'}
        genericName={result?.cheapest_generic.generic_name || 'Amoxycillin & Potassium Clavulanate'}
        brandPrice={result?.brand_details.price_inr || 210}
        genericPrice={result?.cheapest_generic.price_inr || 46.88}
        saltComposition={result?.brand_details.salt_composition || 'Amoxycillin & Potassium Clavulanate'}
      />

      {/* 5. Golden Test Bench & Accuracy Proof Modal (Section 4A.6) */}
      <GoldenTestSetModal
        isOpen={isGoldenBenchOpen}
        onClose={() => setIsGoldenBenchOpen(false)}
        onSelectMedicine={(brandName) => {
          executeSearch(brandName);
        }}
      />

      {/* 6. Monthly Prescription Kit & Household Savings Modal */}
      <PrescriptionKitModal
        isOpen={isKitModalOpen}
        onClose={() => setIsKitModalOpen(false)}
        items={kitItems}
        onRemoveItem={removeFromKit}
        onUpdateQuantity={updateQuantity}
        onAddPreset={addPreset}
        onSelectItem={(brandName) => {
          executeSearch(brandName);
        }}
      />

      {/* 7. Multimodal Prescription / Medicine Photo Scanner Modal */}
      <PrescriptionScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectMedicine={(medName) => {
          executeSearch(medName);
        }}
        onBatchAddToKit={handleBatchAddToKit}
        onOpenAddMedicine={handleOpenAddMedicine}
      />

      {/* 8. Bioscience & Chemical Pharmacology Explorer Modal */}
      <BioscienceModal
        isOpen={isBioscienceOpen}
        onClose={() => setIsBioscienceOpen(false)}
        saltName={result?.brand_details.salt_composition || 'Amoxycillin'}
        brandName={result?.brand_details.brand_name || 'Searched Medicine'}
      />

      {/* 9. Live Audio Voice Consultation Modal (gemini-3.8-live) */}
      <LiveVoiceConsultationModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        activeMedicine={result?.brand_details.brand_name}
      />

      {/* 10. Google Maps Grounding Kendra Locator Modal */}
      <GoogleMapsGroundingModal
        isOpen={isMapsGroundingOpen}
        onClose={() => setIsMapsGroundingOpen(false)}
      />

      {/* 11. Live Google Search Grounding Regulatory Modal */}
      <RegulatorySearchGroundingModal
        isOpen={isRegulatoryOpen}
        onClose={() => setIsRegulatoryOpen(false)}
        medicineName={result?.brand_details.brand_name || 'Generic Medicine'}
      />

      {/* 12. Multi-Turn Gemini Pharmacist Chat Modal */}
      <GeminiPharmacistChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialQuery={result ? `Tell me more about Jan Aushadhi generic alternative for ${result.brand_details.brand_name}` : undefined}
      />

      {/* 13. Saved Prescriptions & Medicines Drawer */}
      <SavedMedicinesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedItems}
        onRemove={removeMedicine}
        onSelect={(bName) => executeSearch(bName)}
        totalAnnualSavings={savedAnnualSavings}
        totalMonthlySavings={savedMonthlySavings}
        isAuthenticated={Boolean(user)}
      />

      {/* 14. Official PMBJP Verification Medicine QR Modal */}
      <MedicineQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        brandName={result?.brand_details.brand_name || 'Augmentin 228.5 mg/5ml'}
        genericName={result?.cheapest_generic.generic_name || 'Amoxycillin & Pot. Clavulanate IP'}
        pmbjpCode={result?.cheapest_generic.pmbjp_code || 'PMBJP-01048'}
        saltComposition={result?.brand_details.salt_composition || 'Amoxycillin & Potassium Clavulanate'}
        strength={result?.brand_details.strength || '228.5 mg/5ml'}
        dosageForm={result?.brand_details.dosage_form || 'Suspension'}
        brandPrice={result?.brand_details.price_inr || 210}
        genericPrice={result?.cheapest_generic.price_inr || 46.88}
      />

      {/* 15. Add New Medicine to PWA Catalog Modal */}
      <AddNewMedicineModal
        isOpen={isAddMedicineOpen}
        onClose={() => setIsAddMedicineOpen(false)}
        initialName={addMedicineInitialName}
        onMedicineAdded={(newMed) => {
          executeSearch(newMed.brandName);
        }}
      />
    </div>
  );
}

export default App;
