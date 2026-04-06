import {getBlogList} from '@/features/blog/api/get-blog-list';
import {getProjectList} from '@/features/project/api/pages/get-project-list';
import {getRecentlyPlayed, getTopArtists, getTopTracks, isSpotifyConfigured} from '@/lib/api/spotify';

import type {DynamicContext} from './build-prompt';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

let cached: {data: DynamicContext; expiry: number} | null = null;

export async function fetchDynamicContext(): Promise<DynamicContext> {
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  const context: DynamicContext = {};
  const spotifyEnabled = isSpotifyConfigured();

  const fetchers: Array<Promise<unknown>> = [
    getProjectList(),
    getBlogList(),
  ];

  if (spotifyEnabled) {
    fetchers.push(
      getTopTracks('short_term', 10),
      getTopArtists('short_term', 5),
      getRecentlyPlayed(5),
    );
  }

  const results = await Promise.allSettled(fetchers);
  const [projectRes, blogRes, topTracksRes, topArtistsRes, recentRes] = results;

  if (projectRes.status === 'fulfilled') {
    const data = projectRes.value as Awaited<ReturnType<typeof getProjectList>>;
    context.projects = data.items.map((p) => ({
      title: p.title,
      description: p.description,
      slug: p.slug,
    }));
  }

  if (blogRes.status === 'fulfilled') {
    const data = blogRes.value as Awaited<ReturnType<typeof getBlogList>>;
    context.blogPosts = data.items.slice(0, 10).map((b) => ({
      title: b.title,
      description: b.description,
      categories: b.categories,
    }));
  }

  if (spotifyEnabled && topTracksRes?.status === 'fulfilled') {
    const tracks = topTracksRes.value as Awaited<ReturnType<typeof getTopTracks>>;
    context.topTracks = tracks.map((t) => ({
      name: t.name ?? '',
      artist: (t.artists ?? []).map((a) => a.name ?? '').join(', '),
    }));
  }

  if (spotifyEnabled && topArtistsRes?.status === 'fulfilled') {
    const artists = topArtistsRes.value as Awaited<ReturnType<typeof getTopArtists>>;
    context.topArtists = artists.map((a) => ({
      name: a.name ?? '',
      genres: (a.genres ?? []).slice(0, 3),
    }));
  }

  if (spotifyEnabled && recentRes?.status === 'fulfilled') {
    const recent = recentRes.value as Awaited<ReturnType<typeof getRecentlyPlayed>>;
    context.recentlyPlayed = recent.map((r) => ({
      name: r.track?.name ?? '',
      artist: (r.track?.artists ?? []).map((a) => a.name ?? '').join(', '),
    }));
  }

  cached = {data: context, expiry: Date.now() + CACHE_TTL_MS};
  return context;
}
