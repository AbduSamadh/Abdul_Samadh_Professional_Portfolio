'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { emit, journey } from '@/lib/journey';
import { GATES, P, W, type V3 } from '@/lib/path';
import { M, onPalette } from '@/lib/materials';
import { briefs } from '@/content/site';
import { Label, Region, damp, lx, makeCanvasTexture } from '../parts/common';
import { RobotCarModel } from '../parts/Models';
import { faceShot } from './build/Exhibits';

/** SCENE 6: SOLVE. Twelve briefs in a slow constellation, then two close flybys and a climb. */
export default function Solve({ mobile }: { mobile: boolean }) {
  return (
    <Region near={GATES.build.z} far={GATES.solve.z}>
      <Stars mobile={mobile} />
      <Constellation />
      <AiWeb />
      <Ladder />
    </Region>
  );
}

const CW = 3.6;
const CH = 2.2;

function cardPos(i: number): V3 {
  const { from, step, radius } = W.solve.helix;
  const g = Math.floor(i / 3);
  const j = i % 3;
  // Each group of three sits to the right of the reading panel, turning a little group to group.
  const a = [Math.PI * 0.26, -Math.PI * 0.08, -Math.PI * 0.38][j] + (g % 2 ? 0.12 : -0.06);
  return [Math.cos(a) * radius * lx() * 1.05 + 0.8 * lx(), Math.sin(a) * radius * 0.66 + 0.2, from - g * 3 * step - j * step];
}

function Constellation() {
  const cards = useMemo(
    () =>
      briefs.items.map((b, i) => {
        const t = makeCanvasTexture(720, 440);
        return { ...b, i, ...t, pos: cardPos(i) };
      }),
    [],
  );

  useEffect(
    () =>
      onPalette((p) => {
        cards.forEach((c) => {
          const g = c.ctx;
          const w = 720, h = 440;
          g.clearRect(0, 0, w, h);
          g.fillStyle = p.dark ? 'rgba(20,15,12,0.94)' : 'rgba(250,246,239,0.96)';
          g.fillRect(0, 0, w, h);
          g.strokeStyle = p.dark ? 'rgba(255,224,189,0.25)' : 'rgba(32,24,16,0.3)';
          g.lineWidth = 2;
          g.strokeRect(1, 1, w - 2, h - 2);
          g.fillStyle = p.accent;
          g.fillRect(0, 0, 6, h);
          g.font = '500 22px "IBM Plex Mono", monospace';
          g.fillStyle = p.mist;
          g.fillText('BRIEF', 40, 56);
          g.font = '700 150px "Space Mono", sans-serif';
          g.fillStyle = p.accent;
          g.fillText(c.n, 36, 210);
          let fs = 46;
          do {
            g.font = `700 ${fs}px "Space Mono", sans-serif`;
            fs -= 2;
          } while (g.measureText(c.title).width > 640 && fs > 22);
          g.fillStyle = p.ink;
          g.fillText(c.title, 40, 330);
          g.font = '500 20px "IBM Plex Mono", monospace';
          g.fillStyle = p.mist;
          g.fillText('CLICK TO OPEN', 40, 392);
          c.tex.needsUpdate = true;
        });
      }),
    [cards],
  );

  const groups = useRef<THREE.Group[]>([]);
  const mats = useMemo(() => cards.map((c) => new THREE.MeshBasicMaterial({ map: c.tex, toneMapped: false, transparent: true, side: THREE.DoubleSide })), [cards]);
  const hovered = useRef(-1);
  const root = useRef<THREE.Group>(null);

  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(cards.map((c) => new THREE.Vector3(...c.pos)));
    return g;
  }, [cards]);

  useFrame(({ camera, clock }, dt) => {
    // Which group of three is the camera looking at?
    const prog = journey.progress;
    let active = 0;
    for (let g = 0; g < 4; g++) if (prog >= P[`briefs-${g}`] - 0.009) active = g;
    groups.current.forEach((grp, i) => {
      if (!grp) return;
      const on = Math.floor(i / 3) === active;
      const target = (on ? 1 : 0.72) * (hovered.current === i ? 1.08 : 1);
      const s = damp(grp.scale.x, target, 5, dt);
      grp.scale.setScalar(s);
      mats[i].opacity = damp(mats[i].opacity, on ? 1 : 0.35, 4, dt);
      // turn gently toward the camera
      const look = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
      const m = new THREE.Matrix4().lookAt(look, grp.position, new THREE.Vector3(0, 1, 0));
      const q = new THREE.Quaternion().setFromRotationMatrix(m);
      grp.quaternion.slerp(q, 1 - Math.exp(-dt * (on ? 4 : 1.5)));
      grp.position.y = cards[i].pos[1] + Math.sin(clock.elapsedTime * 0.5 + i) * 0.12;
    });
    if (root.current) root.current.rotation.z = Math.sin(clock.elapsedTime * 0.05) * 0.05;
  });

  return (
    <group ref={root}>
      <line>
        <primitive object={line} attach="geometry" />
        <primitive object={M.edgeDim} attach="material" />
      </line>
      {cards.map((c, i) => (
        <group key={c.n} ref={(g) => void (g && (groups.current[i] = g))} position={c.pos}>
          <mesh
            material={mats[i]}
            onClick={(e) => {
              e.stopPropagation();
              emit('modal', { type: 'text', kicker: `Brief ${c.n}`, title: c.title, body: c.body });
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              hovered.current = i;
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              hovered.current = -1;
              document.body.style.cursor = '';
            }}
          >
            <planeGeometry args={[CW, CH]} />
          </mesh>
          <mesh position={[0, 0, -0.01]} material={M.glowDim}>
            <planeGeometry args={[CW + 0.06, CH + 0.06]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stars({ mobile }: { mobile: boolean }) {
  const geo = useMemo(() => {
    const n = mobile ? 900 : 2400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = -455 - Math.random() * 110;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [mobile]);
  const mat = useMemo(() => new THREE.PointsMaterial({ size: 0.07, sizeAttenuation: true, transparent: true, opacity: 0.7, toneMapped: false }), []);
  useEffect(() => onPalette((p) => mat.color.set(p.dark ? p.ink : p.mist)), [mat]);
  return <points geometry={geo} material={mat} />;
}

/** Brief 01, close up: a small network where one node is a person. */
function AiWeb() {
  const at = useMemo(() => [W.solve.web[0] * lx(), W.solve.web[1], W.solve.web[2]] as V3, []);
  const yaw = useMemo(() => faceShot(at, 'ai-web'), [at]);
  const { nodes, edges, human } = useMemo(() => {
    const layers = [4, 6, 3];
    const nodes: THREE.Vector3[] = [];
    layers.forEach((n, l) =>
      Array.from({ length: n }).forEach((_, k) => nodes.push(new THREE.Vector3((l - 1) * 2.4, (k - (n - 1) / 2) * 0.9, 0))),
    );
    const edges: [number, number][] = [];
    let a = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const b = a + layers[l];
      for (let i = 0; i < layers[l]; i++) for (let j = 0; j < layers[l + 1]; j++) edges.push([a + i, b + j]);
      a = b;
    }
    return { nodes, edges, human: 4 + 6 + 1 };
  }, []);
  const lines = useMemo(() => {
    const pts: number[] = [];
    edges.forEach(([i, j]) => pts.push(...nodes[i].toArray(), ...nodes[j].toArray()));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [nodes, edges]);
  const humanLines = useMemo(() => {
    const pts: number[] = [];
    edges.filter(([, j]) => j === human).forEach(([i, j]) => pts.push(...nodes[i].toArray(), ...nodes[j].toArray()));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [nodes, edges, human]);

  const pulses = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: 30 }, () => Math.random()), []);
  useFrame(({ clock }) => {
    const m = pulses.current;
    if (!m) return;
    const mm = new THREE.Matrix4();
    seeds.forEach((s, k) => {
      const t = (clock.elapsedTime * 0.45 + s) % 1;
      const e = edges[(k * 7 + Math.floor(clock.elapsedTime * 0.45 + s) * 13) % edges.length];
      const p = nodes[e[0]].clone().lerp(nodes[e[1]], t);
      mm.makeTranslation(p.x, p.y, p.z);
      m.setMatrixAt(k, mm);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={at} rotation={[0, yaw, 0]}>
      <lineSegments geometry={lines} material={M.edgeDim} />
      <lineSegments geometry={humanLines} material={M.edge} />
      {nodes.map((n, i) =>
        i === human ? (
          <group key={i} position={n}>
            <mesh position={[0, 0.2, 0]} material={M.ink}>
              <sphereGeometry args={[0.13, 16, 16]} />
            </mesh>
            <mesh position={[0, -0.16, 0]} material={M.ink}>
              <capsuleGeometry args={[0.12, 0.22, 4, 12]} />
            </mesh>
            <mesh material={M.glowDim}>
              <ringGeometry args={[0.42, 0.45, 40]} />
            </mesh>
          </group>
        ) : (
          <mesh key={i} position={n} material={M.glow}>
            <sphereGeometry args={[0.07, 12, 12]} />
          </mesh>
        ),
      )}
      <instancedMesh ref={pulses} args={[undefined, undefined, seeds.length]} material={M.glow}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </instancedMesh>
      <Label position={[0, -3.3, 0]} size={0.22} tone="ink" letterSpacing={0.15}>
        WHERE A HUMAN STILL HAS TO DECIDE
      </Label>
      <Label position={[0, 3.1, 0]} size={0.17} tone="accent" letterSpacing={0.3}>
        BRIEF 01 · AI LITERACY
      </Label>
    </group>
  );
}

/** Brief 04, as a ladder of light: a floor turtle in Year 1 to a full competition season. */
function Ladder() {
  const { x, from, to } = W.solve.ladder;
  const X = x * lx();
  const at = (t: number) => new THREE.Vector3(X, from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t);
  const len = at(0).distanceTo(at(1));
  const mid = at(0.5);
  const tilt = Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
  const rungs = 14;
  const trophy = useMemo(() => {
    const pts = [
      [0, 0], [0.28, 0], [0.28, 0.06], [0.08, 0.1], [0.06, 0.4], [0.1, 0.46], [0.36, 0.62], [0.42, 1.0], [0.38, 1.02],
    ].map(([a, b]) => new THREE.Vector2(a, b));
    return new THREE.LatheGeometry(pts, 24);
  }, []);
  const milestones: { t: number; label: string; node: React.ReactNode }[] = [
    {
      t: 0.06,
      label: 'YEAR 1 · FLOOR TURTLE',
      node: (
        <mesh material={M.solidLift} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ),
    },
    { t: 0.5, label: 'AUTONOMOUS LINE FOLLOWER', node: <RobotCarModel scale={0.5} /> },
    { t: 0.94, label: 'A FULL COMPETITION SEASON', node: <mesh geometry={trophy} material={M.glow} scale={0.9} /> },
  ];
  return (
    <group>
      {[-0.8, 0.8].map((dx) => (
        <mesh key={dx} position={[mid.x + dx, mid.y, mid.z]} rotation={[tilt - Math.PI / 2, 0, 0]} material={M.glow}>
          <boxGeometry args={[0.04, len, 0.04]} />
        </mesh>
      ))}
      {Array.from({ length: rungs }).map((_, k) => {
        const p = at((k + 0.5) / rungs);
        return (
          <mesh key={k} position={p} material={M.glowDim}>
            <boxGeometry args={[1.6, 0.03, 0.03]} />
          </mesh>
        );
      })}
      {milestones.map((m) => {
        const p = at(m.t);
        return (
          <group key={m.label} position={[p.x + 1.9, p.y, p.z]}>
            {m.node}
            <Billboard position={[0, 0.95, 0]}>
              <Label size={0.17} tone="ink" letterSpacing={0.2}>
                {m.label}
              </Label>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
