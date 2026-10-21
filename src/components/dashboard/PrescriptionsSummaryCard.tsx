import React, { useState } from 'react';
import { HOURLY_PRESCRIPTIONS_BARS } from '../../data/initialData';
import { ChevronRight, TrendingUp } from 'lucide-react';

interface PrescriptionsSummaryCardProps {
  amount: number;
}

export const PrescriptionsSummaryCard: React.FC<PrescriptionsSummaryCardProps> = ({ amount }) => {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const maxVal = Math.max(...HOURLY_PRESCRIPTIONS_BARS.map((b) => b.count));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#183149] bg-gradient-to-b from-[#112334] to-[#0d1c2b] p-4 sm:p-5 shadow-sm">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 tracking-wide uppercase text-[11px]">
            Prescriptions Value
          </span>
          <button className="flex items-center gap-0.5 text-teal-400 hover:text-teal-300 font-medium transition text-[11px]">
            <span>Today</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono-numbers text-slate-100 tracking-tight">
            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="flex items-center text-[11px] font-semibold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> +14.2%
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Hourly dispensing revenue volume
        </p>
      </div>

      {/* Hourly Bar Chart */}
      <div className="mt-5">
        <div className="h-20 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
          {HOURLY_PRESCRIPTIONS_BARS.map((item, idx) => {
            const heightPercent = Math.round((item.count / maxVal) * 100);
            const isHovered = activeBar === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveBar(idx)}
                onMouseLeave={() => setActiveBar(null)}
                className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-8 z-30 whitespace-nowrap rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] font-mono-numbers text-teal-300 shadow-lg pointer-events-none">
                    {item.hour}: {item.count} Rx (${item.amount})
                  </div>
                )}
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[14px] rounded-t-sm transition-all duration-200 ${
                    isHovered
                      ? 'bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
                      : idx % 2 === 0
                      ? 'bg-teal-500/80 hover:bg-teal-400'
                      : 'bg-teal-600/60 hover:bg-teal-400'
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono-numbers px-1 border-t border-[#183149] pt-1.5">
          <span>08:00</span>
          <span>14:00</span>
          <span>22:00</span>
        </div>
      </div>
    </div>
  );
};
