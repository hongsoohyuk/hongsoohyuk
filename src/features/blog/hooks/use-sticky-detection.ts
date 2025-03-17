'use client';

import {useEffect, useState, type RefObject} from 'react';

export function useStickyDetection(ref: RefObject<HTMLElement | null>, headerHeight: number, disabled?: boolean) {
  const [isSticky, setIsSticky] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const el = ref.current;
    if (!el) return;

    const initialTop = el.offsetTop;

    const handleScroll = () => {
      const stuck = window.scrollY + headerHeight >= initialTop;
      setIsSticky(stuck);
      if (!stuck) setIsCollapsed(false);
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, headerHeight, disabled]);

  return {isSticky, isCollapsed, setIsCollapsed};
}
