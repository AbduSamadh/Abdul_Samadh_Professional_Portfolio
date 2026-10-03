'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journey } from '@/lib/journey';
import { GATES, P, W } from '@/lib/path';
import { GLYPHS, glyphMaterial, glyphMesh } from '@/lib/glyphs';
import { M } from '@/lib/materials';
import { DroneSwarm } from '../parts/DroneSwarm';
import { Region, ss } from '../parts/common';

/**
 * SCENE 9: convergence. Everything passed on the way (glyphs, pixels, drones) pulls back into one
 * composition, and the swarm spells the name.
 */
export default function Finale({ mobile }: { mobile: boolean }) {
  const words = useMemo(() => (mobile ? [['ABDUL', 'SAMADH']] : [['ABDUL SAMADH']]), [mobile]);
  const start = useMemo(() => ({ type: 'cloud' as const, radius: 46 }), []);
  const progress = useMemo(() => () => ss(P['gate-scale'] - 0.004, P.name - 0.004, journey.progress), []);
  return (
    <Region near={GATES.scale.z + 30} far={W.finale.name[2] - 10} ahead={140}>
      <DroneSwarm
        count={mobile ? 520 : 1400}
        center={W.finale.name}
        width={mobile ? 17 : 44}
        words={words}
        start={start}
        mode="scroll"
        getProgress={progress}
        size={mobile ? 0.085 : 0.062}
      />
      <Debris mobile={mobile} />
      <Horizon />
    </Region>
  );
}

/** Glyphs and pixels from every world, converging into a slow orbit around the name. */
function Debris({ mobile }: { mobile: boolean }) {
  const count = mobile ? 260 : 700;
  const data = useMemo(() => {
    const from = new Float32Array(count * 3);
    const orbit = new Float32Array(count * 3); // radius, angle, height
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 40);
      from.set([v.x, v.y * 0.7, v.z + 25], i * 3);
      orbit.set([24 + Math.random() * 16, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 16], i * 3);
    }
    const glyphs = new Float32Array(count).map(() => 1 + Math.floor(Math.random() * (GLYPHS.length - 1)));
    const mesh = glyphMesh({ count, positions: new Float32Array(count * 3), glyphs, size: 0.45, material: glyphMaterial({ scramble: 0.05, intensity: 0.6, opacity: 0.55 }) });
    return { from, orbit, mesh };
  }, [count]);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), t: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(0.45, 0.45, 0.45) }), []);
  const [cx, cy, cz] = W.finale.name;

  useFrame(({ clock, camera }) => {
    if (camera.position.z > GATES.scale.z + 40) return;
    const f = ss(P['gate-scale'] - 0.01, P.name, journey.progress);
    const t = clock.elapsedTime;
    (data.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    for (let i = 0; i < count; i++) {
      const [r, a0, h] = [data.orbit[i * 3], data.orbit[i * 3 + 1], data.orbit[i * 3 + 2]];
      const a = a0 + t * 0.04 * (1 + (i % 3) * 0.3);
      tmp.t.set(Math.cos(a) * r * 1.5, h * 0.8, Math.sin(a) * r * 0.5 - 14);
      tmp.p.set(data.from[i * 3], data.from[i * 3 + 1], data.from[i * 3 + 2]);
      const k = ss(0, 1, Math.min(1, f * 1.2 - (i % 10) * 0.02));
      tmp.p.lerp(tmp.t, k);
      tmp.q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(-tmp.p.x, 20) * 0.5);
      tmp.m.compose(tmp.p.set(tmp.p.x + cx, tmp.p.y + cy, tmp.p.z + cz), tmp.q, tmp.s);
      data.mesh.setMatrixAt(i, tmp.m);
    }
    data.mesh.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={data.mesh} />;
}

/** A thin horizon line under the name: the room's light line, come back around. */
function Horizon() {
  const [, y, z] = W.finale.name;
  return (
    <group position={[0, y - 9, z]}>
      <mesh material={M.glow}>
        <boxGeometry args={[140, 0.02, 0.02]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 20]} material={M.solid}>
        <planeGeometry args={[160, 60]} />
      </mesh>
    </group>
  );
}
