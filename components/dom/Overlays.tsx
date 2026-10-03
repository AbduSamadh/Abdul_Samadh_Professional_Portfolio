'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { emit, journey, on, setSwarmRandom } from '@/lib/journey';
import { P } from '@/lib/path';
import { abstract, authoring, briefs, builds, contact, hero, lab, person, route, scale, who } from '@/content/site';
import { testimonials } from '@/content/testimonials';

/**
 * All readable copy lives here as real HTML, staged against the master timeline. Each block fades in
 * and out over its [from, to] window of journey progress. Nothing is hidden from search engines:
 * the whole story is in the exported HTML.
 */

type Side = 'left' | 'right' | 'center' | 'bottom' | 'top';

function Ov({ from, to, side, children, className = '', id, label }: { from: number; to: number; side: Side; children: ReactNode; className?: string; id?: string; label?: string }) {
  return (
    <section id={id} className={`ov ov-${side} ${className}`} data-from={from} data-to={to} aria-label={label}>
      {children}
    </section>
  );
}

const W = 0.0055; // half-window around a shot

const BASE: Record<Side, string> = {
  left: 'translateY(-50%)',
  right: 'translateY(-50%)',
  center: 'translate(-50%, -50%)',
  bottom: 'translateX(-50%)',
  top: 'translateX(-50%)',
};

export default function Overlays() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = Array.from(root.current!.querySelectorAll<HTMLElement>('.ov'));
    const items = els.map((el) => ({
      el,
      from: parseFloat(el.dataset.from!),
      to: parseFloat(el.dataset.to!),
      side: (el.className.match(/ov-(left|right|center|bottom|top)/)?.[1] ?? 'left') as Side,
      a: -1,
    }));
    const mq = window.matchMedia('(max-width: 760px)');
    const F = 0.0045;
    const ss = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const tick = () => {
      const p = journey.progress;
      const narrow = mq.matches;
      for (const it of items) {
        const fin = it.from < 0 ? 1 : ss(it.from, it.from + F, p);
        const fout = it.to > 1 ? 1 : 1 - ss(it.to - F, it.to, p);
        let a = Math.min(fin, fout);
        a = Math.round(a * 200) / 200;
        if (a === it.a) continue;
        it.a = a;
        const s = it.el.style;
        const base = narrow && (it.side === 'left' || it.side === 'right') ? '' : BASE[it.side];
        const dy = (1 - a) * (fin < 1 ? 18 : -18);
        s.opacity = String(a);
        s.visibility = a > 0.01 ? 'visible' : 'hidden';
        s.transform = `${base} translate3d(0, ${dy.toFixed(1)}px, 0)`;
        it.el.classList.toggle('live', a > 0.6);
      }
    };
    gsap.ticker.add(tick);
    const onMq = () => items.forEach((i) => (i.a = -1));
    mq.addEventListener('change', onMq);
    return () => {
      gsap.ticker.remove(tick);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  return (
    <div className="ovs" ref={root}>
      {/* ROOM */}
      <Ov from={-1} to={P['room-drift'] + 0.004} side="left" label="Introduction" className="hero">
        <p className="kicker">
          <span className="dot" />
          Now · {person.nowShort}
        </p>
        <h1>{hero.headline}</h1>
        <p className="mist" style={{ maxWidth: 430 }}>
          {person.oneLine} {person.span}
        </p>
        <div style={{ marginTop: 22 }}>
          <span className="scroll-hint">SCROLL TO DESCEND</span>
        </div>
      </Ov>

      {/* TEACH */}
      <Ov from={P['tunnel-exit'] - 0.002} to={P['teach-room'] + 0.011} side="left" label={who.title}>
        <div className="panel">
          <p className="chapter-tag">
            <b>01</b> / Teach
          </p>
          <p className="kicker">{who.kicker}</p>
          <h2>{who.title}</h2>
          <p>{who.body}</p>
        </div>
      </Ov>
      <Ov from={P['teach-fragments'] - 0.007} to={P['teach-fragments'] + 0.008} side="bottom">
        <p className="big">What changed is the size of the thing I get handed.</p>
        <ul className="tags">
          {who.fragments.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Ov>
      <Ov from={P['teach-portrait'] - 0.006} to={P['teach-portrait'] + 0.007} side="left" label="Abdul Samadh">
        <div className="panel">
          <p className="kicker">Abdul Samadh · Dubai, UAE</p>
          <dl className="facts">
            {who.facts.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mist" style={{ marginTop: 14, fontSize: 12 }}>
            Click the portrait to decode it.
          </p>
        </div>
      </Ov>
      <Ov from={P['teach-abstract'] - 0.005} to={P['teach-abstract'] + 0.007} side="right" label="Abstract">
        <div className="panel">
          <p className="kicker">{abstract.kicker}</p>
          <p>
            {abstract.parts.map(([t, h], i) =>
              h ? (
                <strong key={i} className="hl">
                  {t}
                </strong>
              ) : (
                <span key={i}>{t}</span>
              ),
            )}
          </p>
          <ul className="tags">
            {abstract.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </Ov>
      {route.map((s, i) => {
        const id = `route-${i}`;
        const from = P[id] - W;
        const to = s.feature ? P['route-3b'] + W : P[id] + W;
        const side: Side = i % 2 === 0 ? 'right' : 'left';
        return (
          <Ov key={s.id} from={from} to={to} side={side} label={s.org}>
            <div className={`panel ${s.feature ? 'feature' : ''}`}>
              {i === 0 && <p className="kicker">03 / Route · The route so far</p>}
              <div className="stop-meta">
                <span className={s.now ? 'now' : ''}>{s.now ? '● Now · ' : ''}{s.country}</span>
                <span>
                  {String(i + 1).padStart(2, '0')} / {String(route.length).padStart(2, '0')}
                </span>
              </div>
              <h3>{s.role ? `${s.role}, ${s.org}` : s.org}</h3>
              <p>{s.body}</p>
              {s.feature && (
                <ul className="tags">
                  {scale.fll.pins.map((p) => (
                    <li key={p}>FLL · {p}</li>
                  ))}
                </ul>
              )}
            </div>
          </Ov>
        );
      })}

      {/* WRITE */}
      <Ov from={P['gate-teach'] + 0.004} to={P['write-library'] + 0.007} side="top" label={authoring.title}>
        <p className="chapter-tag">
          <b>02</b> / Write
        </p>
        <h2>{authoring.title}</h2>
        <p className="mist">{authoring.body}</p>
      </Ov>
      {authoring.books.map((b, i) => (
        <Ov key={b.n} from={P[`book-${i}`] - W} to={P[`book-${i}`] + W} side={i % 2 === 0 ? 'right' : 'left'} label={b.title}>
          <div className="panel">
            <p className="kicker">
              {authoring.kicker} · {b.n} / 06
            </p>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
            {i === 0 && <p className="mist">Above you: the arc, KG to Grade 13, on one page.</p>}
          </div>
        </Ov>
      ))}

      {/* BUILD */}
      <Ov from={P['gate-write'] + 0.003} to={P['frame-1'] + 0.007} side="top" label={builds.title}>
        <p className="chapter-tag">
          <b>03</b> / Build
        </p>
        <h2>{builds.title}</h2>
        <p className="mist">{builds.body}</p>
      </Ov>
      <Ov from={P['frame-1'] - 0.003} to={P['frame-1'] + 0.008} side="bottom">
        <Method i={0} />
      </Ov>
      <BuildPanel i={0} from={P.swarm - 0.006} to={P['swarm-hold'] + 0.008} side="left">
        <SwarmControls />
      </BuildPanel>
      <BuildPanel i={1} from={P.city - 0.006} to={P['city-deep'] + 0.007} side="left" />
      <Ov from={P['frame-2'] - 0.005} to={P['frame-2'] + 0.006} side="bottom">
        <Method i={1} />
      </Ov>
      <BuildPanel i={2} from={P.bench - 0.006} to={P.bench + 0.007} side="left" />
      <BuildPanel i={3} from={P.plotter - 0.006} to={P.plotter + 0.007} side="right" />
      <BuildPanel i={4} from={P.landing - 0.006} to={P.landing + 0.007} side="left" />
      <BuildPanel i={5} from={P.hula - 0.006} to={P.hula + 0.007} side="left" />
      <Ov from={P['frame-3'] - 0.006} to={P['frame-3'] + 0.008} side="bottom">
        <Method i={2} />
      </Ov>

      {/* SOLVE */}
      <Ov from={P['gate-build'] + 0.002} to={P['briefs-0'] - 0.0045} side="top" label={briefs.title}>
        <p className="chapter-tag">
          <b>04</b> / Solve
        </p>
        <h2>{briefs.title}</h2>
        <p className="mist">{briefs.body}</p>
      </Ov>
      {[0, 1, 2, 3].map((g) => (
        <Ov key={g} from={P[`briefs-${g}`] - (g === 0 ? 0.0055 : 0.006)} to={P[`briefs-${g}`] + 0.008} side="left" label={`Briefs ${g * 3 + 1} to ${g * 3 + 3}`}>
          <div className="panel">
            <p className="kicker">
              {briefs.kicker} · {String(g * 3 + 1).padStart(2, '0')}–{String(g * 3 + 3).padStart(2, '0')} / 12
            </p>
            <ul className="brief-list">
              {briefs.items.slice(g * 3, g * 3 + 3).map((b) => (
                <li key={b.n}>
                  <button
                    onClick={() => emit('modal', { type: 'text', kicker: `Brief ${b.n}`, title: b.title, body: b.body })}
                    aria-label={`${b.title}: open brief`}
                  >
                    <b>
                      <i>{b.n}</i>
                      {b.title}
                    </b>
                    <p>{b.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Ov>
      ))}
      <Ov from={P['ai-web'] - 0.006} to={P['ai-web'] + 0.006} side="right">
        <div className="panel">
          <p className="kicker">Brief 01 · AI literacy</p>
          <p className="big">…and where a human still has to decide.</p>
          <p className="mist">{briefs.items[0].body}</p>
        </div>
      </Ov>
      <Ov from={P.ladder - 0.006} to={P['ladder-top'] + 0.004} side="left">
        <div className="panel">
          <p className="kicker">Brief 04 · Robotics pathway</p>
          <p className="big">One ladder. Floor turtle to competition season.</p>
          <p className="mist">{briefs.items[3].body}</p>
        </div>
      </Ov>

      {/* LAB */}
      <Ov from={P['gate-solve'] + 0.003} to={P['lab-in'] + 0.007} side="top" label={lab.title}>
        <p className="chapter-tag">
          <b>05</b> / Lab
        </p>
        <h2>{lab.title}</h2>
        <p className="mist">{lab.body}</p>
      </Ov>
      {(
        [
          ['bay-robotics', ['robotics'], 'right'],
          ['bay-ai', ['ai', 'drones'], 'left'],
          ['bay-xr', ['xr'], 'right'],
          ['bay-design', ['design'], 'left'],
          ['bay-mobility', ['mobility'], 'right'],
          ['bay-emerging', ['emerging'], 'left'],
        ] as [string, string[], Side][]
      ).map(([shot, ids, side]) => (
        <Ov key={shot} from={P[shot] - W} to={P[shot] + W} side={side}>
          <div className="panel">
            {ids.map((id) => {
              const bay = lab.bays.find((b) => b.id === id)!;
              return (
                <div key={id} style={{ marginBottom: 10 }}>
                  <p className="kicker">{bay.title}</p>
                  <ul className="hw">
                    {bay.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Ov>
      ))}
      <Ov from={P.humanoid - W} to={P.humanoid + W} side="right">
        <div className="panel">
          <p className="kicker">Robotics · hero</p>
          <h3>Unitree G1 EDU Ultimate C</h3>
          <p className="mist">Part of the robotics stack I specialise in, from a floor turtle to a humanoid.</p>
        </div>
      </Ov>

      {/* SCALE */}
      <Ov from={P['gate-lab'] + 0.003} to={P['stat-0'] - 0.002} side="top" label={scale.title}>
        <p className="chapter-tag">
          <b>06</b> / Scale
        </p>
        <h2>{scale.title}</h2>
      </Ov>
      {/* The numbers are monuments in the world; this list is for screen readers. */}
      <section className="sr-only" aria-label="By the numbers">
        <ul>
          {scale.stats.map((s) => (
            <li key={s.label}>
              {s.value} {s.label}
            </li>
          ))}
          <li>{scale.places.join(', ')}</li>
        </ul>
      </section>
      <Ov from={P.fll - 0.007} to={P.fll + 0.007} side="right">
        <div className="panel feature">
          <p className="kicker">Partnership</p>
          <h3>{scale.fll.title}</h3>
          <p>{scale.fll.body}</p>
          <ul className="tags">
            {scale.fll.pins.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </Ov>
      {testimonials.length > 0 && (
        <Ov from={P.fll + 0.007} to={P['gate-scale']} side="bottom">
          {testimonials.slice(0, 1).map((t) => (
            <figure key={t.name}>
              <blockquote className="big">“{t.quote}”</blockquote>
              <figcaption className="mist">
                {t.name}, {t.role}, {t.org}
              </figcaption>
            </figure>
          ))}
        </Ov>
      )}

      {/* FINALE */}
      <Ov from={P.name + 0.006} to={2} side="bottom" className="finale" id="contact" label="Contact">
        <p className="kicker">{contact.kicker}</p>
        <h1>{contact.title}</h1>
        <p className="mist">{contact.body}</p>
        <div className="btns">
          <a className="btn big" href={person.linkedin} target="_blank" rel="noopener noreferrer">
            Connect on LinkedIn →
          </a>
          <button className="btn big ghost" onClick={() => emit('terminal', true)}>
            Open a terminal
          </button>
          {person.cv && (
            <a className="btn big ghost" href={person.cv} download>
              Download CV
            </a>
          )}
        </div>
        <p className="sign">{contact.sign}</p>
        <p className="foot">
          {contact.footer} · {contact.credit}
        </p>
      </Ov>
    </div>
  );
}

function Method({ i }: { i: number }) {
  const m = builds.method[i];
  return (
    <>
      <p className="kicker">Method · {m.n} / 3</p>
      <p className="big">{m.title}</p>
      <p className="mist">{m.body}</p>
    </>
  );
}

function BuildPanel({ i, from, to, side, children }: { i: number; from: number; to: number; side: Side; children?: ReactNode }) {
  const b = builds.items[i];
  return (
    <Ov from={from} to={to} side={side} label={b.name}>
      <div className="panel">
        <p className="kicker">
          {builds.kicker} · {String(i + 1).padStart(2, '0')} / 06
        </p>
        <h3>{b.name}</h3>
        <p>{b.body}</p>
        <ul className="tags">
          {b.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {children}
        {b.live && (
          <div className="btns">
            <button className="btn" onClick={() => emit('modal', { type: 'live', title: b.name, url: b.live! })}>
              {b.liveLabel} →
            </button>
            <a className="btn ghost" href={b.live} target="_blank" rel="noopener noreferrer">
              New tab ↗
            </a>
          </div>
        )}
      </div>
    </Ov>
  );
}

function SwarmControls() {
  const [random, setRandom] = useState(false);
  useEffect(() => on('swarm', setRandom), []);
  return (
    <div>
      <div className="toggle" role="group" aria-label="Swarm planner">
        <button aria-pressed={!random} onClick={() => setSwarmRandom(false)}>
          Collision-free
        </button>
        <button aria-pressed={random} onClick={() => setSwarmRandom(true)}>
          Random pairing
        </button>
      </div>
      <p className={`counter ${random ? 'bad' : ''}`} style={{ marginTop: 12 }}>
        <b id="swarm-count">0</b> collisions
      </p>
    </div>
  );
}
