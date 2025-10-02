'use client';

import React, {createContext, useContext, useEffect, useRef, useState} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  clientMounted: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  const [clientMounted, setClientMounted] = useState(false);

  // 서버에서는 기본값, 클라이언트에서는 DOM 상태 사용
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const updateTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.style.colorScheme = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  // 테마 변경 시에만 DOM과 localStorage 업데이트 (초기화 시에는 실행되지 않음)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('ThemeProvider initialized with theme:', theme);
      return; // 첫 렌더링에서는 localStorage 업데이트하지 않음
    }

    updateTheme(theme);
  }, [theme]);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (!clientMounted) {
    return (
      <ThemeContext.Provider value={{clientMounted: false, theme: 'light', toggleTheme: () => {}, setTheme: () => {}}}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{clientMounted: true, theme, toggleTheme, setTheme}}>
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
