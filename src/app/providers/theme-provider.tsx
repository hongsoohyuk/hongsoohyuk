'use client';

import {ThemeProvider as NextThemesProvider, useTheme as useNextTheme} from 'next-themes';
import {useCallback, useEffect, useMemo, useState, type ReactNode} from 'react';

type Theme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const nextTheme = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const resolvedTheme = useMemo(() => {
    const theme = nextTheme.resolvedTheme ?? nextTheme.theme ?? 'light';
    return (theme === 'dark' ? 'dark' : 'light') as Theme;
  }, [nextTheme.resolvedTheme, nextTheme.theme]);

  const setTheme = useCallback(
    (value: Theme | ((prev: Theme) => Theme)) => {
      const nextValue = typeof value === 'function' ? value(resolvedTheme) : value;
      nextTheme.setTheme(nextValue);
    },
    [nextTheme, resolvedTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  return {
    clientMounted: mounted,
    theme: resolvedTheme,
    toggleTheme,
    setTheme,
    systemTheme: nextTheme.systemTheme,
  };
}
