// Prefix public/ paths with the deploy base path (GitHub Pages serves from /<repo>/).
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (p: string) => `${BASE}${p}`;

export const FONTS = {
  display: asset('/fonts/space-grotesk-latin-700-normal.woff'),
  displayMedium: asset('/fonts/space-grotesk-latin-500-normal.woff'),
  mono: asset('/fonts/ibm-plex-mono-latin-500-normal.woff'),
  monoRegular: asset('/fonts/ibm-plex-mono-latin-400-normal.woff'),
  crt: asset('/fonts/vt323-latin-400-normal.woff'),
  typeface: asset('/fonts/space-grotesk-700.typeface.json'),
};
