'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journey, on } from '@/lib/journey';
import { M } from '@/lib/materials';
import { orderedAssignment, randomAssignment, textPoints } from '@/lib/textPoints';
import type { V3 } from '@/lib/path';

type Props = {
  count: number;
  center: V3;
  width: number;
  /** Formations to cycle through, each as lines of text. */
  words: string[][];
  /** Where the drones start: a launch pad grid, or a scattered cloud around the formation. */
  start: { type: 'pad'; at: V3; spread: [number, number] } | { type: 'cloud'; radius: number };
  /** 'loop' flies between words on a timer; 'scroll' forms the first word as progress goes 0 → 1. */
  mode: 'loop' | 'scroll';
  getProgress?: () => number;
  /** React to the collision-free / random-pairing switch and drive the on-page counter. */
  interactive?: boolean;
  size?: number;
};

const FLY = 3.6;
const HOLD = 2.8;

/**
 * Instanced drones flying into text formations: the Swarm build, re-made in the world.
 * Collision-free mode pairs drones to targets in sweep order so paths rarely cross; random pairing
 * sends every drone across the formation, which is where the collisions come from.
 */
export function DroneSwarm({ count, center, width, words, start, mode, getProgress, interactive, size = 0.07 }: Props) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(size, 0), M.glow, count);
    m.frustumCulled = false;
    return m;
  }, [count, size]);

  const state = useMemo(() => {
    const home = new Float32Array(count * 3);
    if (start.type === 'pad') {
      const cols = Math.ceil(Math.sqrt(count * (start.spread[0] / start.spread[1])));
      for (let i = 0; i < count; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        const rows = Math.ceil(count / cols);
        home[i * 3] = start.at[0] - center[0] + (c / (cols - 1) - 0.5) * start.spread[0];
        home[i * 3 + 1] = start.at[1] - center[1];
        home[i * 3 + 2] = start.at[2] - center[2] + (r / Math.max(1, rows - 1) - 0.5) * start.spread[1];
      }
    } else {
      for (let i = 0; i < count; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(start.radius * (0.4 + Math.random() * 0.6));
        home[i * 3] = v.x;
        home[i * 3 + 1] = v.y * 0.6;
        home[i * 3 + 2] = v.z + start.radius * 0.3;
      }
    }
    return {
      home,
      pos: Float32Array.from(home),
      from: Float32Array.from(home),
      to: Float32Array.from(home),
      targets: [] as Float32Array[],
      delay: Float32Array.from({ length: count }, () => Math.random() * 0.8),
      lift: Float32Array.from({ length: count }, () => 0.5 + Math.random() * 2.5),
      phase: 0, // index into the flight plan
      t0: -1,
      word: -1,
      flying: false,
      random: journey.swarmRandom,
      collisions: 0,
    };
  }, [count, start, center]);

  // Formation targets need the webfont, so build them once fonts are ready.
  useEffect(() => {
    let alive = true;
    const build = () => {
      if (!alive) return;
      state.targets = words.map((w) => textPoints(w, count, width));
    };
    build();
    document.fonts?.ready.then(build).catch(() => {});
    return () => {
      alive = false;
    };
  }, [words, count, width, state]);

  const flyTo = (word: number, now: number) => {
    const target = state.targets[word];
    if (!target) return;
    const map = state.random ? randomAssignment(count) : orderedAssignment(state.pos, target, count);
    state.from.set(state.pos);
    for (let i = 0; i < count; i++) {
      const j = map[i];
      state.to[i * 3] = target[j * 3];
      state.to[i * 3 + 1] = target[j * 3 + 1];
      state.to[i * 3 + 2] = target[j * 3 + 2];
    }
    state.word = word;
    state.t0 = now;
    state.flying = true;
  };

  // Park every drone at home before the first frame runs.
  useEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.makeTranslation(state.home[i * 3], state.home[i * 3 + 1], state.home[i * 3 + 2]);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [mesh, state, count]);

  const counter = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!interactive) return;
    counter.current = document.getElementById('swarm-count');
    return on('swarm', (v) => {
      state.random = v;
      // Re-fly the current word with the new planner so the difference is visible straight away.
      state.phase = -1;
      state.t0 = -2;
    });
  }, [interactive, state]);

  const centerV = useMemo(() => new THREE.Vector3(...center), [center]);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1) }), []);

  useFrame(({ camera, clock }) => {
    const now = clock.elapsedTime;
    const near = camera.position.distanceTo(centerV) < 90;
    if (!near && mode === 'loop') return;
    if (!state.targets.length) return;

    if (mode === 'loop') {
      // flight plan: fly → hold → fly to next word → hold ...
      if (state.t0 === -1 || state.t0 === -2) {
        flyTo(state.word < 0 ? 0 : state.word, now);
      } else {
        const el = now - state.t0;
        if (state.flying && el > FLY) state.flying = false;
        if (!state.flying && el > FLY + HOLD) flyTo((state.word + 1) % words.length, now);
      }
      const el = now - state.t0;
      for (let i = 0; i < count; i++) {
        const k = Math.min(1, Math.max(0, (el - state.delay[i]) / (FLY - 0.8)));
        const e = k * k * (3 - 2 * k);
        const arc = Math.sin(e * Math.PI) * state.lift[i] * (state.random ? 0.3 : 1);
        state.pos[i * 3] = state.from[i * 3] + (state.to[i * 3] - state.from[i * 3]) * e;
        state.pos[i * 3 + 1] = state.from[i * 3 + 1] + (state.to[i * 3 + 1] - state.from[i * 3 + 1]) * e + arc;
        state.pos[i * 3 + 2] = state.from[i * 3 + 2] + (state.to[i * 3 + 2] - state.from[i * 3 + 2]) * e;
      }
      if (interactive && counter.current) {
        // The real project measured 107 collisions with random pairing, 0 with the planner.
        const f = Math.min(1, el / FLY);
        const c = state.random ? Math.round(107 * f * f) : 0;
        if (c !== state.collisions) {
          state.collisions = c;
          counter.current.textContent = String(c);
        }
      }
    } else {
      const target = state.targets[0];
      const f = getProgress ? getProgress() : 1;
      for (let i = 0; i < count; i++) {
        const d = state.delay[i] * 0.45;
        const k = Math.min(1, Math.max(0, (f - d) / 0.55));
        const e = k * k * (3 - 2 * k);
        const tw = e > 0.99 ? Math.sin(now * 1.3 + i) * 0.03 : 0;
        state.pos[i * 3] = state.home[i * 3] + (target[i * 3] - state.home[i * 3]) * e;
        state.pos[i * 3 + 1] = state.home[i * 3 + 1] + (target[i * 3 + 1] - state.home[i * 3 + 1]) * e + tw;
        state.pos[i * 3 + 2] = state.home[i * 3 + 2] + (target[i * 3 + 2] - state.home[i * 3 + 2]) * e;
      }
    }

    for (let i = 0; i < count; i++) {
      tmp.p.set(state.pos[i * 3], state.pos[i * 3 + 1], state.pos[i * 3 + 2]);
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      mesh.setMatrixAt(i, tmp.m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={center}>
      <primitive object={mesh} />
    </group>
  );
}
