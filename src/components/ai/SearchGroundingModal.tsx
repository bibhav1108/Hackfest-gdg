import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2, X, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Recent FDA drug recalls and safety alerts 2026',
    'Current Amoxicillin and antibiotic supply shortages',
    'GLP-1 receptor agonist new clinical indications and dosing',
    'Atorvastatin brand warnings and contraindications update',
  ];

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setGroundingMetadata(null);

    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Search grounding failed');
      }

      setResult(data.reply);
      setGroundingMetadata(data.groundingMetadata);
    } catch (err: any) {
      console.error('Grounding search error:', err);
      setError(err.message || 'Failed to retrieve grounded information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-6 py-4 bg-[#0a1622] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white tracking-wide text-sm">
                  Google Search Grounded Clinical Radar
                </h3>
                <span className="rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 text-[10px] font-mono-numbers">
                  gemini-3.8-flash + googleSearch
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live regulatory updates, drug shortages, FDA warnings & trials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Query Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Search drug recalls, shortages, clinical alerts with real-time web grounding..."
                className="w-full rounded-xl bg-[#142637] border border-[#203a54] pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-semibold text-xs transition shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase font-medium self-center mr-1">
              Suggested:
            </span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="rounded-lg bg-[#122334] border border-[#1b344d] hover:border-teal-500/40 hover:text-teal-200 px-2.5 py-1 text-[11px] text-slate-300 transition text-left"
              >
                {sq}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search result display */}
          {result && (
            <div className="rounded-xl border border-[#1b344d] bg-[#0b1622] p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#162a3f] pb-2 text-xs">
                <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Grounded Clinical Intelligence
                </span>
                <span className="text-[11px] text-slate-400">Verified via Google Search Engine</span>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {result}
              </div>

              {/* Grounding Sources */}
              {groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
                <div className="pt-3 border-t border-[#162a3f]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Referenced Live Web Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {groundingMetadata.groundingChunks.slice(0, 5).map((chunk: any, idx: number) => {
                      if (!chunk.web?.uri) return null;
                      return (
                        <a
                          key={idx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-[#1c364e] bg-[#122538] hover:border-teal-400/60 hover:text-teal-200 px-2.5 py-1 text-[11px] text-slate-300 transition"
                        >
                          <ExternalLink className="w-3 h-3 text-teal-400" />
                          <span className="max-w-[200px] truncate">{chunk.web.title || chunk.web.uri}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b344d] p-4 bg-[#0a1622] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-[#142637] hover:bg-[#1a334a] rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
