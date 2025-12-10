'use client';

import {ThemeProvider} from './theme-provider';
import QueryProvider from './query-provider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({children}: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
