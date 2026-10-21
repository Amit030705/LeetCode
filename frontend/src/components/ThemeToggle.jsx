import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'leecoai-theme';

export function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent('leecoai-theme-change', { detail: theme }));
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => getSavedTheme());

  useEffect(() => {
    const syncTheme = (event) => setTheme(event.detail || getSavedTheme());
    window.addEventListener('leecoai-theme-change', syncTheme);
    return () => window.removeEventListener('leecoai-theme-change', syncTheme);
  }, []);

  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
