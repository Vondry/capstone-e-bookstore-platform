import { useEffect, useState } from 'react';
import { Asleep, Light } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

function readStoredTheme(): 'light' | 'dark' | null {
  try {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  // Check localStorage first, then system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = readStoredTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored ?? (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page only
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex h-48 w-48 items-center justify-center rounded-none',
        'text-text-primary transition-colors',
        'hover:bg-layer-2',
        'focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden'
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      type="button"
    >
      {theme === 'dark' ? (
        <Light size={20} aria-hidden="true" />
      ) : (
        <Asleep size={20} aria-hidden="true" />
      )}
    </button>
  );
}
