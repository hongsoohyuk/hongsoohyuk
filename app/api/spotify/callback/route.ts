import {NextRequest} from 'next/server';

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

  // refresh_token을 화면에 표시 → .env.local에 복사
  return new Response(
    `<html>
      <body style="font-family:monospace;padding:2rem;background:#111;color:#fff">
        <h2>Spotify 연동 성공!</h2>
        <p>아래 refresh token을 <code>.env.local</code>에 추가하세요:</p>
        <pre style="background:#222;padding:1rem;border-radius:8px;word-break:break-all">SPOTIFY_REFRESH_TOKEN=${data.refresh_token}</pre>
        <p style="color:#888">이 페이지를 닫고, 서버를 재시작하면 연동이 완료됩니다.</p>
      </body>
    </html>`,
    {headers: {'Content-Type': 'text/html'}},
  );
}
