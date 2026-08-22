'use client';

import {useRef} from 'react';

import {useSearchParams} from 'next/navigation';

type HistoryMode = 'push' | 'replace';

export function useSearchFilterParams() {
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const currentQuery = searchParams?.get('q') ?? '';
  const currentCategory = searchParams?.get('category') ?? '';

  // 글 목록이 전부 클라이언트에 있고 서버는 쿼리를 읽지 않으므로 router.push로
  // 네비게이션을 일으킬 이유가 없다. 네이티브 history API는 Next 라우터와 동기화되어
  // useSearchParams를 갱신하면서도 서버 왕복을 만들지 않는다.
  const updateParams = (updates: Record<string, string>, mode: HistoryMode) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    const url = query ? `?${query}` : window.location.pathname;

    if (mode === 'push') window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
  };

  // 타이핑은 글자마다 "돌아갈 장소"가 생기는 게 아니다. push로 쌓으면 블로그를
  // 벗어나려 뒤로가기를 입력한 글자 수만큼 눌러야 하므로 현재 항목을 덮어쓴다.
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const value = e.target.value;
    timerRef.current = setTimeout(() => {
      updateParams({q: value}, 'replace');
    }, 100);
  };

  // 뱃지 클릭은 의도적인 개별 동작이므로 뒤로가기로 되돌릴 수 있어야 한다.
  const handleCategoryClick = (category: string) => {
    updateParams({category: currentCategory === category ? '' : category}, 'push');
  };

  const clearCategory = () => updateParams({category: ''}, 'push');

  return {currentQuery, currentCategory, handleSearch, handleCategoryClick, clearCategory};
}
