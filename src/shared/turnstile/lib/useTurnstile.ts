import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Turnstile Render Options
 * Based on Cloudflare Turnstile API
 * @see https://developers.cloudflare.com/turnstile/
 */
export type TurnstileRenderOptions = {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  action?: string;
  cData?: string;
  callback?: (token: string) => void; // eslint-disable-line no-unused-vars
  'expired-callback'?: () => void;
  'error-callback'?: (errorCode?: string) => void; // eslint-disable-line no-unused-vars
  'timeout-callback'?: () => void;
  'before-interactive-callback'?: () => void;
  'after-interactive-callback'?: () => void;
  'unsupported-callback'?: () => void;
};

/**
 * Turnstile API Global Interface
 */
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: TurnstileRenderOptions) => string; // eslint-disable-line no-unused-vars
      reset: (widgetId: string) => void; // eslint-disable-line no-unused-vars
      remove: (widgetId: string) => void; // eslint-disable-line no-unused-vars
      getResponse: (widgetId: string) => string | undefined; // eslint-disable-line no-unused-vars
      isExpired: (widgetId: string) => boolean; // eslint-disable-line no-unused-vars
      execute: (container: HTMLElement | string, options?: Partial<TurnstileRenderOptions>) => void; // eslint-disable-line no-unused-vars
      ready: (callback: () => void) => void; // eslint-disable-line no-unused-vars
    };
  }
}

/**
 * Turnstile Script Source
 */
export const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
export const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

/**
 * useTurnstile Hook Options
 */
export type UseTurnstileOptions = {
  sitekey: string;
  enabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  action?: string;
  cData?: string;
  onSuccess?: (token: string) => void; // eslint-disable-line no-unused-vars
  onExpired?: () => void;
  onError?: (errorCode?: string) => void; // eslint-disable-line no-unused-vars
  onTimeout?: () => void;
};

/**
 * useTurnstile Hook
 *
 * Manages Turnstile widget lifecycle following FSD principles.
 * Handles script loading, widget rendering, and cleanup.
 *
 * Based on Cloudflare Turnstile documentation:
 * @see https://developers.cloudflare.com/turnstile/
 *
 * @param options - Configuration options for Turnstile
 * @returns Object containing containerRef, scriptReady state, and widget management functions
 *
 * @example
 * ```tsx
 * const { containerRef, scriptReady, reset } = useTurnstile({
 *   sitekey: 'your-site-key',
 *   onSuccess: (token) => console.log('Token:', token),
 *   enabled: true
 * });
 *
 * return <div ref={containerRef} />;
 * ```
 */
export function useTurnstile({
  sitekey,
  enabled = true,
  theme = 'auto',
  size = 'normal',
  action,
  cData,
  onSuccess,
  onExpired,
  onError,
  onTimeout,
}: UseTurnstileOptions) {
  const [scriptReady, setScriptReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderingRef = useRef(false);

  // Memoize callbacks to prevent unnecessary re-renders
  const callbacksRef = useRef({onSuccess, onExpired, onError, onTimeout});

  useEffect(() => {
    callbacksRef.current = {onSuccess, onExpired, onError, onTimeout};
  }, [onSuccess, onExpired, onError, onTimeout]);

  /**
   * Load Turnstile script
   * Follows the pattern from Cloudflare documentation for explicit rendering
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script already loaded
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }

    // Check if script element already exists
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true), {once: true});
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.id = TURNSTILE_SCRIPT_ID;
    script.addEventListener('load', () => setScriptReady(true));
    script.addEventListener('error', () => {
      console.error('[Turnstile] Failed to load script');
    });

    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount as it may be used by other components
    };
  }, []);

  /**
   * Render Turnstile widget
   * Implements explicit rendering pattern from Cloudflare documentation
   */
  useEffect(() => {
    // Don't render if disabled
    if (!enabled) {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      isRenderingRef.current = false;
      return;
    }

    // Wait for prerequisites
    if (!scriptReady || !containerRef.current || !sitekey) return;
    if (!window.turnstile) return;
    if (widgetIdRef.current || isRenderingRef.current) return;

    isRenderingRef.current = true;

    try {
      // Render widget with callbacks
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        theme,
        size,
        action,
        cData,
        callback: (token: string) => {
          callbacksRef.current.onSuccess?.(token);
        },
        'expired-callback': () => {
          callbacksRef.current.onExpired?.();
        },
        'error-callback': (errorCode?: string) => {
          callbacksRef.current.onError?.(errorCode);
        },
        'timeout-callback': () => {
          callbacksRef.current.onTimeout?.();
        },
      });
    } catch (error) {
      console.error('[Turnstile] Render error:', error);
      isRenderingRef.current = false;
    }
  }, [enabled, scriptReady, sitekey, theme, size, action, cData]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      isRenderingRef.current = false;
    };
  }, []);

  /**
   * Reset widget
   * Useful for form resubmission scenarios
   */
  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  /**
   * Get current token without callback
   */
  const getResponse = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.getResponse) {
      return window.turnstile.getResponse(widgetIdRef.current);
    }
    return undefined;
  }, []);

  /**
   * Check if token is expired
   */
  const isExpired = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.isExpired) {
      return window.turnstile.isExpired(widgetIdRef.current);
    }
    return false;
  }, []);

  return {
    containerRef,
    scriptReady,
    widgetId: widgetIdRef.current,
    reset,
    getResponse,
    isExpired,
  };
}
