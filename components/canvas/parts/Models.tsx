'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { M } from '@/lib/materials';
import { EdgeLines } from './common';

// Low-poly hero objects built from primitives: silhouettes with light edges, not replicas.
// Swap any of these for a compressed GLB later without touching the worlds that place them.

type G = Omit<ThreeElements['group'], 'children'>;

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

function Part({ geo, edges = true, material = M.solidLift, ...props }: { geo: THREE.BufferGeometry; edges?: boolean; material?: THREE.Material } & G) {
  return (
    <group {...props}>
      <mesh geometry={geo} material={material} />
      {edges && <EdgeLines geometry={geo} material={M.edgeDim} threshold={30} />}
    </group>
  );
}

/** A quadcopter. Rotors spin when `spin` is set. */
export function DroneModel({ spin = true, ...props }: { spin?: boolean } & G) {
  const rotors = useRef<THREE.Group[]>([]);
  const geos = useMemo(
    () => ({
      body: box(0.5, 0.12, 0.5),
      arm: box(1.1, 0.045, 0.06),
      ring: new THREE.TorusGeometry(0.24, 0.012, 6, 32),
      blade: box(0.42, 0.006, 0.04),
      led: new THREE.SphereGeometry(0.03, 8, 8),
      cam: box(0.12, 0.08, 0.06),
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!spin) return;
    rotors.current.forEach((r, i) => r && (r.rotation.y += dt * (i % 2 ? 30 : -30)));
  });
  const corners: [number, number][] = [
    [0.39, 0.39],
    [-0.39, 0.39],
    [0.39, -0.39],
    [-0.39, -0.39],
  ];
  return (
    <group {...props}>
      <Part geo={geos.body} />
      <mesh geometry={geos.arm} material={M.solidLift} rotation={[0, Math.PI / 4, 0]} />
      <mesh geometry={geos.arm} material={M.solidLift} rotation={[0, -Math.PI / 4, 0]} />
      <mesh geometry={geos.cam} material={M.solid} position={[0, -0.06, 0.26]} />
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0.07, z]}>
          <mesh geometry={geos.ring} material={M.glowDim} rotation={[Math.PI / 2, 0, 0]} />
          <group ref={(r) => void (r && (rotors.current[i] = r))}>
            <mesh geometry={geos.blade} material={M.ink} />
          </group>
          <mesh geometry={geos.led} material={M.glow} position={[0, -0.08, 0]} />
        </group>
      ))}
    </group>
  );
}

/** A humanoid on the scale of the Unitree G1 (about 1.3 m). */
export function HumanoidModel(props: G) {
  const g = useMemo(
    () => ({
      pelvis: box(0.3, 0.14, 0.18),
      torso: box(0.36, 0.42, 0.2),
      chest: box(0.3, 0.12, 0.04),
      head: box(0.18, 0.22, 0.18),
      visor: box(0.15, 0.04, 0.01),
      upper: new THREE.CapsuleGeometry(0.05, 0.22, 4, 8),
      fore: new THREE.CapsuleGeometry(0.042, 0.2, 4, 8),
      thigh: new THREE.CapsuleGeometry(0.065, 0.26, 4, 8),
      shin: new THREE.CapsuleGeometry(0.055, 0.26, 4, 8),
      foot: box(0.1, 0.05, 0.22),
      joint: new THREE.SphereGeometry(0.065, 12, 12),
    }),
    [],
  );
  return (
    <group {...props}>
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.09, 0, 0]}>
          <mesh geometry={g.foot} material={M.solidLift} position={[0, 0.025, 0.03]} />
          <mesh geometry={g.shin} material={M.solidLift} position={[0, 0.22, 0]} />
          <mesh geometry={g.joint} material={M.solid} position={[0, 0.39, 0]} />
          <mesh geometry={g.thigh} material={M.solidLift} position={[0, 0.56, 0]} />
        </group>
      ))}
      <Part geo={g.pelvis} position={[0, 0.74, 0]} />
      <Part geo={g.torso} position={[0, 1.0, 0]} />
      <mesh geometry={g.chest} material={M.glow} position={[0, 1.06, 0.101]} scale={[1, 0.1, 1]} />
      <Part geo={g.head} position={[0, 1.36, 0]} />
      <mesh geometry={g.visor} material={M.glow} position={[0, 1.38, 0.092]} />
      {/* arms, slightly forward as if mid-gesture */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.24, 1.16, 0]} rotation={[0.18, 0, s * 0.08]}>
          <mesh geometry={g.joint} material={M.solid} />
          <mesh geometry={g.upper} material={M.solidLift} position={[0, -0.18, 0]} />
          <group position={[0, -0.33, 0]} rotation={[-0.5, 0, 0]}>
            <mesh geometry={g.fore} material={M.solidLift} position={[0, -0.15, 0]} />
          </group>
        </group>
      ))}
    </group>
  );
}

/** A wheeled quadruped, in the shape of the Unitree Go2-W. */
export function QuadrupedModel(props: G) {
  const g = useMemo(
    () => ({
      body: box(0.7, 0.18, 0.3),
      head: box(0.16, 0.12, 0.22),
      thigh: box(0.06, 0.24, 0.06),
      calf: box(0.04, 0.24, 0.04),
      wheel: new THREE.CylinderGeometry(0.08, 0.08, 0.05, 20),
      eye: box(0.01, 0.03, 0.12),
    }),
    [],
  );
  const legs: [number, number][] = [
    [0.26, 0.17],
    [0.26, -0.17],
    [-0.26, 0.17],
    [-0.26, -0.17],
  ];
  return (
    <group {...props}>
      <Part geo={g.body} position={[0, 0.48, 0]} />
      <Part geo={g.head} position={[0.42, 0.5, 0]} />
      <mesh geometry={g.eye} material={M.glow} position={[0.505, 0.5, 0]} />
      {legs.map(([x, z], i) => (
        <group key={i} position={[x, 0.42, z]}>
          <mesh geometry={g.thigh} material={M.solidLift} position={[-0.04, -0.1, 0]} rotation={[0, 0, -0.4]} />
          <mesh geometry={g.calf} material={M.solidLift} position={[-0.02, -0.28, 0]} rotation={[0, 0, 0.5]} />
          <mesh geometry={g.wheel} material={M.solid} position={[0.04, -0.34, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

/** A box-frame 3D printer. */
export function PrinterModel(props: G) {
  const g = useMemo(
    () => ({
      frame: box(0.6, 0.66, 0.6),
      bed: box(0.46, 0.02, 0.46),
      head: box(0.08, 0.08, 0.08),
      rail: box(0.5, 0.02, 0.02),
      part: new THREE.CylinderGeometry(0.06, 0.08, 0.12, 6),
    }),
    [],
  );
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (head.current) head.current.position.set(Math.sin(t * 1.7) * 0.15, 0.36, Math.cos(t * 1.1) * 0.15);
  });
  return (
    <group {...props}>
      <mesh geometry={g.frame} position={[0, 0.33, 0]}>
        <meshStandardMaterial color="#000" transparent opacity={0.25} roughness={0.1} metalness={0.5} />
      </mesh>
      <group position={[0, 0.33, 0]}>
        <EdgeLines geometry={g.frame} material={M.edge} />
      </group>
      <mesh geometry={g.bed} material={M.solidLift} position={[0, 0.12, 0]} />
      <mesh geometry={g.part} material={M.glow} position={[0, 0.19, 0]} />
      <group ref={head}>
        <mesh geometry={g.head} material={M.solidLift} />
        <mesh geometry={g.rail} material={M.solid} />
      </group>
    </group>
  );
}

/** A small differential-drive robot (Bench, line follower). */
export function RobotCarModel({ batteryForward = false, ...props }: { batteryForward?: boolean } & G) {
  const g = useMemo(
    () => ({
      chassis: box(0.9, 0.22, 0.7),
      wheel: new THREE.CylinderGeometry(0.22, 0.22, 0.1, 24),
      hub: new THREE.CylinderGeometry(0.06, 0.06, 0.11, 8),
      battery: box(0.36, 0.16, 0.26),
      caster: new THREE.SphereGeometry(0.08, 12, 12),
      sensor: box(0.06, 0.06, 0.4),
    }),
    [],
  );
  return (
    <group {...props}>
      <Part geo={g.chassis} position={[0, 0.3, 0]} />
      {[-1, 1].map((s) => (
        <group key={s} position={[-0.15, 0.22, s * 0.41]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={g.wheel} material={M.solid} />
          <mesh geometry={g.hub} material={M.glow} />
        </group>
      ))}
      <mesh geometry={g.caster} material={M.solidLift} position={[0.34, 0.08, 0]} />
      <mesh geometry={g.sensor} material={M.glow} position={[0.46, 0.22, 0]} />
      <group position={batteryForward ? [0.58, 0.28, 0] : [-0.1, 0.5, 0]}>
        <Part geo={g.battery} />
      </group>
    </group>
  );
}

const productGeos = [
  () => new THREE.BoxGeometry(0.5, 0.36, 0.5),
  () => new THREE.CylinderGeometry(0.22, 0.28, 0.5, 6),
  () => new THREE.IcosahedronGeometry(0.3, 0),
  () => new THREE.BoxGeometry(0.62, 0.22, 0.4),
  () => new THREE.OctahedronGeometry(0.32, 0),
  () => new THREE.TorusGeometry(0.22, 0.08, 8, 24),
];

/** Abstract stand-in for a product that has no hero model: a clean silhouette with light edges. */
export function ProductProxy({ variant = 0, ...props }: { variant?: number } & G) {
  const geo = useMemo(() => productGeos[variant % productGeos.length](), [variant]);
  return (
    <group {...props}>
      <mesh geometry={geo} material={M.solidLift} />
      <EdgeLines geometry={geo} material={M.edge} threshold={20} />
    </group>
  );
}
