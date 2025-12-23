'use client';

import {TURNSTILE_SITE_KEY} from '../config/constant';
import {useTurnstile} from '../lib/useTurnstile';

export type TurnstileProps = {
  onSuccess?(token: string): void;
  onExpired?(): void;
  onError?(errorCode?: string): void;
  onTimeout?(): void;
  size?: 'normal' | 'compact' | 'flexible';
};

export function Turnstile({onSuccess, onExpired, onError, onTimeout, size = 'flexible'}: TurnstileProps = {}) {
  const {ref, scriptReady, error} = useTurnstile({
    onSuccess,
    onExpired,
    onError,
    onTimeout,
    size,
  });

  return (
    <div ref={ref}>
      {!TURNSTILE_SITE_KEY && (
        <span className="text-sm text-muted-foreground">
          Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable verification.
        </span>
      )}
      {TURNSTILE_SITE_KEY && !scriptReady && !error && (
        <span className="text-sm text-muted-foreground">Loading verification...</span>
      )}
      {error && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-red-500">{error.message}</span>
        </div>
      )}
    </div>
  );
}
