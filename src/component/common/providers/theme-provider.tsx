'use client';

import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  clientMounted: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  const [clientMounted, setClientMounted] = useState(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.style.colorScheme = newTheme;
    localStorage.setItem('theme', newTheme);
  }, []);

  const getStoredTheme = useCallback((): Theme => {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // 서버에서는 기본값, 클라이언트에서는 저장된 상태 사용
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return getStoredTheme();
  });

  // 초기 마운트 시 DOM 클래스와 상태를 동기화
  useEffect(() => {
    const initialTheme = getStoredTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setClientMounted(true);
  }, [applyTheme, getStoredTheme]);

  // 테마 변경 시 DOM + localStorage 반영
  useEffect(() => {
    if (!clientMounted) return;
    applyTheme(theme);
  }, [applyTheme, clientMounted, theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  if (!clientMounted) {
    return (
      <ThemeContext.Provider
        value={{clientMounted: false, theme: 'light', toggleTheme: () => {}, setTheme: () => undefined}}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{clientMounted: true, theme, toggleTheme, setTheme: setThemeState}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
