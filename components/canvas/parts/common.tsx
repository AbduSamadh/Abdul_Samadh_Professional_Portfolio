'use client';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { journey } from '@/lib/journey';
import { MOBILE_LX } from '@/lib/path';
import { M } from '@/lib/materials';
import { FONTS } from '@/lib/asset';
import { usePalette } from '@/lib/theme';

export const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const damp = THREE.MathUtils.damp;

/** Lateral factor: content and camera pull toward the centre line on narrow screens. */
export const lx = () => (journey.mobile ? MOBILE_LX : 1);

/**
 * A slice of the world that only renders while the camera is near it. `near` is the z where it
 * starts (closest to the room), `far` where it ends. Worlds live behind the laptop screen, so
 * nothing here renders while the camera is still in the room.
 */
export function Region({ near, far, children, ahead = 110 }: { near: number; far: number; children: ReactNode; ahead?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    const z = camera.position.z;
    if (ref.current) ref.current.visible = z < -0.25 && z < near + ahead && z > far - 25;
  });
  return <group ref={ref}>{children}</group>;
}

/** Hard edges of a geometry as glowing lines. */
export function EdgeLines({ geometry, threshold = 25, material = M.edge }: { geometry: THREE.BufferGeometry; threshold?: number; material?: THREE.Material }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, threshold), [geometry, threshold]);
  return <lineSegments geometry={edges} material={material} />;
}

/** A box with a solid body and glowing edges. */
export function EdgeBox({
  size,
  material = M.solid,
  edge = M.edge,
  ...props
}: { size: [number, number, number]; material?: THREE.Material; edge?: THREE.Material | null } & Omit<ThreeElements['group'], 'children'>) {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group {...props}>
      <mesh geometry={geo} material={material} />
      {edge && <EdgeLines geometry={geo} material={edge} />}
    </group>
  );
}

type LabelProps = {
  children: ReactNode;
  size?: number;
  tone?: 'ink' | 'mist' | 'accent';
  font?: 'mono' | 'display' | 'crt';
  opacity?: number;
} & Omit<React.ComponentProps<typeof Text>, 'children' | 'font' | 'fontSize' | 'color'>;

/** SDF text in the site's fonts and palette. */
export function Label({ children, size = 0.3, tone = 'ink', font = 'mono', opacity = 1, ...props }: LabelProps) {
  const p = usePalette();
  const color = tone === 'accent' ? p.accent : tone === 'mist' ? p.mist : p.ink;
  const f = font === 'display' ? FONTS.display : font === 'crt' ? FONTS.crt : FONTS.mono;
  return (
    <Text
      font={f}
      fontSize={size}
      color={color}
      fillOpacity={opacity}
      anchorX="center"
      anchorY="middle"
      letterSpacing={font === 'mono' ? 0.08 : font === 'display' ? -0.02 : 0}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Rotate a group so it faces the camera path at x = 0 (used for things on the sides). */
export function faceAxis(pos: [number, number, number], bias = 0.35) {
  const yaw = Math.atan2(-pos[0], 6) * (1 - bias);
  return [0, yaw, 0] as [number, number, number];
}

const tmp = new THREE.Vector3();
/** Distance from camera to a world point, for proximity-driven animation. */
export function camDist(camera: THREE.Camera, p: THREE.Vector3 | [number, number, number]) {
  if (Array.isArray(p)) tmp.set(p[0], p[1], p[2]);
  else tmp.copy(p);
  return camera.position.distanceTo(tmp);
}

/** Draw into a canvas and get a texture back; redraws when the palette changes. */
export function makeCanvasTexture(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { canvas: c, ctx: c.getContext('2d')!, tex };
}
