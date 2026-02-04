'use server';

import console from 'console';

import {revalidatePath} from 'next/cache';

import {supabaseAdmin} from '@/lib/api/supabase';
import {getClientFingerprint} from '@/lib/security';
import {FormActionResult} from '@/types/form';

import {schema} from '../model/validation';

export async function submit(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  try {
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

    const {ip_hash, ua_hash} = await getClientFingerprint(process.env.GUESTBOOK_HMAC_SECRET!);

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

    revalidatePath('/guestbook');
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
