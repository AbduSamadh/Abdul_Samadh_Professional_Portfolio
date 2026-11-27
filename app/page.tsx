import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './paper.css';
import LabScene from '@/components/lab/LabScene';
import LabTerminal, { TerminalButton } from '@/components/lab/LabTerminal';
import { asset, SUMMARY } from '@/lib/asset';
import { authoring, briefs, builds, contact, credentials, person, route, scale, who } from '@/content/site';
import { featured, testimonials } from '@/content/testimonials';

// Home, as a set of drawing sheets. Sheet 01 is the lab (drawn, then built as you scroll). The
// rest read like the sheets that follow a plan: the brief, the timeline, the parts list, the
// specifications and the sign-off. Copy comes from content/.

const quotes = featured.map((n) => testimonials.find((t) => t.name === n)).filter((t) => !!t);
const EXPLORE = asset('/explore/');
const SHEETS = 6;

// The timeline's scale. Spans are read from each role's dates on the CV; roles with no end
// date run to now.
const T0 = 2015;
const NOW = 2026.9;
const T1 = 2027;
const spans: Record<string, [number, number]> = {
  trainer: [2015.25, 2018.3],
  chrysalis: [2018.25, 2021],
  alphagen: [2021, 2024.5],
  'coding-school': [2024.42, 2025.5],
  atlab: [2025.5, NOW],
  sunmarke: [NOW, NOW],
};
const pct = (y: number) => `${((y - T0) / (T1 - T0)) * 100}%`;
const years = Array.from({ length: T1 - T0 + 1 }, (_, i) => T0 + i);

function SheetHead({ n, title, note }: { n: number; title: string; note?: string }) {
  return (
    <div className="sheet-head">
      <span>
        <b>{String(n).padStart(2, '0')}</b> {title}
      </span>
      {note && <span className="sheet-note">{note}</span>}
      <span>
        Sheet {String(n).padStart(2, '0')} / {String(SHEETS).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#brief">
        Skip to the reading version
      </a>

      <nav className="rev" aria-label="Sections">
        <span className="rev-title" aria-hidden="true">
          Index
        </span>
        <a href="#top">01 Lab</a>
        <a href="#brief">02 Brief</a>
        <a href="#experience">03 Timeline</a>
        <a href="#work">04 Parts</a>
        <a href="#specs">05 Specs</a>
        <a className="rev-cta" href="#contact">
          06 Contact
        </a>
      </nav>

      <main id="top">
        <LabScene />

        <section id="brief" className="sheet" aria-labelledby="brief-h">
          <SheetHead n={2} title="The brief" note={person.location} />
          <div className="brief">
            <h2 id="brief-h" className="statement">
              {who.title}. <em>{person.pitch}</em>
            </h2>
            <figure className="portrait">
              <img src={asset('/assets/portrait.jpg')} alt={person.name} width={560} height={626} loading="lazy" />
              <figcaption>Fig. 1 · {person.name}</figcaption>
            </figure>
            <div className="brief-body">
              <p>{who.body}</p>
              <p className="mist">{person.span}</p>
            </div>
          </div>
          <ul className="figures">
            {scale.stats.map((st, i) => (
              <li key={st.label}>
                <span className="fig-n">{String.fromCharCode(65 + i)}</span>
                <b>
                  {st.value.toLocaleString('en')}
                  <i>{st.suffix}</i>
                </b>
                <span>{st.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="experience" className="sheet" aria-labelledby="exp-h">
          <SheetHead n={3} title="Timeline" note="Scale: 1 year" />
          <h2 id="exp-h" className="sheet-title">
            Eleven years, <em>to scale</em>
          </h2>

          <div className="gantt" aria-hidden="true">
            <div className="gantt-axis">
              {years.map((y) => (
                <span key={y} style={{ left: pct(y) }}>
                  {y === T1 ? '' : `’${String(y).slice(2)}`}
                </span>
              ))}
              <span className="gantt-now" style={{ left: pct(NOW) }}>
                Now
              </span>
            </div>
            {route.map((r) => {
              const [a, b] = spans[r.id] ?? [NOW, NOW];
              const point = a === b;
              return (
                <div className="gantt-row" key={r.id}>
                  <span
                    className={point ? 'gantt-bar gantt-point' : 'gantt-bar'}
                    style={{ left: pct(a), width: point ? undefined : `calc(${pct(b)} - ${pct(a)})` }}
                  />
                  <span className="gantt-label" style={point ? { right: `calc(100% - ${pct(a)} + 14px)` } : { left: pct(a) }}>
                    {r.label ?? r.org}
                  </span>
                </div>
              );
            })}
          </div>

          <ol className="roles">
            {route
              .slice()
              .reverse()
              .map((r) => (
                <li key={r.id}>
                  <p className="when">{r.now ? 'Now' : r.period}</p>
                  <div>
                    <h3>{r.role ?? r.org}</h3>
                    <p className="org">
                      {r.role && <b>{r.org}</b>}
                      <span>
                        {r.city ? `${r.city}, ` : ''}
                        {r.country}
                      </span>
                    </p>
                    <p>{r.body}</p>
                    {r.wins && (
                      <ul className="wins">
                        {r.wins.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
          </ol>
          <div className="fll">
            <span className="stamp">Judged</span>
            <div>
              <h3>{scale.fll.title}</h3>
              <p>{scale.fll.body}</p>
              <p className="mist">{scale.fll.judged}</p>
            </div>
          </div>
        </section>

        <section id="work" className="sheet" aria-labelledby="work-h">
          <SheetHead n={4} title="Parts list" note={`${builds.items.length} items`} />
          <h2 id="work-h" className="sheet-title">
            {builds.title.replace(/ because the lesson needed it$/, '')}, <em>because the lesson needed it</em>
          </h2>
          <ol className="parts">
            {builds.items.map((b, i) => (
              <li key={b.id}>
                <span className="part-no">{String(i + 1).padStart(3, '0')}</span>
                <div className="part-name">
                  <h3>{b.name}</h3>
                  {b.tagline && <p>{b.tagline}</p>}
                </div>
                <div className="part-body">
                  <p>{b.body}</p>
                  {b.classroom && <p className="mist">{b.classroom}</p>}
                  <p className="tags">{b.tags.join(' / ')}</p>
                </div>
                <div className="part-links">
                  {b.live && (
                    <a href={b.live} target="_blank" rel="noopener noreferrer">
                      {b.liveLabel} ↗
                    </a>
                  )}
                  {b.code && (
                    <a href={b.code} target="_blank" rel="noopener noreferrer">
                      Code ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="specs" className="sheet" aria-labelledby="spec-h">
          <SheetHead n={5} title="Specifications" note={credentials.standards.join(' · ')} />
          <div className="spec">
            <div>
              <h2 id="spec-h" className="sheet-title">
                {authoring.title.split(',')[0]}, <em>{authoring.title.split(',').slice(1).join(',').trim()}</em>
              </h2>
              <p className="mist">{authoring.body}</p>
              <ol className="books">
                {authoring.books.map((b) => (
                  <li key={b.n}>
                    <span>{b.n}</span>
                    <div>
                      <b>{b.title}</b>
                      <p>{b.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="mono-h">{briefs.title}</h3>
              <p className="mist">{briefs.body}</p>
              <p className="briefs">
                {briefs.items.map((b) => (
                  <span key={b.n}>{b.title}</span>
                ))}
              </p>
            </div>
          </div>
          {quotes.length > 0 && (
            <ul className="quotes">
              {quotes.map((t) => (
                <li key={t.name}>
                  <blockquote>“{t.quote}”</blockquote>
                  <p>
                    <b>{t.name}</b>
                    <span>
                      {t.role}
                      {t.org ? `, ${t.org}` : ''}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="contact" className="sheet signoff" aria-labelledby="contact-h">
          <SheetHead n={6} title="Sign-off" />
          <h2 id="contact-h" className="big">
            {contact.title.replace(/ remember\.$/, '')} <em>remember.</em>
          </h2>
          <p className="mist center">{contact.body}</p>
          <div className="actions">
            <a className="btn" href={person.linkedin} target="_blank" rel="noopener noreferrer">
              Connect on LinkedIn ↗
            </a>
            {person.cv && (
              <a className="btn ghost" href={asset(person.cv)} download>
                Download CV
              </a>
            )}
            <a className="btn ghost" href={SUMMARY}>
              One-page version
            </a>
          </div>

          <dl className="titleblock">
            <div>
              <dt>Drawn by</dt>
              <dd>{person.name}</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>
                {credentials.education.map((e) => (
                  <span key={e.title}>
                    {e.title}, {e.where}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Certified</dt>
              <dd>
                {credentials.certifications.map((c) => (
                  <span key={c.title}>
                    {c.title}
                    {'where' in c && c.where ? `, ${c.where}` : ''}
                    {'when' in c && c.when ? ` (${c.when})` : ''}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>{credentials.languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(' · ')}</dd>
            </div>
            <div>
              <dt>Also on file</dt>
              <dd>
                <a href={EXPLORE}>The 3D journey</a> · <TerminalButton className="linkish" />
              </dd>
            </div>
            <div>
              <dt>Rev.</dt>
              <dd>{contact.footer}</dd>
            </div>
          </dl>
        </section>
      </main>

      <LabTerminal />
    </>
  );
}
