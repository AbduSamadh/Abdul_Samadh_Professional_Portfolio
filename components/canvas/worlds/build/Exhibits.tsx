'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import { W, fitShots, type V3 } from '@/lib/path';
import { M, onPalette } from '@/lib/materials';
import { asset, FONTS } from '@/lib/asset';
import { journey } from '@/lib/journey';
import { builds } from '@/content/site';
import { EdgeBox, Label, lx, makeCanvasTexture } from '../../parts/common';
import { DroneModel, RobotCarModel } from '../../parts/Models';

/** Yaw that turns an object at `at` to face the camera position of a named shot. */
export function faceShot(at: V3, shotId: string) {
  const s = fitShots(journey.lx, journey.fovBoost, journey.sheet).find((x) => x.id === shotId)!;
  return Math.atan2(s.pos[0] - at[0], s.pos[2] - at[2]);
}
const place = (p: V3): V3 => [p[0] * lx(), p[1], p[2]];

/** One of the three method frames the camera flies through. */
export function MethodFrame({ i }: { i: number }) {
  const p = place(W.build.frames[i]);
  const w = 6.4, h = 4.2, t = 0.045;
  return (
    <group position={p}>
      {[
        [0, h / 2, w + t, t],
        [0, -h / 2, w + t, t],
        [-w / 2, 0, t, h],
        [w / 2, 0, t, h],
      ].map(([x, y, sw, sh], k) => (
        <mesh key={k} position={[x, y, 0]} material={M.glow}>
          <boxGeometry args={[sw, sh, t]} />
        </mesh>
      ))}
    </group>
  );
}

/** Bench: a robot that misbehaves honestly, with live gauges and a report card. */
export function Bench() {
  const at = place(W.build.bench);
  const yaw = useMemo(() => faceShot(at, 'bench'), [at]);
  const robot = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Mesh[]>([]);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const [mode, setMode] = useState<0 | 1>(0);
  const modeRef = useRef(0);
  const vals = useRef([0, 0, 0]);

  useFrame(({ clock, camera }, dt) => {
    if (camera.position.distanceTo(new THREE.Vector3(...at)) > 60) return;
    const t = clock.elapsedTime % 10;
    const m = t < 5 ? 0 : 1;
    if (m !== modeRef.current) {
      modeRef.current = m;
      setMode(m as 0 | 1);
    }
    const r = robot.current;
    if (r) {
      if (m === 0) {
        // one wheel wired backwards: it spins on the spot
        r.position.set(0, 0.1, 0);
        r.rotation.set(0, clock.elapsedTime * 2.4, 0);
      } else {
        // battery off the nose: it tips forward and scrapes along
        const k = (t - 5) / 5;
        r.rotation.set(0, 0, -0.14 + Math.sin(clock.elapsedTime * 22) * 0.012);
        r.position.set(-1.2 + k * 2.2, 0.08, 0);
      }
    }
    const target = m === 0 ? [0.82 + Math.sin(clock.elapsedTime * 9) * 0.06, (clock.elapsedTime * 0.6) % 1, 0.72] : [0.96, (clock.elapsedTime * 0.15) % 1, 0.42 + Math.sin(clock.elapsedTime * 3) * 0.04];
    vals.current = vals.current.map((v, i) => THREE.MathUtils.damp(v, target[i], 5, dt));
    bars.current.forEach((b, i) => {
      if (!b) return;
      b.scale.y = Math.max(0.02, vals.current[i]);
      b.position.y = (b.scale.y * 2) / 2;
    });
    const s = sparks.current;
    if (s) {
      const mm = new THREE.Matrix4();
      for (let i = 0; i < s.count; i++) {
        const life = (clock.elapsedTime * 3 + i / s.count) % 1;
        const on = m === 1 ? 1 : 0;
        const x = (r?.position.x ?? 0) + 0.75 - life * 0.6;
        mm.compose(new THREE.Vector3(x, 0.05 + life * 0.35 * Math.sin(i), (Math.sin(i * 7.3) * 0.3) * life), new THREE.Quaternion(), new THREE.Vector3().setScalar(on * (1 - life) * 0.05));
        s.setMatrixAt(i, mm);
      }
      s.instanceMatrix.needsUpdate = true;
    }
  });


  return (
    <group position={at} rotation={[0, yaw, 0]}>
      <EdgeBox size={[4.4, 0.18, 3.2]} position={[0, -0.09, 0]} edge={M.edgeDim} />
      <group ref={robot}>
        <RobotCarModel batteryForward={mode === 1} scale={1.1} />
      </group>
      <instancedMesh ref={sparks} args={[undefined, undefined, 24]} material={M.glow}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      {/* gauges */}
      <group position={[2.9, 0, -0.4]}>
        {['MOTOR CURRENT', 'ENCODER TICKS', 'BATTERY SAG'].map((name, i) => (
          <group key={name} position={[i * 0.75, 0, 0]}>
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[0.24, 2, 0.02]} />
              <meshBasicMaterial color="#000" transparent opacity={0.4} />
            </mesh>
            <mesh ref={(m) => void (m && (bars.current[i] = m))} material={i === 1 && mode === 1 ? M.danger : M.glow}>
              <boxGeometry args={[0.18, 2, 0.04]} />
            </mesh>
            <Label position={[0, -0.25, 0]} size={0.09} tone="mist" letterSpacing={0.15} maxWidth={0.8} textAlign="center">
              {name}
            </Label>
          </group>
        ))}
      </group>
    </group>
  );
}

/** LEGO pen plotter: draws the portrait in horizontal strokes, four pens. */
export function Plotter() {
  const at = place(W.build.plotter);
  const yaw = useMemo(() => faceShot(at, 'plotter'), [at]);
  const img = useLoader(THREE.TextureLoader, asset('/assets/portrait.jpg'));
  const paper = useMemo(() => makeCanvasTexture(448, 500), []);
  const PW = 3.0, PH = 3.35;
  const PENS = ['#1a1510', '#2b4c9a', '#b23a2a', '#d9821e'];

  const strokes = useMemo(() => {
    const cols = 112, rows = 92;
    const c = document.createElement('canvas');
    c.width = cols;
    c.height = rows;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img.image as CanvasImageSource, 0, 0, cols, rows);
    const d = g.getImageData(0, 0, cols, rows).data;
    const level = (x: number, y: number) => {
      const i = (y * cols + x) * 4;
      const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      return l < 0.2 ? 0 : l < 0.36 ? 1 : l < 0.52 ? 2 : l < 0.68 ? 3 : -1;
    };
    const out: { x0: number; x1: number; y: number; pen: number }[] = [];
    for (let y = 0; y < rows; y++) {
      const runs: { x0: number; x1: number; y: number; pen: number }[] = [];
      let x = 0;
      while (x < cols) {
        const lv = level(x, y);
        let e = x;
        while (e + 1 < cols && level(e + 1, y) === lv) e++;
        if (lv >= 0) runs.push({ x0: x, x1: e + 1, y, pen: lv });
        x = e + 1;
      }
      if (y % 2) runs.reverse();
      out.push(...runs);
    }
    return { list: out, cols, rows };
  }, [img]);

  const st = useRef({ i: 0, hold: 0 });
  const head = useRef<THREE.Group>(null);
  const rail = useRef<THREE.Group>(null);

  const clear = () => {
    const { ctx, canvas, tex } = paper;
    ctx.fillStyle = '#efe7da';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    tex.needsUpdate = true;
  };
  useEffect(clear, [paper]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ camera }, dt) => {
    if (camera.position.distanceTo(new THREE.Vector3(...at)) > 45) return;
    const s = st.current;
    const { list, cols, rows } = strokes;
    if (s.i >= list.length) {
      s.hold += dt;
      if (s.hold > 4) {
        s.hold = 0;
        s.i = 0;
        clear();
      }
      return;
    }
    const n = Math.max(1, Math.round(dt * 260));
    const { ctx, canvas, tex } = paper;
    const sx = canvas.width / cols, sy = canvas.height / rows;
    ctx.lineCap = 'round';
    let last = list[s.i];
    for (let k = 0; k < n && s.i < list.length; k++, s.i++) {
      const r = list[s.i];
      ctx.strokeStyle = PENS[r.pen];
      ctx.lineWidth = sy * (0.75 - r.pen * 0.1);
      ctx.beginPath();
      ctx.moveTo(r.x0 * sx, (r.y + 0.5) * sy);
      ctx.lineTo(r.x1 * sx, (r.y + 0.5) * sy);
      ctx.stroke();
      last = r;
    }
    tex.needsUpdate = true;
    const hx = -PW / 2 + ((last.y % 2 ? last.x0 : last.x1) / cols) * PW;
    const hy = PH / 2 - ((last.y + 0.5) / rows) * PH;
    if (head.current) head.current.position.set(hx, hy, 0.12);
    if (rail.current) rail.current.position.y = hy;
  });

  const paperMat = useMemo(() => new THREE.MeshBasicMaterial({ map: paper.tex, toneMapped: false, color: new THREE.Color(0.86, 0.84, 0.8) }), [paper]);
  return (
    <group position={at} rotation={[0, yaw, 0]}>
      <mesh material={paperMat}>
        <planeGeometry args={[PW, PH]} />
      </mesh>
      <EdgeBox size={[PW + 0.3, PH + 0.3, 0.06]} position={[0, 0, -0.05]} edge={M.edgeDim} />
      {/* LEGO-ish uprights */}
      {[-1, 1].map((sd) => (
        <EdgeBox key={sd} size={[0.24, PH + 1.1, 0.24]} position={[sd * (PW / 2 + 0.35), 0.2, 0.08]} edge={M.edgeDim} material={M.solidLift} />
      ))}
      <group ref={rail}>
        <mesh position={[0, 0, 0.14]} material={M.solidLift}>
          <boxGeometry args={[PW + 0.9, 0.14, 0.14]} />
        </mesh>
      </group>
      <group ref={head}>
        <mesh material={M.solidLift}>
          <boxGeometry args={[0.26, 0.3, 0.2]} />
        </mesh>
        <mesh position={[0, -0.18, 0.02]} material={M.glow}>
          <coneGeometry args={[0.04, 0.12, 8]} />
        </mesh>
      </group>
      {PENS.map((c, i) => (
        <mesh key={c} position={[-PW / 2 + 0.2 + i * 0.22, -PH / 2 - 0.35, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 10]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Landing surface detection: the reticle scans three surfaces and calls each one. */
export function Landing() {
  const { y, z, xs } = W.build.landing;
  const verdicts = [true, false, false];
  const reticle = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);
  const drone = useRef<THREE.Group>(null);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const rocks = useMemo(() => Array.from({ length: 14 }, () => [(Math.random() - 0.5) * 2.6, (Math.random() - 0.5) * 2.6, 0.15 + Math.random() * 0.35, Math.random() * 3] as const), []);

  useFrame(({ clock, camera }) => {
    if (Math.abs(camera.position.z - z) > 70) return;
    const T = 2.8;
    const t = clock.elapsedTime % (T * 3 + 1.5);
    const k = Math.min(2, Math.floor(t / T));
    const local = (t - k * T) / T;
    const x = xs[k] * lx();
    if (reticle.current) {
      reticle.current.position.x = THREE.MathUtils.damp(reticle.current.position.x, x, 6, 0.016);
      reticle.current.scale.setScalar(1 + Math.sin(local * Math.PI * 4) * 0.06);
      reticle.current.rotation.z = clock.elapsedTime * 0.8;
    }
    if (scan.current) {
      scan.current.position.set(x, 0.05, -1.6 + (local % 0.5) * 2 * 3.2);
      scan.current.visible = local < 0.6;
    }
    if (drone.current) {
      drone.current.position.x = THREE.MathUtils.damp(drone.current.position.x, x, 4, 0.016);
      drone.current.position.y = 4 + Math.sin(clock.elapsedTime * 2) * 0.1 - (verdicts[k] && local > 0.6 ? (local - 0.6) * 3 : 0);
    }
    const n = t > T * 3 ? 3 : local > 0.6 ? k + 1 : k;
    if (n !== shownRef.current) {
      shownRef.current = n;
      setShown(n);
    }
  });

  return (
    <group position={[0, y, z]}>
      {xs.map((x0, i) => (
        <group key={i} position={[x0 * lx(), 0, 0]}>
          {i === 0 && (
            <>
              <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.solidLift}>
                <planeGeometry args={[3.4, 3.4]} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={M.glowDim}>
                <ringGeometry args={[0.9, 0.97, 48]} />
              </mesh>
              <Label rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} size={0.9} font="display" tone="mist">
                H
              </Label>
            </>
          )}
          {i === 1 && (
            <>
              <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.solid}>
                <planeGeometry args={[3.4, 3.4]} />
              </mesh>
              {rocks.map(([rx, rz, s, r], k) => (
                <mesh key={k} position={[rx, s * 0.5, rz]} rotation={[r, r * 2, 0]} scale={s} material={M.solidLift}>
                  <icosahedronGeometry args={[1, 0]} />
                </mesh>
              ))}
            </>
          )}
          {i === 2 && (
            <group rotation={[0.42, 0, 0]} position={[0, 0.7, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.solidLift}>
                <planeGeometry args={[3.4, 3.4]} />
              </mesh>
              {[-1.2, -0.6, 0, 0.6, 1.2].map((u) => (
                <mesh key={u} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, u]} material={M.glowDim}>
                  <planeGeometry args={[3.2, 0.02]} />
                </mesh>
              ))}
            </group>
          )}
          {shown > i && (
            <Billboard position={[0, 2.4, 0]}>
              <Text font={FONTS.display} fontSize={0.62} color={verdicts[i] ? undefined : '#ff5a46'} anchorX="center" anchorY="middle">
                {verdicts[i] ? 'SAFE' : 'UNSAFE'}
                {verdicts[i] && <meshBasicMaterial color={new THREE.Color('#ff9d2e').multiplyScalar(2)} toneMapped={false} />}
              </Text>
            </Billboard>
          )}
        </group>
      ))}
      <group ref={reticle} position={[xs[0], 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={M.glow}>
          <ringGeometry args={[1.5, 1.56, 64]} />
        </mesh>
        {[0, 1, 2, 3].map((q) => (
          <mesh key={q} rotation={[0, 0, (q * Math.PI) / 2]} position={[Math.cos((q * Math.PI) / 2) * 1.75, Math.sin((q * Math.PI) / 2) * 1.75, 0]} material={M.glow}>
            <planeGeometry args={[0.4, 0.04]} />
          </mesh>
        ))}
      </group>
      <mesh ref={scan} material={M.glowSoft} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 0.06]} />
      </mesh>
      <group ref={drone} position={[xs[0], 4, 0]} scale={0.9}>
        <DroneModel />
        <mesh position={[0, -2, 0]} material={M.glowSoft}>
          <coneGeometry args={[1.2, 4, 24, 1, true]} />
        </mesh>
      </group>
    </group>
  );
}

/** Hula drone SDK: a lesson wall, and a drone locking onto an AprilTag. */
export function Hula() {
  const at = place(W.build.hula);
  const yaw = useMemo(() => faceShot(at, 'hula'), [at]);
  const screens = useMemo(() => builds.hulaLessons.map(() => makeCanvasTexture(640, 380)), []);
  const tag = useMemo(() => {
    const t = makeCanvasTexture(256, 256);
    const g = t.ctx;
    g.fillStyle = '#f4ede2';
    g.fillRect(0, 0, 256, 256);
    const cell = 256 / 10;
    g.fillStyle = '#0b0907';
    g.fillRect(cell, cell, cell * 8, cell * 8);
    const bits = [1,0,1,1,0,1, 0,1,1,0,0,1, 1,1,0,1,1,0, 0,0,1,0,1,1, 1,0,0,1,0,1, 0,1,1,1,0,0];
    bits.forEach((b, i) => {
      if (!b) return;
      g.fillStyle = '#f4ede2';
      g.fillRect(cell * (2 + (i % 6)), cell * (2 + Math.floor(i / 6)), cell, cell);
    });
    t.tex.needsUpdate = true;
    t.tex.magFilter = THREE.NearestFilter;
    return t;
  }, []);

  useEffect(
    () =>
      onPalette((p) => {
        screens.forEach((s, i) => {
          const g = s.ctx;
          const w = 640, h = 380;
          g.fillStyle = '#0b0907';
          g.fillRect(0, 0, w, h);
          g.strokeStyle = p.dark ? p.accent : '#ff9d2e';
          g.lineWidth = 2;
          g.globalAlpha = 0.25;
          for (let x = 0; x < w; x += 32) {
            g.beginPath();
            g.moveTo(x, 0);
            g.lineTo(x, h);
            g.stroke();
          }
          g.globalAlpha = 1;
          g.fillStyle = p.dark ? p.accent : '#ff9d2e';
          g.font = '600 22px "IBM Plex Mono", monospace';
          g.fillText(`0${i + 1}`, 32, 48);
          g.fillStyle = '#F6EDE2';
          g.font = '700 38px "Unbounded", sans-serif';
          const words = builds.hulaLessons[i].split(' ');
          let line = '';
          let y = 120;
          for (const wd of words) {
            if (g.measureText(line + wd).width > w - 64) {
              g.fillText(line.trim(), 32, y);
              y += 52;
              line = '';
            }
            line += wd + ' ';
          }
          g.fillText(line.trim(), 32, y);
          // play mark
          g.fillStyle = p.dark ? p.accent : '#ff9d2e';
          g.beginPath();
          g.moveTo(w - 96, h - 104);
          g.lineTo(w - 96, h - 44);
          g.lineTo(w - 44, h - 74);
          g.closePath();
          g.fill();
          s.tex.needsUpdate = true;
        });
      }),
    [screens],
  );

  const drone = useRef<THREE.Group>(null);
  const bracket = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 5;
    const locked = t > 2.4;
    if (drone.current) {
      drone.current.rotation.y = locked ? THREE.MathUtils.damp(drone.current.rotation.y, Math.PI, 5, 0.016) : Math.PI + Math.sin(clock.elapsedTime * 1.6) * 0.6;
      drone.current.position.y = 1.0 + Math.sin(clock.elapsedTime * 1.8) * 0.08;
    }
    if (bracket.current) {
      bracket.current.visible = locked || Math.floor(clock.elapsedTime * 6) % 2 === 0;
      bracket.current.scale.setScalar(locked ? 1 : 1.25);
    }
  });

  return (
    <group position={at} rotation={[0, yaw, 0]}>
      {screens.map((s, i) => (
        <group key={i} position={[(i - 1) * 3.05, 1.4 + (i === 1 ? 0.25 : 0), i === 1 ? -0.3 : 0]} rotation={[0, (1 - i) * 0.22, 0]}>
          <EdgeBox size={[2.9, 1.78, 0.08]} position={[0, 0, -0.05]} edge={M.edgeDim} />
          <mesh>
            <planeGeometry args={[2.8, 1.66]} />
            <meshBasicMaterial map={s.tex} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* the AprilTag on a stand, and the drone that finds it */}
      <group position={[-1.6, -0.6, 2.2]}>
        <mesh position={[0, 0.9, 0]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial map={tag.tex} toneMapped={false} color={new THREE.Color(0.8, 0.8, 0.8)} />
        </mesh>
        <mesh position={[0, 0.2, -0.02]} material={M.solid}>
          <boxGeometry args={[0.05, 0.9, 0.05]} />
        </mesh>
        <group ref={bracket} position={[0, 0.9, 0.02]}>
          {[
            [-1, 1],
            [1, 1],
            [-1, -1],
            [1, -1],
          ].map(([sx, sy], k) => (
            <group key={k} position={[sx * 0.56, sy * 0.56, 0]}>
              <mesh position={[-sx * 0.1, 0, 0]} material={M.glow}>
                <planeGeometry args={[0.22, 0.03]} />
              </mesh>
              <mesh position={[0, -sy * 0.1, 0]} material={M.glow}>
                <planeGeometry args={[0.03, 0.22]} />
              </mesh>
            </group>
          ))}
        </group>
        <group ref={drone} position={[0, 1, 2]} scale={0.55}>
          <DroneModel />
        </group>
      </group>
    </group>
  );
}

