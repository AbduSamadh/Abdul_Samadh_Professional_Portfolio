'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { GATES, W } from '@/lib/path';
import { journey } from '@/lib/journey';
import { M, onPalette } from '@/lib/materials';
import { usePalette } from '@/lib/theme';
import { lab, type Bay } from '@/content/site';
import { Label, Region, lx, makeCanvasTexture } from '../parts/common';
import { DroneModel, HumanoidModel, PrinterModel, ProductProxy, QuadrupedModel } from '../parts/Models';

/** SCENE 7: LAB. A dark gallery of lit plinths: every piece of hardware on the stack. */
export default function Lab({ mobile }: { mobile: boolean }) {
  return (
    <Region near={GATES.solve.z} far={GATES.lab.z}>
      <Floor />
      {lab.bays.map((b) => (
        <BayView key={b.id} bay={b} mobile={mobile} />
      ))}
      <Hero />
    </Region>
  );
}

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

const HERO: Record<string, 'quad' | 'printer' | 'drone'> = {
  'Unitree Go2-W': 'quad',
  'Bambu P1 Series': 'printer',
  'Bambu P2S': 'printer',
};

function BayView({ bay, mobile }: { bay: Bay; mobile: boolean }) {
  const spec = W.lab.bays[bay.id];
  const side = spec.side;
  // The humanoid gets its own plinth at the end of the hall.
  const items = bay.items.filter((n) => n !== 'Unitree G1 EDU Ultimate C');
  const rows = items.length > 6 ? 2 : 1;
  const perRow = Math.ceil(items.length / rows);
  const step = spec.len / perRow;
  const baseX = side * 5.6 * lx();

  const title = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    // Only the bay you are passing announces itself.
    if (title.current) title.current.visible = Math.abs(camera.position.z - spec.z) < 16;
  });
  return (
    <group>
      <Billboard ref={title} position={[side * 6.8 * lx(), 3.4, spec.z + spec.len / 2 - 1]}>
        <Label size={mobile ? 0.42 : 0.55} font="display" tone="ink">
          {bay.title}
        </Label>
      </Billboard>
      {items.map((name, i) => {
        const r = rows === 2 ? i % 2 : 0;
        const k = rows === 2 ? Math.floor(i / 2) : i;
        const x = baseX + side * r * 2.2 * lx();
        const z = spec.z + spec.len / 2 - step * (k + 0.5);
        return <Item key={name} name={name} kind={bay.kind} i={i} pos={[x, F, z]} labelY={r === 1 ? 2.75 : 2.05} />;
      })}
    </group>
  );
}

function Item({ name, kind, i, pos, labelY }: { name: string; kind: Bay['kind']; i: number; pos: [number, number, number]; labelY: number }) {
  const obj = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!obj.current) return;
    obj.current.rotation.y = clock.elapsedTime * 0.25 + i;
    if (kind === 'hover') obj.current.position.y = 1.9 + Math.sin(clock.elapsedTime * 1.5 + i) * 0.12;
  });
  const hero = HERO[name];
  if (kind === 'screen') return <HoloScreen name={name} i={i} pos={pos} />;
  return (
    <group position={pos}>
      <mesh position={[0, 0.45, 0]} material={M.solid}>
        <cylinderGeometry args={[0.55, 0.6, 0.9, 32]} />
      </mesh>
      <mesh position={[0, 0.905, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.glow}>
        <ringGeometry args={[0.5, 0.55, 48]} />
      </mesh>
      <group ref={obj} position={[0, kind === 'hover' ? 1.9 : 1.15, 0]}>
        {kind === 'hover' || hero === 'drone' ? (
          <DroneModel scale={0.7} />
        ) : hero === 'quad' ? (
          <QuadrupedModel scale={1.1} position={[0, -0.25, 0]} />
        ) : hero === 'printer' ? (
          <PrinterModel scale={1.1} position={[0, -0.25, 0]} />
        ) : (
          <ProductProxy variant={i} />
        )}
      </group>
      {/* on phones the reading panel lists the names; floating labels would crowd the frame */}
      {!journey.mobile && (
        <Billboard position={[0, kind === 'hover' ? 2.8 : labelY, 0]}>
          <Label size={0.15} tone="ink" maxWidth={2.2} textAlign="center">
            {name}
          </Label>
        </Billboard>
      )}
    </group>
  );
}

function HoloScreen({ name, i, pos }: { name: string; i: number; pos: [number, number, number] }) {
  const t = useMemo(() => makeCanvasTexture(512, 300), []);
  useEffect(
    () =>
      onPalette((p) => {
        const g = t.ctx;
        g.clearRect(0, 0, 512, 300);
        g.fillStyle = p.dark ? 'rgba(255,157,46,0.06)' : 'rgba(178,86,10,0.08)';
        g.fillRect(0, 0, 512, 300);
        g.strokeStyle = p.accent;
        g.lineWidth = 3;
        g.strokeRect(2, 2, 508, 296);
        g.fillStyle = p.accent;
        g.font = '500 20px "IBM Plex Mono", monospace';

        g.fillStyle = p.ink;
        // shrink long names to fit the screen
        let fs = 44;
        do {
          g.font = `700 ${fs}px "Space Mono", sans-serif`;
          fs -= 2;
        } while (g.measureText(name).width > 456 && fs > 18);
        g.fillText(name, 28, 170);
        t.tex.needsUpdate = true;
      }),
    [t, name, i],
  );
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = F + 1.9 + Math.sin(clock.elapsedTime * 0.8 + i) * 0.1;
  });
  return (
    <group ref={ref} position={pos} rotation={[0, -Math.sign(pos[0]) * 0.9, 0]}>
      <mesh>
        <planeGeometry args={[2.1, 1.23]} />
        <meshBasicMaterial map={t.tex} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -1.6, 0]} material={M.glowDim}>
        <boxGeometry args={[0.02, 1.6, 0.02]} />
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
      <mesh position={[0, 0.605, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.glow}>
        <ringGeometry args={[0.92, 1.0, 64]} />
      </mesh>
      <group ref={ref} position={[0, 0.6, 0]} scale={1.35}>
        <HumanoidModel />
      </group>
      <primitive object={target} position={[0, 1.2, 0]} />
      <spotLight target={target} position={[0, 6, 2]} angle={0.4} penumbra={0.8} intensity={p.dark ? 60 : 30} distance={12} color={p.dark ? '#ffcf9a' : '#ffffff'} />
      <pointLight position={[-1.2, 1.6, -1.2]} intensity={p.dark ? 6 : 2} distance={5} color={p.accent} />
      <Billboard position={[0, 3, 0]}>
        <Label size={0.24} font="display" tone="ink">
          Unitree G1 EDU Ultimate C
        </Label>
      </Billboard>
    </group>
  );
}
