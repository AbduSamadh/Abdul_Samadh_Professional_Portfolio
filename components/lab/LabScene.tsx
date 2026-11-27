'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LAB_IMAGE, zones, type Zone } from '@/content/zones';
import { asset } from '@/lib/asset';
import s from './lab.module.css';

// The lab is the menu. Pins sit on the objects in the image; choosing one moves the "camera"
// (a zoom on the image) toward it and opens a panel about that part of the work. Escape, the
// close button or a click on the dimmed image goes back to the whole room.

const ZOOM = 1.9;

/** Translate (in % of the frame) that puts the point (x, y) at (tx, ty) after scaling, without
 *  showing past the image's edges. */
function framing(z: Zone, tx: number, ty: number) {
  const clamp = (v: number) => Math.min(0, Math.max(1 - ZOOM, v));
  return { dx: clamp(tx - ZOOM * z.x) * 100, dy: clamp(ty - ZOOM * z.y) * 100 };
}

export default function LabScene() {
  const [active, setActive] = useState<number | null>(null);
  const [narrow, setNarrow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPin = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const open = useCallback((i: number) => {
    lastPin.current = i;
    setActive(i);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    const i = lastPin.current;
    if (i !== null) requestAnimationFrame(() => pinRefs.current[i]?.focus({ preventScroll: true }));
  }, []);

  const step = useCallback(
    (d: number) => setActive((a) => {
      const n = ((a ?? 0) + d + zones.length) % zones.length;
      lastPin.current = n;
      return n;
    }),
    [],
  );

  useEffect(() => {
    if (active === null) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close, step]);

  const zone = active === null ? null : zones[active];
  // On a wide screen the panel covers the right side, so the subject moves to the left third.
  // On a phone the panel sits below the image, so the subject goes to the middle.
  const view = zone ? framing(zone, narrow ? 0.5 : 0.3, 0.5) : null;
  const transform = view ? `translate(${view.dx}%, ${view.dy}%) scale(${ZOOM})` : 'none';

  return (
    <section className={s.scene} aria-label="The lab">
      <div className={s.frame} data-open={zone ? '1' : undefined}>
        <div className={s.viewport}>
        <div className={s.stage} style={{ transform }}>
          <picture>
            <source srcSet={asset(LAB_IMAGE.webp)} type="image/webp" />
            <img
              className={s.photo}
              src={asset(LAB_IMAGE.jpg)}
              alt={LAB_IMAGE.alt}
              width={LAB_IMAGE.width}
              height={LAB_IMAGE.height}
              fetchPriority="high"
              onClick={zone ? close : undefined}
            />
          </picture>
          <ul className={s.pins} aria-label="Places in the lab">
            {zones.map((z, i) => (
              <li key={z.id} style={{ left: `${z.x * 100}%`, top: `${z.y * 100}%` }}>
                <button
                  ref={(el) => {
                    pinRefs.current[i] = el;
                  }}
                  type="button"
                  className={s.pin}
                  data-on={active === i ? '1' : undefined}
                  data-side={z.x > 0.8 ? 'left' : 'right'}
                  aria-expanded={active === i}
                  aria-controls="lab-panel"
                  tabIndex={zone && active !== i ? -1 : 0}
                  onClick={() => (active === i ? close() : open(i))}
                >
                  <span className={s.dot} aria-hidden="true" />
                  <span className={s.tag}>{z.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        </div>

        {zone && (
          <div
            id="lab-panel"
            ref={panelRef}
            className={s.panel}
            role="dialog"
            aria-modal="false"
            aria-labelledby="lab-panel-title"
            tabIndex={-1}
          >
            <div className={s.panelHead}>
              <p className={s.kicker}>
                {String(active! + 1).padStart(2, '0')} / {String(zones.length).padStart(2, '0')} · {zone.label}
              </p>
              <button type="button" className={s.close} onClick={close} aria-label="Close">
                ×
              </button>
            </div>
            <h2 id="lab-panel-title">{zone.title}</h2>
            <p>{zone.body}</p>
            {zone.points && (
              <ul className={s.points}>
                {zone.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {zone.kit && zone.kit.length > 0 && (
              <>
                <h3>On the bench</h3>
                <ul className={s.chips}>
                  {zone.kit.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </>
            )}
            {zone.builds?.map((b) => (
              <div key={b.name} className={s.build}>
                <h3>{b.name}</h3>
                <p>{b.body}</p>
                {b.links.length > 0 && (
                  <p className={s.links}>
                    {b.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label} ↗
                      </a>
                    ))}
                  </p>
                )}
              </div>
            ))}
            <div className={s.nav}>
              <button type="button" onClick={() => step(-1)}>
                ← {zones[(active! - 1 + zones.length) % zones.length].label}
              </button>
              <button type="button" onClick={() => step(1)}>
                {zones[(active! + 1) % zones.length].label} →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={s.legend}>
        <p className={s.hint}>Every bench in the lab is part of the work. Choose one to look closer.</p>
        <ul className={s.list} aria-label="Places in the lab, as a list">
          {zones.map((z, i) => (
            <li key={z.id}>
              <button type="button" data-on={active === i ? '1' : undefined} onClick={() => (active === i ? close() : open(i))}>
                {z.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
