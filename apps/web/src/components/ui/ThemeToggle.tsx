'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md flex items-center justify-center p-2">
        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
      </div>
    );
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center relative w-9 h-9"
      aria-label="Toggle theme"
    >
      <Sun className={`absolute h-5 w-5 transition-all text-slate-500 dark:text-slate-400 ${isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-5 w-5 transition-all text-slate-500 dark:text-slate-400 ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
