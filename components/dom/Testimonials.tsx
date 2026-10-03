'use client';
import { useEffect, useState } from 'react';
import { journey } from '@/lib/journey';
import { testimonials } from '@/content/testimonials';

/** One LinkedIn recommendation, in full. */
export default function Testimonial({ i }: { i: number }) {
  const t = testimonials[i];
  const n = testimonials.length;
  // On small screens the full text folds away behind a tap, so the panel stays short.
  const [compact, setCompact] = useState(false);
  useEffect(() => setCompact(journey.sheet), []);
  return (
    <div className="panel quote">
      <p className="kicker">
        Recommendation {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · LinkedIn
      </p>
      <figure className="quote-body">
        <blockquote>“{t.quote}”</blockquote>
        {t.detail &&
          (compact ? (
            <details className="more">
              <summary>Read the full recommendation</summary>
              <p>{t.detail}</p>
            </details>
          ) : (
            <p>{t.detail}</p>
          ))}
        <figcaption>
          <b>{t.name}</b>
          <span className="mist">
            {t.role}
            {t.org ? `, ${t.org}` : ''}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
