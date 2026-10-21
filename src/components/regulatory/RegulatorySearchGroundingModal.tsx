import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Award
} from 'lucide-react';

interface RegulatorySearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineName: string;
}

export const RegulatorySearchGroundingModal: React.FC<RegulatorySearchGroundingModalProps> = ({
  isOpen,
  onClose,
  medicineName,
}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !medicineName) return;

    const fetchGrounding = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gemini/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Jan Aushadhi PMBJP generic price cap NPPA ceiling price regulatory approval for ${medicineName}`,
          }),
        });
        const data = await res.json();
        setContent(data.reply || 'No regulatory data found.');
        setGroundingChunks(data.groundingMetadata?.groundingChunks || []);
      } catch (err) {
        console.error('Search grounding error:', err);
        setContent('Unable to fetch live search grounding data at this moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrounding();
  }, [isOpen, medicineName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-4 bg-teal-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-base">
                  Live Regulatory & Price Cap Verification
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold">
                  gemini-3.8-flash + googleSearch tool
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time Google Search Grounding for NPPA ceiling prices, CDSCO approvals & recalls
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-950 dark:text-emerald-200 block">National Pharmaceutical Pricing Authority (NPPA) Compliance</span>
              <span className="text-emerald-800 dark:text-emerald-300">
                Verifying statutory ceiling prices and Jan Aushadhi government basket inclusion for <strong>{medicineName}</strong>.
              </span>
            </div>
          </div>

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Grounding query with Google Search for latest pricing revisions...</span>
            </div>
          )}

          {content && !loading && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Verified Regulatory Intelligence
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {content}
                </div>
              </div>

              {/* Citations & Sources */}
              {groundingChunks && groundingChunks.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Google Search Grounding Sources:
                  </span>
                  <div className="space-y-2">
                    {groundingChunks.map((chunk, idx) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={idx}
                          href={web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-slate-800 text-xs transition group"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-900 dark:group-hover:text-teal-300 truncate mr-2">{web.title || web.uri}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
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
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Grounding provided via Google Search Tool
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-700 border border-teal-200 dark:border-slate-600 hover:bg-teal-100 dark:hover:bg-slate-600 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
