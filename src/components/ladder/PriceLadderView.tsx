import React from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles, 
  Building2,
  ArrowDown
} from 'lucide-react';
import { generatePriceLadder, PriceLadderData } from '../../engine/priceLadder';

interface PriceLadderViewProps {
  brandName: string;
  saltComposition: string;
  strength: string;
  dosageForm: string;
  brandPrice: number;
  genericPrice: number;
  genericName: string;
}

export const PriceLadderView: React.FC<PriceLadderViewProps> = ({
  brandName,
  saltComposition,
  strength,
  dosageForm,
  brandPrice,
  genericPrice,
  genericName,
}) => {
  const ladderData: PriceLadderData = generatePriceLadder(
    brandName,
    saltComposition,
    strength,
    dosageForm,
    brandPrice,
    genericPrice,
    genericName
  );

  return (
    <div className="rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs transition">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                Price Ladder: Where Does Your Brand Sit?
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 uppercase">
                Section 4A.4
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranking brands with identical {saltComposition} ({strength}) by retail pack price
            </p>
          </div>
        </div>

        {/* Spread badge */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Market Price Spread:</span>
          <span className="text-xs sm:text-sm font-extrabold font-mono-numbers text-teal-800 dark:text-teal-300">
            ₹{ladderData.cheapestPrice.toFixed(0)} — ₹{ladderData.highestPrice.toFixed(0)} (Spread: ₹{ladderData.spreadInr.toFixed(0)})
          </span>
        </div>
      </div>

      {/* Visual Spread Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span className="text-emerald-600 dark:text-emerald-400">₹{ladderData.cheapestPrice.toFixed(2)} (Jan Aushadhi)</span>
          <span className="text-rose-600 dark:text-rose-400">₹{ladderData.highestPrice.toFixed(2)} (Top Private Brand)</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div className="w-1/4 bg-emerald-500 h-full" title="Jan Aushadhi Tier" />
          <div className="w-1/4 bg-teal-400 h-full" title="Mid-Market Generics" />
          <div className="w-1/2 bg-amber-400 h-full" title="Private Commercial Brands" />
        </div>
      </div>

      {/* The Vertical Ladder Table */}
      <div className="space-y-2">
        {ladderData.entries.map((entry, idx) => {
          const isUser = entry.isUserBrand;
          const isCheapest = entry.isGeneric;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isCheapest
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-sm'
                  : isUser
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCheapest 
                    ? 'bg-emerald-600 text-white' 
                    : isUser 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {entry.brandName}
                    </span>
                    {isCheapest && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                        Cheapest
                      </span>
                    )}
                    {isUser && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        Your Search
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Mfg: {entry.manufacturer} • {entry.packSize}
                  </p>
                </div>
              </div>

              {/* Price comparison column */}
              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-extrabold font-mono-numbers text-slate-900 dark:text-white">
                  ₹{entry.packPriceInr.toFixed(2)}
                </div>
                {entry.relativeSavingsPercent !== undefined && entry.relativeSavingsPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    -{entry.relativeSavingsPercent}% vs peak
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
