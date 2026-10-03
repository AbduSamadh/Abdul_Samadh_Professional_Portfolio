'use client';
import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { journey } from '@/lib/journey';
import { getPalette, subscribeTheme } from '@/lib/theme';

const RAMP = ' .:-=+*#%@';
const NOISE = '!#$%&*+-:;<=>?@[]^_{|}~0123456789ABCDEFabcdef';
const COLS = 56;
const ROWS = 63; // keeps the photo's 560×626 proportions with square-ish cells

/**
 * The landing portrait: glyphs scramble in, settle into an ASCII portrait, then a scanline decodes it
 * into the photograph. Click to toggle between the two.
 */
export default function GlyphPortrait() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [decoded, setDecoded] = useState(false);
  const state = useRef({ decoded: false, t0: 0, decodeAt: -1, encodeAt: -1, img: null as HTMLImageElement | null, lum: null as Float32Array | null });

  useEffect(() => {
    const c = canvas.current!;
    const g = c.getContext('2d')!;
    const W = 560, H = 626;
    c.width = W;
    c.height = H;
    const st = state.current;
    const img = new Image();
    img.src = asset('/assets/portrait.jpg');
    img.onload = () => {
      const s = document.createElement('canvas');
      s.width = COLS;
      s.height = ROWS;
      const sg = s.getContext('2d', { willReadFrequently: true })!;
      sg.drawImage(img, 0, 0, COLS, ROWS);
      const d = sg.getImageData(0, 0, COLS, ROWS).data;
      const lum = new Float32Array(COLS * ROWS);
      for (let i = 0; i < lum.length; i++) lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
      st.img = img;
      st.lum = lum;
      // Start once the boot screen has gone, so the glyphs are seen settling.
      const start = () => {
        st.t0 = performance.now();
        st.decodeAt = st.t0 + 2600;
      };
      if (journey.booted) start();
      else {
        st.t0 = Infinity;
        window.addEventListener('as:booted', start, { once: true });
      }
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let accent = getPalette().accent;
    let bg = getPalette().dark ? '#0b0907' : getPalette().bg2;
    const unsub = subscribeTheme(() => {
      accent = getPalette().accent;
      bg = getPalette().dark ? '#0b0907' : getPalette().bg2;
    });
    const cw = W / COLS, ch = H / ROWS;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!st.lum || !st.img) return;
      const settle = reduced ? 1 : Math.max(0, Math.min(1, (now - st.t0) / 1800));
      // decode progress 0..1 (top to bottom); runs backwards when encoding
      let k = 0;
      if (st.decoded || (st.decodeAt > 0 && now >= st.decodeAt)) {
        if (!st.decoded) {
          st.decoded = true;
          setDecoded(true);
        }
        k = reduced ? 1 : Math.min(1, (now - Math.max(st.decodeAt, 0)) / 1400);
      }
      if (!st.decoded && st.encodeAt > 0) k = 1 - (reduced ? 1 : Math.min(1, (now - st.encodeAt) / 1100));

      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      g.font = `600 ${Math.round(ch * 1.05)}px "IBM Plex Mono", monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = accent;
      const front = k * (ROWS + 4);
      for (let y = 0; y < ROWS; y++) {
        if (y < front - 2) continue; // already photograph
        for (let x = 0; x < COLS; x++) {
          const l = st.lum[y * COLS + x];
          // each cell settles at its own moment
          const seed = ((x * 73856093) ^ (y * 19349663)) >>> 0;
          const when = (seed % 1000) / 1000;
          let glyph: string;
          if (settle < when) glyph = NOISE[(seed + Math.floor(now / 60)) % NOISE.length];
          else glyph = RAMP[Math.min(9, Math.floor(l * 1.1 * 10))];
          if (glyph === ' ') continue;
          g.globalAlpha = 0.35 + l * 0.65;
          g.fillText(glyph, x * cw + cw / 2, y * ch + ch / 2);
        }
      }
      g.globalAlpha = 1;
      if (front > 0) {
        const py = Math.min(H, (front - 2) * ch);
        if (py > 0) g.drawImage(st.img, 0, 0, st.img.naturalWidth, st.img.naturalHeight * (py / H), 0, 0, W, py);
        if (k < 1) {
          g.fillStyle = accent;
          g.fillRect(0, py - 2, W, 3);
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
  }, []);

  const toggle = () => {
    const st = state.current;
    const now = performance.now();
    if (st.decoded) {
      st.decoded = false;
      st.decodeAt = -1;
      st.encodeAt = now;
      setDecoded(false);
    } else {
      st.encodeAt = -1;
      st.decodeAt = now;
    }
  };

  return (
    <figure className="glyph-portrait">
      <button onClick={toggle} aria-label={decoded ? 'Show the portrait as glyphs' : 'Decode the portrait'}>
        <canvas ref={canvas} role="img" aria-label="Portrait of Abdul Samadh" />
      </button>
      <figcaption>{decoded ? 'Abdul Samadh · Dubai, UAE' : 'Click to decode'}</figcaption>
    </figure>
  );
}
