jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import {getClientFingerprint} from '../client-fingerprint';
import {headers} from 'next/headers';

const mockHeaders = headers as jest.Mock;

function createMockHeaders(entries: Record<string, string | null>) {
  return {
    get: (key: string) => entries[key] ?? null,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getClientFingerprint', () => {
  it('returns hashed IP and User-Agent', async () => {
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0 TestBrowser',
      }),
    );

    const result = await getClientFingerprint('test-secret');

    expect(result.ip_hash).toBeTruthy();
    expect(result.ua_hash).toBeTruthy();
    expect(typeof result.ip_hash).toBe('string');
    expect(typeof result.ua_hash).toBe('string');
    // HMAC-SHA256 produces 64 hex characters
    expect(result.ip_hash).toHaveLength(64);
    expect(result.ua_hash).toHaveLength(64);
  });

  it('produces different hashes for different IPs', async () => {
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '10.0.0.1',
        'user-agent': 'SameAgent',
      }),
    );
    const result1 = await getClientFingerprint('secret');

    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '10.0.0.2',
        'user-agent': 'SameAgent',
      }),
    );
    const result2 = await getClientFingerprint('secret');

    expect(result1.ip_hash).not.toBe(result2.ip_hash);
    expect(result1.ua_hash).toBe(result2.ua_hash);
  });

  it('produces different hashes for different secrets', async () => {
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '10.0.0.1',
        'user-agent': 'TestAgent',
      }),
    );

    const result1 = await getClientFingerprint('secret-1');
    const result2 = await getClientFingerprint('secret-2');

    expect(result1.ip_hash).not.toBe(result2.ip_hash);
  });

  it('extracts first IP from x-forwarded-for with multiple IPs', async () => {
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
        'user-agent': 'TestAgent',
      }),
    );

    const multiResult = await getClientFingerprint('secret');

    // Compare with single IP
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'TestAgent',
      }),
    );

    const singleResult = await getClientFingerprint('secret');

    expect(multiResult.ip_hash).toBe(singleResult.ip_hash);
  });

  it('returns null ip_hash when x-forwarded-for is missing', async () => {
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'user-agent': 'TestAgent',
      }),
    );

    const result = await getClientFingerprint('secret');

    expect(result.ip_hash).toBeNull();
  });

  it('returns null ua_hash when user-agent is missing', async () => {
    mockHeaders.mockResolvedValue(
      createMockHeaders({
        'x-forwarded-for': '1.2.3.4',
      }),
    );

    const result = await getClientFingerprint('secret');

    expect(result.ua_hash).toBeNull();
  });
});
