import { useState, useEffect } from 'react';

const STORAGE_KEY = 'jan_aushadhi_theme';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        localStorage.setItem(STORAGE_KEY, 'dark');
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        localStorage.setItem(STORAGE_KEY, 'light');
      }

      // Update PWA meta theme-color tag
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#0b1120' : '#0f766e');
      }
    } catch (e) {
      console.warn('Failed to update theme preference', e);
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return { isDark, toggleDarkMode, setIsDark };
}
