/**
 * @jest-environment node
 */
const mockRpc = jest.fn();

jest.mock('@/lib/api/supabase', () => ({
  supabaseAdmin: {rpc: (...args: unknown[]) => mockRpc(...args)},
}));

import {fetchStats, parsePeriod} from '../queries';

describe('parsePeriod', () => {
  it("'30'만 30, 그 외는 전부 7", () => {
    expect(parsePeriod('30')).toBe(30);
    expect(parsePeriod('7')).toBe(7);
    expect(parsePeriod(undefined)).toBe(7);
    expect(parsePeriod('999')).toBe(7);
  });
});

describe('fetchStats', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockRpc.mockImplementation(async (fn: string) => {
      const data = {
        beacon_summary: [{pageviews: 10, visitors: 3, sessions: 4, clicks: 2}],
        beacon_daily_pageviews: [{day: '2026-07-19', pv: 10}],
        beacon_top_sources: [{source: 'direct', sessions: 4}],
        beacon_top_pages: [{path: '/blog/1', pv: 6}],
        beacon_vitals: [{metric: 'LCP', p75: 1800, good: 8, needs_improvement: 1, poor: 1, total: 10}],
      }[fn];
      return {data, error: null};
    });
  });

  it('RPC 5개를 site_id/기간 인자로 호출해 합성한다', async () => {
    const stats = await fetchStats(7);
    expect(mockRpc).toHaveBeenCalledWith('beacon_summary', {p_site_id: 'hongsoohyuk.com', p_days: 7});
    expect(mockRpc).toHaveBeenCalledWith('beacon_top_sources', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(mockRpc).toHaveBeenCalledWith('beacon_top_pages', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(stats.summary.pageviews).toBe(10);
    expect(stats.daily).toHaveLength(1);
    expect(stats.vitals[0].metric).toBe('LCP');
  });

  it('summary가 빈 결과면 0으로 채운다', async () => {
    mockRpc.mockResolvedValue({data: [], error: null});
    const stats = await fetchStats(30);
    expect(stats.summary).toEqual({pageviews: 0, visitors: 0, sessions: 0, clicks: 0});
  });

  it('RPC 에러는 throw한다', async () => {
    mockRpc.mockResolvedValue({data: null, error: {message: 'missing function'}});
    await expect(fetchStats(7)).rejects.toThrow('beacon_summary');
  });
});
