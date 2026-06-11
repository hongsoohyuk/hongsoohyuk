import {ImageResponse} from 'next/og';

import {SITE_CONFIG} from '@/config/site';

export const OG_IMAGE_SIZE = {width: 1200, height: 630};

// Satori cannot render woff2; the Google Fonts css2 endpoint serves ttf/otf to
// unknown user agents, and the `text` param subsets the font to only the glyphs
// we actually draw (keeps the download small enough for build-time generation).
async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const chars = Array.from(new Set(text)).join('');
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(chars)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!resource) return null;

    const response = await fetch(resource[1]);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function generateContentOgImage({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
}): Promise<ImageResponse> {
  const heading = truncate(title, 80);
  const sub = subtitle ? truncate(subtitle, 120) : undefined;
  const host = SITE_CONFIG.url.replace(/^https?:\/\//, '');

  const boldText = `${heading}${badge ?? ''}${SITE_CONFIG.name}`;
  const regularText = `${sub ?? ''}${host}`;

  const [bold, regular] = await Promise.all([
    loadGoogleFont('Noto+Sans+KR:wght@700', boldText),
    loadGoogleFont('Noto+Sans+KR:wght@400', regularText),
  ]);

  const fonts = [
    ...(bold ? [{name: 'Noto Sans KR', data: bold, weight: 700 as const, style: 'normal' as const}] : []),
    ...(regular ? [{name: 'Noto Sans KR', data: regular, weight: 400 as const, style: 'normal' as const}] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#09090b',
          color: '#fafafa',
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 14, height: 14, borderRadius: 9999, backgroundColor: '#fafafa'}} />
          <div style={{fontSize: 30, fontWeight: 700, color: '#a1a1aa'}}>{SITE_CONFIG.name}</div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          {badge && (
            <div style={{display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: 6, color: '#71717a'}}>
              {badge.toUpperCase()}
            </div>
          )}
          <div
            style={{
              fontSize: heading.length > 40 ? 56 : 68,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: -1,
            }}
          >
            {heading}
          </div>
          {sub && <div style={{fontSize: 30, lineHeight: 1.5, color: '#a1a1aa'}}>{sub}</div>}
        </div>

        <div style={{display: 'flex', fontSize: 26, color: '#71717a'}}>{host}</div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      ...(fonts.length > 0 ? {fonts} : {}),
    },
  );
}
