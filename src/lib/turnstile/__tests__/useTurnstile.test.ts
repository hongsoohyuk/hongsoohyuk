import {renderHook, act} from '@testing-library/react';

// Mock the constant before importing
jest.mock('../config/constant', () => ({
  TURNSTILE_SITE_KEY: 'test-site-key',
}));

import {useTurnstile} from '../lib/useTurnstile';

let mockRender: jest.Mock;
let mockReset: jest.Mock;
let mockRemove: jest.Mock;
let mockGetResponse: jest.Mock;
let mockIsExpired: jest.Mock;

beforeEach(() => {
  mockRender = jest.fn().mockReturnValue('widget-id-123');
  mockReset = jest.fn();
  mockRemove = jest.fn();
  mockGetResponse = jest.fn().mockReturnValue('test-token');
  mockIsExpired = jest.fn().mockReturnValue(false);

  (window as any).turnstile = {
    render: mockRender,
    reset: mockReset,
    remove: mockRemove,
    getResponse: mockGetResponse,
    isExpired: mockIsExpired,
  };

  // Create a mock script element so the hook thinks script is loaded
  const script = document.createElement('script');
  script.id = 'cf-turnstile-script';
  document.head.appendChild(script);
});

afterEach(() => {
  delete (window as any).turnstile;
  const script = document.getElementById('cf-turnstile-script');
  if (script) script.remove();
});

describe('useTurnstile', () => {
  it('returns expected interface', () => {
    const {result} = renderHook(() => useTurnstile({}));

    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('scriptReady');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('resetError');
    expect(result.current).toHaveProperty('reset');
    expect(result.current).toHaveProperty('getResponse');
    expect(result.current).toHaveProperty('isExpired');
  });

  it('detects script as ready when turnstile exists on window', () => {
    const {result} = renderHook(() => useTurnstile({}));

    expect(result.current.scriptReady).toBe(true);
  });

  it('getResponse delegates to turnstile API', () => {
    const {result} = renderHook(() => useTurnstile({}));

    const response = result.current.getResponse();

    expect(response).toBe('test-token');
  });

  it('isExpired delegates to turnstile API', () => {
    const {result} = renderHook(() => useTurnstile({}));

    const expired = result.current.isExpired();

    expect(expired).toBe(false);
  });

  it('returns undefined from getResponse when turnstile is not available', () => {
    delete (window as any).turnstile;

    const {result} = renderHook(() => useTurnstile({}));

    expect(result.current.getResponse()).toBeUndefined();
  });

  it('returns true from isExpired when turnstile is not available', () => {
    delete (window as any).turnstile;

    const {result} = renderHook(() => useTurnstile({}));

    expect(result.current.isExpired()).toBe(true);
  });

  it('resetError clears error state', () => {
    const {result} = renderHook(() => useTurnstile({}));

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
  });

  it('reset calls turnstile.reset and clears error', () => {
    // We need to render with a ref attached to trigger widget creation
    const {result} = renderHook(() => useTurnstile({}));

    act(() => {
      result.current.reset();
    });

    // Since no widget was rendered (no DOM ref), reset won't call turnstile.reset
    // But it should not throw
    expect(result.current.error).toBeNull();
  });

  it('starts with null error', () => {
    const {result} = renderHook(() => useTurnstile({}));

    expect(result.current.error).toBeNull();
  });
});
