import {supabaseAdmin} from '@/lib/api/supabase';
import type {components} from '@/types/spotify';

type TrackObject = components['schemas']['TrackObject'];
type ArtistObject = components['schemas']['ArtistObject'];
type PlayHistoryObject = components['schemas']['PlayHistoryObject'];
type PagingObject = components['schemas']['PagingObject'];

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const CREDENTIALS_ROW_ID = 1;

const clientId = process.env.SPOTIFY_CLIENT_ID ?? '';
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? '';

let cachedToken: {accessToken: string; expiresAt: number} | null = null;

async function loadRefreshToken(): Promise<string> {
  const {data, error} = await supabaseAdmin
    .from('spotify_credentials')
    .select('refresh_token')
    .eq('id', CREDENTIALS_ROW_ID)
    .single();

  if (error || !data?.refresh_token) {
    throw new Error(`Spotify refresh_token not found in DB: ${error?.message ?? 'no row'}`);
  }

  return data.refresh_token;
}

async function persistRefreshToken(refreshToken: string): Promise<void> {
  const {error} = await supabaseAdmin
    .from('spotify_credentials')
    .update({refresh_token: refreshToken})
    .eq('id', CREDENTIALS_ROW_ID);

  if (error) {
    console.error('[spotify] failed to persist new refresh_token:', error);
  }
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  const refreshToken = await loadRefreshToken();

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Spotify token refresh failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    await persistRefreshToken(data.refresh_token);
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.accessToken;
}

async function spotifyFetch<T>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status} ${endpoint}`);
  }

  return res.json();
}

// --- Public API ---

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export async function getTopTracks(timeRange: TimeRange = 'short_term', limit = 10) {
  const data = await spotifyFetch<PagingObject & {items: TrackObject[]}>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
  );
  return data.items;
}

export async function getTopArtists(timeRange: TimeRange = 'short_term', limit = 10) {
  const data = await spotifyFetch<PagingObject & {items: ArtistObject[]}>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
  );
  return data.items;
}

export async function getRecentlyPlayed(limit = 10) {
  const data = await spotifyFetch<{items: PlayHistoryObject[]}>(
    `/me/player/recently-played?limit=${limit}`,
  );
  return data.items;
}

export function isSpotifyConfigured(): boolean {
  return Boolean(clientId && clientSecret);
}

export type {ArtistObject, PlayHistoryObject, TrackObject};
