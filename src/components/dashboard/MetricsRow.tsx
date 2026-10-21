import React from 'react';
import { PharmacyMetrics } from '../../types/pharmacy';
import { DollarSign, FileText, PackageCheck, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface MetricsRowProps {
  metrics: PharmacyMetrics;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics }) => {
  const items = [
    {
      label: 'Daily Rev',
      value: `$${metrics.dailyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'Today Rx',
      icon: DollarSign,
      color: 'text-teal-300',
    },
    {
      label: 'Active Rx',
      value: metrics.activePrescriptions.toString(),
      sub: 'To Dispense',
      icon: FileText,
      color: 'text-sky-300',
    },
    {
      label: 'In Stock',
      value: metrics.inStockItems.toLocaleString(),
      sub: 'Units',
      icon: PackageCheck,
      color: 'text-emerald-300',
    },
    {
      label: 'Low Stock',
      value: metrics.lowStockItems.toString(),
      sub: 'Reorder',
      icon: AlertTriangle,
      color: 'text-amber-300',
    },
    {
      label: 'Expiring',
      value: metrics.expiringItems.toString(),
      sub: '< 90 Days',
      icon: Clock,
      color: 'text-rose-300',
    },
    {
      label: 'Dispensed',
      value: metrics.dispensedToday.toLocaleString(),
      sub: 'Completed',
      icon: CheckCircle,
      color: 'text-teal-300',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex flex-col items-center justify-center rounded-xl border border-[#183149] bg-[#0d1d2c]/80 p-2.5 sm:p-3 text-center hover:border-teal-500/30 transition shadow-xs"
          >
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 truncate w-full">
              {item.label}
            </span>
            <span className={`text-base sm:text-lg font-bold font-mono-numbers ${item.color}`}>
              {item.value}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {item.sub}
            </span>
          </div>
        );
      })}
    </div>
  );
};
