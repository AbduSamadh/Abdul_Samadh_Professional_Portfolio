'use client';
import { useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import { GATES, W, type V3 } from '@/lib/path';
import { M } from '@/lib/materials';
import { DroneSwarm } from '../parts/DroneSwarm';
import { Label, Region } from '../parts/common';
import AsciiCity from './build/AsciiCity';
import { Bench, Hula, Landing, MethodFrame, Plotter } from './build/Exhibits';

const WORDS = [['BUILD'], ['SWARM']];

/** SCENE 5: BUILD. The engine room: every build is a small world that behaves like the project. */
export default function Build({ mobile }: { mobile: boolean }) {
  const sw = W.build.swarm;
  const start = useMemo(() => ({ type: 'pad' as const, at: sw.pad, spread: [mobile ? 12 : 22, 6] as [number, number] }), [sw, mobile]);
  return (
    <Region near={GATES.write.z} far={GATES.build.z}>
      <MethodFrame i={0} />
      <DroneSwarm count={mobile ? 420 : 1000} center={sw.center} width={mobile ? 18 : sw.width} words={WORDS} start={start} mode="loop" interactive />
      <LaunchPad at={sw.pad} mobile={mobile} />
      <AsciiCity mobile={mobile} />
      <MethodFrame i={1} />
      <Bench />
      <Plotter />
      <Landing />
      <Hula />
      <MethodFrame i={2} />
    </Region>
  );
}

function LaunchPad({ at, mobile }: { at: V3; mobile: boolean }) {
  const w = mobile ? 13 : 23;
  return (
    <group position={at}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} material={M.solid}>
        <planeGeometry args={[w + 2, 8]} />
      </mesh>
      <gridHelper args={[w + 2, 24, M.edgeDim.color, M.edgeDim.color]} position={[0, -0.04, 0]} scale={[1, 1, 8 / (w + 2)]} material-transparent material-opacity={0.25} />
      <Billboard position={[0, -0.8, 5]}>
        <Label size={0.3} tone="mist" letterSpacing={0.4}>
          LAUNCH PAD · SWARM
        </Label>
      </Billboard>
    </group>
  );
}
