import type { Metadata, Viewport } from 'next';
import '@fontsource/unbounded/500.css';
import '@fontsource/unbounded/700.css';
import '@fontsource/sora/400.css';
import '@fontsource/sora/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/vt323/400.css';
import './globals.css';

const description =
  'Abdul Samadh. Twelve years building outcomes-driven ICT, AI and STREAM curriculum for offline and online learning, across the UAE, GCC, Singapore and India.';

export const metadata: Metadata = {
  title: 'Abdul Samadh — Portfolio',
  description,
  openGraph: {
    title: 'Abdul Samadh — Portfolio',
    description,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Abdul Samadh — Portfolio', description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#100D0B',
};

// Set the saved theme before first paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem('as-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="amber" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
