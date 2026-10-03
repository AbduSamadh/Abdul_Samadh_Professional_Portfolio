'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { journey, navigate } from '@/lib/journey';
import { SCROLL_VH } from '@/lib/path';
import { initTheme } from '@/lib/theme';
import { detectProfile, type Profile } from '@/lib/device';
import ScrollSystem from './ScrollSystem';
import Boot from './dom/Boot';
import HUD from './dom/HUD';
import Overlays from './dom/Overlays';
import Terminal from './dom/Terminal';
import Modal from './dom/Modal';
import Flash from './dom/Flash';

// WebGL only on the client.
const Scene = dynamic(() => import('./canvas/Scene'), { ssr: false });

type Env = Profile & { reduced: boolean };

function detect(): Env {
  return { ...detectProfile(), reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
}

export default function Experience() {
  const [env, setEnv] = useState<Env | null>(null);

  useEffect(() => {
    initTheme();
    const apply = () => {
      const e = detect();
      Object.assign(journey, { mobile: e.mobile, reduced: e.reduced, sheet: e.sheet, lx: e.lx, fovBoost: e.fovBoost, tier: e.tier });
      document.documentElement.dataset.sheet = e.sheet ? '1' : '';
      document.documentElement.dataset.tier = e.tier;
      setEnv((prev) => (prev && prev.key === e.key && prev.reduced === e.reduced ? prev : e));
    };
    apply();
    // Re-fit when the screen really changes shape (rotation, window resize), not when a phone's
    // address bar slides in and out.
    let lastW = window.innerWidth;
    let t = 0;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        if ((journey.mobile || coarse) && window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        apply();
      }, 300);
    };
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('resize', onResize);
    rm.addEventListener('change', apply);
    const onMove = (e: PointerEvent) => {
      journey.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      journey.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
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
        {env && <Scene key={env.key} mobile={env.mobile} reduced={env.reduced} tier={env.tier} />}
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
      {env && <ScrollSystem mobile={env.mobile} reduced={env.reduced} layoutKey={env.key} />}
    </>
  );
}
