import 'server-only';

import {DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';
import {supabase} from '@/shared/api/supabase';

import {GuestbookListResponse} from '../types';

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
