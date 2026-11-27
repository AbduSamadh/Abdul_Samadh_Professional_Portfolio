'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LAB_IMAGE, zones, type Zone } from '@/content/zones';
import { person } from '@/content/site';
import { asset } from '@/lib/asset';
import s from './lab.module.css';

// The hero is a drawing sheet. The lab starts as a pencil drawing; scrolling runs an orange scan
// across it and the drawing is rendered into the built lab. Then the callouts draw in, and each
// one opens a detail sheet about that part of the work. Before it is built, a lens under the
// pointer shows the finished room through the drawing.

const ZOOM = 1.8;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function framing(z: Zone, tx: number, ty: number) {
  const c = (v: number) => Math.min(0, Math.max(1 - ZOOM, v));
  return { dx: c(tx - ZOOM * z.x) * 100, dy: c(ty - ZOOM * z.y) * 100 };
}

export default function LabScene() {
  const root = useRef<HTMLElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPin = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [built, setBuilt] = useState(false);
  const [narrow, setNarrow] = useState(false);

  // Scroll progress through the hero drives --reveal (the scan) and --draw (the callouts).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mq = window.matchMedia('(max-width: 760px)');
    setNarrow(mq.matches);
    const onMq = () => setNarrow(mq.matches);
    mq.addEventListener('change', onMq);
    if (reduced) {
      el.style.setProperty('--reveal', '1');
      el.style.setProperty('--draw', '1');
      el.dataset.reduced = '1';
      document.documentElement.dataset.pastHero = '1';
      setBuilt(true);
      return () => mq.removeEventListener('change', onMq);
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = clamp01(-r.top / span);
      const reveal = clamp01((p - 0.08) / 0.52);
      const draw = clamp01((p - 0.62) / 0.22);
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--reveal', reveal.toFixed(4));
      el.style.setProperty('--draw', draw.toFixed(4));
      const past = r.bottom < window.innerHeight * 0.5;
      if (past) document.documentElement.dataset.pastHero = '1';
      else delete document.documentElement.dataset.pastHero;
      if (draw > 0.5) el.dataset.ready = '1';
      else delete el.dataset.ready;
      setBuilt(reveal > 0.98);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  // The lens: the built room seen through the drawing, under the pointer.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !drawing.current) return;
    const r = drawing.current.getBoundingClientRect();
    drawing.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    drawing.current.style.setProperty('--my', `${e.clientY - r.top}px`);
    drawing.current.dataset.lens = '1';
  };
  const onLeave = () => {
    if (drawing.current) delete drawing.current.dataset.lens;
  };

  // Opening a callout before the scan has finished jumps to the built state.
  const open = useCallback((i: number) => {
    lastPin.current = i;
    setActive(i);
    const el = root.current;
    if (el && el.dataset.reduced !== '1') {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = -r.top / span;
      if (p < 0.86) window.scrollTo({ top: window.scrollY + r.top + span * 0.9, behavior: 'smooth' });
    }
  }, []);

  const close = useCallback(() => {
    setActive(null);
    const i = lastPin.current;
    if (i !== null) requestAnimationFrame(() => pinRefs.current[i]?.focus({ preventScroll: true }));
  }, []);

  const step = useCallback(
    (d: number) =>
      setActive((a) => {
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
  const view = zone ? framing(zone, narrow ? 0.5 : 0.32, 0.5) : null;
  const transform = view ? `translate(${view.dx}%, ${view.dy}%) scale(${ZOOM})` : undefined;
  const n2 = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <section ref={root} className={s.hero} aria-label="The lab" data-open={zone ? '1' : undefined}>
      <div className={s.sticky}>
        <div className={s.sheet}>
          <div className={s.meta}>
            <span className={s.metaMid}>Project: a future-skills lab · Dubai 25.20°N 55.27°E</span>
            <nav className={s.topnav} aria-label="Sections">
              <a href="#brief">Brief</a>
              <a href="#experience">Timeline</a>
              <a href="#work">Parts</a>
              <a href="#contact" className={s.topcta}>
                Contact
              </a>
            </nav>
            <span className={s.metaSheet} aria-hidden="true">
              Sheet 01 / 06
            </span>
          </div>

          <div className={s.head}>
            <h1 className={s.name}>
              <span>Abdul</span> <em>Samadh</em>
            </h1>
            <dl className={s.block}>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={s.status} data-built={built ? '1' : undefined}>
                    <span>Drawn</span>
                    <span>Built</span>
                  </span>
                </dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{person.nowShort}</dd>
              </div>
              <div className={s.blockWide}>
                <dt>Brief</dt>
                <dd>{person.pitch}</dd>
              </div>
            </dl>
          </div>

          <div className={s.drawingWrap}>
            <div ref={drawing} className={s.drawing} onPointerMove={onMove} onPointerLeave={onLeave}>
              <div className={s.stage} style={transform ? { transform } : undefined}>
                <picture>
                  <source srcSet={asset(LAB_IMAGE.webp)} type="image/webp" />
                  <img
                    className={s.render}
                    src={asset(LAB_IMAGE.jpg)}
                    alt={LAB_IMAGE.alt}
                    width={LAB_IMAGE.width}
                    height={LAB_IMAGE.height}
                    fetchPriority="high"
                    onClick={zone ? close : undefined}
                  />
                </picture>
                <img className={s.sketch} src={asset(LAB_IMAGE.sketch)} alt="" aria-hidden="true" width={LAB_IMAGE.width} height={LAB_IMAGE.height} />
                <div className={s.lens} aria-hidden="true" style={{ backgroundImage: `url(${asset(LAB_IMAGE.webp)})` }} />
                <div className={s.scan} aria-hidden="true">
                  <span />
                </div>

                <svg className={s.leaders} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
                  {zones.map((z) => (
                    <line key={z.id} x1={z.x} y1={z.y} x2={z.lx} y2={z.ly} pathLength={1} vectorEffect="non-scaling-stroke" />
                  ))}
                </svg>

                <ul className={s.pins} aria-label="Places in the lab">
                  {zones.map((z, i) => (
                    <li key={z.id}>
                      <span className={s.mark} style={{ left: `${z.x * 100}%`, top: `${z.y * 100}%` }} aria-hidden="true" />
                      <button
                        ref={(el) => {
                          pinRefs.current[i] = el;
                        }}
                        type="button"
                        className={s.callout}
                        style={{ left: `${z.lx * 100}%`, top: `${z.ly * 100}%`, ['--i' as string]: i }}
                        data-end={z.lx > 0.9 ? '1' : undefined}
                        data-on={active === i ? '1' : undefined}
                        aria-expanded={active === i}
                        aria-controls="lab-panel"
                        onClick={() => (active === i ? close() : open(i))}
                      >
                        <b>{n2(i)}</b>
                        <span>{z.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {zone && (
              <div id="lab-panel" ref={panelRef} className={s.panel} role="dialog" aria-modal="false" aria-labelledby="lab-panel-title" tabIndex={-1}>
                <div className={s.panelHead}>
                  <p className={s.kicker}>
                    Detail {n2(active!)} · {zone.label}
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

          <ul className={s.list} aria-label="Places in the lab, as a list">
            {zones.map((z, i) => (
              <li key={z.id}>
                <button type="button" data-on={active === i ? '1' : undefined} onClick={() => (active === i ? close() : open(i))}>
                  <b>{n2(i)}</b> {z.label}
                </button>
              </li>
            ))}
          </ul>
          <div className={s.foot} aria-hidden="true">
            <span className={s.cue}>
              <span className={s.cueDrawn}>Scroll to build the lab ↓</span>
              <span className={s.cueBuilt}>Choose a callout to open its detail</span>
            </span>
            <span className={s.progress}>
              Render <i />
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
