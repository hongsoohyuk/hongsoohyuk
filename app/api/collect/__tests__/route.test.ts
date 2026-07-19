/**
 * @jest-environment node
 */
const mockInsert = jest.fn(async () => ({error: null as {message: string} | null}));

jest.mock('@/lib/api/supabase', () => ({
  supabaseAdmin: {from: jest.fn(() => ({insert: mockInsert}))},
}));

import {OPTIONS, POST} from '../route';

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/collect', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', ...headers},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const validBatch = {
  sdk: {name: 'beacon', version: '0.1.0'},
  sentAt: '2026-07-19T12:00:00.000Z',
  events: [
    {
      name: 'pageview',
      ts: '2026-07-19T12:00:00.000Z',
      siteId: 'hongsoohyuk.com',
      anonId: 'anon-1',
      sessionId: 'sess-1',
      url: 'https://hongsoohyuk.com/blog/1',
      referrer: 'https://www.google.com/',
    },
  ],
};

beforeEach(() => {
  mockInsert.mockClear();
  mockInsert.mockResolvedValue({error: null});
});

describe('POST /api/collect', () => {
  it('유효한 배치는 204를 반환하고 snake_case로 매핑해 저장한다', async () => {
    const res = await POST(makeRequest(validBatch));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        site_id: 'hongsoohyuk.com',
        event_name: 'pageview',
        anon_id: 'anon-1',
        session_id: 'sess-1',
        url: 'https://hongsoohyuk.com/blog/1',
        referrer: 'https://www.google.com/',
        client_ts: '2026-07-19T12:00:00.000Z',
      }),
    ]);
  });

  it('referrer가 null인 직접 유입 이벤트도 204 (SDK는 리퍼러 없으면 null을 보낸다)', async () => {
    const batch = {
      ...validBatch,
      events: [{...validBatch.events[0], referrer: null}],
    };
    const res = await POST(makeRequest(batch));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({referrer: null})]);
  });

  it('JSON이 아닌 body는 400', async () => {
    const res = await POST(makeRequest('not-json'));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('스키마 위반(빈 events)은 400', async () => {
    const res = await POST(makeRequest({events: []}));
    expect(res.status).toBe(400);
  });

  it('이벤트 51개는 400', async () => {
    const events = Array.from({length: 51}, () => validBatch.events[0]);
    const res = await POST(makeRequest({events}));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('봇 UA는 저장 없이 204', async () => {
    const res = await POST(makeRequest(validBatch, {'User-Agent': 'Googlebot/2.1'}));
    expect(res.status).toBe(204);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('저장 실패여도 204 (방문자 경험 보호)', async () => {
    mockInsert.mockResolvedValue({error: {message: 'db down'}});
    const res = await POST(makeRequest(validBatch));
    expect(res.status).toBe(204);
  });

  it('허용 origin이면 응답에 CORS 헤더를 포함한다', async () => {
    const res = await POST(makeRequest(validBatch, {Origin: 'https://hongsoohyuk.com'}));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://hongsoohyuk.com');
  });
});

describe('OPTIONS /api/collect', () => {
  it('허용 origin 프리플라이트에 204 + CORS 헤더', async () => {
    const req = new Request('http://localhost:3000/api/collect', {
      method: 'OPTIONS',
      headers: {Origin: 'http://localhost:3000'},
    });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('비허용 origin에는 CORS 헤더 없음', async () => {
    const req = new Request('http://localhost:3000/api/collect', {
      method: 'OPTIONS',
      headers: {Origin: 'https://evil.example.com'},
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
