'use client';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { journey } from '@/lib/journey';
import { P } from '@/lib/path';

// The landing view's window ends here (see the hero's Ov in Overlays).
const HERO_END = P['room-drift'] + 0.004;

/**
 * The landing name, typed out, with a terminal cursor that keeps blinking once it is done.
 * It types after the boot screen on every load, and again whenever you come back to the
 * landing view (scrolling to the top, the logo, the Start mark, `cd home`).
 *
 * The full name is in the page for screen readers and search. The letters not yet typed are
 * already in place, just invisible, so each one lands where it finishes and nothing reflows.
 */
export default function TypedName({ text }: { text: string }) {
  // Server HTML carries the whole name; the client clears it behind the boot screen.
  const [n, setN] = useState(text.length);
  const [done, setDone] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let timer = 0;
    let away = false;

    const type = () => {
      window.clearTimeout(timer);
      setN(0);
      setDone(false);
      let k = 0;
      const step = () => {
        k++;
        setN(k);
        if (k < text.length) {
          // a typist's rhythm: a little uneven, with a beat at the space
          const pause = text[k - 1] === ' ' ? 240 : 75 + Math.random() * 70;
          timer = window.setTimeout(step, pause);
        } else setDone(true);
      };
      timer = window.setTimeout(step, 420);
    };

    setN(0);
    setDone(false);
    if (journey.booted) type();
    else window.addEventListener('as:booted', type, { once: true });

    // Leaving the landing view clears the name; coming back types it again.
    const tick = () => {
      const p = journey.progress;
      if (!away && p > HERO_END) {
        away = true;
        window.clearTimeout(timer);
        setN(0);
        setDone(false);
      } else if (away && p < HERO_END - 0.012 && journey.booted) {
        away = false;
        type();
      }
    };
    gsap.ticker.add(tick);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('as:booted', type);
      gsap.ticker.remove(tick);
    };
  }, [text]);

  // Each word stays whole (lines break only at spaces); the cursor sits after the n-th letter.
  const words = text.split(' ');
  let start = 0;
  return (
    <h1 className="typed">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => {
          const at = start;
          start += w.length + 1;
          const typed = Math.max(0, Math.min(w.length, n - at));
          const caretHere = n >= at && n <= at + w.length;
          return (
            <span key={i}>
              <span className="typed-word">
                {w.slice(0, typed)}
                {caretHere && <i className={`caret ${done ? 'idle' : ''}`} />}
                <span className="typed-rest">{w.slice(typed)}</span>
              </span>
              {i < words.length - 1 && ' '}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
