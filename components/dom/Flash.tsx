'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { journey } from '@/lib/journey';
import { P } from '@/lib/path';

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** The light burst as the camera falls through the laptop screen. */
export default function Flash() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let last = -1;
    const tick = () => {
      const p = journey.progress;
      const a = ss(P.screen - 0.014, P.screen + 0.002, p) * (1 - ss(P.screen + 0.004, P.tunnel - 0.006, p));
      const v = Math.round(a * 100) / 100;
      if (v !== last && ref.current) {
        ref.current.style.opacity = String(v * 0.9);
        last = v;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return <div className="flash" ref={ref} aria-hidden="true" />;
}
