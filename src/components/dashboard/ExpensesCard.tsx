import React, { useState } from 'react';
import { ChevronRight, ArrowDownRight, Wallet } from 'lucide-react';

interface ExpensesCardProps {
  amount: number;
}

export const ExpensesCard: React.FC<ExpensesCardProps> = ({ amount }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const months = [
    { label: 'Jan', val: 58, cost: '$5.8k' },
    { label: 'Feb', val: 72, cost: '$7.2k' },
    { label: 'Mar', val: 64, cost: '$6.4k' },
    { label: 'Apr', val: 85, cost: '$8.5k' },
    { label: 'May', val: 92, cost: '$9.2k' },
    { label: 'Jun', val: 78, cost: '$7.8k' },
    { label: 'Jul', val: 88, cost: '$8.8k' },
    { label: 'Aug', val: 62, cost: '$6.2k' },
    { label: 'Sep', val: 95, cost: '$9.5k' },
    { label: 'Oct', val: 70, cost: '$7.0k' },
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#183149] bg-gradient-to-b from-[#112334] to-[#0d1c2b] p-4 sm:p-5 shadow-sm">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 tracking-wide uppercase text-[11px]">
            Operating Expenses
          </span>
          <button className="flex items-center gap-0.5 text-teal-400 hover:text-teal-300 font-medium transition text-[11px]">
            <span>Current Year</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono-numbers text-slate-100 tracking-tight">
            ${amount.toLocaleString('en-US')}
          </span>
          <span className="flex items-center text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
            Procurement
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Wholesale stock replenishment & cold-chain
        </p>
      </div>

      {/* Multi-bar sparkline graph */}
      <div className="mt-5">
        <div className="h-20 flex items-end justify-between gap-1 sm:gap-1.5 px-1">
          {months.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
              >
                {isHovered && (
                  <div className="absolute -top-8 z-30 whitespace-nowrap rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] font-mono-numbers text-teal-300 shadow-lg pointer-events-none">
                    {item.label}: {item.cost}
                  </div>
                )}
                <div
                  style={{ height: `${item.val}%` }}
                  className={`w-full max-w-[12px] rounded-t-sm transition-all duration-200 ${
                    isHovered
                      ? 'bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                      : 'bg-gradient-to-t from-teal-700/60 to-cyan-500/70 hover:from-teal-600 hover:to-cyan-400'
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono-numbers px-1 border-t border-[#183149] pt-1.5">
          <span>Q1</span>
          <span>Q2</span>
          <span>Q3</span>
          <span>Q4</span>
        </div>
      </div>
    </div>
  );
};
