import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Compass
} from 'lucide-react';

interface GoogleMapsGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
}

export const GoogleMapsGroundingModal: React.FC<GoogleMapsGroundingModalProps> = ({
  isOpen,
  onClose,
  defaultCity = 'New Delhi',
}) => {
  const [cityQuery, setCityQuery] = useState(defaultCity);
  const [loading, setLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);

  const handleSearchMaps = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setCityQuery(queryText);

    try {
      const res = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Pradhan Mantri Bharatiya Janaushadhi Kendras in ${queryText}`,
        }),
      });

      const data = await res.json();
      setResponseHtml(data.reply || 'No live locations found for this query.');
      const chunks = data.groundingMetadata?.groundingChunks || [];
      setGroundingChunks(chunks);
    } catch (err: any) {
      console.error('Maps grounding error:', err);
      setResponseHtml('Unable to retrieve Google Maps data at this time. Please check your query or network.');
    } finally {
      setLoading(false);
    }
  };

  const sampleLocations = [
    'Connaught Place, New Delhi',
    'Indiranagar, Bengaluru',
    'Andheri West, Mumbai',
    'C-Scheme, Jaipur',
    'Hazratganj, Lucknow',
    'Banjara Hills, Hyderabad',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-4 bg-teal-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-base">
                  Live Jan Aushadhi Kendra Locator
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold">
                  gemini-3.8-flash + googleMaps tool
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grounded in Google Maps Platform data for operational generic medical stores across India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Input Bar */}
          <div className="space-y-2">
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-teal-500 dark:border-teal-500 p-1.5 shadow-2xs">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMaps(cityQuery)}
                placeholder="Enter city, district, pincode, or landmark (e.g. Indiranagar Bengaluru)..."
                className="w-full bg-transparent pl-10 pr-24 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSearchMaps(cityQuery)}
                disabled={loading || !cityQuery.trim()}
                className="absolute right-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-xs shadow-md transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Quick Sample City Chips */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs pt-1">
              <span className="text-slate-400 dark:text-slate-400 text-[11px] font-medium mr-1">Quick Cities:</span>
              {sampleLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchMaps(loc)}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-900 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Querying Google Maps grounding for verified Jan Aushadhi Kendras in {cityQuery}...</span>
            </div>
          )}

          {responseHtml && !loading && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-2xl border border-teal-100 dark:border-slate-800 bg-teal-50/40 dark:bg-slate-800/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Google Maps Grounded Kendra Outlets</span>
                </div>

                <div className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {responseHtml}
                </div>
              </div>

              {/* Grounding Source Citations & Maps Links */}
              {groundingChunks && groundingChunks.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Verified Google Maps Locations:
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {groundingChunks.map((chunk, idx) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate mr-2">{web.title || 'Jan Aushadhi Outlet'}</span>
                          <a
                            href={web.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:underline font-bold shrink-0"
                          >
                            <span>Open Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Official PMBJP Kendras operating 8:00 AM – 9:00 PM
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
