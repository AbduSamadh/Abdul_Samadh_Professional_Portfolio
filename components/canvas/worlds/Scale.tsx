'use client';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, useFont } from '@react-three/drei';
import { TextGeometry } from 'three-stdlib';
import { journey } from '@/lib/journey';
import { GATES, P, VOICES, W, voicePos, type V3 } from '@/lib/path';
import { M, glowColor } from '@/lib/materials';
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
      {!mobile && <Lines mobile={mobile} />}
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

/** FIRST LEGO League UAE and competition judging, as a monolith. */
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
        CORE TEAM
      </Label>
      <Label position={[0, 1.2, 0.37]} size={0.42} font="display" tone="ink" maxWidth={2.2} textAlign="center" lineHeight={1}>
        {scale.fll.title}
      </Label>
      {scale.fll.roles.slice(1).map((p, i) => (
        <group key={p} position={[0, -0.2 - i * 0.5, 0.37]}>
          <mesh position={[-0.95, 0, 0]} material={M.glow}>
            <circleGeometry args={[0.06, 16]} />
          </mesh>
          <Label position={[-0.8, 0, 0]} size={0.17} tone="ink" anchorX="left" letterSpacing={0.15}>
            {p.toUpperCase()}
          </Label>
        </group>
      ))}
      <Label position={[0, -2.3, 0.37]} size={0.13} tone="mist" maxWidth={2.2} textAlign="center" lineHeight={1.4}>
        {scale.fll.judged}
      </Label>
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

/** LinkedIn recommendations as an arc of slabs; the one the camera faces lights up. */
function Quotes() {
  const n = testimonials.length;
  const mats = useMemo(() => testimonials.map(() => M.edge.clone()), []);
  const geo = useMemo(() => new THREE.BoxGeometry(3.6, 6.2, 0.5), []);
  const [cx, , cz] = VOICES.center;
  useFrame(() => {
    const p = journey.progress;
    mats.forEach((m, i) => {
      const d = Math.abs(p - P[`voice-${i}`]);
      const on = 1 - ss(0.002, 0.006, d);
      m.color.copy(glowColor).multiplyScalar(0.35 + on * 0.9);
    });
  });
  return (
    <group>
      {testimonials.map((t, i) => {
        const at = voicePos(i, n);
        const yaw = Math.atan2(cx - at[0], cz - at[2]);
        return (
          <group key={t.name} position={at} rotation={[0, yaw, 0]} scale={0.8}>
            <mesh geometry={geo} material={M.solid} />
            <EdgeLines geometry={geo} material={mats[i]} />
            <Label position={[-1.5, 2.55, 0.27]} size={0.14} tone="accent" anchorX="left" letterSpacing={0.3}>
              {`RECOMMENDATION ${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`}
            </Label>
            <Label position={[-1.5, 2.1, 0.27]} size={0.3} font="display" tone="ink" maxWidth={3.0} textAlign="left" anchorX="left" anchorY="top" lineHeight={1.2}>
              {`“${t.quote}”`}
            </Label>
            <Label position={[-1.5, -2.2, 0.27]} size={0.2} font="display" tone="ink" anchorX="left">
              {t.name}
            </Label>
            <Label position={[-1.5, -2.55, 0.27]} size={0.11} tone="mist" maxWidth={3.0} textAlign="left" anchorX="left" anchorY="top">
              {`${t.role}${t.org ? `, ${t.org}` : ''}`}
            </Label>
          </group>
        );
      })}
    </group>
  );
}
