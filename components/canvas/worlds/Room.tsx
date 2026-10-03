'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { journey } from '@/lib/journey';
import { P, W } from '@/lib/path';
import { M, onPalette } from '@/lib/materials';
import { getPalette, usePalette } from '@/lib/theme';
import { person } from '@/content/site';
import { EdgeLines, makeCanvasTexture, ss } from '../parts/common';
import { DroneModel } from '../parts/Models';

/** SCENE 1 + 2: the black room, the sculptural desk, and the laptop that becomes the portal. */
export default function Room({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (group.current) group.current.visible = camera.position.z > -0.25;
  });

  return (
    <group ref={group}>
      <Shell mobile={mobile} />
      <Desk />
      <Laptop />
      <group position={[0.86, 1.0, 0.12]} rotation={[0, -0.5, 0]} scale={0.32}>
        <DroneModel spin={false} />
      </group>
    </group>
  );
}

const ROOM = { w: 16, h: 6, d: 20, z: 2 };

function Shell({ mobile }: { mobile: boolean }) {
  const p = usePalette();
  const walls = useMemo(() => new THREE.BoxGeometry(ROOM.w, ROOM.h, ROOM.d), []);
  // Neon strips tracing the room's back and floor edges.
  const strips = useMemo(() => {
    const hw = ROOM.w / 2;
    const back = ROOM.z - ROOM.d / 2;
    const front = ROOM.z + ROOM.d / 2;
    const t = 0.025;
    return [
      { pos: [0, 0.01, back + 0.02], size: [ROOM.w, t, t] },
      { pos: [0, ROOM.h - 0.01, back + 0.02], size: [ROOM.w, t, t] },
      { pos: [-hw + 0.02, ROOM.h / 2, back + 0.02], size: [t, ROOM.h, t] },
      { pos: [hw - 0.02, ROOM.h / 2, back + 0.02], size: [t, ROOM.h, t] },
      { pos: [-hw + 0.02, 0.01, (back + front) / 2], size: [t, t, ROOM.d] },
      { pos: [hw - 0.02, 0.01, (back + front) / 2], size: [t, t, ROOM.d] },
      { pos: [-hw + 0.02, ROOM.h - 0.01, (back + front) / 2], size: [t, t, ROOM.d] },
      { pos: [hw - 0.02, ROOM.h - 0.01, (back + front) / 2], size: [t, t, ROOM.d] },
      // the boot scanline, now a light line across the back wall at desk height
      { pos: [0, 1.0, back + 0.03], size: [ROOM.w, 0.012, 0.01] },
    ] as { pos: [number, number, number]; size: [number, number, number] }[];
  }, []);

  return (
    <group>
      <mesh geometry={walls} position={[0, ROOM.h / 2, ROOM.z]}>
        <meshStandardMaterial side={THREE.BackSide} color={p.dark ? '#0b0908' : '#f3eee6'} roughness={0.92} metalness={0} />
      </mesh>
      {strips.map((s, i) => (
        <mesh key={i} position={s.pos} material={M.glow}>
          <boxGeometry args={s.size} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, ROOM.z]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        {mobile || journey.tier !== 'high' ? (
          <meshStandardMaterial color={p.dark ? '#090706' : '#ebe4d8'} roughness={0.35} metalness={0.4} />
        ) : (
          <MeshReflectorMaterial
            blur={[400, 120]}
            resolution={1024}
            mixBlur={1}
            mixStrength={p.dark ? 22 : 4}
            roughness={0.85}
            depthScale={1.1}
            minDepthThreshold={0.35}
            maxDepthThreshold={1.4}
            color={p.dark ? '#0a0807' : '#ece5d9'}
            metalness={0.55}
            mirror={0}
          />
        )}
      </mesh>
      {/* soft haze behind the desk */}
      <mesh position={[0, 1.6, ROOM.z - ROOM.d / 2 + 0.05]}>
        <planeGeometry args={[10, 6]} />
        <HazeMaterial />
      </mesh>
      <pointLight position={[0, 4.6, 2.5]} intensity={p.dark ? 4 : 10} distance={14} decay={1.6} color={p.dark ? '#ffd9ae' : '#ffffff'} />
      <spotLight position={[0, 5.5, 1]} angle={0.42} penumbra={0.9} intensity={p.dark ? 18 : 30} distance={12} decay={1.4} color={p.dark ? '#ffcf9a' : '#fff'} />
    </group>
  );
}

function HazeMaterial() {
  const mat = useMemo(() => {
    const { canvas, ctx, tex } = makeCanvasTexture(256, 256);
    const g = ctx.createRadialGradient(128, 128, 2, 128, 128, 127);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    tex.needsUpdate = true;
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.16 });
  }, []);
  useEffect(() => onPalette((p) => mat.color.set(p.accent).multiplyScalar(p.dark ? 1 : 0.6)), [mat]);
  return <primitive object={mat} attach="material" />;
}

function Desk() {
  // One monolithic slab and pedestal, with a single light edge.
  const top = useMemo(() => new THREE.BoxGeometry(2.4, 0.08, 1.0), []);
  const ped = useMemo(() => new THREE.BoxGeometry(0.55, 0.92, 0.86), []);
  const leg = useMemo(() => new THREE.BoxGeometry(0.06, 0.92, 0.86), []);
  return (
    <group position={[W.laptop.x, 0, W.laptop.z]}>
      <mesh geometry={top} material={M.solid} position={[0, 0.96, 0]} />
      <mesh geometry={ped} material={M.solid} position={[0.82, 0.46, 0]} />
      <mesh geometry={leg} material={M.solid} position={[-1.12, 0.46, 0]} />
      {/* the light edge */}
      <mesh position={[0, 0.918, 0.5]} material={M.glow}>
        <boxGeometry args={[2.4, 0.006, 0.006]} />
      </mesh>
      <group position={[0, 0.96, 0]}>
        <EdgeLines geometry={top} material={M.edgeDim} />
      </group>
    </group>
  );
}

const LID_W = 0.62;
const LID_H = 0.4;

function Laptop() {
  const lid = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const screen = useMemo(() => makeCanvasTexture(1024, 640), []);
  const state = useRef({ typed: -1, palette: '' });

  const lines = useMemo(
    () => [
      ['abdul.os 12.0', 'dim'],
      [`${person.prompt} ./descend`, 'ink'],
      ['loading twelve years of practice...', 'dim'],
      ['[ OK ] curriculum   [ OK ] competitions', 'ok'],
      ['[ OK ] software     [ OK ] lab', 'ok'],
      ['> entering', 'acc'],
    ],
    [],
  );
  const total = useMemo(() => lines.reduce((a, l) => a + l[0].length, 0), [lines]);

  const draw = (chars: number, p: ReturnType<typeof readPalette>) => {
    const { ctx, canvas, tex } = screen;
    const g = ctx;
    g.fillStyle = p.bg;
    g.fillRect(0, 0, canvas.width, canvas.height);
    const grad = g.createRadialGradient(512, 320, 40, 512, 320, 640);
    grad.addColorStop(0, p.glowA);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.font = '46px VT323, "IBM Plex Mono", monospace';
    g.textBaseline = 'top';
    let left = chars;
    lines.forEach(([t, c], i) => {
      if (left <= 0) return;
      const s = t.slice(0, left);
      left -= t.length;
      g.fillStyle = c === 'dim' ? p.mist : c === 'ink' ? p.ink : p.accent;
      g.fillText(s, 70, 70 + i * 66);
      if (left <= 0 && Math.floor(performance.now() / 400) % 2 === 0) {
        g.fillStyle = p.accent;
        g.fillRect(70 + g.measureText(s).width + 6, 76 + i * 66, 22, 40);
      }
    });
    // scanlines
    g.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < canvas.height; y += 4) g.fillRect(0, y, canvas.width, 1.5);
    tex.needsUpdate = true;
  };

  useFrame(() => {
    const prog = journey.progress;
    const open = ss(P['room-drift'] - 0.012, P['room-desk'] + 0.006, prog);
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.035, -0.22, open);
    const typed = Math.floor(ss(P['room-desk'] - 0.016, P.screen - 0.004, prog) * total);
    const pal = readPalette();
    const blink = Math.floor(performance.now() / 400) % 2;
    const key = `${typed}-${blink}-${pal.key}`;
    if (key !== state.current.palette) {
      state.current.palette = key;
      draw(typed, pal);
    }
    // the screen floods with light as the camera dives in
    const flood = 1 + ss(P['room-desk'], P.screen, prog) * 2.6;
    if (screenMat.current) screenMat.current.color.setScalar(pal.dark ? 0.9 + 0.5 * open : 1).multiplyScalar(pal.dark ? flood : 1);
    if (light.current) light.current.intensity = (0.3 + open * 2.2) * (pal.dark ? 1 : 0.4) * flood;
  });

  return (
    <group position={[W.laptop.x, W.laptop.y, W.laptop.z]}>
      {/* base */}
      <mesh position={[0, 0.011, 0]} material={M.solidLift}>
        <boxGeometry args={[LID_W, 0.022, 0.42]} />
      </mesh>
      <mesh position={[0, 0.0225, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.19]} />
        <meshStandardMaterial color="#050404" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0225, 0.165]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 0.07]} />
        <meshStandardMaterial color="#1b1714" roughness={0.6} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group ref={lid} position={[0, 0.022, -0.2]} rotation={[Math.PI / 2 - 0.035, 0, 0]}>
        <mesh position={[0, LID_H / 2, -0.004]} material={M.solidLift}>
          <boxGeometry args={[LID_W, LID_H, 0.01]} />
        </mesh>
        <mesh position={[0, LID_H / 2 + 0.004, 0.0012]}>
          <planeGeometry args={[LID_W - 0.03, LID_H - 0.04]} />
          <meshBasicMaterial ref={screenMat} map={screen.tex} toneMapped={false} />
        </mesh>
        <pointLight ref={light} position={[0, LID_H / 2, 0.25]} distance={3} decay={1.8} color="#ffb366" />
      </group>
    </group>
  );
}

// The laptop screen is always a dark terminal, tinted by the theme's accent.
function readPalette() {
  const p = getPalette();
  const accent = p.dark ? p.accent : '#FF9D2E';
  const h = accent.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
  return {
    key: p.name,
    dark: p.dark,
    bg: p.dark ? '#0a0806' : '#1a1510',
    ink: p.name === 'phosphor' ? '#C9FFD0' : '#F6EDE2',
    mist: p.name === 'phosphor' ? '#3E9E52' : '#A99787',
    accent,
    glowA: `rgba(${rgb},0.18)`,
  };
}
