import {useCallback, useEffect, useRef, useState} from 'react';
import {UseFormClearErrors, UseFormSetError, UseFormSetValue} from 'react-hook-form';
import {FormValues} from './guestbook-types';
import {TURNSTILE_SITE_KEY, TURNSTILE_SRC} from './turnstile-types';

type UseTurnstileOptions = {
  open: boolean;
  setValue: UseFormSetValue<FormValues>;
  clearErrors: UseFormClearErrors<FormValues>;
  setError: UseFormSetError<FormValues>;
  errorMessage: string;
  onStatusChange?: (status: {type: 'success' | 'error'; message: string} | null) => void;
};

export function useTurnstile({
  open,
  setValue,
  clearErrors,
  setError,
  errorMessage,
  onStatusChange,
}: UseTurnstileOptions) {
  const [scriptReady, setScriptReady] = useState(false);
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRenderingRef = useRef(false);

  // Load Turnstile script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }
    const existing = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true), {once: true});
      return;
    }
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.id = 'cf-turnstile-script';
    script.addEventListener('load', () => setScriptReady(true));
    document.body.appendChild(script);
  }, []);

  // Memoized callbacks to prevent infinite re-renders
  const handleSuccess = useCallback(
    (token: string) => {
      console.log('[Turnstile] Token received successfully');
      setValue('turnstileToken', token, {shouldValidate: true});
      clearErrors('turnstileToken');
      onStatusChange?.(null);
    },
    [setValue, clearErrors, onStatusChange],
  );

  const handleExpired = useCallback(() => {
    console.warn('[Turnstile] Token expired');
    setValue('turnstileToken', '');
    setError('turnstileToken', {type: 'expired', message: errorMessage});
  }, [setValue, setError, errorMessage]);

  const handleError = useCallback(() => {
    console.error('[Turnstile] Error occurred - check site key and domain configuration');
    setValue('turnstileToken', '');
    setError('turnstileToken', {type: 'manual', message: errorMessage});
  }, [setValue, setError, errorMessage]);

  // Store callbacks in ref to avoid dependency issues
  const callbacksRef = useRef({handleSuccess, handleExpired, handleError});

  useEffect(() => {
    callbacksRef.current = {handleSuccess, handleExpired, handleError};
  }, [handleSuccess, handleExpired, handleError]);

  // Render Turnstile widget only when modal opens
  useEffect(() => {
    // Clean up when modal closes
    if (!open) {
      if (widgetIdRef.current && window.turnstile?.remove) {
        console.log('[Turnstile] Modal closed, removing widget:', widgetIdRef.current);
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        isRenderingRef.current = false;
      }
      return;
    }

    // Prevent rendering if conditions not met
    if (!scriptReady || !containerRef.current || !TURNSTILE_SITE_KEY) {
      return;
    }

    if (!window.turnstile) {
      console.error('[Turnstile] Turnstile API not available');
      return;
    }

    // Prevent duplicate rendering - widget already exists
    if (widgetIdRef.current) {
      console.log('[Turnstile] Widget already rendered, skipping');
      return;
    }

    // Prevent concurrent rendering attempts
    if (isRenderingRef.current) {
      console.log('[Turnstile] Widget rendering in progress, skipping');
      return;
    }

    isRenderingRef.current = true;

    try {
      console.log('[Turnstile] Rendering widget with site key:', TURNSTILE_SITE_KEY);
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
        callback: (token: string) => callbacksRef.current.handleSuccess(token),
        'expired-callback': () => callbacksRef.current.handleExpired(),
        'error-callback': () => callbacksRef.current.handleError(),
      });
      console.log('[Turnstile] Widget rendered with ID:', widgetIdRef.current);
    } catch (error) {
      console.error('[Turnstile] Failed to render widget:', error);
      isRenderingRef.current = false;
    }
  }, [open, scriptReady]);

  return {
    scriptReady,
    containerRef,
    siteKey: TURNSTILE_SITE_KEY,
  };
}
