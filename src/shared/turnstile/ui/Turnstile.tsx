'use client';

import {useTurnstile} from '../lib/useTurnstile';

/**
 * Turnstile Widget Props
 */
export type TurnstileProps = {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  action?: string;
  cData?: string;
  onSuccess?: (token: string) => void; // eslint-disable-line no-unused-vars
  onExpired?: () => void;
  onError?: (errorCode?: string) => void; // eslint-disable-line no-unused-vars
  onTimeout?: () => void;
  enabled?: boolean;
  className?: string;
  loadingText?: string;
  errorText?: string;
};

/**
 * Turnstile Widget Component
 *
 * A reusable Cloudflare Turnstile widget component following FSD principles.
 * Provides a clean UI layer for bot protection.
 *
 * Based on Cloudflare Turnstile documentation:
 * @see https://developers.cloudflare.com/turnstile/
 *
 * @example
 * ```tsx
 * <Turnstile
 *   sitekey="your-site-key"
 *   onSuccess={(token) => setValue('turnstileToken', token)}
 *   onExpired={() => setValue('turnstileToken', '')}
 *   theme="auto"
 * />
 * ```
 */
export function Turnstile({
  sitekey,
  theme = 'auto',
  size = 'normal',
  action,
  cData,
  onSuccess,
  onExpired,
  onError,
  onTimeout,
  enabled = true,
  className,
  loadingText = 'Loading verification...',
  errorText,
}: TurnstileProps) {
  const {containerRef, scriptReady} = useTurnstile({
    sitekey,
    enabled,
    theme,
    size,
    action,
    cData,
    onSuccess,
    onExpired,
    onError,
    onTimeout,
  });

  return (
    <div className={className}>
      <div ref={containerRef} className="min-h-16">
        {!sitekey && errorText && <span className="text-sm text-muted-foreground">{errorText}</span>}
        {sitekey && !scriptReady && <span className="text-sm text-muted-foreground">{loadingText}</span>}
      </div>
    </div>
  );
}

export default Turnstile;
