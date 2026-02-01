import crypto from 'crypto';

import {headers} from 'next/headers';

function createHmacHash(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') ?? '';
  return forwardedFor.split(',')[0].trim();
}

async function getClientUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') ?? '';
}

export interface ClientFingerprint {
  ip_hash: string | null;
  ua_hash: string | null;
}

export async function getClientFingerprint(secret: string): Promise<ClientFingerprint> {
  const ip = await getClientIp();
  const ua = await getClientUserAgent();

  return {
    ip_hash: ip ? createHmacHash(ip, secret) : null,
    ua_hash: ua ? createHmacHash(ua, secret) : null,
  };
}
