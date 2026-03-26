'use client';

import {useEffect, useRef, useState} from 'react';

interface MarqueeProps {
  text: string;
  className?: string;
  /** Pixels per second */
  speed?: number;
  copies?: number;
}

export function Marquee({text, className = '', speed = 100, copies = 8}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const update = () => {
      const groupWidth = group.scrollWidth;
      if (groupWidth > 0) {
        setDistance(groupWidth);
        setDuration(groupWidth / speed);
      }
    };

    update();
    // Recalculate after fonts load — Safari measures with fallback font initially
    document.fonts.ready.then(update);
    const observer = new ResizeObserver(update);
    observer.observe(group);
    return () => observer.disconnect();
  }, [speed]);

  const items = Array.from({length: copies}, (_, i) => (
    <span key={i} className="flex-shrink-0">
      {text}&nbsp;
    </span>
  ));

  return (
    <div className="relative overflow-hidden">
      <div
        ref={containerRef}
        className={`marquee-track flex whitespace-nowrap ${className}`}
        style={
          duration > 0
            ? {
                animationDuration: `${duration}s`,
                '--marquee-distance': `-${distance}px`,
              }
            : {animationPlayState: 'paused'}
        }
      >
        {/* Group 1: measured for exact pixel distance */}
        <div ref={groupRef} className="flex flex-shrink-0">
          {items}
        </div>
        {/* Group 2: identical clone for seamless loop */}
        <div className="flex flex-shrink-0" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  );
}
