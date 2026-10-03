'use client';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { W } from '@/lib/path';
import { gi, glyphMaterial, glyphMesh } from '@/lib/glyphs';
import { Label } from '../../parts/common';

/**
 * ASCII City, rebuilt in 3D: towers, roads, parks, traffic and pedestrians made of characters.
 * Traffic obeys the signals at every crossing. The weather cycles rain → snow → fog.
 */

const BLOCK = 5;
const ROAD = 2;
const N = 5;
const SPAN = N * BLOCK + (N - 1) * ROAD; // 33
const HALF = SPAN / 2;
const ROADS = Array.from({ length: N - 1 }, (_, k) => -HALF + BLOCK + ROAD / 2 + k * (BLOCK + ROAD)); // centres
const G = 0.42; // glyph pitch on facades

type Car = { axis: 0 | 1; road: number; dir: 1 | -1; s: number; v: number; lane: number };

export default function AsciiCity({ mobile }: { mobile: boolean }) {
  const center = W.build.city.center;

  const statics = useMemo(() => {
    const pos: number[] = [];
    const rot: number[] = [];
    const gl: number[] = [];
    const col: number[] = [];
    const size: number[] = [];
    const add = (x: number, y: number, z: number, rx: number, ry: number, ch: string, b: number, s = G * 0.95) => {
      pos.push(x, y, z);
      rot.push(rx, ry, 0);
      gl.push(gi(ch));
      col.push(b, b, b);
      size.push(s);
    };
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    for (let bx = 0; bx < N; bx++)
      for (let bz = 0; bz < N; bz++) {
        const x0 = -HALF + bx * (BLOCK + ROAD);
        const z0 = -HALF + bz * (BLOCK + ROAD);
        const park = rnd() < 0.16 && !(bx === 2 && bz === 2);
        // sidewalks
        for (let t = 0; t <= BLOCK; t += 0.85) {
          add(x0 + t, 0.02, z0, -Math.PI / 2, 0, '.', 0.35);
          add(x0 + t, 0.02, z0 + BLOCK, -Math.PI / 2, 0, '.', 0.35);
          add(x0, 0.02, z0 + t, -Math.PI / 2, 0, '.', 0.35);
          add(x0 + BLOCK, 0.02, z0 + t, -Math.PI / 2, 0, '.', 0.35);
        }
        if (park) {
          for (let k = 0; k < 18; k++) add(x0 + 0.6 + rnd() * 3.8, 0.35, z0 + 0.6 + rnd() * 3.8, 0, rnd() * 3, k % 3 ? '^' : '*', 0.55, 0.7);
          for (let k = 0; k < 30; k++) add(x0 + 0.4 + rnd() * 4.2, 0.03, z0 + 0.4 + rnd() * 4.2, -Math.PI / 2, 0, '"', 0.3, 0.3);
          continue;
        }
        // Keep the first rows beside the camera's street low so the dive stays clear.
        const nearDive = (bx === 2 || bx === 3) && bz <= 1;
        const towers = mobile ? 1 : rnd() < 0.5 ? 2 : 1;
        for (let t = 0; t < towers; t++) {
          const w = towers === 1 ? 2.6 + rnd() * 1.6 : 1.6 + rnd() * 0.8;
          const d = towers === 1 ? 2.6 + rnd() * 1.6 : 1.6 + rnd() * 0.8;
          const cx = x0 + (towers === 1 ? BLOCK / 2 : t === 0 ? 1.3 : 3.6);
          const cz = z0 + (towers === 1 ? BLOCK / 2 : t === 0 ? 1.4 : 3.5);
          const centrality = 1 - Math.hypot(cx, cz) / (HALF * 1.4);
          let h = 2 + rnd() * 3 + centrality * 7;
          if (nearDive) h = Math.min(h, 3);
          if (mobile) h = Math.min(h, 7);
          const cols = Math.max(2, Math.floor(w / G));
          const rows = Math.max(3, Math.floor(h / G));
          const faces: [number, number, number, number][] = [
            [0, d / 2, 0, cols],
            [Math.PI, -d / 2, 0, cols],
            [Math.PI / 2, 0, w / 2, Math.max(2, Math.floor(d / G))],
            [-Math.PI / 2, 0, -w / 2, Math.max(2, Math.floor(d / G))],
          ];
          for (const [ry, oz, ox, n] of faces) {
            for (let r = 0; r < rows; r++)
              for (let c = 0; c < n; c++) {
                const u = (c - (n - 1) / 2) * G;
                const x = cx + ox + (ry === 0 || ry === Math.PI ? u : 0);
                const z = cz + oz + (ry === 0 || ry === Math.PI ? 0 : u);
                const y = 0.25 + r * G;
                let ch = ':';
                let b = 0.28;
                if (c === 0 || c === n - 1) {
                  ch = '|';
                  b = 0.45;
                } else if (r === rows - 1) {
                  ch = '=';
                  b = 0.6;
                } else if (r % 2 === 1 && c % 2 === 1) {
                  const lit = rnd() < 0.35;
                  ch = lit ? '#' : '.';
                  b = lit ? 1.15 : 0.3;
                }
                add(x, y, z, 0, ry, ch, b);
              }
          }
          // rooftop antenna on tall towers
          if (h > 7) add(cx, rows * G + 0.5, cz, 0, 0, '!', 1.4, 0.8);
        }
      }
    // road markings
    for (const r of ROADS) {
      for (let t = -HALF; t <= HALF; t += 1.1) {
        add(r, 0.02, t, -Math.PI / 2, 0, '|', 0.22, 0.45);
        add(t, 0.02, r, -Math.PI / 2, 0, '-', 0.22, 0.45);
      }
      for (const r2 of ROADS) add(r, 0.03, r2, -Math.PI / 2, 0, '+', 0.6, 0.9);
    }
    const count = gl.length;
    return glyphMesh({
      count,
      positions: new Float32Array(pos),
      rotations: new Float32Array(rot),
      glyphs: new Float32Array(gl),
      colors: new Float32Array(col),
      size: new Float32Array(size),
      material: glyphMaterial({ intensity: 1 }),
    });
  }, [mobile]);

  // Traffic, pedestrians and signals.
  const movers = useMemo(() => {
    const cars: Car[] = [];
    const nCars = mobile ? 28 : 64;
    for (let i = 0; i < nCars; i++) {
      const axis = (i % 2) as 0 | 1;
      const dir = (Math.random() < 0.5 ? 1 : -1) as 1 | -1;
      cars.push({ axis, road: ROADS[Math.floor(Math.random() * ROADS.length)], dir, s: -HALF + Math.random() * SPAN, v: 2.2 + Math.random() * 1.2, lane: dir * 0.45 });
    }
    const peds = Array.from({ length: mobile ? 16 : 40 }, () => ({
      bx: Math.floor(Math.random() * N),
      bz: Math.floor(Math.random() * N),
      t: Math.random() * 4,
      v: 0.25 + Math.random() * 0.25,
    }));
    const count = cars.length + peds.length;
    const glyphs = new Float32Array(count);
    cars.forEach((c, i) => (glyphs[i] = gi(c.axis === 0 ? (c.dir > 0 ? '>' : '<') : c.dir > 0 ? 'v' : '^')));
    peds.forEach((_, i) => (glyphs[cars.length + i] = gi('o')));
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const b = i < cars.length ? 1.8 : 0.9;
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = b;
    }
    const mesh = glyphMesh({
      count,
      positions: new Float32Array(count * 3),
      glyphs,
      colors,
      size: 0.6,
      material: glyphMaterial({ intensity: 1 }),
    });
    // signals: two per crossing, recoloured each frame
    const sigCount = ROADS.length * ROADS.length * 2;
    const sigPos = new Float32Array(sigCount * 3);
    let k = 0;
    for (const rx of ROADS)
      for (const rz of ROADS) {
        sigPos.set([rx + 1.15, 0.9, rz + 1.15], k * 3);
        sigPos.set([rx - 1.15, 0.9, rz - 1.15], (k + 1) * 3);
        k += 2;
      }
    const sig = glyphMesh({
      count: sigCount,
      positions: sigPos,
      glyphs: new Float32Array(sigCount).fill(gi('o')),
      colors: new Float32Array(sigCount * 3).fill(1),
      size: 0.5,
      material: glyphMaterial({ tint: 'none' }),
    });
    return { cars, peds, mesh, sig };
  }, [mobile]);

  const weather = useMemo(() => {
    const count = mobile ? 500 : 1400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SPAN;
      pos[i * 3 + 1] = Math.random() * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPAN;
    }
    const mat = glyphMaterial({ fall: 9, fallBase: 0, fallHeight: 12, intensity: 0.6, opacity: 0.55 });
    return glyphMesh({ count, positions: pos, glyphs: new Float32Array(count).fill(gi('|')), size: 0.32, material: mat });
  }, [mobile]);

  const fog = useMemo(() => {
    const count = mobile ? 200 : 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SPAN;
      pos[i * 3 + 1] = 0.4 + Math.random() * 2.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPAN;
    }
    const mat = glyphMaterial({ intensity: 0.5, opacity: 0, scramble: 0.02 });
    return glyphMesh({ count, positions: pos, glyphs: new Float32Array(count).fill(gi('~')), size: 0.6, material: mat });
  }, [mobile]);

  const [sky, setSky] = useState('RAIN');
  const skyRef = useRef('RAIN');
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler(), c: new THREE.Color() }), []);
  const flat = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), []);
  const centerV = useMemo(() => new THREE.Vector3(...center), [center]);

  useFrame(({ camera, clock }, dt) => {
    if (camera.position.distanceTo(centerV) > 95) return;
    const t = clock.elapsedTime;
    const step = Math.min(dt, 0.05);
    // signals: phase 0 lets x-axis traffic go, phase 1 lets z-axis traffic go
    const phase = Math.floor(t / 4.5) % 2;
    const amber = (t % 4.5) > 3.8;

    const { cars, peds, mesh, sig } = movers;
    cars.forEach((c, i) => {
      const green = (c.axis === 0 ? phase === 0 : phase === 1) && !amber;
      // distance to the next crossing ahead
      let gap = Infinity;
      for (const r of ROADS) {
        const ahead = (r - c.s) * c.dir;
        if (ahead > 0.9 && ahead < gap) gap = ahead;
      }
      const stopping = !green && gap < 1.7;
      const target = stopping ? 0 : c.v;
      const v = THREE.MathUtils.damp((c as Car & { cur?: number }).cur ?? c.v, target, 4, step);
      (c as Car & { cur?: number }).cur = v;
      c.s += v * c.dir * step;
      if (c.s > HALF) c.s = -HALF;
      if (c.s < -HALF) c.s = HALF;
      const x = c.axis === 0 ? c.s : c.road + c.lane;
      const z = c.axis === 0 ? c.road + c.lane : c.s;
      tmp.p.set(x, 0.06, z);
      tmp.s.setScalar(0.6);
      tmp.m.compose(tmp.p, flat, tmp.s);
      mesh.setMatrixAt(i, tmp.m);
    });
    peds.forEach((p, i) => {
      p.t = (p.t + p.v * step) % 4;
      const x0 = -HALF + p.bx * (BLOCK + ROAD) - 0.35;
      const z0 = -HALF + p.bz * (BLOCK + ROAD) - 0.35;
      const L = BLOCK + 0.7;
      const s = (p.t % 1) * L;
      const edge = Math.floor(p.t);
      const x = edge === 0 ? x0 + s : edge === 1 ? x0 + L : edge === 2 ? x0 + L - s : x0;
      const z = edge === 0 ? z0 : edge === 1 ? z0 + s : edge === 2 ? z0 + L : z0 + L - s;
      tmp.p.set(x, 0.3, z);
      tmp.s.setScalar(0.32);
      tmp.q.identity();
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      mesh.setMatrixAt(cars.length + i, tmp.m);
    });
    mesh.instanceMatrix.needsUpdate = true;

    // signal colours
    for (let k = 0; k < sig.count; k += 2) {
      const xGo = phase === 0 && !amber;
      const zGo = phase === 1 && !amber;
      sig.setColorAt(k, tmp.c.set(amber ? '#ffb000' : xGo ? '#3dff7a' : '#ff3b30').multiplyScalar(2));
      sig.setColorAt(k + 1, tmp.c.set(amber ? '#ffb000' : zGo ? '#3dff7a' : '#ff3b30').multiplyScalar(2));
    }
    if (sig.instanceColor) sig.instanceColor.needsUpdate = true;

    // weather: rain → snow → fog
    const w = Math.floor(t / 9) % 3;
    const wm = weather.material as THREE.ShaderMaterial;
    const fm = fog.material as THREE.ShaderMaterial;
    wm.uniforms.uTime.value = t;
    fm.uniforms.uTime.value = t;
    wm.uniforms.uFall.value = w === 0 ? 9 : 1.4;
    wm.uniforms.uGlyphSwap.value = w === 1 ? gi('*') : -1;
    wm.uniforms.uOpacity.value = THREE.MathUtils.damp(wm.uniforms.uOpacity.value, w === 2 ? 0 : 0.55, 2, step);
    fm.uniforms.uOpacity.value = THREE.MathUtils.damp(fm.uniforms.uOpacity.value, w === 2 ? 0.5 : 0, 2, step);
    fog.position.x = Math.sin(t * 0.2) * 1.5;
    const txt = ['RAIN', 'SNOW', 'FOG'][w];
    if (skyRef.current !== txt) {
      skyRef.current = txt;
      setSky(txt);
    }
  });

  return (
    <group position={center}>
      <primitive object={statics} />
      <primitive object={movers.mesh} />
      <primitive object={movers.sig} />
      <primitive object={weather} />
      <primitive object={fog} />
      <Billboard position={[0, 14, -4]}>
        <Label size={1.1} font="display" tone="ink">
          ASCII CITY
        </Label>
        <Label position={[0, -1, 0]} size={0.32} tone="accent" letterSpacing={0.3}>
          {`WEATHER · ${sky}`}
        </Label>
      </Billboard>
    </group>
  );
}
