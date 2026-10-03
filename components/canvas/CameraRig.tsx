'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journey } from '@/lib/journey';
import { P, shots } from '@/lib/path';
import { damp } from './parts/common';

/**
 * The camera is the main character. Shots from lib/path.ts become two Catmull-Rom curves
 * (position and look target). The GSAP master timeline writes `journey.u`; this samples the curves.
 * In reduced-motion mode the camera snaps between resting shots behind a short crossfade.
 */
export default function CameraRig({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const list = useMemo(() => shots(mobile), [mobile]);
  const n = list.length - 1;
  const { pos, look, fovs, stops } = useMemo(() => {
    const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
    return {
      pos: new THREE.CatmullRomCurve3(list.map((s) => v(s.pos)), false, 'centripetal'),
      look: new THREE.CatmullRomCurve3(list.map((s) => v(s.look)), false, 'centripetal'),
      fovs: list.map((s) => s.fov ?? (mobile ? 64 : 50)),
      stops: list.map((s, i) => (s.stop ? i : -1)).filter((i) => i >= 0),
    };
  }, [list, mobile]);

  const p = useMemo(() => new THREE.Vector3(), []);
  const l = useMemo(() => new THREE.Vector3(), []);
  const par = useRef({ x: 0, y: 0, roll: 0, lastX: 0, pending: false, shift: 0 });

  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    let u = journey.u;

    if (reduced) {
      // Snap to the nearest resting shot, hidden behind a quick fade.
      const prog = journey.progress;
      let best = stops[0];
      for (const i of stops) if (list[i].p <= prog + 0.004) best = i;
      if (best !== journey.still && !par.current.pending) {
        const fader = document.getElementById('fader');
        par.current.pending = true;
        fader?.classList.add('on');
        setTimeout(() => {
          journey.still = best;
          setTimeout(() => {
            fader?.classList.remove('on');
            par.current.pending = false;
          }, 60);
        }, 230);
      }
      u = journey.still / n;
    }

    pos.getPoint(u, p);
    look.getPoint(u, l);

    const f = u * n;
    const i = Math.min(n - 1, Math.floor(f));
    const t = f - i;
    const fov = THREE.MathUtils.lerp(fovs[i], fovs[i + 1], t * t * (3 - 2 * t));

    // Subtle pointer parallax, faded out near the laptop screen where it would break the framing.
    const k = !mobile && !reduced ? Math.min(1, Math.abs(journey.progress - P.screen) / 0.03) : 0;
    const pr = par.current;
    pr.x = damp(pr.x, journey.pointer.x * 0.28 * k, 2.5, dt);
    pr.y = damp(pr.y, journey.pointer.y * 0.16 * k, 2.5, dt);

    cam.position.set(p.x + pr.x, p.y + pr.y, p.z);
    l.x += pr.x * 0.4;
    l.y += pr.y * 0.4;
    cam.lookAt(l);

    // Bank gently into lateral moves.
    const vx = dt > 0 ? (p.x - pr.lastX) / dt : 0;
    pr.lastX = p.x;
    pr.roll = damp(pr.roll, THREE.MathUtils.clamp(-vx * 0.01, -0.05, 0.05), 3, dt);
    if (!reduced) cam.rotateZ(pr.roll);

    // On phones, shift the lens so the subject sits in the upper part of the frame, above the reading panel.
    if (mobile) {
      const want = journey.progress > P.tunnel ? 0.3 : 0;
      const prev = pr.shift;
      pr.shift = damp(pr.shift, want, 2, dt);
      if (Math.abs(prev - pr.shift) > 1e-4 || !cam.view) {
        const { width, height } = state.size;
        cam.setViewOffset(width, height * (1 + pr.shift), 0, height * pr.shift, width, height);
      }
    }

    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
