'use client';

import {useEffect, useRef, useState} from 'react';

type Props = {
  onQuit: () => void;
};

const CHARS = '.,-~:;=!*#$@';

export function DonutAnimation({onQuit}: Props) {
  const [frame, setFrame] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const aRef = useRef(0);
  const bRef = useRef(0);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    let animId: number;

    function renderFrame() {
      const width = 80;
      const height = 80;

      const output = new Array(width * height).fill(' ');
      const zBuffer = new Array(width * height).fill(0);

      const R1 = 1;
      const R2 = 2;
      const K2 = 5;
      const K1 = (width * K2 * 3) / (8 * (R1 + R2));

      const A = aRef.current;
      const B = bRef.current;

      const cosA = Math.cos(A);
      const sinA = Math.sin(A);
      const cosB = Math.cos(B);
      const sinB = Math.sin(B);

      for (let theta = 0; theta < 6.28; theta += 0.07) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 6.28; phi += 0.02) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          const circleX = R2 + R1 * cosTheta;
          const circleY = R1 * sinTheta;

          const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB;
          const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB;
          const z = K2 + cosA * circleX * sinPhi + circleY * sinA;
          const ooz = 1 / z;

          const xp = Math.floor(width / 2 + K1 * ooz * x);
          const yp = Math.floor(height / 2 - (K1 / 2) * ooz * y);

          if (xp < 0 || xp >= width || yp < 0 || yp >= height) continue;

          const idx = yp * width + xp;

          const luminance =
            cosPhi * cosTheta * sinB -
            cosA * cosTheta * sinPhi -
            sinA * sinTheta +
            cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi);

          if (ooz > zBuffer[idx]) {
            zBuffer[idx] = ooz;
            const luminanceIndex = Math.max(0, Math.floor(luminance * 8));
            output[idx] = CHARS[Math.min(luminanceIndex, CHARS.length - 1)];
          }
        }
      }

      const lines: string[] = [];
      for (let j = 0; j < height; j++) {
        lines.push(output.slice(j * width, (j + 1) * width).join(''));
      }
      setFrame(lines.join('\n'));

      aRef.current += 0.02;
      bRef.current += 0.01;

      animId = requestAnimationFrame(renderFrame);
    }

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'q' || e.key === 'Escape') {
      e.preventDefault();
      onQuit();
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between bg-neutral-800 px-3 py-1 text-neutral-400 text-xs">
        <span>donut.c — 3D Rotating Donut</span>
        <span className="text-neutral-500">Press q or Esc to quit</span>
      </div>

      {/* Donut canvas */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <pre className="text-white-400 leading-none text-xs sm:text-sm">{frame}</pre>
      </div>

      {/* Status bar */}
      <div className="shrink-0 bg-neutral-800 px-3 py-1 text-xs text-neutral-500">
        Inspired by Andy Sloane&apos;s donut.c
      </div>
    </div>
  );
}
