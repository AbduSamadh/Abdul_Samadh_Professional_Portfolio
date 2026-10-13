import type { Metadata } from 'next';
import { SHARE_IMAGE, asset } from '@/lib/asset';
import { abstract, authoring, briefs, builds, contact, credentials, lab, person, route, scale } from '@/content/site';
import { featured, testimonials } from '@/content/testimonials';
import PrintButton from './PrintButton';
import s from './summary.module.css';

// The quick view: everything in the 3D journey on one plain, printable page, read from the same
// content files so the two never drift apart.

export const metadata: Metadata = {
  title: 'Abdul Samadh — Summary',
  description: person.oneLine,
  alternates: { canonical: './' },
  // a page's openGraph replaces the layout's, so the image is repeated here
  openGraph: { title: 'Abdul Samadh — Summary', description: person.oneLine, url: './', type: 'profile', images: [SHARE_IMAGE] },
};

const quotes = featured.map((n) => testimonials.find((t) => t.name === n)).filter((t) => !!t);

export default function Summary() {
  return (
    <main className={s.page}>
      <nav className={s.top}>
        <a href={asset('/')}>← The 3D portfolio</a>
        <span>Quick view</span>
      </nav>

      <header className={s.head}>
        <div>
          <p className={s.kicker}>
            <span className={s.dot} />
            Now · {person.now}
          </p>
          <h1>{person.name}</h1>
          <p className={s.pitch}>{person.pitch}</p>
          <p className={s.mist}>{person.span}</p>
          <div className={s.actions}>
            <a className={s.btn} href={person.linkedin} target="_blank" rel="noopener noreferrer">
              Connect on LinkedIn ↗
            </a>
            {person.cv && (
              <a className={s.ghost} href={asset(person.cv)} download>
                Download CV
              </a>
            )}
            <PrintButton className={s.ghost} />
          </div>
        </div>
        <img className={s.photo} src={asset('/assets/portrait.jpg')} alt="Abdul Samadh" width={560} height={626} />
      </header>

      <section aria-labelledby="numbers">
        <h2 id="numbers">By the numbers</h2>
        <ul className={s.stats}>
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

      <section aria-labelledby="experience">
        <h2 id="experience">Experience</h2>
        <ol className={s.roles}>
          {route
            .slice()
            .reverse()
            .map((r) => (
              <li key={r.id}>
                <p className={s.when}>{r.now ? 'Now' : r.period}</p>
                <div>
                  <h3>{r.role ?? r.org}</h3>
                  <p className={s.org}>
                    {r.role && <b>{r.org}</b>}
                    <span>
                      {r.city ? `${r.city}, ` : ''}
                      {r.country}
                    </span>
                  </p>
                  <p>{r.body}</p>
                  {r.wins && (
                    <ul className={s.wins}>
                      {r.wins.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
        </ol>
      </section>

      <section aria-labelledby="competitions">
        <h2 id="competitions">Competitions</h2>
        <h3>{scale.fll.title}</h3>
        <p>{scale.fll.body}</p>
        <p className={s.mist}>{scale.fll.judged}</p>
      </section>

      <section aria-labelledby="builds">
        <h2 id="builds">Software I built</h2>
        <p className={s.mist}>{builds.title}. {builds.body}</p>
        <ul className={s.cards}>
          {builds.items.map((b) => (
            <li key={b.id}>
              <h3>{b.name}</h3>
              <p>{b.body}</p>
              <p className={s.tags}>{b.tags.join(' · ')}</p>
              {b.live && (
                <a href={b.live} target="_blank" rel="noopener noreferrer">
                  {b.liveLabel} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="curriculum">
        <h2 id="curriculum">Curriculum</h2>
        <p>{abstract.parts.map(([t]) => t).join('')}</p>
        <h3>{authoring.title}</h3>
        <p className={s.mist}>{authoring.body}</p>
        <ul className={s.list}>
          {authoring.books.map((b) => (
            <li key={b.n}>
              <b>{b.title}.</b> {b.body}
            </li>
          ))}
        </ul>
        <h3>{briefs.title}</h3>
        <p className={s.mist}>{briefs.body}</p>
        <p className={s.inline}>{briefs.items.map((b) => b.title).join(' · ')}</p>
      </section>

      <section aria-labelledby="labs">
        <h2 id="labs">{lab.title}</h2>
        <p>{lab.body}</p>
        <ul className={s.list}>
          {lab.bays.map((b) => (
            <li key={b.id}>
              <b>{b.title}.</b> {b.did}
              <span className={s.kit}>{b.items.join(', ')}</span>
            </li>
          ))}
        </ul>
      </section>

      {quotes.length > 0 && (
        <section aria-labelledby="recommendations">
          <h2 id="recommendations">Recommendations</h2>
          <ul className={s.quotes}>
            {quotes.map((t) => (
              <li key={t.name}>
                <blockquote>“{t.quote}”</blockquote>
                <p className={s.mist}>
                  <b>{t.name}</b>, {t.role}
                  {t.org ? `, ${t.org}` : ''}
                </p>
              </li>
            ))}
          </ul>
          <p className={s.mist}>
            More on{' '}
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </section>
      )}

      <section aria-labelledby="credentials" className={s.cols}>
        <div>
          <h2 id="credentials">Education</h2>
          <ul className={s.list}>
            {credentials.education.map((e) => (
              <li key={e.title}>
                <b>{e.title}</b>, {e.where}
              </li>
            ))}
          </ul>
          <h2>Certification</h2>
          <ul className={s.list}>
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
          <h2>Standards</h2>
          <p className={s.inline}>{credentials.standards.join(' · ')}</p>
          <h2>Languages</h2>
          <ul className={s.list}>
            {credentials.languages.map((l) => (
              <li key={l.name}>
                <b>{l.name}</b>, {l.level.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className={s.foot}>
        <p className={s.pitch}>{contact.title}</p>
        <p className={s.mist}>{contact.body}</p>
        <div className={s.actions}>
          <a className={s.btn} href={person.linkedin} target="_blank" rel="noopener noreferrer">
            Connect on LinkedIn ↗
          </a>
          <a className={s.ghost} href={asset('/')}>
            Enter the 3D portfolio
          </a>
        </div>
        <p className={s.small}>{contact.footer}</p>
      </footer>
    </main>
  );
}
