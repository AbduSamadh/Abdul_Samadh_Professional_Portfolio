'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { GATES, W, type V3 } from '@/lib/path';
import { M, onPalette } from '@/lib/materials';
import type { Palette } from '@/lib/theme';
import { authoring } from '@/content/site';
import { Label, Region, camDist, lx, makeCanvasTexture, ss } from '../parts/common';

/** SCENE 4: WRITE. An infinite library, ordered by grade, with six books that open as you pass. */
export default function Write({ mobile }: { mobile: boolean }) {
  return (
    <Region near={GATES.teach.z} far={GATES.write.z}>
      <Shelves mobile={mobile} />
      <Floor />
      <GradeArc />
      {authoring.books.map((b, i) => (
        <Book key={b.n} i={i} n={b.n} title={b.title} pos={W.write.books[i]} />
      ))}
      <Pixels mobile={mobile} />
    </Region>
  );
}

const FLOOR = -2.6;

function Shelves({ mobile }: { mobile: boolean }) {
  const { from, to, x } = W.write.shelves;
  const levels = mobile ? 4 : 6;
  const built = useMemo(() => {
    const spines: { pos: V3; size: V3; shade: number; title: boolean; side: number }[] = [];
    for (const side of [-1, 1]) {
      for (let lv = 0; lv < levels; lv++) {
        const y = FLOOR + 0.12 + lv * 2.3;
        let z = from;
        while (z > to) {
          const w = 0.12 + Math.random() * 0.22;
          const h = 1.3 + Math.random() * 0.6;
          const d = 0.75 + Math.random() * 0.2;
          if (Math.random() < 0.04) {
            z -= 0.6; // a gap on the shelf
            continue;
          }
          const lean = Math.random() < 0.03;
          spines.push({
            pos: [side * x * lx(), y + h / 2, z - w / 2],
            size: [d, lean ? h * 0.92 : h, w],
            shade: Math.random(),
            title: Math.random() < 0.16,
            side,
          });
          z -= w + 0.015;
        }
      }
    }
    const count = spines.length;
    const box = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.1 });
    const mesh = new THREE.InstancedMesh(box, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    spines.forEach((s, i) => {
      m.compose(new THREE.Vector3(...s.pos), q, new THREE.Vector3(...s.size));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    const titled = spines.filter((s) => s.title);
    const tmesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.glow, titled.length);
    titled.forEach((s, i) => {
      const face = s.pos[0] - s.side * (s.size[0] / 2 + 0.005);
      m.compose(new THREE.Vector3(face, s.pos[1] + s.size[1] * (Math.random() * 0.3), s.pos[2]), q, new THREE.Vector3(0.01, s.size[1] * 0.35, s.size[2] * 0.35));
      tmesh.setMatrixAt(i, m);
    });
    mesh.frustumCulled = false;
    tmesh.frustumCulled = false;
    return { mesh, tmesh, spines };
  }, [from, to, x, levels]);

  useEffect(
    () =>
      onPalette((p: Palette) => {
        const c = new THREE.Color();
        const base = new THREE.Color(p.dark ? '#120e0b' : '#f2ece2');
        const alt = new THREE.Color(p.dark ? '#1f1813' : '#ddd2c2');
        built.spines.forEach((s, i) => {
          c.copy(base).lerp(alt, s.shade);
          built.mesh.setColorAt(i, c);
        });
        built.mesh.instanceColor!.needsUpdate = true;
      }),
    [built],
  );

  // Shelf boards with a quiet light line on the front edge.
  const boards = useMemo(() => {
    const out: { pos: V3; len: number }[] = [];
    for (const side of [-1, 1]) for (let lv = 0; lv <= levels; lv++) out.push({ pos: [side * x * lx(), FLOOR + lv * 2.3, (from + to) / 2], len: from - to });
    return out;
  }, [from, to, x, levels]);

  return (
    <group>
      <primitive object={built.mesh} />
      <primitive object={built.tmesh} />
      {boards.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh material={M.solid}>
            <boxGeometry args={[1.1, 0.1, b.len]} />
          </mesh>
          <mesh position={[-Math.sign(b.pos[0]) * 0.56, 0.05, 0]} material={M.glowDim}>
            <boxGeometry args={[0.012, 0.012, b.len]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Floor() {
  const { from, to } = W.write.shelves;
  const grades = authoring.grades;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, (from + to) / 2]} material={M.solid}>
        <planeGeometry args={[22, from - to]} />
      </mesh>
      {grades.map((g, i) => {
        const z = -190 - (i / (grades.length - 1)) * 62;
        return (
          <group key={g} position={[0, FLOOR + 0.01, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.glowDim}>
              <planeGeometry args={[4.6, 0.02]} />
            </mesh>
            <Label rotation={[-Math.PI / 2, 0, 0]} position={[-2.9, 0.01, 0]} size={0.5} tone="mist" font="display" anchorX="right">
              {g === 'KG' ? 'KG' : `G${g}`}
            </Label>
          </group>
        );
      })}
    </group>
  );
}

/** The scope and sequence as one arc of light overhead: KG to Grade 13 on one page. */
function GradeArc() {
  const grades = authoring.grades;
  const { from, to, y } = W.write.arc;
  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 1.0 - Math.PI / 2) * 2.2 * lx(), y + Math.sin(t * Math.PI) * 3.2, from + (to - from) * t));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [from, to, y]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.03, 6, false), [curve]);
  const dot = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (dot.current) dot.current.position.copy(curve.getPointAt((clock.elapsedTime * 0.05) % 1));
  });
  return (
    <group>
      <mesh geometry={tube} material={M.glow} />
      <mesh ref={dot} material={M.glow}>
        <sphereGeometry args={[0.16, 12, 12]} />
      </mesh>
      {grades.map((g, i) => {
        const p = curve.getPointAt(i / (grades.length - 1));
        return (
          <group key={g} position={p}>
            <mesh material={M.ink}>
              <sphereGeometry args={[0.09, 10, 10]} />
            </mesh>
            <Billboard position={[0, 0.42, 0]}>
              <Label size={0.24} tone="ink">
                {g === 'KG' ? 'KG' : g}
              </Label>
            </Billboard>
          </group>
        );
      })}
      <Billboard position={[0, y + 4.4, from - 6]}>
        <Label size={0.2} tone="accent" letterSpacing={0.3}>
          SCOPE AND SEQUENCE · KG–13
        </Label>
      </Billboard>
    </group>
  );
}

const BW = 1.6;
const BH = 2.2;

/**
 * One of the six authored book types. Covers are typographic placeholders until real covers
 * are supplied (drop images in public/assets/books/ and map them here).
 */
function Book({ i, n, title, pos }: { i: number; n: string; title: string; pos: V3 }) {
  const side = pos[0] < 0 ? -1 : 1;
  const front = useRef<THREE.Group>(null);
  const sheets = useRef<THREE.Group[]>([]);
  const root = useRef<THREE.Group>(null);
  const open = useRef(0);

  const tex = useMemo(() => ({ cover: makeCanvasTexture(512, 704), page: makeCanvasTexture(512, 704) }), []);

  useEffect(
    () =>
      onPalette((p) => {
        drawCover(tex.cover.ctx, n, title, p);
        tex.cover.tex.needsUpdate = true;
        drawPage(tex.page.ctx, i, p);
        tex.page.tex.needsUpdate = true;
      }),
    [tex, n, title, i],
  );

  const world = useMemo(() => new THREE.Vector3(pos[0] * lx(), pos[1], pos[2]), [pos]);
  useFrame(({ camera, clock }, dt) => {
    const d = camDist(camera, world);
    open.current = THREE.MathUtils.damp(open.current, 1 - ss(5, 15, d), 2.2, dt);
    const o = open.current;
    // the front cover swings toward you and lands on the left
    if (front.current) front.current.rotation.y = -o * (Math.PI - 0.22);
    const t = clock.elapsedTime;
    sheets.current.forEach((s, k) => {
      if (!s) return;
      const phase = (t * 0.28 + k / 3) % 1;
      s.rotation.y = -ss(0.1, 0.9, phase) * (Math.PI - 0.3) * ss(0.6, 1, o);
      s.visible = o > 0.5;
    });
    if (root.current) root.current.position.y = world.y + Math.sin(t * 0.5 + i) * 0.1;
  });

  const coverMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex.cover.tex, toneMapped: false }), [tex]);
  const pageMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex.page.tex, toneMapped: false, color: new THREE.Color(0.8, 0.78, 0.74) }), [tex]);
  const sheetMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide, color: '#bdb3a4' }), []);

  return (
    <group ref={root} position={world} rotation={[0, -side * 0.55, 0]}>
      {/* back cover, page block and the right-hand page */}
      <mesh material={M.solid} position={[BW / 2, 0, -0.07]}>
        <boxGeometry args={[BW, BH, 0.03]} />
      </mesh>
      <mesh position={[BW / 2 - 0.03, 0, -0.03]}>
        <boxGeometry args={[BW - 0.06, BH - 0.06, 0.05]} />
        <meshStandardMaterial color="#d9cfbf" roughness={0.9} />
      </mesh>
      <mesh material={pageMat} position={[BW / 2 - 0.03, 0, -0.004]}>
        <planeGeometry args={[BW - 0.08, BH - 0.08]} />
      </mesh>
      <mesh material={M.solid} position={[0, 0, -0.03]}>
        <boxGeometry args={[0.07, BH, 0.11]} />
      </mesh>
      {/* turning pages */}
      {[0, 1, 2].map((k) => (
        <group key={k} ref={(g) => void (g && (sheets.current[k] = g))} position={[0, 0, 0.001 + k * 0.002]}>
          <mesh material={sheetMat} position={[BW / 2 - 0.05, 0, 0]}>
            <planeGeometry args={[BW - 0.1, BH - 0.1]} />
          </mesh>
        </group>
      ))}
      {/* front cover: printed outside, a page inside */}
      <group ref={front}>
        <mesh material={M.solid} position={[BW / 2, 0, 0.03]}>
          <boxGeometry args={[BW, BH, 0.03]} />
        </mesh>
        <mesh material={coverMat} position={[BW / 2, 0, 0.0465]}>
          <planeGeometry args={[BW - 0.02, BH - 0.02]} />
        </mesh>
        <mesh material={pageMat} position={[BW / 2, 0, 0.013]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[BW - 0.08, BH - 0.08]} />
        </mesh>
      </group>
      <Label position={[0, -BH / 2 - 0.3, 0]} size={0.16} tone="mist" letterSpacing={0.3}>
        {`${n} · ${title.toUpperCase()}`}
      </Label>
    </group>
  );
}

function drawCover(g: CanvasRenderingContext2D, n: string, title: string, p: Palette) {
  const w = 512, h = 704;
  g.fillStyle = p.dark ? '#151009' : '#2a2119';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = p.accent;
  g.lineWidth = 4;
  g.strokeRect(24, 24, w - 48, h - 48);
  g.fillStyle = p.accent;
  g.font = '700 200px "Unbounded", sans-serif';
  g.textBaseline = 'top';
  g.fillText(n, 48, 60);
  g.fillStyle = '#F6EDE2';
  g.font = '700 42px "Unbounded", sans-serif';
  const words = title.split(' ');
  let line = '';
  let y = 380;
  for (const wd of words) {
    if (g.measureText(line + wd).width > w - 110) {
      g.fillText(line.trim(), 48, y);
      y += 50;
      line = '';
    }
    line += wd + ' ';
  }
  g.fillText(line.trim(), 48, y);
  g.fillStyle = '#A99787';
  g.font = '500 20px "IBM Plex Mono", monospace';

}

function drawPage(g: CanvasRenderingContext2D, i: number, p: Palette) {
  const w = 512, h = 704;
  g.fillStyle = '#f4ece0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = p.dark ? '#b2560a' : '#b2560a';
  g.font = '600 22px "IBM Plex Mono", monospace';
  g.textBaseline = 'top';

  g.fillStyle = '#1a1510';
  g.font = '700 40px "Unbounded", sans-serif';

  g.fillStyle = '#6b5d4f';
  for (let k = 0; k < 16; k++) g.fillRect(40, 150 + k * 30, (w - 80) * (0.55 + ((k * 31) % 45) / 100), 6);
  g.strokeStyle = '#b2560a';
  g.lineWidth = 3;
  g.strokeRect(40, 640 - 120, w - 80, 110);
}

/** The last book's pages dissolve into pixels that stream through the R of WRITE into BUILD. */
function Pixels({ mobile }: { mobile: boolean }) {
  const count = mobile ? 160 : 420;
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), M.glow, count);
    m.frustumCulled = false;
    return m;
  }, [count]);
  const seeds = useMemo(() => Array.from({ length: count }, () => [Math.random(), (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, Math.random()]), [count]);
  const start = useMemo(() => new THREE.Vector3(W.write.books[5][0] * lx(), W.write.books[5][1], W.write.books[5][2]), []);
  const end = useMemo(() => new THREE.Vector3(0, GATES.write.y, GATES.write.z - 20), []);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const [a, jx, jy, sp] = seeds[i];
      const f = (t * (0.05 + sp * 0.05) + a) % 1;
      tmp.p.lerpVectors(start, end, f);
      const spread = Math.sin(f * Math.PI) * 2.4;
      tmp.p.x += jx * spread * 0.6;
      tmp.p.y += jy * spread * 0.6 + Math.sin(f * Math.PI) * 1.2;
      const k = Math.sin(f * Math.PI) * (0.6 + sp);
      tmp.s.setScalar(k);
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      mesh.setMatrixAt(i, tmp.m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={mesh} />;
}
