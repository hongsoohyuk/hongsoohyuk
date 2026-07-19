import {
  dailyKeys,
  fillDailySeries,
  formatVitalValue,
  pivotDaily,
  ratingPercents,
  sortVitals,
  vitalSparkSeries,
} from '../format';

describe('formatVitalValue', () => {
  it('CLS는 소수 3자리', () => {
    expect(formatVitalValue('CLS', 0.0512)).toBe('0.051');
  });

  it('1000ms 이상은 초 단위 2자리', () => {
    expect(formatVitalValue('LCP', 1850)).toBe('1.85s');
  });

  it('1000ms 미만은 ms 정수', () => {
    expect(formatVitalValue('TTFB', 320.6)).toBe('321ms');
  });
});

describe('ratingPercents', () => {
  it('정수 퍼센트로 변환한다', () => {
    expect(ratingPercents({good: 8, needs_improvement: 1, poor: 1, total: 10})).toEqual({
      good: 80,
      needsImprovement: 10,
      poor: 10,
    });
  });

  it('total 0이면 전부 0', () => {
    expect(ratingPercents({good: 0, needs_improvement: 0, poor: 0, total: 0})).toEqual({
      good: 0,
      needsImprovement: 0,
      poor: 0,
    });
  });
});

describe('sortVitals', () => {
  it('LCP, CLS, TTFB, INP 순으로 정렬하고 미지 metric은 뒤로 보낸다', () => {
    const input = [{metric: 'FCP'}, {metric: 'TTFB'}, {metric: 'LCP'}, {metric: 'CLS'}];
    expect(sortVitals(input).map((v) => v.metric)).toEqual(['LCP', 'CLS', 'TTFB', 'FCP']);
  });
});

describe('dailyKeys', () => {
  it('오늘 포함 과거 days개를 오름차순으로 반환한다', () => {
    expect(dailyKeys(3, '2026-07-19')).toEqual(['2026-07-17', '2026-07-18', '2026-07-19']);
  });
});

describe('pivotDaily', () => {
  const rows = [
    {day: '2026-07-18', key: '/blog/1', value: 5},
    {day: '2026-07-19', key: '/blog/1', value: 2},
    {day: '2026-07-19', key: '/', value: 9},
  ];

  it('키×날짜 매트릭스로 피벗하고 결측일은 0으로 채운다', () => {
    const m = pivotDaily(rows, 3, '2026-07-19');
    expect(m.days).toEqual(['2026-07-17', '2026-07-18', '2026-07-19']);
    expect(m.rows).toEqual([
      {key: '/', cells: [0, 0, 9], total: 9},
      {key: '/blog/1', cells: [0, 5, 2], total: 7},
    ]);
  });

  it('행은 total 내림차순', () => {
    const m = pivotDaily(rows, 3, '2026-07-19');
    expect(m.rows.map((r) => r.key)).toEqual(['/', '/blog/1']);
  });

  it('빈 입력이면 rows가 빈 배열', () => {
    expect(pivotDaily([], 7, '2026-07-19').rows).toEqual([]);
  });
});

describe('vitalSparkSeries', () => {
  it('해당 metric의 일별 p75를 뽑고 결측일은 null', () => {
    const rows = [
      {day: '2026-07-17', metric: 'LCP', p75: 1800},
      {day: '2026-07-19', metric: 'LCP', p75: 2100},
      {day: '2026-07-18', metric: 'CLS', p75: 0.02},
    ];
    expect(vitalSparkSeries(rows, 'LCP', 3, '2026-07-19')).toEqual([1800, null, 2100]);
  });
});

describe('fillDailySeries', () => {
  it('빠진 날짜를 0으로 채워 days개를 반환한다', () => {
    const rows = [{day: '2026-07-18', pv: 5}];
    const series = fillDailySeries(rows, 3, '2026-07-19');
    expect(series).toEqual([
      {day: '2026-07-17', pv: 0},
      {day: '2026-07-18', pv: 5},
      {day: '2026-07-19', pv: 0},
    ]);
  });
});
