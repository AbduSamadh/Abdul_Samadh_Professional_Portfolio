'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { usePalette } from '@/lib/theme';
import { GATES } from '@/lib/path';
import '@/lib/materials';
import CameraRig from './CameraRig';
import { AnchorWord } from './parts/AnchorWord';
import Room from './worlds/Room';
import Portal from './worlds/Portal';
import Teach from './worlds/Teach';
import Write from './worlds/Write';
import Build from './worlds/Build';
import Solve from './worlds/Solve';
import Lab from './worlds/Lab';
import Scale from './worlds/Scale';
import Finale from './worlds/Finale';

/** One canvas, one continuous world. */
export default function Scene({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const [dpr, setDpr] = useState(mobile ? 1.25 : 1.6);
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 40, near: 0.03, far: 260, position: [0, 1.8, 7.6] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.8, d - 0.3))}
        onIncline={() => setDpr((d) => Math.min(mobile ? 1.5 : 2, d + 0.2))}
        flipflops={3}
      />
      <ThemeSync />
      <CameraRig mobile={mobile} reduced={reduced} />
      <Lights />
      <Suspense fallback={null}>
        <Room mobile={mobile} />
        <Portal mobile={mobile} />
        <Teach mobile={mobile} />
        <Write mobile={mobile} />
        <Build mobile={mobile} />
        <Solve mobile={mobile} />
        <Lab mobile={mobile} />
        <Scale mobile={mobile} />
        <Finale mobile={mobile} />
        <Gates />
        <Ready />
      </Suspense>
      <Effects mobile={mobile} />
    </Canvas>
  );
}

function Gates() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const z = camera.position.z;
    ref.current.visible = z < -0.25;
    // Only the next two words need to exist at any time.
    ref.current.children.forEach((c, i) => {
      const g = Object.values(GATES)[i];
      c.visible = g.z < z + 8 && g.z > z - 140;
    });
  });
  return (
    <group ref={ref}>
      {Object.entries(GATES).map(([k, g]) => (
        <group key={k}>
          <AnchorWord gate={g} />
        </group>
      ))}
    </group>
  );
}

/** Tell the boot screen the world is ready to be seen. */
function Ready() {
  useEffect(() => {
    window.dispatchEvent(new Event('as:scene-ready'));
  }, []);
  return null;
}

function ThemeSync() {
  const p = usePalette();
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.background = new THREE.Color(p.bg);
    scene.fog = new THREE.Fog(p.bg, 16, 120);
  }, [p, scene]);
  return null;
}

function Lights() {
  const p = usePalette();
  const follow = useRef<THREE.PointLight>(null);
  useFrame(({ camera }) => {
    // A soft light that travels with the camera so nearby black forms read as forms.
    follow.current?.position.set(camera.position.x + 1.5, camera.position.y + 3, camera.position.z - 4);
  });
  return (
    <>
      <hemisphereLight args={[p.dark ? '#5a4a3c' : '#ffffff', p.dark ? '#000000' : '#d9cfc0', p.dark ? 0.55 : 1.6]} />
      <directionalLight position={[6, 12, 4]} intensity={p.dark ? 0.6 : 1.5} color={p.dark ? '#ffd8b0' : '#ffffff'} />
      <pointLight ref={follow} intensity={p.dark ? 22 : 12} distance={26} decay={1.4} color={p.dark ? '#ffcf9e' : '#ffffff'} />
    </>
  );
}

function Effects({ mobile }: { mobile: boolean }) {
  const p = usePalette();
  const bloom = useMemo(() => ({ intensity: p.dark ? 0.95 : 0.3, threshold: p.dark ? 0.92 : 0.98 }), [p]);
  if (mobile) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={bloom.intensity} luminanceThreshold={bloom.threshold} luminanceSmoothing={0.2} radius={0.7} resolutionScale={0.5} />
        <Vignette offset={0.3} darkness={p.dark ? 0.65 : 0.3} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={bloom.intensity} luminanceThreshold={bloom.threshold} luminanceSmoothing={0.2} radius={0.75} />
      <Vignette offset={0.28} darkness={p.dark ? 0.7 : 0.32} />
      <Noise opacity={p.dark ? 0.045 : 0.025} premultiply />
    </EffectComposer>
  );
}
