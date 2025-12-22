'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {TURNSTILE_SITE_KEY} from '../config/constant';

export type TurnstileRenderOptions = {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  callback?(token: string): void;
  'expired-callback'?(): void;
  'error-callback'?(errorCode?: string): void;
  'timeout-callback'?(): void;
};

export type UseTurnstileOptions = {
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  onSuccess?(token: string): void;
  onExpired?(): void;
  onError?(errorCode?: string): void;
  onTimeout?(): void;
};

export const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
export const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileWindow extends Window {
  turnstile?: {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
    getResponse: (widgetId?: string) => string | undefined;
    isExpired: (widgetId?: string) => boolean;
  };
}

export type TurnstileError = {
  code?: string;
  message: string;
} | null;

export function useTurnstile({
  theme = 'auto',
  size = 'flexible',
  onSuccess,
  onExpired,
  onError,
  onTimeout,
}: UseTurnstileOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<TurnstileError>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existingScript) {
      if ((window as TurnstileWindow).turnstile) {
        setScriptReady(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptReady(true);
      setError(null);
    };

    script.onerror = () => {
      const scriptError: TurnstileError = {
        code: 'script_load_failed',
        message: 'Failed to load Turnstile script. Please check your internet connection.',
      };
      setError(scriptError);
      onError?.('script_load_failed');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onError]);

  useEffect(() => {
    if (!scriptReady || !TURNSTILE_SITE_KEY || !ref.current) return;

    const turnstile = (window as TurnstileWindow).turnstile;
    if (!turnstile) return;

    setError(null);

    try {
      const widgetId = turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme,
        size,
        callback: (token: string) => {
          setError(null);
          onSuccess?.(token);
        },
        'expired-callback': () => {
          const expiredError: TurnstileError = {
            code: 'expired',
            message: 'Verification expired. Please try again.',
          };
          setError(expiredError);
          onExpired?.();
        },
        'error-callback': (errorCode?: string) => {
          const errorMessages: Record<string, string> = {
            'invalid-input-response': 'Invalid verification response. Please try again.',
            'invalid-input-secret': 'Invalid site key. Please contact support.',
            'timeout-or-duplicate': 'Verification timeout or duplicate. Please try again.',
            'internal-error': 'Internal error occurred. Please try again later.',
          };

          const errorMessage =
            errorCode && errorMessages[errorCode] ? errorMessages[errorCode] : 'Verification failed. Please try again.';

          const turnstileError: TurnstileError = {
            code: errorCode,
            message: errorMessage,
          };
          setError(turnstileError);
          onError?.(errorCode);
        },
        'timeout-callback': () => {
          const timeoutError: TurnstileError = {
            code: 'timeout',
            message: 'Verification timeout. Please try again.',
          };
          setError(timeoutError);
          onTimeout?.();
        },
      });

      widgetIdRef.current = widgetId;
    } catch (renderError) {
      const renderErrorState: TurnstileError = {
        code: 'render_failed',
        message: 'Failed to render Turnstile widget. Please refresh the page.',
      };
      setError(renderErrorState);
      onError?.('render_failed');
    }

    return () => {
      if (widgetIdRef.current && turnstile) {
        try {
          turnstile.remove(widgetIdRef.current);
        } catch (removeError) {
          console.error('Failed to remove Turnstile widget:', removeError);
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, ref]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    const turnstile = (window as TurnstileWindow).turnstile;
    if (turnstile && widgetIdRef.current) {
      turnstile.reset(widgetIdRef.current);
      setError(null);
    }
  }, []);

  const getResponse = useCallback((widgetId?: string) => {
    const turnstile = (window as TurnstileWindow).turnstile;
    if (!turnstile) return undefined;
    return turnstile.getResponse(widgetId || widgetIdRef.current || undefined);
  }, []);

  const isExpired = useCallback((widgetId?: string) => {
    const turnstile = (window as TurnstileWindow).turnstile;
    if (!turnstile) return true;
    return turnstile.isExpired(widgetId || widgetIdRef.current || undefined);
  }, []);

  return {
    ref,
    scriptReady,
    error,
    resetError,
    reset,
    getResponse,
    isExpired,
  };
}
