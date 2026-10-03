'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journey } from '@/lib/journey';
import { W } from '@/lib/path';
import { M, onPalette } from '@/lib/materials';
import { GLYPHS, glyphMaterial, glyphMesh } from '@/lib/glyphs';
import { Region } from '../parts/common';

/**
 * SCENE 2 (inside): falling through the terminal. Scanlines stretch into a tunnel of light lines,
 * the terminal's characters break apart into a field of glyphs flying past, then thin out as the
 * first world resolves.
 */
export default function Portal({ mobile }: { mobile: boolean }) {
  const { from, to } = W.tunnel;
  const glyphs = useMemo(() => {
    const count = mobile ? 1400 : 3600;
    const pos = new Float32Array(count * 3);
    const rot = new Float32Array(count * 3);
    const gl = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Denser near the entrance, thinning toward the exit.
      const t = Math.pow(Math.random(), 1.6);
      const z = from - t * (to - from) * -1;
      const a = Math.random() * Math.PI * 2;
      const r = 2.2 + Math.random() * 4.5 + t * 4;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = 0.6 + Math.sin(a) * r * 0.75;
      pos[i * 3 + 2] = z;
      // face the tunnel axis
      rot[i * 3] = 0;
      rot[i * 3 + 1] = 0;
      rot[i * 3 + 2] = a + Math.PI / 2;
      gl[i] = 1 + Math.floor(Math.random() * (GLYPHS.length - 1));
      const b = 0.35 + Math.random() * 0.9;
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = b;
      size[i] = 0.18 + Math.random() * 0.35;
    }
    const mat = glyphMaterial({ scramble: 0.12, intensity: 1 });
    return glyphMesh({ count, positions: pos, rotations: rot, glyphs: gl, colors: col, size, material: mat });
  }, [mobile, from, to]);

  const streaks = useMemo(() => {
    const count = mobile ? 220 : 520;
    const geo = new THREE.BoxGeometry(0.015, 0.015, 1);
    const mesh = new THREE.InstancedMesh(geo, M.glow, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 7;
      const len = 1.5 + Math.random() * 9;
      const z = from - Math.random() * (from - to);
      m.compose(new THREE.Vector3(Math.cos(a) * r, 0.6 + Math.sin(a) * r * 0.75, z), q, new THREE.Vector3(1, 1, len));
      mesh.setMatrixAt(i, m);
    }
    mesh.frustumCulled = false;
    return mesh;
  }, [mobile, from, to]);

  // Horizontal scanline rings at the mouth of the tunnel, echoing the CRT.
  const rings = useMemo(() => {
    const count = 26;
    const geo = new THREE.BoxGeometry(14, 0.02, 0.02);
    const mesh = new THREE.InstancedMesh(geo, M.edgeDim, count);
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.makeTranslation(0, -3.5 + (i / count) * 8.5, -1.5 - i * 0.9);
      mesh.setMatrixAt(i, m);
    }
    return mesh;
  }, []);

  const glow = useRef<THREE.Mesh>(null);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false }), []);
  useEffect(() => onPalette((p) => glowMat.color.set(p.accent).multiplyScalar(p.dark ? 2.2 : 1.1)), [glowMat]);

  useFrame(({ camera, clock }) => {
    (glyphs.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    // The screen's light lingers just after the crossing, then falls away behind.
    const z = camera.position.z;
    glowMat.opacity = Math.max(0, Math.min(1, 1 - (-z - 0.3) / 7));
    if (glow.current) glow.current.visible = glowMat.opacity > 0.01 && journey.progress < 0.2;
  });

  return (
    <Region near={from} far={to} ahead={30}>
      <primitive object={glyphs} />
      <primitive object={streaks} />
      <primitive object={rings} />
      <mesh ref={glow} position={[0, 1.2, -0.6]} material={glowMat}>
        <planeGeometry args={[6, 4]} />
      </mesh>
    </Region>
  );
}
