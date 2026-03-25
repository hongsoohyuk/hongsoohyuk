'use client';

import {useEffect, useRef, useState} from 'react';

interface MarqueeProps {
  text: string;
  className?: string;
  /** Pixels per second */
  speed?: number;
}

export function Marquee({text, className = '', speed = 100}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const singleRef = useRef<HTMLSpanElement>(null);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [copies, setCopies] = useState(4);

  useEffect(() => {
    const container = containerRef.current;
    const single = singleRef.current;
    if (!container || !single) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const itemWidth = single.offsetWidth;
      if (itemWidth === 0) return;

      // Need enough copies so one group fills the container + some overflow
      const needed = Math.ceil(containerWidth / itemWidth) + 2;
      setCopies(needed);

      const groupWidth = needed * itemWidth;
      setDistance(groupWidth);
      setDuration(groupWidth / speed);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [speed]);

  const items = Array.from({length: copies}, (_, i) => (
    <span key={i} className="flex-shrink-0">
      {text}&nbsp;
    </span>
  ));

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Hidden measurer for single item width */}
      <span
        ref={singleRef}
        aria-hidden
        className={`invisible absolute whitespace-nowrap ${className}`}
      >
        {text}&nbsp;
      </span>
      <div
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
        {/* Group 1 */}
        <div className="flex flex-shrink-0">{items}</div>
        {/* Group 2: identical clone for seamless loop */}
        <div className="flex flex-shrink-0" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  );
}
