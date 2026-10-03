'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { journey, navigate, setNavigate } from '@/lib/journey';
import { shots } from '@/lib/path';

/**
 * The master scroll timeline. Lenis smooths the wheel/touch input; ScrollTrigger maps scroll
 * position onto one GSAP timeline whose total duration is 1.0. Each tween in it moves the camera
 * curve parameter `journey.u` from one shot to the next with that segment's ease, so pacing and
 * weight are authored in one place (lib/path.ts).
 */
export default function ScrollSystem({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const lenis = reduced
      ? null
      : new Lenis({ lerp: mobile ? 0.12 : 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4, smoothWheel: true });
    const raf = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      if (!journey.booted) lenis.stop();
    }
    const onBooted = () => lenis?.start();
    window.addEventListener('as:booted', onBooted);

    const list = shots(mobile);
    const n = list.length - 1;
    journey.u = 0;
    const tl = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      scrollTrigger: {
        trigger: '#journey',
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduced ? true : mobile ? 0.8 : 1.25,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        journey.progress = tl.time();
      },
    });
    for (let i = 1; i <= n; i++) {
      const a = list[i - 1];
      const b = list[i];
      tl.fromTo(
        journey,
        { u: (i - 1) / n },
        { u: i / n, duration: b.p - a.p, ease: b.ease ?? 'power1.inOut', immediateRender: false },
        a.p,
      );
    }

    setNavigate((p, immediate) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = Math.max(0, Math.min(1, p)) * max;
      if (lenis) {
        const dist = Math.abs(target - window.scrollY) / window.innerHeight;
        lenis.scrollTo(target, {
          immediate: !!immediate,
          duration: Math.min(6, Math.max(1.4, dist * 0.06)),
          easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
          force: true,
        });
      } else {
        window.scrollTo({ top: target, behavior: 'auto' });
      }
    });

    // Handy from the console: __journey.progress, __go(0.5)
    Object.assign(window, { __journey: journey, __go: (p: number) => navigate(p, true) });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('as:booted', onBooted);
      tl.scrollTrigger?.kill();
      tl.kill();
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.destroy();
      }
    };
  }, [mobile, reduced]);

  return null;
}
