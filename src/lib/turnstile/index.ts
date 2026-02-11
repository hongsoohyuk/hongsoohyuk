/**
 * Shared Turnstile Module
 *
 * Public API for Cloudflare Turnstile integration.
 * Following FSD principles - only export what's needed externally.
 *
 * @see https://developers.cloudflare.com/turnstile/
 */

// UI Components
export {Turnstile, type TurnstileProps} from './ui/Turnstile';

// Hooks
export {
  TURNSTILE_SCRIPT_ID,
  TURNSTILE_SCRIPT_SRC,
  useTurnstile,
  type TurnstileError,
  type UseTurnstileOptions,
} from './lib/useTurnstile';

// Types
export type {TurnstileRenderOptions} from './lib/useTurnstile';
