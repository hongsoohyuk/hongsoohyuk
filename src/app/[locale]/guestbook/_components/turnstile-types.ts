/* eslint-disable @typescript-eslint/no-unused-vars */
export type TurnstileRenderOptions = {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  callback?: (_token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (_element: HTMLElement, _options: TurnstileRenderOptions) => string;
      reset: (_widgetId: string) => void;
      remove?: (_widgetId: string) => void;
    };
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
