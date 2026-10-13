'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { GATES, W, fitShots } from '@/lib/path';
import { journey } from '@/lib/journey';
import { M, onPalette } from '@/lib/materials';
import { getPalette, usePalette, type Palette } from '@/lib/theme';
import { lab, type StackGroup } from '@/content/site';
import { Label, Region, lx, makeCanvasTexture } from '../parts/common';
import { HumanoidModel } from '../parts/Models';

/**
 * SCENE 7: LAB. A quiet hall: at each stop a board lists one part of the stack (languages,
 * boards, AI, robotics...), and the humanoid stands at the end.
 */
export default function Lab() {
  return (
    <Region near={GATES.solve.z} far={GATES.lab.z}>
      <Floor />
      {STOPS.map((s, i) => (
        <Board key={s.shot} shot={s.shot} i={i} groups={s.groups.map((id) => lab.groups.find((g) => g.id === id)!)} />
      ))}
      <Hero />
    </Region>
  );
}

/** Which groups stand at which camera stop. Every group in content/site.ts appears once. */
const STOPS: { shot: string; groups: string[] }[] = [
  { shot: 'bay-robotics', groups: ['code', 'boards'] },
  { shot: 'bay-ai', groups: ['ai'] },
  { shot: 'bay-xr', groups: ['robotics'] },
  { shot: 'bay-design', groups: ['drones', 'xr'] },
  { shot: 'bay-mobility', groups: ['design', 'mobility'] },
  { shot: 'bay-emerging', groups: ['emerging'] },
];

const F = W.lab.floor;

function Floor() {
  const from = GATES.solve.z - 4, to = GATES.lab.z + 2;
  const grid = useMemo(() => {
    const pts: number[] = [];
    for (let x = -10; x <= 10; x += 2) pts.push(x, 0, from, x, 0, to);
    for (let z = from; z >= to; z -= 2) pts.push(-10, 0, z, 10, 0, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [from, to]);
  return (
    <group position={[0, F, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, (from + to) / 2]} material={M.solid}>
        <planeGeometry args={[30, from - to]} />
      </mesh>
      <lineSegments geometry={grid} material={M.inkLine} />
      {/* the walkway */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x * lx(), 0.01, (from + to) / 2]} material={M.glowDim}>
          <boxGeometry args={[0.03, 0.01, from - to]} />
        </mesh>
      ))}
    </group>
  );
}

const PX = 160; // canvas pixels per world unit

const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

/** Lay out a board: returns its height in pixels and a function that draws it. */
function layout(groups: StackGroup[], wpx: number, cols: number, n: number) {
  const pad = 44, tileH = 62, gap = 14;
  const tileW = (wpx - 2 * pad - (cols - 1) * gap) / cols;
  let y = pad + 40;
  const blocks = groups.map((g) => {
    const top = y;
    const rows = Math.ceil(g.items.length / cols);
    y += 62 + rows * (tileH + gap) + 26;
    return { g, top };
  });
  const hpx = Math.round(y - 26 - gap + pad);

  const draw = (ctx: CanvasRenderingContext2D, p: Palette) => {
    ctx.clearRect(0, 0, wpx, hpx);
    const r = 18;
    ctx.beginPath();
    ctx.roundRect(2, 2, wpx - 4, hpx - 4, r);
    ctx.fillStyle = p.dark ? rgba(p.bg2, 0.92) : rgba('#F7F2EA', 0.95);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(p.accent, 0.38);
    ctx.stroke();
    // corner brackets, as on the HUD
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 4;
    const b = 30, o = 10;
    for (const [x, y0, sx, sy] of [[o, o, 1, 1], [wpx - o, o, -1, 1], [o, hpx - o, 1, -1], [wpx - o, hpx - o, -1, -1]]) {
      ctx.beginPath();
      ctx.moveTo(x, y0 + sy * b);
      ctx.lineTo(x, y0);
      ctx.lineTo(x + sx * b, y0);
      ctx.stroke();
    }
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '5px';
    ctx.font = '400 22px "Electrolize", sans-serif';
    ctx.fillStyle = p.accent;
    ctx.fillText(`${lab.kicker.toUpperCase()} · ${String(n + 1).padStart(2, '0')} / ${String(STOPS.length).padStart(2, '0')}`, pad, pad + 6);
    ctx.letterSpacing = '0px';
    for (const { g, top } of blocks) {
      let ts = 44;
      ctx.font = `600 ${ts}px "Pixelify Sans", sans-serif`;
      while (ctx.measureText(g.title).width > wpx - 2 * pad && ts > 24) ctx.font = `600 ${--ts}px "Pixelify Sans", sans-serif`;
      ctx.fillStyle = p.ink;
      ctx.fillText(g.title, pad, top + 26);
      g.items.forEach((name, k) => {
        const x = pad + (k % cols) * (tileW + gap);
        const ty = top + 62 + Math.floor(k / cols) * (tileH + gap);
        ctx.beginPath();
        ctx.roundRect(x, ty, tileW, tileH, 10);
        ctx.fillStyle = rgba(p.ink, p.dark ? 0.05 : 0.04);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = g.code ? rgba(p.accent, 0.55) : rgba(p.ink, p.dark ? 0.16 : 0.2);
        ctx.stroke();
        // languages read as code: accent, with a prompt mark
        const label = g.code ? `› ${name}` : name;
        ctx.fillStyle = g.code ? p.accent : p.ink;
        const room = tileW - 32;
        let fs = 27;
        ctx.font = `400 ${fs}px "Electrolize", sans-serif`;
        while (ctx.measureText(label).width > room && fs > 19) ctx.font = `400 ${--fs}px "Electrolize", sans-serif`;
        if (ctx.measureText(label).width <= room) {
          ctx.fillText(label, x + 16, ty + tileH / 2 + 1);
        } else {
          // long product names go onto two lines rather than shrinking out of sight
          const words = label.split(' ');
          let best = 1, bestW = Infinity;
          for (let c = 1; c < words.length; c++) {
            const w = Math.max(ctx.measureText(words.slice(0, c).join(' ')).width, ctx.measureText(words.slice(c).join(' ')).width);
            if (w < bestW) [best, bestW] = [c, w];
          }
          const lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
          fs = 22;
          ctx.font = `400 ${fs}px "Electrolize", sans-serif`;
          while (Math.max(...lines.map((l) => ctx.measureText(l).width)) > room && fs > 13) ctx.font = `400 ${--fs}px "Electrolize", sans-serif`;
          lines.forEach((l, j) => ctx.fillText(l, x + 16, ty + tileH / 2 + (j - 0.5) * (fs + 3)));
        }
      });
    }
  };
  return { hpx, draw };
}

/** One part of the stack, standing where its camera stop looks, turned to face the camera. */
function Board({ shot, i, groups }: { shot: string; i: number; groups: StackGroup[] }) {
  // Phones crop the frame (room for the reading panel), so their boards stand further back.
  const narrow = lx() < 0.75;
  const wWorld = narrow ? 3.2 : 6.4;
  const cols = narrow ? 2 : 3;
  const { hpx, draw } = useMemo(() => layout(groups, Math.round(wWorld * PX), cols, i), [groups, wWorld, cols, i]);
  const hWorld = hpx / PX;
  const tex = useMemo(() => makeCanvasTexture(Math.round(wWorld * PX), hpx), [wWorld, hpx]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, depthWrite: false }), [tex]);

  useEffect(
    () =>
      onPalette((p) => {
        draw(tex.ctx, p);
        tex.tex.needsUpdate = true;
        // keep the board's light text under each theme's bloom threshold
        mat.color.setScalar(p.name === 'neon' ? 0.8 : p.dark ? 0.9 : 1);
      }),
    [draw, tex, mat],
  );
  // Redraw once the webfonts are in, so the first frame's fallback type is replaced.
  useEffect(() => {
    document.fonts?.ready.then(() => {
      draw(tex.ctx, getPalette());
      tex.tex.needsUpdate = true;
    });
  }, [draw, tex]);

  const { pos, yaw } = useMemo(() => {
    const s = fitShots(journey.lx, journey.fovBoost, journey.sheet).find((x) => x.id === shot)!;
    const cam = new THREE.Vector3(...s.pos);
    const dir = new THREE.Vector3(...s.look).sub(cam).normalize();
    const c = cam.clone().addScaledVector(dir, narrow ? 8.4 : 7);
    c.y = Math.max(c.y, F + 0.3 + hWorld / 2);
    return { pos: c, yaw: Math.atan2(cam.x - c.x, cam.z - c.z) };
  }, [shot, narrow, hWorld]);

  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0, -0.04]} material={M.solid}>
        <boxGeometry args={[wWorld, hWorld, 0.05]} />
      </mesh>
      <mesh material={mat}>
        <planeGeometry args={[wWorld, hWorld]} />
      </mesh>
    </group>
  );
}

/** The humanoid, life-size, catching the light last. */
function Hero() {
  const p = usePalette();
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = 0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.5;
  });
  const [x, y, z] = W.lab.humanoid;
  return (
    <group position={[x * lx(), y, z]}>
      <mesh position={[0, 0.3, 0]} material={M.solid}>
        <cylinderGeometry args={[1.0, 1.1, 0.6, 48]} />
      </mesh>
      <mesh position={[0, 0.605, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.glowDim}>
        <ringGeometry args={[0.92, 1.0, 64]} />
      </mesh>
      <group ref={ref} position={[0, 0.6, 0]} scale={1.35}>
        <HumanoidModel />
      </group>
      <primitive object={target} position={[0, 1.2, 0]} />
      <spotLight target={target} position={[0, 6, 2]} angle={0.4} penumbra={0.8} intensity={p.dark ? 40 : 24} distance={12} color={p.name === 'neon' ? '#dcc6ff' : p.dark ? '#ffcf9a' : '#ffffff'} />
      <Billboard position={[0, 3, 0]}>
        <Label size={lx() < 0.75 ? 0.12 : 0.2} tone="mist" letterSpacing={0.2}>
          UNITREE G1 EDU ULTIMATE C
        </Label>
      </Billboard>
    </group>
  );
}
