import type { Metadata, Viewport } from 'next';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/electrolize/400.css';
import '@fontsource/vt323/400.css';
import './globals.css';

const description =
  'Abdul Samadh. Eleven years building outcomes-driven ICT, AI and STREAM curriculum for offline and online learning, across the UAE, the wider GCC, Singapore and India.';

// Social previews need absolute URLs. The share card is public/og.jpg (the black room and the
// hero at 1200x630); re-render it if the hero changes.
const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://abdusamadh.github.io';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const image = { url: 'og.jpg', width: 1200, height: 630, alt: 'Abdul Samadh: STREAM and AI curriculum, and the software that teaches it' };

export const metadata: Metadata = {
  metadataBase: new URL(`${origin}${base}/`),
  title: 'Abdul Samadh — Portfolio',
  description,
  openGraph: {
    title: 'Abdul Samadh — Portfolio',
    description,
    type: 'website',
    url: './',
    images: [image],
  },
  twitter: { card: 'summary_large_image', title: 'Abdul Samadh — Portfolio', description, images: [image] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B0713',
};

// Set the saved theme before first paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem('as-theme');if(t==='phosphor'||t==='paper')document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="neon" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
