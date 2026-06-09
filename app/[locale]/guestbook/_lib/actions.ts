'use server';

import console from 'console';

import {revalidatePath} from 'next/cache';

import {supabaseAdmin} from '@/lib/api/supabase';
import {rateLimit} from '@/lib/rate-limit';
import {getClientFingerprint} from '@/lib/security';
import {verifyTurnstileToken} from '@/lib/turnstile/verify';
import {FormActionResult} from '@/types/form';

import {schema} from './types';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function submit(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  try {
    // Rate limit per client (keyed by hashed IP — no raw IP retained)
    const {ip_hash, ua_hash} = await getClientFingerprint(process.env.GUESTBOOK_HMAC_SECRET!);
    const {success} = rateLimit(`guestbook:${ip_hash ?? 'unknown'}`, {
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    });

    if (!success) {
      return {
        status: 'error',
        issues: [{path: 'rateLimit', message: 'Guestbook.formSection.validation.rateLimited'}],
      };
    }

    // Verify Turnstile token server-side
    const turnstileToken = formData.get('turnstile_token');

    if (typeof turnstileToken !== 'string' || !turnstileToken) {
      return {
        status: 'error',
        issues: [{path: 'turnstile', message: 'Guestbook.formSection.validation.turnstileRequired'}],
      };
    }

    const turnstileResult = await verifyTurnstileToken(turnstileToken);

    if (!turnstileResult.success) {
      return {
        status: 'error',
        issues: [{path: 'turnstile', message: 'Guestbook.formSection.validation.turnstileFailed'}],
      };
    }

    const rawData = {
      author_name: formData.get('author_name'),
      message: formData.get('message'),
      emotions: formData.getAll('emotions'),
    };

    const validation = schema.safeParse(rawData);

    if (!validation.success) {
      return {
        status: 'error',
        issues: validation.error.issues.map((issue) => ({
          path: issue.path[0]?.toString(),
          message: issue.message,
        })),
      };
    }

    const {author_name, message, emotions} = validation.data;

    const {error} = await supabaseAdmin.from('guestbook').insert({
      author_name,
      message,
      ip_hash,
      ua_hash,
      emotions,
    });

    if (error) {
      console.error('Guestbook insert error:', error);
      return {
        status: 'error',
        issues: [{path: 'db', message: 'Failed to save your message. Please try again.'}],
      };
    }

    revalidatePath('/[locale]/guestbook', 'page');
    return {
      status: 'success',
      message: 'Your message has been submitted successfully!',
    };
  } catch (error) {
    console.error('Guestbook submission error:', error);
    return {
      status: 'error',
      issues: [{path: 'unknown', message: error instanceof Error ? error.message : 'An unexpected error occurred.'}],
    };
  }
}
