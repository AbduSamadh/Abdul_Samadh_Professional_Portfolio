import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import './paper.css';
import LabScene from '@/components/lab/LabScene';
import LabTerminal, { TerminalButton } from '@/components/lab/LabTerminal';
import { asset, SUMMARY } from '@/lib/asset';
import { authoring, briefs, builds, contact, credentials, person, route, scale, who } from '@/content/site';
import { featured, testimonials } from '@/content/testimonials';

// Home: the lab (an image you explore) on top, then a plain reading layer with everything a
// recruiter or a school needs, in order. Copy comes from content/.

const quotes = featured.map((n) => testimonials.find((t) => t.name === n)).filter((t) => !!t);
const EXPLORE = asset('/explore/');

export default function Home() {
  return (
    <>
      <a className="skip" href="#experience">
        Skip to the reading version
      </a>

      <header className="bar">
        <a className="brand" href="#top">
          <b>{person.name}</b>
          <span>STREAM and AI curriculum</span>
        </a>
        <nav aria-label="Sections">
          <a href="#lab">Lab</a>
          <a href="#experience">Experience</a>
          <a href="#work">Work</a>
          {person.cv ? (
            <a href={asset(person.cv)} download>
              CV
            </a>
          ) : (
            <a href={SUMMARY}>One page</a>
          )}
          <a className="bar-cta" href="#contact">
            Contact
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="intro">
          <div>
            <h1>{person.name}</h1>
            <p className="now">
              <span className="live" aria-hidden="true" />
              {person.nowShort}
            </p>
          </div>
          <p className="pitch">{person.pitch}</p>
        </section>

        <div id="lab" className="lab-wrap">
          <LabScene />
        </div>

        <section className="wrap about" aria-labelledby="about-h">
          <h2 id="about-h" className="label">
            {who.kicker}
          </h2>
          <div className="about-grid">
            <div>
              <p className="lede">{who.title}.</p>
              <p>{who.body}</p>
              <p className="mist">{person.span}</p>
            </div>
            <img className="portrait" src={asset('/assets/portrait.jpg')} alt={person.name} width={560} height={626} loading="lazy" />
          </div>
          <ul className="stats">
            {scale.stats.map((st) => (
              <li key={st.label}>
                <b>
                  {st.value.toLocaleString('en')}
                  {st.suffix}
                </b>
                <span>{st.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="experience" className="wrap" aria-labelledby="exp-h">
          <h2 id="exp-h" className="label">
            Experience
          </h2>
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
            <h3>{scale.fll.title}</h3>
            <p>{scale.fll.body}</p>
            <p className="mist">{scale.fll.judged}</p>
          </div>
        </section>

        <section id="work" className="wrap" aria-labelledby="work-h">
          <h2 id="work-h" className="label">
            Work
          </h2>
          <p className="lede">{builds.title}.</p>
          <p className="mist">{builds.body}</p>
          <ul className="cards">
            {builds.items.map((b) => (
              <li key={b.id}>
                <h3>{b.name}</h3>
                {b.tagline && <p className="tagline">{b.tagline}</p>}
                <p>{b.body}</p>
                {b.classroom && <p className="mist">{b.classroom}</p>}
                <p className="tags">{b.tags.join(' · ')}</p>
                {(b.live || b.code) && (
                  <p className="links">
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
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="two">
            <div>
              <h3>{authoring.title}</h3>
              <p className="mist">{authoring.body}</p>
              <ul className="plain">
                {authoring.books.map((b) => (
                  <li key={b.n}>
                    <b>{b.title}.</b> {b.body}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{briefs.title}</h3>
              <p className="mist">{briefs.body}</p>
              <ul className="pills">
                {briefs.items.map((b) => (
                  <li key={b.n}>{b.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {quotes.length > 0 && (
          <section className="wrap" aria-labelledby="rec-h">
            <h2 id="rec-h" className="label">
              Recommendations
            </h2>
            <ul className="quotes">
              {quotes.map((t) => (
                <li key={t.name}>
                  <blockquote>“{t.quote}”</blockquote>
                  <p className="mist">
                    <b>{t.name}</b>, {t.role}
                    {t.org ? `, ${t.org}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="wrap creds" aria-labelledby="cred-h">
          <div>
            <h2 id="cred-h" className="label">
              Education and certification
            </h2>
            <ul className="plain">
              {credentials.education.map((e) => (
                <li key={e.title}>
                  <b>{e.title}</b>, {e.where}
                </li>
              ))}
              {credentials.certifications.map((c) => (
                <li key={c.title}>
                  <b>{c.title}</b>
                  {'where' in c && c.where ? `, ${c.where}` : ''}
                  {'when' in c && c.when ? ` (${c.when})` : ''}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="label">Standards and languages</h2>
            <p>{credentials.standards.join(' · ')}</p>
            <p>{credentials.languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(' · ')}</p>
          </div>
        </section>

        <section id="contact" className="wrap contact" aria-labelledby="contact-h">
          <h2 id="contact-h">{contact.title}</h2>
          <p className="mist">{contact.body}</p>
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
        </section>
      </main>

      <footer className="foot wrap">
        <p>{contact.footer}</p>
        <p>
          <a href={EXPLORE}>The 3D journey</a>
          <span aria-hidden="true"> · </span>
          <TerminalButton className="linkish" />
        </p>
      </footer>

      <LabTerminal />
    </>
  );
}
