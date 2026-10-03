'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { emit, journey, navigate } from '@/lib/journey';
import { CHAPTERS, DESTINATIONS } from '@/lib/path';
import { cycleTheme, usePalette } from '@/lib/theme';
import { person } from '@/content/site';

const RAIL = ['studio', 'teach', 'write', 'build', 'solve', 'lab', 'scale', 'contact'];

export default function HUD() {
  const sector = useRef<HTMLElement>(null);
  const depth = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const palette = usePalette();

  useEffect(() => {
    let lastSector = '';
    let lastDepth = '';
    let lastIdx = -1;
    const tick = () => {
      const p = journey.progress;
      let idx = 0;
      for (let i = 0; i < CHAPTERS.length; i++) if (p >= CHAPTERS[i].p - 0.0005) idx = i;
      const label = CHAPTERS[idx].label;
      if (label !== lastSector && sector.current) sector.current.textContent = lastSector = label;
      const d = String(Math.round(p * 9999)).padStart(4, '0');
      if (d !== lastDepth && depth.current) depth.current.textContent = lastDepth = d;
      const railIdx = Math.max(0, RAIL.indexOf(CHAPTERS[idx].id === 'portal' ? 'studio' : CHAPTERS[idx].id));
      if (railIdx !== lastIdx && rail.current) {
        lastIdx = railIdx;
        rail.current.querySelectorAll('button').forEach((b, i) => {
          b.classList.toggle('on', i === railIdx);
          if (i === railIdx) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <>
      <header className="hud">
        <button className="hud-mark" onClick={() => navigate(0)} aria-label="Back to the start">
          <b>&gt;</b> {person.handle}
        </button>
        <div className="hud-right">
          <div className="hud-read" aria-hidden="true">
            <span>
              Sector<b ref={sector}>STUDIO</b>
            </span>
            <span className="depth">
              Depth<b ref={depth}>0000</b>
            </span>
          </div>
          <button className="hud-btn" onClick={cycleTheme} aria-label={`Theme: ${palette.label}. Switch theme`}>
            {palette.label}
          </button>
          <button className="hud-btn" onClick={() => emit('terminal', true)} aria-label="Open terminal">
            &gt;_
          </button>
        </div>
      </header>
      <div className="ticker" aria-hidden="true">
        {person.ticker.map((t, i) => (
          <span key={t}>
            {i > 0 && <i>·</i>}
            {t}
          </span>
        ))}
      </div>
      <nav className="rail" ref={rail} aria-label="Chapters">
        {RAIL.map((id) => (
          <button key={id} onClick={() => navigate(DESTINATIONS[id])} aria-label={`Go to ${id}`} title={id.toUpperCase()}>
            <span />
          </button>
        ))}
      </nav>
    </>
  );
}
