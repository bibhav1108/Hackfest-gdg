import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Percent, 
  Building2, 
  TrendingDown, 
  CheckCircle2, 
  Pill, 
  ShieldAlert, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Phone,
  Navigation
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface BrandDetails {
  brand_name: string;
  manufacturer: string;
  salt_composition: string;
  strength: string;
  dosage_form: string;
  package_size: string;
  price_inr: number;
}

interface GenericMatch {
  generic_name: string;
  manufacturer: string;
  salt_composition: string;
  strength: string;
  dosage_form: string;
  package_size: string;
  price_inr: number;
  savings_percentage: number;
  availability_status: string;
}

interface StoreLocation {
  id: string;
  name: string;
  store_type: string;
  address: string;
  distance_km: number;
  distance_display: string;
  contact: string;
  open_now: boolean;
}

interface SearchResponse {
  query: string;
  parsed_strength: string | null;
  parsed_dosage_form: string | null;
  parsed_volume: string | null;
  brand_details: BrandDetails;
  cheapest_generic: GenericMatch;
  all_generic_alternatives: GenericMatch[];
  nearby_stores: StoreLocation[];
  disclaimer: string;
}

export const GenericRxApp: React.FC<{ onBackToApotheca?: () => void }> = ({ onBackToApotheca }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Suggestions for autocomplete / quick tap
  const quickSearches = [
    'Augmentin 228.5 mg/5ml suspension',
    'Pan 40 tablet',
    'Crocin 650',
    'Atorva 10 tablet',
    'Glycomet 500 tablet',
  ];

  // Load default search on mount
  useEffect(() => {
    executeSearch('Augmentin 228.5 mg/5ml suspension');
  }, []);

  const executeSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setSearchQuery(queryToSearch);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryToSearch)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to find generic match');
      }
      setResult(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Error communicating with generic lookup server');
    } finally {
      setLoading(false);
    }
  };

  // Voice Search using Web Speech API or microphone
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Type in the search box instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchQuery(speechResult);
      executeSearch(speechResult);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#071019] text-slate-100 flex flex-col">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-40 bg-[#091522]/95 backdrop-blur-md border-b border-[#182e44] px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Pill className="w-4 h-4 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-classic text-base sm:text-lg font-bold text-white tracking-wide">
                GenericRx
              </h1>
              <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider">
                Jan Aushadhi
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Direct Salt Bioequivalence & Price Saver
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToApotheca && (
            <button
              onClick={onBackToApotheca}
              className="text-xs text-slate-400 hover:text-teal-300 px-2.5 py-1 rounded-lg border border-[#182e44] hover:border-teal-500/40 transition"
            >
              Dispensary Suite
            </button>
          )}
          <PWAInstallButton compact={true} />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* Hero & Search Section */}
        <section className="space-y-3">
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Compare Branded Medicine with Affordable Generic Equivalents
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter any branded tablet, syrup, or injection to detect active salt composition and find the lowest price in Jan Aushadhi Kendras.
            </p>
          </div>

          {/* Prominent Search Bar with Auto-complete & Voice Input */}
          <div className="relative flex items-center shadow-lg">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
              placeholder="e.g. Augmentin 228.5 mg/5ml suspension, Pan 40, Crocin 650..."
              className="w-full rounded-2xl bg-[#0f2030] border-2 border-[#1c3852] focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 pl-11 pr-24 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-[#162c42]'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit Search */}
              <button
                type="button"
                onClick={() => executeSearch(searchQuery)}
                disabled={loading || !searchQuery.trim()}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>

          {/* Quick Auto-complete Suggestions Pill bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium">Popular:</span>
            {quickSearches.map((qs, i) => (
              <button
                key={i}
                onClick={() => executeSearch(qs)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#112334] border border-[#1b354e] hover:border-emerald-500/50 hover:text-emerald-300 text-slate-300 text-[11px] transition shrink-0"
              >
                {qs}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Parsed Chemical Formulation Badge */}
            <div className="rounded-xl border border-[#19334a] bg-[#0c1a26] p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Detected Salt Composition:</span>
                <span className="font-semibold text-emerald-300 font-mono-numbers">
                  {result.brand_details.salt_composition}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Strength: <strong className="text-slate-200">{result.brand_details.strength}</strong></span>
                <span>•</span>
                <span>Form: <strong className="text-slate-200">{result.brand_details.dosage_form}</strong></span>
              </div>
            </div>

            {/* SIDE-BY-SIDE COMPARISON VIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Card 1: Searched Brand Card */}
              <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#112130] to-[#0c1824] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#182e44]">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    Searched Branded Medicine
                  </span>
                  <span className="rounded-md bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-medium">
                    Commercial Brand
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {result.brand_details.brand_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mfg: {result.brand_details.manufacturer}
                  </p>
                </div>

                <div className="rounded-xl bg-[#08121c] p-3 space-y-1.5 text-xs border border-[#16293a]">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Pack Formulation:</span>
                    <span>{result.brand_details.package_size}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Dosage Form:</span>
                    <span>{result.brand_details.dosage_form}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-baseline justify-between border-t border-[#182e44]">
                  <span className="text-xs text-slate-400">MRP / Retail Price:</span>
                  <span className="text-2xl font-bold font-mono-numbers text-slate-200">
                    ₹{result.brand_details.price_inr.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Card 2: Cheapest Generic Match Card */}
              <div className="relative rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-b from-[#0f2838] to-[#0a1c27] p-5 shadow-lg space-y-4">
                {/* Savings Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Best Generic Match
                  </span>
                  
                  {/* Vibrant Green Savings Badge */}
                  <div className="flex items-center gap-1 rounded-full bg-emerald-500 text-slate-950 px-2.5 py-0.5 text-xs font-black shadow-md animate-pulse">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>SAVE {result.cheapest_generic.savings_percentage}%</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {result.cheapest_generic.generic_name}
                  </h3>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    Available at: {result.cheapest_generic.manufacturer}
                  </p>
                </div>

                <div className="rounded-xl bg-[#06141f] p-3 space-y-1.5 text-xs border border-emerald-500/20">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Active Salts:</span>
                    <span className="text-emerald-200 font-medium">100% Equivalent</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Packaging:</span>
                    <span>{result.cheapest_generic.package_size}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-baseline justify-between border-t border-emerald-500/30">
                  <div>
                    <span className="text-xs text-slate-400">Jan Aushadhi Price:</span>
                    <p className="text-[10px] text-emerald-400 font-medium">
                      You save ₹{(result.brand_details.price_inr - result.cheapest_generic.price_inr).toFixed(2)} per pack
                    </p>
                  </div>
                  <span className="text-2xl font-bold font-mono-numbers text-emerald-300">
                    ₹{result.cheapest_generic.price_inr.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            {/* Extra Generic Alternatives Table */}
            {result.all_generic_alternatives.length > 1 && (
              <div className="rounded-2xl border border-[#182e44] bg-[#0c1825] p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  All Bioequivalent Generic Options
                </h4>
                <div className="divide-y divide-[#152a3f] text-xs">
                  {result.all_generic_alternatives.map((gen, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{gen.generic_name}</span>
                        <p className="text-[11px] text-slate-400">{gen.manufacturer} • {gen.package_size}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono-numbers font-bold text-emerald-300 text-sm">
                          ₹{gen.price_inr.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-emerald-400 font-semibold">
                          Save {gen.savings_percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Store Locator List */}
            <div className="rounded-2xl border border-[#182e44] bg-gradient-to-b from-[#112334] to-[#0c1825] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#182e44]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm tracking-wide">
                    Nearby Jan Aushadhi & Generic Stores
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {result.nearby_stores.length} outlets nearby
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.nearby_stores.map((store) => (
                  <div
                    key={store.id}
                    className="rounded-xl border border-[#183149] bg-[#0d1c2a] p-3.5 space-y-2 hover:border-emerald-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white text-xs">
                          {store.name}
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {store.store_type}
                        </span>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono-numbers text-emerald-300 font-bold">
                        <MapPin className="w-3 h-3" /> {store.distance_display}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {store.address}
                    </p>

                    <div className="pt-2 border-t border-[#162a3d] flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400" /> {store.contact}
                      </span>
                      <span className={`font-semibold ${store.open_now ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {store.open_now ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Disclaimer Banner at the bottom */}
            <div className="rounded-xl border border-amber-600/30 bg-amber-950/20 p-4 text-xs text-amber-200/90 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Important Medical & Bioequivalence Disclaimer</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/80">
                {result.disclaimer}
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
