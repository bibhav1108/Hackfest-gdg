import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  Pill, 
  Filter, 
  Store,
  Mic,
  Bot,
  Radio,
  Globe,
  User,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { MedicineCategory } from '../../types/pharmacy';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderNavProps {
  onOpenNewRx: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  totalPrescriptions: number;
  onOpenTranscribe: () => void;
  onOpenChatbot: () => void;
  onOpenSearchGrounding: () => void;
  onOpenLiveVoice: () => void;
  onOpenAuth: () => void;
  onOpenScanner: () => void;
  user: FirebaseUser | null;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenNewRx,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  totalPrescriptions,
  onOpenTranscribe,
  onOpenChatbot,
  onOpenSearchGrounding,
  onOpenLiveVoice,
  onOpenAuth,
  onOpenScanner,
  user,
}) => {
  const [showSupplierMenu, setShowSupplierMenu] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers');

  const categories: (MedicineCategory | 'All')[] = [
    'All',
    'Antibiotics',
    'Analgesics',
    'Cardiovascular',
    'Pediatrics',
    'Supplements',
    'Respiratory',
  ];

  const suppliers = [
    'All Suppliers',
    'Novartis Healthcare Dist.',
    'Pfizer Pharma Direct',
    'GSK Clinical Supplies',
    'Roche Therapeutics',
  ];

  return (
    <header className="h-16 border-b border-[#182e44] bg-[#0c1825]/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30">
      {/* Left: Brand & Filter Pills */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center">
            <Pill className="w-4 h-4 text-teal-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-classic text-sm sm:text-base font-bold tracking-wider text-slate-100 uppercase">
              Pharmacy
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-tight -mt-1 hidden sm:inline">
              Apothecary & Clinical Suite
            </span>
          </div>
        </div>

        {/* Filter Pills matching screenshot */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Supplier Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setShowSupplierMenu(!showSupplierMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#132537] border border-[#1f3a54] text-xs font-medium text-slate-200 hover:border-teal-500/40 hover:text-teal-200 transition"
            >
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span className="max-w-[110px] truncate">{selectedSupplier}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSupplierMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-slate-700 bg-[#0f1f2e] p-1.5 shadow-2xl z-50 animate-in fade-in">
                {suppliers.map((sup) => (
                  <button
                    key={sup}
                    onClick={() => {
                      setSelectedSupplier(sup);
                      setShowSupplierMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition ${
                      selectedSupplier === sup
                        ? 'bg-teal-500/20 text-teal-300 font-medium'
                        : 'text-slate-300 hover:bg-[#162a3f]'
                    }`}
                  >
                    {sup}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown Pill */}
          <div className="flex items-center gap-1 bg-[#132537] border border-[#1f3a54] rounded-full p-0.5">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-teal-500/25 text-teal-200 border border-teal-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Search Input with mic transcribe icon */}
      <div className="flex-1 max-w-xs md:max-w-md mx-1 sm:mx-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, medication, Rx ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#112234] border border-[#1d374f] rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 transition"
          />
          <button
            onClick={onOpenTranscribe}
            title="Dictate with Gemini 3.5 Transcribe"
            className="absolute right-2 p-1 text-slate-400 hover:text-teal-300 transition"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Actions: AI Tools, Auth, PWA Install, Add Prescription */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Gemini Live Voice API */}
        <button
          onClick={onOpenLiveVoice}
          title="Gemini 3.8 Live Voice Conversation"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-600/40 bg-teal-950/40 text-teal-300 hover:bg-teal-900/50 hover:border-teal-400 transition text-xs font-medium"
        >
          <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span className="hidden lg:inline">Live Voice</span>
        </button>

        {/* Gemini Clinical Chatbot */}
        <button
          onClick={onOpenChatbot}
          title="Gemini Pharmacy Chatbot (gemini-3.8-flash / gemini-4-argon)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1d3852] bg-[#122437] text-slate-200 hover:border-teal-500/50 hover:text-teal-200 transition text-xs font-medium"
        >
          <Bot className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden lg:inline">AI Advisor</span>
        </button>

        {/* Google Search Grounding */}
        <button
          onClick={onOpenSearchGrounding}
          title="Google Search Grounded Drug & Recall Alerts"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#1d3852] bg-[#122437] text-slate-200 hover:border-sky-500/50 hover:text-sky-200 transition text-xs font-medium"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline">FDA Radar</span>
        </button>

        {/* Firebase User Auth */}
        <button
          onClick={onOpenAuth}
          title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in with Google Firebase'}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition text-xs font-medium ${
            user
              ? 'border-teal-500/40 bg-teal-950/50 text-teal-300'
              : 'border-[#1d3852] bg-[#122437] text-slate-300 hover:border-teal-500/40'
          }`}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline max-w-[85px] truncate">
            {user ? user.displayName?.split(' ')[0] || 'User' : 'Sign In'}
          </span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton compact={true} />

        {/* Scan Rx / Medicine Pic */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold transition active:scale-95 shadow-sm"
          title="Scan Prescription or Medicine Photo with Gemini Vision"
        >
          <Camera className="w-3.5 h-3.5 text-teal-300" />
          <span className="hidden md:inline">Scan Pic</span>
        </button>

        {/* Action Button: + New Prescription */}
        <button
          onClick={onOpenNewRx}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold shadow-sm transition active:scale-95"
          title="Create New Prescription or Dispense Order"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Rx</span>
        </button>
      </div>
    </header>
  );
};
