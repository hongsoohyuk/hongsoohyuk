import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_LIMIT = 120;
const PROFILE_FIELDS = [
  'id',
  'username',
  'website',
  'biography',
  'followers_count',
  'follows_count',
  'media_count',
  'profile_picture_url',
  'name',
];
const MEDIA_FIELDS = [
  'id',
  'media_type',
  'media_url',
  'thumbnail_url',
  'like_count',
  'shortcode',
  'comments_count',
  'username',
  'caption',
  'timestamp',
  'children{id,media_type,media_url,thumbnail_url}',
  'comments{id,text,username,timestamp}',
];

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'instagram');
const MEDIA_DIR = path.join(OUTPUT_DIR, 'media');
const FEED_PATH = path.join(OUTPUT_DIR, 'feed.json');
const PROFILE_PATH = path.join(OUTPUT_DIR, 'profile.json');

const ENV_FILES = ['.env.local', '.env'];

async function loadEnvFile() {
  for (const fileName of ENV_FILES) {
    const filePath = path.join(ROOT_DIR, fileName);
    try {
      const contents = await readFile(filePath, 'utf8');
      for (const line of contents.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [rawKey, ...rest] = trimmed.split('=');
        if (!rawKey || rest.length === 0) continue;
        const key = rawKey.trim();
        const value = rest
          .join('=')
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
      break;
    } catch {
      continue;
    }
  }
}

function ensureEnv() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const graphUrl = process.env.INSTAGRAM_GRAPH_URL;
  if (!accessToken || !graphUrl) {
    throw new Error('Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_GRAPH_URL in environment.');
  }
  return {accessToken, graphUrl};
}

function inferExtension(url, contentType) {
  try {
    const ext = path.extname(new URL(url).pathname);
    if (ext) return ext.toLowerCase() === '.jpeg' ? '.jpg' : ext.toLowerCase();
  } catch {
    // Ignore URL parse errors.
  }
  if (!contentType) return '.jpg';
  if (contentType.includes('image/png')) return '.png';
  if (contentType.includes('image/webp')) return '.webp';
  if (contentType.includes('image/jpeg')) return '.jpg';
  if (contentType.includes('video/mp4')) return '.mp4';
  return '.jpg';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function downloadToPublic(url, fileBaseName) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') ?? undefined;
  const ext = inferExtension(url, contentType);
  const fileName = `${fileBaseName}${ext}`;
  const filePath = path.join(MEDIA_DIR, fileName);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(filePath, buffer);
  return `/instagram/media/${fileName}`;
}

async function run() {
  await loadEnvFile();
  const {accessToken, graphUrl} = ensureEnv();

  await mkdir(MEDIA_DIR, {recursive: true});

  const postParams = new URLSearchParams([
    ['access_token', accessToken],
    ['limit', String(DEFAULT_LIMIT)],
    ['fields', MEDIA_FIELDS.join(',')],
  ]);
  const profileParams = new URLSearchParams([
    ['access_token', accessToken],
    ['fields', PROFILE_FIELDS.join(',')],
  ]);

  const [feed, profile] = await Promise.all([
    fetchJson(`${graphUrl}/me/media?${postParams.toString()}`),
    fetchJson(`${graphUrl}/me?${profileParams.toString()}`),
  ]);

  const updatedPosts = [];
  for (const post of feed.data ?? []) {
    const updated = {...post};
    if (updated.media_url) {
      updated.media_url = await downloadToPublic(updated.media_url, updated.id);
    }
    if (updated.thumbnail_url) {
      updated.thumbnail_url = await downloadToPublic(updated.thumbnail_url, `${updated.id}-thumb`);
    }
    // Handle CAROUSEL_ALBUM children
    if (updated.children?.data) {
      const updatedChildren = [];
      for (const child of updated.children.data) {
        const updatedChild = {...child};
        if (updatedChild.media_url) {
          updatedChild.media_url = await downloadToPublic(updatedChild.media_url, updatedChild.id);
        }
        if (updatedChild.thumbnail_url) {
          updatedChild.thumbnail_url = await downloadToPublic(updatedChild.thumbnail_url, `${updatedChild.id}-thumb`);
        }
        updatedChildren.push(updatedChild);
      }
      updated.children = updatedChildren;
    }
    // Handle comments
    if (updated.comments?.data) {
      updated.comments = updated.comments.data;
    }
    updatedPosts.push(updated);
  }

  const updatedProfile = {...profile};
  if (updatedProfile.profile_picture_url) {
    updatedProfile.profile_picture_url = await downloadToPublic(
      updatedProfile.profile_picture_url,
      `profile-${updatedProfile.id}`,
    );
  }

  await writeFile(FEED_PATH, JSON.stringify({...feed, data: updatedPosts}, null, 2));
  await writeFile(PROFILE_PATH, JSON.stringify(updatedProfile, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
