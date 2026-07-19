'use client';

import {useEffect} from 'react';
import {init} from 'hongsoohyuk-beacon';
import {webVitals} from 'hongsoohyuk-beacon/vitals';

export function BeaconProvider() {
  useEffect(() => {
    // 로컬 개발 pageview가 실제 통계에 섞이지 않도록 프로덕션에서만 수집한다
    if (process.env.NODE_ENV !== 'production') return;
    init({
      endpoint: '/api/collect',
      siteId: 'hongsoohyuk.com',
      plugins: [webVitals()],
    });
  }, []);
  return null;
}
