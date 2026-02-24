import crypto from 'crypto';

import {supabaseAdmin} from '@/lib/api/supabase';

function hashIp(ip: string): string | null {
  if (!ip) return null;
  return crypto.createHmac('sha256', process.env.GUESTBOOK_HMAC_SECRET!).update(ip).digest('hex');
}

export function saveChatLog({
  userMessage,
  assistantTextPromise,
  ip,
}: {
  userMessage: string;
  assistantTextPromise: PromiseLike<string>;
  ip: string;
}) {
  const ipHash = hashIp(ip);

  assistantTextPromise.then(assistantMessage => {
    supabaseAdmin
      .from('chat_logs')
      .insert({user_message: userMessage, assistant_message: assistantMessage, ip_hash: ipHash})
      .then(({error}) => {
        if (error) console.error('[chat_logs] insert error:', error);
      });
  });
}
