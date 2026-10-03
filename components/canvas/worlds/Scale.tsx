'use client';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, useFont } from '@react-three/drei';
import { TextGeometry } from 'three-stdlib';
import { journey } from '@/lib/journey';
import { GATES, P, W, type V3 } from '@/lib/path';
import { M } from '@/lib/materials';
import { FONTS } from '@/lib/asset';
import { scale } from '@/content/site';
import { testimonials } from '@/content/testimonials';
import { EdgeLines, Label, Region, lx, ss } from '../parts/common';
import { faceShot } from './build/Exhibits';

/** SCENE 8: SCALE. Numbers as architecture, a slow globe, the partnership monolith. */
export default function Scale({ mobile }: { mobile: boolean }) {
  return (
    <Region near={GATES.lab.z} far={GATES.scale.z}>
      {scale.stats.map((s, i) => (
        <Monument key={s.label} i={i} value={s.value} label={s.label} />
      ))}
      <Globe />
      <Monolith />
      <Lines mobile={mobile} />
      {testimonials.length > 0 && <Quotes />}
    </Region>
  );
}

const geoCache = new Map<string, { geo: THREE.BufferGeometry; edges: THREE.BufferGeometry; width: number }>();

/** A statistic as a monument. It counts up as you arrive. */
function Monument({ i, value, label }: { i: number; value: number; label: string }) {
  const font = useFont(FONTS.typeface);
  const at = useMemo(() => {
    const p = W.scale.stats[i];
    return [p[0] * lx(), p[1], p[2]] as V3;
  }, [i]);
  const yaw = useMemo(() => faceShot(at, `stat-${i}`), [at, i]);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  const get = (s: string) => {
    let g = geoCache.get(s);
    if (!g) {
      const geo = new TextGeometry(s, { font, size: 6, height: 1.4, curveSegments: 6, bevelEnabled: false });
      geo.computeBoundingBox();
      const width = geo.boundingBox!.max.x - geo.boundingBox!.min.x;
      g = { geo, edges: new THREE.EdgesGeometry(geo, 24), width };
      geoCache.set(s, g);
    }
    return g;
  };

  useFrame(() => {
    const p = journey.progress;
    const k = ss(P[`stat-${i}`] - 0.016, P[`stat-${i}`] - 0.002, p);
    const v = Math.round(value * k);
    if (v !== shownRef.current) {
      shownRef.current = v;
      setShown(v);
    }
  });

  const g = get(String(shown));
  return (
    <group position={at} rotation={[0, yaw, 0]}>
      <group position={[-g.width / 2, -2, -1.4]}>
        <mesh geometry={g.geo} material={M.solid} />
        <lineSegments geometry={g.edges} material={M.edge} />
      </group>
      <Label position={[0, -2.75, 0]} size={0.36} font="display" tone="ink">
        {label}
      </Label>
      <Label position={[0, 4.9, 0]} size={0.16} tone="accent" letterSpacing={0.35}>
        {`0${i + 1} / 06`}
      </Label>
    </group>
  );
}

const PLACES: { name: string; lat: number; lon: number }[] = [
  { name: 'INDIA', lat: 20.6, lon: 78.9 },
  { name: 'SINGAPORE', lat: 1.35, lon: 103.8 },
  { name: 'UAE', lat: 24.4, lon: 54.4 },
  { name: 'QATAR', lat: 25.3, lon: 51.2 },
  { name: 'KUWAIT', lat: 29.4, lon: 47.9 },
];

function ll(lat: number, lon: number, r: number) {
  const a = THREE.MathUtils.degToRad(lat);
  const b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a) * Math.cos(b) * r, Math.sin(a) * r, -Math.cos(a) * Math.sin(b) * r);
}

/** A minimal dark globe turning beneath the numbers, with the route lit. */
function Globe() {
  const R = 7;
  const lines = useMemo(() => {
    const pts: number[] = [];
    for (let lat = -60; lat <= 60; lat += 20) {
      for (let lon = 0; lon < 360; lon += 6) pts.push(...ll(lat, lon, R).toArray(), ...ll(lat, lon + 6, R).toArray());
    }
    for (let lon = 0; lon < 360; lon += 20) {
      for (let lat = -80; lat < 80; lat += 6) pts.push(...ll(lat, lon, R).toArray(), ...ll(lat + 6, lon, R).toArray());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const arcs = useMemo(() => {
    const route = [PLACES[0], PLACES[1], PLACES[2]];
    return route.slice(0, -1).map((a, i) => {
      const b = route[i + 1];
      const pa = ll(a.lat, a.lon, R), pb = ll(b.lat, b.lon, R);
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 32; k++) {
        const t = k / 32;
        const p = pa.clone().lerp(pb, t).normalize().multiplyScalar(R + Math.sin(t * Math.PI) * 1.4);
        pts.push(p);
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.03, 6, false);
    });
  }, []);
  // Turn the globe so the Gulf and India face the camera as it looks down.
  const base = useMemo(() => {
    const focus = ll(18, 70, 1).normalize();
    const want = new THREE.Vector3(0.0, 18, 13).normalize();
    return new THREE.Quaternion().setFromUnitVectors(focus, want);
  }, []);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const wob = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 18, 13).normalize(), Math.sin(clock.elapsedTime * 0.12) * 0.35);
    ref.current.quaternion.copy(wob).multiply(base);
  });
  const [x, y, z] = W.scale.globe;
  return (
    <group position={[x, y, z]}>
      <group ref={ref}>
        <mesh material={M.solid}>
          <sphereGeometry args={[R * 0.995, 48, 32]} />
        </mesh>
        <lineSegments geometry={lines} material={M.edgeDim} />
        {arcs.map((g, i) => (
          <mesh key={i} geometry={g} material={M.glow} />
        ))}
        {PLACES.map((p) => (
          <group key={p.name} position={ll(p.lat, p.lon, R)}>
            <mesh material={M.glow}>
              <sphereGeometry args={[0.14, 12, 12]} />
            </mesh>
            <Billboard position={ll(p.lat, p.lon, 0.9)}>
              <Label size={0.3} tone="ink" letterSpacing={0.25}>
                {p.name}
              </Label>
            </Billboard>
          </group>
        ))}
      </group>
    </group>
  );
}

/** The FIRST LEGO League partnership as a monolith. */
function Monolith() {
  const at = useMemo(() => [W.scale.fll[0] * lx(), W.scale.fll[1], W.scale.fll[2]] as V3, []);
  const yaw = useMemo(() => faceShot(at, 'fll'), [at]);
  const geo = useMemo(() => new THREE.BoxGeometry(2.6, 7, 0.7), []);
  return (
    <group position={at} rotation={[0, yaw, 0]}>
      <mesh geometry={geo} material={M.solid} />
      <EdgeLines geometry={geo} material={M.edge} />
      <mesh position={[0, 2.9, 0.36]} material={M.glow}>
        <planeGeometry args={[2.2, 0.03]} />
      </mesh>
      <Label position={[0, 2.4, 0.37]} size={0.13} tone="accent" letterSpacing={0.35}>
        OFFICIAL PARTNERSHIP
      </Label>
      <Label position={[0, 1.2, 0.37]} size={0.42} font="display" tone="ink" maxWidth={2.2} textAlign="center" lineHeight={1}>
        {scale.fll.title}
      </Label>
      {scale.fll.pins.map((p, i) => (
        <group key={p} position={[0, -0.4 - i * 0.62, 0.37]}>
          <mesh position={[-0.8, 0, 0]} material={M.glow}>
            <circleGeometry args={[0.07, 16]} />
          </mesh>
          <Label position={[-0.6, 0, 0]} size={0.2} tone="ink" anchorX="left" letterSpacing={0.2}>
            {p.toUpperCase()}
          </Label>
        </group>
      ))}
    </group>
  );
}

/** Bold true lines drifting through the space. */
function Lines({ mobile }: { mobile: boolean }) {
  const refs = useRef<THREE.Group[]>([]);
  const spots = useMemo(
    () =>
      scale.lines.map((_, i) => [(i % 2 ? 1 : -1) * (mobile ? 4 : 15 + (i % 3) * 2), 7 + (i % 3) * 2.2, -690 - i * 15] as V3),
    [mobile],
  );
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => g && (g.position.x = spots[i][0] + Math.sin(clock.elapsedTime * 0.15 + i) * 1.2));
  });
  return (
    <group>
      {scale.lines.map((l, i) => (
        <group key={l} ref={(g) => void (g && (refs.current[i] = g))} position={spots[i]}>
          <Label size={mobile ? 0.6 : 1.1} font="display" tone="mist" opacity={0.4}>
            {l}
          </Label>
        </group>
      ))}
    </group>
  );
}

/** Testimonial monoliths: only rendered when real testimonials exist in content/testimonials.ts. */
function Quotes() {
  return (
    <group>
      {testimonials.slice(0, 6).map((t, i) => {
        const at: V3 = [(i % 2 ? -1 : 1) * (5.5 + Math.floor(i / 2) * 1.5) * lx(), 1.2, -759 - Math.floor(i / 2) * 3.5];
        const geo = new THREE.BoxGeometry(3.4, 6.5, 0.5);
        return (
          <group key={t.name} position={at} rotation={[0, (i % 2 ? 1 : -1) * 0.6, 0]}>
            <mesh geometry={geo} material={M.solid} />
            <EdgeLines geometry={geo} material={M.edgeDim} />
            <Label position={[0, 1, 0.3]} size={0.3} font="display" tone="ink" maxWidth={2.9} textAlign="left">
              {`“${t.quote}”`}
            </Label>
            <Label position={[0, -2.4, 0.3]} size={0.13} tone="mist" maxWidth={2.9} textAlign="left">
              {`${t.name} · ${t.role}${t.org ? `, ${t.org}` : ''}`}
            </Label>
          </group>
        );
      })}
    </group>
  );
}
