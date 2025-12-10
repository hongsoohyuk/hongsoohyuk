'use client';

import {useEffect, useRef} from 'react';

interface UseIntersectionObserverOptions {
  onIntersect: () => void;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement>({
  onIntersect,
  rootMargin = '0px',
  threshold = 0,
  enabled = true,
}: UseIntersectionObserverOptions) {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          onIntersect();
        }
      },
      {rootMargin, threshold},
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [onIntersect, rootMargin, threshold, enabled]);

  return targetRef;
}
