'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useFont } from '@react-three/drei';
import { TextGeometry } from 'three-stdlib';
import { FONTS } from '@/lib/asset';
import { M, glowColor } from '@/lib/materials';
import { VOICES, WORD_SIZE, type Gate } from '@/lib/path';
import { journey } from '@/lib/journey';
import { testimonials } from '@/content/testimonials';
import { ss } from './common';

type FontData = {
  glyphs: Record<string, { ha: number }>;
  capHeight: number;
  through: Record<string, { x: number; y: number; radius: number } | null>;
};

const DEPTH = 3.2;
const TRACK = 0.4;

/**
 * A chapter word as architecture: extruded Space Grotesk letters, black bodies, light edges.
 * The word is placed so the camera path runs exactly through the counter of one letter
 * (the A of TEACH, the R of WRITE, the U of BUILD...). That letter brightens as you approach.
 */
export function AnchorWord({ gate }: { gate: Gate }) {
  const font = useFont(FONTS.typeface);
  const data = font.data as unknown as FontData;
  const k = WORD_SIZE / 1000;

  const { letters, offset, width } = useMemo(() => {
    let cursor = 0;
    const letters = gate.word.split('').map((ch) => {
      const geo = new TextGeometry(ch, { font, size: WORD_SIZE, height: DEPTH, curveSegments: 6, bevelEnabled: false });
      const x = cursor;
      cursor += data.glyphs[ch].ha * k + TRACK;
      return { ch, geo, edges: new THREE.EdgesGeometry(geo, 24), x };
    });
    const ch = gate.word[gate.letter];
    const tp = data.through[ch] ?? { x: data.glyphs[ch].ha / 2, y: data.capHeight / 2, radius: 100 };
    const hole = new THREE.Vector3(letters[gate.letter].x + tp.x * k, tp.y * k, 0);
    return { letters, offset: hole, width: cursor - TRACK };
  }, [font, data, gate, k]);

  const hot = useMemo(() => M.edge.clone(), []);

  const root = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    // SCALE's word would sit behind the recommendation slabs; keep it out of the way while they are read.
    if (root.current && gate.word === 'SCALE' && testimonials.length) {
      const p = journey.progress;
      root.current.visible = !(p > VOICES.start - 0.006 && p < VOICES.end + 0.004);
    }
    // The through-letter's edges brighten as the camera closes in.
    const d = Math.abs(camera.position.z - gate.z);
    const t = 1 - ss(4, 70, d);
    hot.color.copy(glowColor).multiplyScalar(1 + t * 1.6);
    hot.opacity = 1;
  });

  return (
    <group ref={root} position={[-offset.x, gate.y - offset.y, gate.z - DEPTH]}>
      {letters.map((l, i) => (
        <group key={i} position={[l.x, 0, 0]}>
          <mesh geometry={l.geo} material={M.solid} />
          <lineSegments geometry={l.edges} material={i === gate.letter ? hot : M.edge} />
        </group>
      ))}
      {/* a faint plinth line the word stands on */}
      <mesh position={[width / 2, -0.25, DEPTH / 2]} material={M.glowDim}>
        <boxGeometry args={[width + 8, 0.02, 0.05]} />
      </mesh>
    </group>
  );
}

useFont.preload(FONTS.typeface);
