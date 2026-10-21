import React, { useState } from 'react';
import { Download, Check, Share2, Smartphone, Laptop, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running in standalone mode, show subtle indicator
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        title="Install Jan Aushadhi App on Mobile or Desktop"
        className={`group relative flex items-center gap-2 rounded-xl border border-teal-600 dark:border-teal-500 bg-teal-600 dark:bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 text-white font-semibold shadow-xs transition-all duration-150 active:scale-95 ${
          compact ? 'p-2' : 'px-3.5 py-1.5 text-xs'
        }`}
      >
        <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
        {!compact && (
          <span className="tracking-tight">
            {installing ? 'Installing...' : 'Install App'}
          </span>
        )}
      </button>

      {/* Guided installation modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-800 dark:text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
                    Install Generic Rx
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Access offline & save on your home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              {isIOS ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-teal-800 dark:text-teal-300">
                    <Smartphone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>Instructions for Safari on iPhone / iPad</span>
                  </div>
                  <ol className="list-decimal space-y-2 pl-4 text-slate-600 dark:text-slate-300">
                    <li>
                      Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button <Share2 className="inline h-3.5 w-3.5 text-teal-600" /> in the Safari navigation bar.
                    </li>
                    <li>Scroll down and select <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.</li>
                    <li>Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top right corner.</li>
                  </ol>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-teal-800 dark:text-teal-300">
                    <Laptop className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>Android / Chrome / Edge</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Look for the <strong className="text-slate-900 dark:text-white">Install</strong> prompt in your browser address bar or click the browser options menu (⋮) and tap <strong className="text-slate-900 dark:text-white">Install app</strong> or <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-xs font-bold transition shadow-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
