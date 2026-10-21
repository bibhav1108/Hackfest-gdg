import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-2xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
      <span className="flex h-2.5 w-2.5 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
      </span>
      <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <span>Offline Mode — Cached medicine database available</span>
      <button 
        onClick={() => window.location.reload()} 
        className="ml-1 inline-flex items-center gap-1 rounded-lg bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 transition"
      >
        <RefreshCw className="h-3 w-3" /> Retry
      </button>
    </div>
  );
};
