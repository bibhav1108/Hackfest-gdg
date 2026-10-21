import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Camera, 
  Clock, 
  X, 
  TrendingDown, 
  Sparkles, 
  Loader2, 
  ChevronRight,
  FileQuestion
} from 'lucide-react';
import { POPULAR_MEDICINES, MedicineRecord } from '../../data/popularMedicines';
import { matchMedicineHandwriting } from '../../engine/matcher';
import { AudioTranscriberButton } from '../voice/AudioTranscriberButton';

interface MedicineAutocompleteProps {
  query: string;
  onChangeQuery: (newQuery: string) => void;
  onSearch: (selectedQuery: string) => void;
  onScanClick: () => void;
  onOpenBlankFill?: () => void;
  loading: boolean;
  placeholderText?: string;
}

const RECENT_KEY = 'jan_aushadhi_recent_searches_v1';

export const MedicineAutocomplete: React.FC<MedicineAutocompleteProps> = ({
  query,
  onChangeQuery,
  onSearch,
  onScanClick,
  onOpenBlankFill,
  loading,
  placeholderText = 'Search branded medicine or use ? for unreadable letters (e.g. D?lo 6?0, Pan 40)...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter medicines based on user input (checking handwriting wildcards or standard tokens)
  const isWildcardQuery = query.includes('?') || query.includes('*') || /[\u0900-\u097F]/.test(query);

  let filteredSuggestions: { record: MedicineRecord; subtitle: string; badge: string }[] = [];

  if (query.trim()) {
    if (isWildcardQuery) {
      const hwMatches = matchMedicineHandwriting(query);
      filteredSuggestions = hwMatches.map(m => ({
        record: m.record,
        subtitle: `Wildcard Decoded • Salt: ${m.record.saltComposition}`,
        badge: `${m.confidencePercent}% match`
      }));
    } else {
      const q = query.toLowerCase().trim();
      let customMeds: MedicineRecord[] = [];
      try {
        const stored = localStorage.getItem('jan_aushadhi_custom_medicines_v1');
        if (stored) customMeds = JSON.parse(stored);
      } catch {}
      const combined = [...customMeds, ...POPULAR_MEDICINES];

      const standardMatches = combined.filter((item) => {
        return (
          item.brandName.toLowerCase().includes(q) ||
          item.saltComposition.toLowerCase().includes(q) ||
          item.tags.some((t) => t.includes(q))
        );
      }).slice(0, 6);

      filteredSuggestions = standardMatches.map(m => ({
        record: m,
        subtitle: `Active Salt: ${m.saltComposition}`,
        badge: `Save ~${m.savingsPercentage}%`
      }));
    }
  }

  const addRecentSearch = (item: string) => {
    try {
      const clean = item.trim();
      if (!clean) return;
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save recent search:', e);
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  const handleSelect = (selectedText: string) => {
    onChangeQuery(selectedText);
    addRecentSearch(selectedText);
    setIsOpen(false);
    onSearch(selectedText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelect(filteredSuggestions[selectedIndex].record.brandName);
      } else if (query.trim()) {
        e.preventDefault();
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar Input Container */}
      <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-600 dark:border-teal-500 shadow-md dark:shadow-teal-950/20 hover:border-teal-700 dark:hover:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all p-1.5">
        <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 absolute left-4 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChangeQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className="w-full bg-transparent pl-11 pr-44 py-3 text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              onChangeQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Action icons on right */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Blank-Fill Decoder helper button */}
          {onOpenBlankFill && (
            <button
              type="button"
              onClick={onOpenBlankFill}
              className="px-2 py-1.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold transition flex items-center gap-1"
              title="Open Blank-Fill Handwriting Decoder"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">D?lo</span>
            </button>
          )}

          {/* Audio Dictation transcription */}
          <AudioTranscriberButton
            onTranscribed={(dictatedText) => {
              handleSelect(dictatedText);
            }}
          />

          {/* Camera Scan Button */}
          <button
            type="button"
            onClick={onScanClick}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition"
            title="Scan Prescription or Medicine Photo"
            aria-label="Upload or snap medicine photo"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => query.trim() && handleSelect(query)}
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Filtered suggestions list */}
          {filteredSuggestions.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider flex items-center justify-between">
                <span>{isWildcardQuery ? 'Handwriting Decoded Matches' : 'Matching Medicines'}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  Arrow keys to navigate • Enter to select
                </span>
              </div>

              {filteredSuggestions.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={item.record.id}
                    onClick={() => handleSelect(item.record.brandName)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-slate-800/90 text-teal-950 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {item.record.brandName}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.record.dosageForm}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        {item.badge}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Searches section */}
          {recentSearches.length > 0 && !query.trim() && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-slate-400" /> Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(term)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-800 dark:hover:text-teal-200 border border-slate-200 dark:border-slate-700 transition"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
