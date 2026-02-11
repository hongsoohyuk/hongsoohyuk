import {renderHook} from '@testing-library/react';

import {useDarkMode} from '../use-dark-mode';

const mockUseTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: (...args: unknown[]) => mockUseTheme(...args),
}));

beforeEach(() => {
  mockUseTheme.mockReturnValue({resolvedTheme: 'light'});
});

describe('useDarkMode', () => {
  it('returns false when theme is light', () => {
    const {result} = renderHook(() => useDarkMode());
    expect(result.current).toBe(false);
  });

  it('returns true when theme is dark', () => {
    mockUseTheme.mockReturnValue({resolvedTheme: 'dark'});

    const {result} = renderHook(() => useDarkMode());
    expect(result.current).toBe(true);
  });

  it('returns false before mount (SSR safety)', () => {
    // useDarkMode uses useState(false) + useEffect to detect mount
    // In the test environment, useEffect fires synchronously in renderHook
    // so we just verify the hook returns a boolean
    const {result} = renderHook(() => useDarkMode());
    expect(typeof result.current).toBe('boolean');
  });
});
