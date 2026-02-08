import {renderHook} from '@testing-library/react';

import {useIntersectionObserver} from '../use-intersection-observer';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
let observerCallback: IntersectionObserverCallback;

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  global.IntersectionObserver = jest.fn((callback) => {
    observerCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: jest.fn(),
    };
  });
});

describe('useIntersectionObserver', () => {
  it('returns a ref object', () => {
    const onIntersect = jest.fn();
    const {result} = renderHook(() =>
      useIntersectionObserver({onIntersect}),
    );
    expect(result.current).toHaveProperty('current');
  });

  it('does not observe when enabled is false', () => {
    const onIntersect = jest.fn();
    renderHook(() =>
      useIntersectionObserver({onIntersect, enabled: false}),
    );
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('does not observe when ref has no target element', () => {
    const onIntersect = jest.fn();
    renderHook(() =>
      useIntersectionObserver({onIntersect}),
    );
    // ref.current is null by default, so observe should not be called
    expect(mockObserve).not.toHaveBeenCalled();
  });
});
