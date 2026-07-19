import {beaconBatchSchema} from '../schema';

const validEvent = {
  name: 'pageview',
  ts: '2026-07-19T12:00:00.000Z',
  siteId: 'hongsoohyuk.com',
  anonId: '9a2f4c1e-1111-4222-8333-444455556666',
  sessionId: '9a2f4c1e-7777-4888-9999-000011112222',
  url: 'https://hongsoohyuk.com/blog/1',
  referrer: 'https://www.google.com/',
  utm: {source: null, medium: null, campaign: null, term: null, content: null},
  props: {},
};

describe('beaconBatchSchema', () => {
  it('유효한 배치를 통과시킨다', () => {
    const batch = {
      sdk: {name: 'beacon', version: '0.1.0'},
      sentAt: '2026-07-19T12:00:00.000Z',
      events: [validEvent],
    };
    expect(beaconBatchSchema.safeParse(batch).success).toBe(true);
  });

  it('선택 필드가 없어도 통과한다 (name, siteId만 필수)', () => {
    const batch = {events: [{name: 'click', siteId: 'hongsoohyuk.com'}]};
    expect(beaconBatchSchema.safeParse(batch).success).toBe(true);
  });

  it('빈 events 배열은 거부한다', () => {
    expect(beaconBatchSchema.safeParse({events: []}).success).toBe(false);
  });

  it('이벤트 51개는 거부한다', () => {
    const events = Array.from({length: 51}, () => validEvent);
    expect(beaconBatchSchema.safeParse({events}).success).toBe(false);
  });

  it('이벤트 50개는 통과한다', () => {
    const events = Array.from({length: 50}, () => validEvent);
    expect(beaconBatchSchema.safeParse({events}).success).toBe(true);
  });

  it('name 누락 이벤트는 거부한다', () => {
    expect(beaconBatchSchema.safeParse({events: [{siteId: 'hongsoohyuk.com'}]}).success).toBe(false);
  });

  it('ISO가 아닌 ts는 거부한다', () => {
    const batch = {events: [{...validEvent, ts: 'yesterday'}]};
    expect(beaconBatchSchema.safeParse(batch).success).toBe(false);
  });
});
