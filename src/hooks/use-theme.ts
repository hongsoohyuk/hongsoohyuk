'use client';

import {useEffect, useState} from 'react';

import {useTheme as useNextTheme} from 'next-themes';

type Theme = 'light' | 'dark';

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
