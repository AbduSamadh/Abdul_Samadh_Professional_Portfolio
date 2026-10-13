'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { journey, navigate, setNavigate } from '@/lib/journey';

/**
 * Scroll → journey, in three stages, the same on every device:
 *
 * 1. Input. Lenis smooths the mouse wheel and trackpad on desktop. Touch screens keep the
 *    browser's own momentum scrolling, which is already smooth and feels native.
 * 2. Progress. ScrollTrigger turns the scroll position into a raw 0..1 target, and a single
 *    frame-rate-independent spring (below) eases `journey.progress` toward it. Everything — the
 *    camera, the reading panels, the HUD — reads that one value, so they always move together.
 * 3. Camera. CameraRig times its path from that progress (lib/path.ts `curveTiming`) so its
 *    speed changes continuously whether you scroll forward or back.
 */
export default function ScrollSystem({ mobile, reduced, layoutKey }: { mobile: boolean; reduced: boolean; layoutKey: string }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const coarse = mobile || window.matchMedia('(pointer: coarse)').matches;
    // Phone address bars resize the viewport while scrolling; don't recalculate for that.
    ScrollTrigger.config({ ignoreMobileResize: true });
    history.scrollRestoration = 'manual';
    // First load starts at the top. A re-fit (rotation, window resize) keeps the visitor where they were.
    const resumeAt = journey.started ? journey.progress : 0;
    if (!journey.started) window.scrollTo(0, 0);
    journey.started = true;

    // Desktop wheels and trackpads get Lenis; touch keeps native momentum.
    const lenis =
      reduced || coarse
        ? null
        : new Lenis({ lerp: 0.1, wheelMultiplier: 0.85, smoothWheel: true, syncTouch: false });
    const raf = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf);
      if (!journey.booted) lenis.stop();
    }
    gsap.ticker.lagSmoothing(0);
    // Hold the page still under the boot screen on touch, too.
    const lockTouch = (e: TouchEvent) => !journey.booted && e.preventDefault();
    window.addEventListener('touchmove', lockTouch, { passive: false });
    const onBooted = () => lenis?.start();
    window.addEventListener('as:booted', onBooted);

    let target = resumeAt;
    journey.progress = resumeAt;
    const st = ScrollTrigger.create({
      trigger: '#journey',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress;
      },
    });

    // The one spring. Higher = tighter; touch already carries momentum, so it follows a little closer.
    const lambda = coarse ? 7 : 6;
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 20);
      let p = journey.progress;
      if (reduced) p = target;
      else {
        p += (target - p) * (1 - Math.exp(-lambda * dt));
        if (Math.abs(target - p) < 1e-6) p = target;
      }
      journey.progress = p;
    };
    gsap.ticker.add(tick);

    setNavigate((p, immediate) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const to = Math.max(0, Math.min(1, p)) * max;
      if (immediate) {
        target = Math.max(0, Math.min(1, p));
        journey.progress = target;
      }
      if (lenis) {
        const dist = Math.abs(to - window.scrollY) / window.innerHeight;
        lenis.scrollTo(to, {
          immediate: !!immediate,
          duration: Math.min(6, Math.max(1.4, dist * 0.06)),
          easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
          force: true,
        });
      } else {
        window.scrollTo({ top: to, behavior: immediate || reduced ? 'auto' : 'smooth' });
      }
    });

    // Put the page back at the same point of the journey (the page length changes with the screen).
    const holdPlace = (p: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, p * max);
      lenis?.resize();
      lenis?.scrollTo(p * max, { immediate: true, force: true });
      target = p;
      journey.progress = p;
      ScrollTrigger.update();
    };
    if (resumeAt > 0) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        holdPlace(resumeAt);
      });
    }

    // Handy from the console: __journey.progress, __go(0.5)
    Object.assign(window, { __journey: journey, __go: (p: number) => navigate(p, true) });

    let lastW = window.innerWidth;
    const onResize = () => {
      // Height-only changes on touch screens are the address bar; ignore them.
      if (window.innerWidth === lastW && coarse) return;
      lastW = window.innerWidth;
      const p = journey.progress;
      ScrollTrigger.refresh();
      holdPlace(p);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('as:booted', onBooted);
      window.removeEventListener('touchmove', lockTouch);
      gsap.ticker.remove(tick);
      st.kill();
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.destroy();
      }
    };
  }, [mobile, reduced, layoutKey]);

  return null;
}
