import {useCallback, useEffect, useRef, useState} from 'react';
import {UseFormClearErrors, UseFormSetError, UseFormSetValue} from 'react-hook-form';
import {TURNSTILE_SITE_KEY, TURNSTILE_SRC} from '../lib/turnstile-constants';
import {FormValues, StatusMessage} from '../model/types';

type UseTurnstileOptions = {
  open: boolean;
  setValue: UseFormSetValue<FormValues>;
  clearErrors: UseFormClearErrors<FormValues>;
  setError: UseFormSetError<FormValues>;
  errorMessage: string;
  onStatusChange?: (status: StatusMessage) => void; // eslint-disable-line no-unused-vars
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
      setValue('turnstileToken', token, {shouldValidate: true});
      clearErrors('turnstileToken');
      onStatusChange?.(null);
    },
    [setValue, clearErrors, onStatusChange],
  );

  const handleExpired = useCallback(() => {
    setValue('turnstileToken', '');
    setError('turnstileToken', {type: 'expired', message: errorMessage});
  }, [setValue, setError, errorMessage]);

  const handleError = useCallback(() => {
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
    if (!open) {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        isRenderingRef.current = false;
      }
      return;
    }

    if (!scriptReady || !containerRef.current || !TURNSTILE_SITE_KEY) {
      return;
    }

    if (!window.turnstile) {
      return;
    }

    if (widgetIdRef.current || isRenderingRef.current) {
      return;
    }

    isRenderingRef.current = true;

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
        callback: (token: string) => callbacksRef.current.handleSuccess(token),
        'expired-callback': () => callbacksRef.current.handleExpired(),
        'error-callback': () => callbacksRef.current.handleError(),
      });
    } catch {
      isRenderingRef.current = false;
    }
  }, [open, scriptReady]);

  return {
    scriptReady,
    containerRef,
    siteKey: TURNSTILE_SITE_KEY,
  };
}
