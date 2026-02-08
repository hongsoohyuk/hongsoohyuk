'use strict';

// Mock dependencies before importing module under test
jest.mock('@/lib/api/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/security', () => ({
  getClientFingerprint: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import {submit} from '../api/actions';
import {supabaseAdmin} from '@/lib/api/supabase';
import {getClientFingerprint} from '@/lib/security';
import {revalidatePath} from 'next/cache';
import type {FormActionResult} from '@/types/form';

const mockFrom = supabaseAdmin.from as jest.Mock;
const mockGetClientFingerprint = getClientFingerprint as jest.Mock;

function createFormData(data: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.append(key, value);
    }
  }
  return fd;
}

const prevState: FormActionResult = {status: 'idle'};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetClientFingerprint.mockResolvedValue({ip_hash: 'hash_ip', ua_hash: 'hash_ua'});
  process.env.GUESTBOOK_HMAC_SECRET = 'test-secret';
});

describe('guestbook submit action', () => {
  it('returns validation error for empty author_name', async () => {
    const fd = createFormData({author_name: '', message: 'hello', emotions: []});
    const result = await submit(prevState, fd);

    expect(result.status).toBe('error');
    expect(result.issues).toBeDefined();
    expect(result.issues!.some((i) => i.path === 'author_name')).toBe(true);
  });

  it('returns validation error for empty message', async () => {
    const fd = createFormData({author_name: 'John', message: ''});
    const result = await submit(prevState, fd);

    expect(result.status).toBe('error');
    expect(result.issues!.some((i) => i.path === 'message')).toBe(true);
  });

  it('returns validation error for too-long author_name', async () => {
    const fd = createFormData({author_name: 'A'.repeat(13), message: 'hello'});
    const result = await submit(prevState, fd);

    expect(result.status).toBe('error');
    expect(result.issues!.some((i) => i.path === 'author_name')).toBe(true);
  });

  it('submits successfully with valid data', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({error: null}),
    });

    const fd = createFormData({
      author_name: 'Alice',
      message: 'Great site!',
      emotions: ['LIKE'],
    });
    const result = await submit(prevState, fd);

    expect(result.status).toBe('success');
    expect(result.message).toBeDefined();
    expect(mockFrom).toHaveBeenCalledWith('guestbook');
    expect(revalidatePath).toHaveBeenCalledWith('/guestbook');
  });

  it('includes fingerprint data in insert', async () => {
    const mockInsert = jest.fn().mockResolvedValue({error: null});
    mockFrom.mockReturnValue({insert: mockInsert});

    const fd = createFormData({author_name: 'Bob', message: 'Hi!'});
    await submit(prevState, fd);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        ip_hash: 'hash_ip',
        ua_hash: 'hash_ua',
        author_name: 'Bob',
        message: 'Hi!',
      }),
    );
  });

  it('returns error when Supabase insert fails', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({error: {message: 'DB error'}}),
    });

    const fd = createFormData({author_name: 'Alice', message: 'Test'});
    const result = await submit(prevState, fd);

    expect(result.status).toBe('error');
    expect(result.issues!.some((i) => i.path === 'db')).toBe(true);
  });

  it('returns error when fingerprint fails', async () => {
    mockGetClientFingerprint.mockRejectedValue(new Error('Header access failed'));

    const fd = createFormData({author_name: 'Alice', message: 'Test'});
    const result = await submit(prevState, fd);

    expect(result.status).toBe('error');
    expect(result.issues!.some((i) => i.path === 'unknown')).toBe(true);
  });

  it('handles unexpected errors gracefully', async () => {
    mockGetClientFingerprint.mockRejectedValue('string error');

    const fd = createFormData({author_name: 'Alice', message: 'Test'});
    const result = await submit(prevState, fd);

    expect(result.status).toBe('error');
    expect(result.issues![0].message).toBe('An unexpected error occurred.');
  });

  it('submits with emotions array', async () => {
    const mockInsert = jest.fn().mockResolvedValue({error: null});
    mockFrom.mockReturnValue({insert: mockInsert});

    const fd = createFormData({
      author_name: 'Carol',
      message: 'Nice!',
      emotions: ['LIKE', 'FUN'],
    });
    await submit(prevState, fd);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        emotions: ['LIKE', 'FUN'],
      }),
    );
  });
});
