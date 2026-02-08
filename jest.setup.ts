import '@testing-library/jest-dom';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (n: number) => String(n),
    relativeTime: (date: Date) => date.toISOString(),
  }),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({resolvedTheme: 'light', theme: 'light', setTheme: jest.fn()}),
}));

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
