import 'server-only';

import {cache} from 'react';

import {DEFAULT_PAGE_SIZE} from '@/lib/api/pagination';
import {supabase} from '@/lib/api/supabase';

import {GuestbookItemDto, GuestbookListResponse} from '../types';

/**
 * Guestbook 전체 row를 가져옵니다 (페이지네이션 없이).
 * 서버는 정적 prerender 가능하도록 전체를 한 번에 가져오고,
 * 클라이언트에서 slice하여 페이지네이션을 처리합니다.
 *
 * React cache로 같은 요청 내 중복 호출 dedup. ISR 캐싱은 page revalidate config 사용.
 */
export const fetchAllGuestbookEntries = cache(async function fetchAllGuestbookEntries(): Promise<GuestbookItemDto[]> {
  const {data, error} = await supabase
    .from('guestbook')
    .select('id, author_name, message, emotions, created_at')
    .order('created_at', {ascending: false});

  if (error) {
    console.error(error);
    throw new Error('Failed to fetch guestbook entries');
  }

  return data ?? [];
});

/**
 * 서버에서 직접 Supabase를 호출하여 guestbook 목록을 가져옵니다.
 * 서버 컴포넌트의 초기 데이터 로드에 사용됩니다.
 */
export async function fetchGuestbookListServer(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GuestbookListResponse> {
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const validPageSize = Number.isNaN(pageSize) ? DEFAULT_PAGE_SIZE : Math.max(pageSize, 1);

  const from = (validPage - 1) * validPageSize;
  const to = from + validPageSize - 1;

  const {data, error, count} = await supabase
    .from('guestbook')
    .select('id, author_name, message, emotions, created_at', {count: 'exact'})
    .order('created_at', {ascending: false})
    .range(from, to);

  if (error) {
    console.error(error);
    throw new Error('Failed to fetch guestbook list');
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / validPageSize));
  const hasMore = from + (data?.length ?? 0) < total;

  return {
    entries: data ?? [],
    pagination: {
      page: validPage,
      pageSize: validPageSize,
      total,
      totalPages,
      hasMore,
    },
  };
}
