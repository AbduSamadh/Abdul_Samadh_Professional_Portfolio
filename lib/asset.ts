// Prefix public/ paths with the deploy base path (GitHub Pages serves from /<repo>/).
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (p: string) => `${BASE}${p}`;

/** The social share card, relative to metadataBase (set in app/layout.tsx). */
export const SHARE_IMAGE = { url: 'og.jpg', width: 1200, height: 630, alt: 'Abdul Samadh: STREAM and AI curriculum, and the software that teaches it' };

/** The one-page quick view (app/summary). */
export const SUMMARY = asset('/summary/');

export const FONTS = {
  display: asset('/fonts/pixelify-sans-latin-700-normal.woff'),
  mono: asset('/fonts/electrolize-latin-400-normal.woff'),
  crt: asset('/fonts/vt323-latin-400-normal.woff'),
  typeface: asset('/fonts/pixelify-sans-700.typeface.json'),
};
