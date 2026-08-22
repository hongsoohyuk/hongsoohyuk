'use client';

import {useSearchParams} from 'next/navigation';

import {DEFAULT_PAGE, PAGINATION_PARAMETER_PAGE} from '@/lib/api/pagination';

import {EMOTION_SET, type EmotionCode} from './emotion';

const EMOTION_PARAM = 'emotion';

export function useGuestbookFilter() {
  const searchParams = useSearchParams();

  // pagination href 조립에 쓰이는 현재 쿼리 문자열.
  // 하위 컴포넌트가 각자 useSearchParams를 부르면 정적 렌더에서 전부 이탈하므로
  // URL 읽기는 이 훅 한 곳으로 모으고 아래로는 값으로 내려보낸다.
  const search = searchParams?.toString() ?? '';

  const rawEmotion = searchParams?.get(EMOTION_PARAM);
  const selectedEmotion =
    rawEmotion && EMOTION_SET.has(rawEmotion as EmotionCode) ? (rawEmotion as EmotionCode) : null;

  const rawPage = Number(searchParams?.get(PAGINATION_PARAMETER_PAGE));
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE;

  // 목록 전체가 이미 클라이언트에 있고 서버는 페이지 번호를 읽지 않으므로,
  // router.push로 네비게이션을 일으키면 방금 가진 것과 동일한 RSC 페이로드를 다시 받게 된다.
  // 네이티브 history API는 Next 라우터와 동기화되어 useSearchParams를 갱신하면서도
  // 서버 왕복을 만들지 않는다.
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    window.history.pushState(null, '', query ? `?${query}` : window.location.pathname);
  };

  const toggleEmotion = (code: EmotionCode) => {
    updateParams({
      [EMOTION_PARAM]: selectedEmotion === code ? null : code,
      [PAGINATION_PARAMETER_PAGE]: null,
    });
  };

  const clearEmotion = () => {
    updateParams({
      [EMOTION_PARAM]: null,
      [PAGINATION_PARAMETER_PAGE]: null,
    });
  };

  const goToPage = (page: number) => {
    updateParams({
      [PAGINATION_PARAMETER_PAGE]: page > DEFAULT_PAGE ? String(page) : null,
    });
  };

  return {selectedEmotion, currentPage, search, toggleEmotion, clearEmotion, goToPage};
}
