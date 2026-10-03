'use client';
import { useEffect, useRef, useState } from 'react';
import { journey } from '@/lib/journey';

const LINES: [string, string][] = [
  ['> abdul.samadh', ''],
  ['loading twelve years of practice...', 'dim'],
  ['[ OK ] curriculum', 'ok'],
  ['[ OK ] competitions', 'ok'],
  ['[ OK ] software', 'ok'],
  ['[ OK ] lab', 'ok'],
];

/** Short, skippable boot. Lines collapse into one amber scanline, which hands over to the room. */
export default function Boot() {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<'type' | 'collapse' | 'gone' | 'off'>('type');
  const done = useRef(false);

  useEffect(() => {
    const timers: number[] = [];
    const finish = (instant: boolean) => {
      if (done.current) return;
      done.current = true;
      try {
        sessionStorage.setItem('as-booted', '1');
      } catch {}
      window.scrollTo(0, 0);
      const handOver = () => {
        journey.booted = true;
        window.dispatchEvent(new Event('as:booted'));
      };
      if (instant) {
        handOver();
        setPhase('off');
        return;
      }
      setPhase('collapse');
      timers.push(window.setTimeout(() => {
        handOver();
        setPhase('gone');
      }, 760));
      timers.push(window.setTimeout(() => setPhase('off'), 1500));
    };

    let seen = false;
    try {
      seen = sessionStorage.getItem('as-booted') === '1';
    } catch {}
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) {
      finish(true);
      return;
    }

    let i = 0;
    const next = () => {
      i++;
      setShown(i);
      if (i < LINES.length) timers.push(window.setTimeout(next, i === 1 ? 320 : 170));
      else timers.push(window.setTimeout(() => finish(false), 420));
    };
    timers.push(window.setTimeout(next, 200));
    const skip = () => finish(false);
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    window.addEventListener('touchstart', skip, { once: true, passive: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
    };
  }, []);

  if (phase === 'off') return null;
  return (
    <div className={`boot ${phase === 'collapse' || phase === 'gone' ? 'collapse' : ''} ${phase === 'gone' ? 'gone' : ''}`} role="status" aria-live="polite">
      <div className="lines">
        {LINES.slice(0, shown).map(([t, c]) => (
          <div key={t} className={c}>
            {t}
          </div>
        ))}
        {shown < LINES.length && <span aria-hidden="true">▌</span>}
      </div>
      <div className="scan" />
      <div className="skiphint">CLICK OR PRESS ANY KEY TO SKIP</div>
    </div>
  );
}
