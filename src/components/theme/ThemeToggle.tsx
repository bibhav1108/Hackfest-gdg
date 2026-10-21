import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to eye-friendly dark mode'}
      className={`relative inline-flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all duration-200 active:scale-95 shadow-2xs ${
        isDark
          ? 'bg-slate-800/90 border-slate-700 text-amber-300 hover:bg-slate-700/80 hover:text-amber-200 hover:border-slate-600'
          : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 text-slate-600" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold hidden md:inline">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
