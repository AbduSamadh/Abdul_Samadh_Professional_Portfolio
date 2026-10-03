import { testimonials } from '@/content/testimonials';

/** One LinkedIn recommendation, in full. */
export default function Testimonial({ i }: { i: number }) {
  const t = testimonials[i];
  const n = testimonials.length;
  return (
    <div className="panel quote">
      <p className="kicker">
        Recommendation {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · LinkedIn
      </p>
      <figure className="quote-body">
        <blockquote>“{t.quote}”</blockquote>
        {t.detail && <p>{t.detail}</p>}
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
