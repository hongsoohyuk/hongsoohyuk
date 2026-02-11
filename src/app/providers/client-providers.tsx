'use client';

import QueryProvider from './query-provider';
import {ThemeProvider} from './theme-provider';

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
