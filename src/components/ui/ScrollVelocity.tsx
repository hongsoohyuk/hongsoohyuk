'use client';

import {useRef, useLayoutEffect, useState, type ReactNode, type RefObject, type CSSProperties} from 'react';
import {motion, useMotionValue, useTransform, useAnimationFrame} from 'motion/react';

function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

interface ScrollVelocityProps {
  velocity?: number;
  className?: string;
  numCopies?: number;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}

function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

function VelocityText({
  children,
  baseVelocity,
  className = '',
  numCopies = 6,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}: {
  children: ReactNode;
  baseVelocity: number;
  className?: string;
  numCopies?: number;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}) {
  const baseX = useMotionValue(0);
  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  useAnimationFrame((_t, delta) => {
    const moveBy = baseVelocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  const spans = [];
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <span className={`flex-shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : null}>
        {children}&nbsp;
      </span>,
    );
  }

  return (
    <div className={`${parallaxClassName ?? ''} relative overflow-hidden`} style={parallaxStyle}>
      <motion.div className={`${scrollerClassName ?? ''} flex whitespace-nowrap`} style={{x, ...scrollerStyle}}>
        {spans}
      </motion.div>
    </div>
  );
}

export function ScrollVelocity({
  velocity = 100,
  className = '',
  numCopies = 6,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}: ScrollVelocityProps) {
  return (
    <section>
      <VelocityText
        className={className}
        baseVelocity={velocity}
        numCopies={numCopies}
        parallaxClassName={parallaxClassName}
        scrollerClassName={scrollerClassName}
        parallaxStyle={parallaxStyle}
        scrollerStyle={scrollerStyle}
      >
        hongsoohyuk
      </VelocityText>
    </section>
  );
}
