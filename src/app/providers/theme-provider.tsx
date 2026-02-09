'use client';

import {useEffect, useState, type ReactNode} from 'react';

import {ThemeProvider as NextThemesProvider, useTheme as useNextTheme} from 'next-themes';

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

  const resolvedTheme = (() => {
    const theme = nextTheme.resolvedTheme ?? nextTheme.theme ?? 'light';
    return (theme === 'dark' ? 'dark' : 'light') as Theme;
  })();

  const setTheme = (value: Theme | ((prev: Theme) => Theme)) => {
    const nextValue = typeof value === 'function' ? value(resolvedTheme) : value;
    nextTheme.setTheme(nextValue);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return {
    clientMounted: mounted,
    theme: resolvedTheme,
    toggleTheme,
    setTheme,
    systemTheme: nextTheme.systemTheme,
  };
}
