import {supabaseAdmin} from '@/lib/api/supabase';
import {corsHeaders, isBotUserAgent} from './_lib/http';
import {beaconBatchSchema} from './_lib/schema';

export async function OPTIONS(req: Request) {
  return new Response(null, {status: 204, headers: corsHeaders(req.headers.get('origin'))});
}

export async function POST(req: Request) {
  const headers = corsHeaders(req.headers.get('origin'));

  if (isBotUserAgent(req.headers.get('user-agent'))) {
    return new Response(null, {status: 204, headers});
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400, headers});
  }

  const parsed = beaconBatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({error: 'Invalid payload'}, {status: 400, headers});
  }

  const rows = parsed.data.events.map((ev) => ({
    site_id: ev.siteId,
    event_name: ev.name,
    anon_id: ev.anonId ?? null,
    session_id: ev.sessionId ?? null,
    url: ev.url ?? null,
    referrer: ev.referrer ?? null,
    utm: ev.utm ?? null,
    props: ev.props ?? null,
    client_ts: ev.ts ?? null,
  }));

  // 수집 실패가 방문자 경험에 영향을 주면 안 됨 — 저장 에러도 로깅 후 204
  const {error} = await supabaseAdmin.from('beacon_events').insert(rows);
  if (error) {
    console.error('[collect] insert failed:', error.message);
  }

  return new Response(null, {status: 204, headers});
}
