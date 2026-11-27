import type { Metadata, Viewport } from 'next';
import '../legacy-styles';
import Experience from '@/components/Experience';

// The original 3D journey, kept as an optional walk-through. The home page is the lab.

export const metadata: Metadata = {
  title: 'Abdul Samadh — The 3D journey',
  alternates: { canonical: './' },
};

export const viewport: Viewport = { themeColor: '#0B0713' };

export default function Explore() {
  return <Experience />;
}
