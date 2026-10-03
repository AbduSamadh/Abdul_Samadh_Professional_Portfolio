'use client';
import { useEffect, useState } from 'react';
import { testimonials } from '@/content/testimonials';

/** LinkedIn recommendations, one at a time. Advances on its own; arrows to step. */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const n = testimonials.length;
  useEffect(() => {
    if (n < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % n), 9000);
    return () => clearInterval(id);
  }, [n, i]);
  if (!n) return null;
  const t = testimonials[i];
  return (
    <div className="panel quote">
      <p className="kicker">Recommendations · LinkedIn</p>
      <figure key={i} className="quote-body">
        <blockquote>“{t.quote}”</blockquote>
        {t.detail && <p className="mist">{t.detail}</p>}
        <figcaption>
          <b>{t.name}</b>
          <span className="mist">
            {t.role}
            {t.org ? `, ${t.org}` : ''}
          </span>
        </figcaption>
      </figure>
      {n > 1 && (
        <div className="quote-nav">
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous recommendation">←</button>
          <span>
            {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next recommendation">→</button>
        </div>
      )}
    </div>
  );
}
