'use client';

import {useEffect} from 'react';
import {init} from 'hongsoohyuk-beacon';
import {webVitals} from 'hongsoohyuk-beacon/vitals';

export function BeaconProvider() {
  useEffect(() => {
    // 로컬 개발 pageview가 실제 통계에 섞이지 않도록 프로덕션에서만 수집한다
    if (process.env.NODE_ENV !== 'production') return;
    // 로컬에서 프로덕션 빌드(pnpm start)로 e2e를 돌리면 NODE_ENV가 production이라
    // 위 가드를 통과한다. hostname으로 로컬 접속을 한 번 더 걸러 통계 오염을 막는다.
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return;
    init({
      endpoint: '/api/collect',
      siteId: 'hongsoohyuk.com',
      plugins: [webVitals()],
    });
  }, []);
  return null;
}
