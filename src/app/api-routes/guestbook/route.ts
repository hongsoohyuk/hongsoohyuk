import {supabase, supabaseAdmin} from '@/shared/api/supabase';
import crypto from 'crypto';
import {NextRequest, NextResponse} from 'next/server';

const ALLOWED_EMOTIONS = new Set(['LIKE', 'INSPIRATION', 'NICE', 'HELLO', 'FUN']);
const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const parsedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
    const parsedPageSize = Number.parseInt(searchParams.get('pageSize') ?? `${DEFAULT_PAGE_SIZE}`, 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const pageSize = Number.isNaN(parsedPageSize)
      ? DEFAULT_PAGE_SIZE
      : Math.min(Math.max(parsedPageSize, 1), MAX_PAGE_SIZE);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {data, error, count} = await supabase
      .from('guestbook')
      .select('id, author_name, message, emotions, created_at', {count: 'exact'})
      .eq('status', 'approved')
      .order('created_at', {ascending: false})
      .range(from, to);

    if (error) {
      console.error(error);
      return NextResponse.json({error: 'db error'}, {status: 500});
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const hasMore = from + (data?.length ?? 0) < total;

    return NextResponse.json({
      entries: data ?? [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: 'unexpected error'}, {status: 500});
  }
}

export async function POST(req: Request) {
  try {
    const {author_name, message, emotions} = await req.json();

    if (!author_name || !message) return NextResponse.json({error: 'missing fields'}, {status: 400});

    if (author_name.length < 1 || author_name.length > 40)
      return NextResponse.json({error: 'invalid name length'}, {status: 400});
    if (message.length < 1 || message.length > 500)
      return NextResponse.json({error: 'invalid message length'}, {status: 400});

    let normalizedEmotions: string[] = [];
    if (Array.isArray(emotions)) {
      normalizedEmotions = emotions
        .map((emotion) => String(emotion).toUpperCase())
        .filter((emotion, index, arr) => ALLOWED_EMOTIONS.has(emotion) && arr.indexOf(emotion) === index)
        .slice(0, 2);
    }

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const ua = req.headers.get('user-agent') ?? '';

    const hmac = (value: string) =>
      crypto.createHmac('sha256', process.env.GUESTBOOK_HMAC_SECRET!).update(value).digest('hex');

    const ip_hash = ip ? hmac(ip) : null;
    const ua_hash = ua ? hmac(ua) : null;

    // Rate limit
    const ONE_MINUTE = 60 * 1000;
    const since = new Date(Date.now() - ONE_MINUTE).toISOString();

    if (ip_hash) {
      const {data: recentIpRows, error: recentIpErr} = await supabaseAdmin
        .from('guestbook')
        .select('id, created_at')
        .eq('ip_hash', ip_hash)
        .gte('created_at', since)
        .limit(1);

      if (!recentIpErr && recentIpRows && recentIpRows.length > 0) {
        return NextResponse.json({error: 'rate_limit_ip', message: 'You are posting too fast.'}, {status: 429});
      }
    }
    if (!ip_hash && ua_hash) {
      const {data: recentUaRows, error: recentUaErr} = await supabaseAdmin
        .from('guestbook')
        .select('id, created_at')
        .eq('ua_hash', ua_hash)
        .gte('created_at', since)
        .limit(1);

      if (!recentUaErr && recentUaRows && recentUaRows.length > 0) {
        return NextResponse.json({error: 'rate_limit_ua', message: 'You are posting too fast.'}, {status: 429});
      }
    }
    // End of Rate limit

    const {error} = await supabaseAdmin.from('guestbook').insert({
      author_name: author_name.trim(),
      message: message.trim(),
      ip_hash,
      ua_hash,
      emotions: normalizedEmotions,
      status: 'pending',
    });

    if (error) {
      console.error(error);
      return NextResponse.json({error: 'db error'}, {status: 500});
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({error: message}, {status: 500});
  }
}
