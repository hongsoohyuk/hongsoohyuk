import {NextRequest} from 'next/server';

import {supabaseAdmin} from '@/lib/api/supabase';

const CREDENTIALS_ROW_ID = 1;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) return new Response(`Authorization failed: ${error ?? 'no code'}`, {status: 400});

  const clientId = process.env.SPOTIFY_CLIENT_ID ?? '';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? '';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? '';

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(`Token exchange failed: ${text}`, {status: 500});
  }

  const data = await res.json();

  if (!data.refresh_token) {
    return new Response('Spotify did not return a refresh_token', {status: 500});
  }

  const {error: dbError} = await supabaseAdmin
    .from('spotify_credentials')
    .upsert({id: CREDENTIALS_ROW_ID, refresh_token: data.refresh_token}, {onConflict: 'id'});

  if (dbError) {
    console.error('[spotify/callback] failed to persist refresh_token:', dbError);
    return new Response(`Failed to save refresh_token: ${dbError.message}`, {status: 500});
  }

  return new Response(
    `<html>
      <body style="font-family:monospace;padding:2rem;background:#111;color:#fff">
        <h2>Spotify connected!</h2>
        <p>Refresh token has been saved to the database.</p>
        <p style="color:#888">You can close this page.</p>
      </body>
    </html>`,
    {headers: {'Content-Type': 'text/html; charset=utf-8'}},
  );
}
