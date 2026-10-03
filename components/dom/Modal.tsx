'use client';
import { useEffect, useRef, useState } from 'react';
import { emit, on, type ModalPayload } from '@/lib/journey';

/** Click-to-expand: live builds in an iframe, briefs and other detail as text. */
export default function Modal() {
  const [m, setM] = useState<ModalPayload | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => on('modal', setM), []);

  useEffect(() => {
    if (m) {
      opener.current = document.activeElement;
      setTimeout(() => close.current?.focus(), 30);
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('modal', null);
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    } else if (opener.current instanceof HTMLElement) {
      opener.current.focus();
    }
  }, [m]);

  return (
    <div
      className={`modal ${m ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!m}
      aria-label={m?.title}
      onClick={(e) => e.target === e.currentTarget && emit('modal', null)}
    >
      {m?.type === 'live' && (
        <div className="modal-card">
          <div className="modal-head">
            <span>{m.title} · live build</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <a className="modal-close" href={m.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                New tab ↗
              </a>
              <button ref={close} className="modal-close" onClick={() => emit('modal', null)}>
                Close ×
              </button>
            </span>
          </div>
          <iframe src={m.url} title={`${m.title}, live build`} loading="lazy" allow="fullscreen" />
        </div>
      )}
      {m?.type === 'text' && (
        <div className="modal-card text">
          <button ref={close} className="modal-close" onClick={() => emit('modal', null)}>
            Close ×
          </button>
          {m.kicker && <p className="kicker">{m.kicker}</p>}
          <h2>{m.title}</h2>
          <p>{m.body}</p>
          {m.tags && (
            <ul className="tags">
              {m.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {m.link && (
            <div className="btns">
              <a className="btn" href={m.link.href} target="_blank" rel="noopener noreferrer">
                {m.link.label} →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
