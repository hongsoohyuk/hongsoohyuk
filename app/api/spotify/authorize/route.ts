const SCOPES = ['user-top-read', 'user-read-recently-played'].join(' ');

export function GET() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI ?? '',
  });

  return Response.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
