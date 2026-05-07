const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileVerifyResult = {
  success: boolean;
  'error-codes': string[];
  challenge_ts?: string;
  hostname?: string;
};

/**
 * Server-side Turnstile token verification via Cloudflare siteverify API.
 */
export async function verifyTurnstileToken(token: string): Promise<{success: boolean; error?: string}> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set');
    return {success: false, error: 'Server configuration error'};
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({secret, response: token}),
    });

    if (!response.ok) {
      return {success: false, error: 'Verification service unavailable'};
    }

    const result: TurnstileVerifyResult = await response.json();

    if (!result.success) {
      console.warn('[turnstile] Verification failed:', result['error-codes']);
      return {success: false, error: 'Verification failed'};
    }

    return {success: true};
  } catch (error) {
    console.error('[turnstile] Verification error:', error);
    return {success: false, error: 'Verification request failed'};
  }
}
