'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { journey, navigate } from '@/lib/journey';
import { SCROLL_VH } from '@/lib/path';
import { initTheme } from '@/lib/theme';
import ScrollSystem from './ScrollSystem';
import Boot from './dom/Boot';
import HUD from './dom/HUD';
import Overlays from './dom/Overlays';
import Terminal from './dom/Terminal';
import Modal from './dom/Modal';
import Flash from './dom/Flash';

// WebGL only on the client.
const Scene = dynamic(() => import('./canvas/Scene'), { ssr: false });

function detect() {
  const mobile = window.matchMedia('(max-width: 760px)').matches || (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { mobile, reduced };
}

export default function Experience() {
  const [env, setEnv] = useState<{ mobile: boolean; reduced: boolean } | null>(null);

  useEffect(() => {
    initTheme();
    const apply = () => {
      const e = detect();
      journey.mobile = e.mobile;
      journey.reduced = e.reduced;
      setEnv((prev) => (prev && prev.mobile === e.mobile && prev.reduced === e.reduced ? prev : e));
    };
    apply();
    const mq = window.matchMedia('(max-width: 760px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', apply);
    rm.addEventListener('change', apply);
    const onMove = (e: PointerEvent) => {
      journey.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      journey.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      mq.removeEventListener('change', apply);
      rm.removeEventListener('change', apply);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <>
      <a
        className="skip"
        href="#contact"
        onClick={(e) => {
          e.preventDefault();
          navigate(1);
          setTimeout(() => document.querySelector<HTMLElement>('#contact a')?.focus(), 2500);
        }}
      >
        Skip to contact
      </a>
      <div className="stage" aria-hidden="true">
        {env && <Scene key={env.mobile ? 'm' : 'd'} mobile={env.mobile} reduced={env.reduced} />}
      </div>
      <Flash />
      <div className="fader" id="fader" aria-hidden="true" />
      <main>
        <Overlays />
      </main>
      <HUD />
      <Terminal />
      <Modal />
      <Boot />
      {/* The scroll track. Its height is the length of the journey. */}
      <div id="journey" className="spacer" style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />
      {env && <ScrollSystem mobile={env.mobile} reduced={env.reduced} />}
    </>
  );
}
