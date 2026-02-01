'use client';

import {MoonIcon, SunIcon, LoaderCircleIcon} from 'lucide-react';

import {useTheme} from '@/app/providers/theme-provider';

import {Button} from '@/shared/ui/button';

import CaseRenderer from './case-renderer';

export function ThemeSwitch() {
  const {clientMounted, theme, toggleTheme} = useTheme();

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 px-0">
      {clientMounted ? (
        <CaseRenderer
          value={theme}
          cases={{
            dark: <MoonIcon className="h-4 w-4 transition-all" />,
            light: <SunIcon className="h-4 w-4 transition-all" />,
          }}
        />
      ) : (
        <LoaderCircleIcon className="h-4 w-4 color-foreground transition-all animate-spin" />
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  );
}
