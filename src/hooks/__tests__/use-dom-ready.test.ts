import {renderHook} from '@testing-library/react';

import {useDomReady} from '../use-dom-ready';

describe('useDomReady', () => {
  it('returns true after mount (useEffect fires)', () => {
    const {result} = renderHook(() => useDomReady());
    // After renderHook completes, useEffect has fired
    expect(result.current).toBe(true);
  });
});
