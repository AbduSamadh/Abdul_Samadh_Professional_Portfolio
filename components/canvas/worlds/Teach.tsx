'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { journey, on } from '@/lib/journey';
import { GATES, P, W, type V3 } from '@/lib/path';
import { M, onPalette } from '@/lib/materials';
import { ATLAS, glyphAtlas } from '@/lib/glyphs';
import { asset } from '@/lib/asset';
import { usePalette, type Palette } from '@/lib/theme';
import { abstract, route, scale, who } from '@/content/site';
import { Billboard } from '@react-three/drei';
import { EdgeLines, Label, Region, damp, lx, makeCanvasTexture, ss } from '../parts/common';

/** SCENE 3: TEACH. Where it started: the classroom, the growing size of the brief, the person, the route. */
export default function Teach({ mobile }: { mobile: boolean }) {
  return (
    <Region near={-58} far={GATES.teach.z}>
      <Classroom />
      <Fragments />
      <Portrait />
      {!mobile && <Tags />}
      <Route mobile={mobile} />
    </Region>
  );
}

/** A chalk-line classroom floating below the path. */
function Classroom() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const seg = (a: V3, b: V3) => pts.push(...a, ...b);
    const boxLines = (cx: number, cy: number, cz: number, w: number, h: number, d: number) => {
      const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy, y1 = cy + h, z0 = cz - d / 2, z1 = cz + d / 2;
      const c: V3[] = [
        [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
      ];
      for (let i = 0; i < 4; i++) seg(c[i], c[(i + 1) % 4]);
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) seg([x, y0, z], [x, y1, z]);
    };
    // desks in rows
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 5; c++) {
        const x = (c - 2) * 3.2;
        const z = r * 3 - 2;
        boxLines(x, 0, z, 1.6, 0.75, 0.7);
        boxLines(x, 0, z + 0.9, 0.5, 0.45, 0.45);
      }
    // board and teacher's desk
    const bz = -6.5;
    seg([-6, 1, bz], [6, 1, bz]);
    seg([6, 1, bz], [6, 4.2, bz]);
    seg([6, 4.2, bz], [-6, 4.2, bz]);
    seg([-6, 4.2, bz], [-6, 1, bz]);
    boxLines(4, 0, -4.4, 2.2, 0.8, 0.9);
    // floor grid
    for (let i = -8; i <= 8; i += 2) seg([i, 0, -7], [i, 0, 10]);
    for (let j = -7; j <= 10; j += 2) seg([-8, 0, j], [8, 0, j]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  // A sketch on the board: a tiny flow chart.
  const board = useMemo(() => {
    const pts: number[] = [];
    const rect = (x: number, y: number, w: number, h: number) => {
      pts.push(x, y, 0, x + w, y, 0, x + w, y, 0, x + w, y + h, 0, x + w, y + h, 0, x, y + h, 0, x, y + h, 0, x, y, 0);
    };
    rect(-4.5, 2.6, 2, 0.9);
    rect(-1, 2.6, 2, 0.9);
    rect(2.5, 2.6, 2, 0.9);
    rect(-1, 1.3, 2, 0.8);
    pts.push(-2.5, 3.05, 0, -1, 3.05, 0, 1, 3.05, 0, 2.5, 3.05, 0, 0, 2.6, 0, 0, 2.1, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = -0.18 + Math.sin(clock.elapsedTime * 0.1) * 0.04;
  });

  return (
    <group ref={ref} position={W.teach.classroom} scale={1.15}>
      <lineSegments geometry={geo} material={M.edgeDim} />
      <lineSegments geometry={board} material={M.edge} position={[0, 0, -6.48]} />
    </group>
  );
}

/** A worksheet, then a unit, then a scheme, then a season, then software: each bigger than the last. */
function Fragments() {
  const items = useMemo(
    () =>
      who.fragments.map((label, i) => {
        const w = [1.9, 3.0, 4.4, 5.6, 7.8][i];
        const h = [2.5, 2.1, 3.0, 3.6, 4.8][i];
        const { canvas, ctx, tex } = makeCanvasTexture(Math.round(w * 130), Math.round(h * 130));
        return { label, w, h, canvas, ctx, tex, i };
      }),
    [],
  );

  useEffect(
    () =>
      onPalette((p) => {
        items.forEach((it) => drawFragment(it.ctx, it.canvas, it.i, it.label, p));
        items.forEach((it) => (it.tex.needsUpdate = true));
      }),
    [items],
  );

  const refs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = W.teach.fragments[i][1] + Math.sin(t * 0.6 + i) * 0.12;
    });
  });

  return (
    <group>
      {items.map((it, i) => {
        const p = W.teach.fragments[i];
        return (
          <group key={it.label} ref={(g) => void (g && (refs.current[i] = g))} position={[p[0] * lx(), p[1], p[2]]} rotation={[0, -Math.sign(p[0]) * 0.28, Math.sign(p[0]) * 0.02]}>
            <mesh>
              <planeGeometry args={[it.w, it.h]} />
              <meshBasicMaterial map={it.tex} toneMapped={false} transparent />
            </mesh>
            <Label position={[0, -it.h / 2 - 0.3, 0]} size={0.2} tone="mist" letterSpacing={0.25}>
              {`${String(i + 1).padStart(2, '0')} · ${it.label.toUpperCase()}`}
            </Label>
          </group>
        );
      })}
    </group>
  );
}

function drawFragment(g: CanvasRenderingContext2D, c: HTMLCanvasElement, i: number, label: string, p: Palette) {
  const W2 = c.width, H = c.height;
  g.clearRect(0, 0, W2, H);
  g.fillStyle = p.dark ? 'rgba(25,19,15,0.92)' : 'rgba(255,252,246,0.95)';
  g.fillRect(0, 0, W2, H);
  g.strokeStyle = p.accent;
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, W2 - 3, H - 3);
  const ink = p.ink, mist = p.mist, acc = p.accent;
  const line = (x: number, y: number, w: number, col = mist, lw = 4) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, lw);
  };
  g.font = `600 ${Math.round(H * 0.07)}px "IBM Plex Mono", monospace`;
  g.fillStyle = acc;
  g.textBaseline = 'top';
  const pad = W2 * 0.07;
  if (i === 0) {
    // worksheet
    // (no invented headings: shapes only)
    for (let k = 0; k < 9; k++) line(pad, pad + 60 + k * 26, (W2 - pad * 2) * (0.5 + ((k * 37) % 40) / 80), mist, 3);
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = ink;
      g.lineWidth = 2;
      g.strokeRect(pad, pad + 310 + k * 0, (W2 - pad * 2) / 3 - 8, 0);
    }
  } else if (i === 1) {

    for (let k = 0; k < 4; k++) {
      g.strokeStyle = k === 1 ? acc : mist;
      g.lineWidth = 2;
      g.strokeRect(pad + k * ((W2 - pad * 2) / 4), pad + 50, (W2 - pad * 2) / 4 - 10, H * 0.45);
      line(pad + 10 + k * ((W2 - pad * 2) / 4), pad + 70, 50, ink, 3);
    }
    for (let k = 0; k < 3; k++) line(pad, H * 0.75 + k * 18, W2 * 0.6, mist, 3);
  } else if (i === 2) {

    const cols = 7, rows = 5;
    const gw = (W2 - pad * 2) / cols, gh = (H - pad * 2 - 60) / rows;
    for (let r = 0; r < rows; r++)
      for (let k = 0; k < cols; k++) {
        g.strokeStyle = mist;
        g.lineWidth = 1.5;
        g.strokeRect(pad + k * gw, pad + 60 + r * gh, gw, gh);
        if ((r + k * 2) % 5 === 0) {
          g.fillStyle = acc;
          g.globalAlpha = 0.6;
          g.fillRect(pad + k * gw + 4, pad + 64 + r * gh, gw - 8, gh - 8);
          g.globalAlpha = 1;
        }
      }
  } else if (i === 3) {

    // a bracket
    const x0 = pad, y0 = pad + 70, h = H - y0 - pad;
    g.strokeStyle = ink;
    g.lineWidth = 2;
    for (let r = 0; r < 3; r++) {
      const n = 8 >> r;
      const colX = x0 + r * (W2 - pad * 2) / 3.4;
      for (let k = 0; k < n; k++) {
        const y = y0 + (k + 0.5) * (h / n);
        g.strokeRect(colX, y - 10, 120, 20);
        if (r < 2) {
          g.beginPath();
          g.moveTo(colX + 120, y);
          g.lineTo(colX + 160, y);
          g.stroke();
        }
      }
    }
    g.fillStyle = acc;
    g.font = `700 ${Math.round(H * 0.12)}px "Space Mono", sans-serif`;

  } else {
    // a browser window with a simulator inside
    g.fillStyle = p.dark ? '#0b0907' : '#efe9df';
    g.fillRect(3, 3, W2 - 6, 54);
    [0, 1, 2].forEach((k) => {
      g.fillStyle = k === 0 ? acc : mist;
      g.beginPath();
      g.arc(32 + k * 28, 30, 9, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = mist;
    g.font = `500 24px "IBM Plex Mono", monospace`;

    // a little world: grid + drones
    g.strokeStyle = mist;
    g.globalAlpha = 0.4;
    for (let x = 0; x < W2; x += 40) {
      g.beginPath();
      g.moveTo(x, 60);
      g.lineTo(x, H);
      g.stroke();
    }
    for (let y = 60; y < H; y += 40) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W2, y);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = acc;
    for (let k = 0; k < 120; k++) {
      const a = (k / 120) * Math.PI * 2;
      const r = 150 + 60 * Math.sin(a * 3);
      g.beginPath();
      g.arc(W2 / 2 + Math.cos(a) * r * 1.5, H / 2 + 30 + Math.sin(a) * r, 5, 0, Math.PI * 2);
      g.fill();
    }
    g.font = `700 ${Math.round(H * 0.09)}px "Space Mono", sans-serif`;
    g.fillStyle = ink;

  }
  void label;
}

/** The portrait, first as amber ASCII, decoding into the photograph as you approach (or on click). */
function Portrait() {
  const tex = useLoader(THREE.TextureLoader, asset('/assets/portrait.jpg'));
  const mat = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uPhoto: { value: tex },
        uAtlas: { value: glyphAtlas() },
        uDecode: { value: 0 },
        uTime: { value: 0 },
        uAccent: { value: new THREE.Color() },
        uBg: { value: new THREE.Color() },
        uCells: { value: new THREE.Vector2(64, 72) },
      },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uPhoto; uniform sampler2D uAtlas; uniform float uDecode; uniform float uTime;
        uniform vec3 uAccent; uniform vec3 uBg; uniform vec2 uCells;
        varying vec2 vUv;
        const float COLS = ${ATLAS.cols.toFixed(1)}; const float ROWS = ${ATLAS.rows.toFixed(1)};
        void main(){
          vec2 cell = floor(vUv * uCells);
          vec2 cuv = fract(vUv * uCells);
          vec3 photoAtCell = texture2D(uPhoto, (cell + 0.5) / uCells).rgb;
          float lum = dot(photoAtCell, vec3(0.299, 0.587, 0.114));
          float idx = floor(clamp(lum * 1.15, 0.0, 0.999) * 10.0);
          // ramp " .:-=+*#%@" sits at atlas indices 0..9
          float g = idx;
          float col = mod(g, COLS); float row = floor(g / COLS);
          float a = texture2D(uAtlas, (vec2(col, ROWS - 1.0 - row) + cuv) / vec2(COLS, ROWS)).a;
          vec3 ascii = mix(uBg, uAccent * (0.5 + lum * 1.6), a);
          vec3 photo = texture2D(uPhoto, vUv).rgb;
          // decode as a scan from top to bottom with a bright line at the front
          float front = 1.0 - uDecode * 1.15;
          float edge = smoothstep(front - 0.03, front, vUv.y);
          float line = (1.0 - smoothstep(0.0, 0.012, abs(vUv.y - front))) * step(0.001, uDecode) * step(uDecode, 0.999);
          vec3 c = mix(ascii, photo, edge) + uAccent * line * 1.5;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });
  }, [tex]);

  useEffect(
    () =>
      onPalette((p) => {
        (mat.uniforms.uAccent.value as THREE.Color).set(p.accent);
        (mat.uniforms.uBg.value as THREE.Color).set(p.dark ? '#0b0907' : p.bg2);
      }),
    [mat],
  );

  // Stays as glyphs until you ask: click the portrait (or the button in the panel) to decode, again to encode.
  const decoded = useRef(false);
  const decode = useRef(0);
  const [label, setLabel] = useState('CLICK TO DECODE');
  const toggle = () => {
    decoded.current = !decoded.current;
    setLabel(decoded.current ? 'CLICK TO ENCODE' : 'CLICK TO DECODE');
  };
  useEffect(() => on('decode', toggle), []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    decode.current = damp(decode.current, decoded.current ? 1 : 0, 1.4, dt);
    mat.uniforms.uDecode.value = decode.current;
  });

  const pos = W.teach.portrait;
  const w = 3.2, h = w * (626 / 560);
  const frame = useMemo(() => new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.08), [w, h]);
  return (
    <group position={[pos[0] * lx(), pos[1], pos[2]]} rotation={[0, -0.62, 0]}>
      <mesh geometry={frame} material={M.solid} position={[0, 0, -0.05]} />
      <EdgeLines geometry={frame} material={M.edge} />
      <mesh
        material={mat}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          toggle();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <planeGeometry args={[w, h]} />
      </mesh>
      <Label position={[0, -h / 2 - 0.36, 0]} size={0.2} tone="mist" letterSpacing={0.3}>
        ABDUL SAMADH · DUBAI · UAE
      </Label>
      <Label position={[0, h / 2 + 0.3, 0]} size={0.16} tone="accent" letterSpacing={0.3}>
        {label}
      </Label>
    </group>
  );
}

/** The seven capability tags, drifting as small lights. */
function Tags() {
  const tags = abstract.tags;
  const refs = useRef<THREE.Group[]>([]);
  const spots = useMemo(
    () =>
      tags.map((_, i) => {
        const a = i / tags.length;
        return [(i % 2 ? 1 : -1) * (5.5 + (i % 3) * 1.2), 1.4 + ((i * 7) % 5) * 0.35, -128 - a * 12] as V3;
      }),
    [tags],
  );
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => g && (g.position.y = spots[i][1] + Math.sin(clock.elapsedTime * 0.7 + i * 1.3) * 0.15));
  });
  return (
    <group>
      {tags.map((t, i) => (
        <group key={t} ref={(g) => void (g && (refs.current[i] = g))} position={[spots[i][0] * lx(), spots[i][1], spots[i][2]]}>
          <mesh material={M.glow}>
            <sphereGeometry args={[0.05, 8, 8]} />
          </mesh>
          <Label position={[0, -0.24, 0]} size={0.15} tone="mist" letterSpacing={0.2}>
            {t.toUpperCase()}
          </Label>
        </group>
      ))}
    </group>
  );
}

/** The career as a physical route: a line of light through five waypoints, oldest to newest. */
function Route({ mobile }: { mobile: boolean }) {
  const pts = useMemo(() => W.teach.route.map((p) => new THREE.Vector3(p[0] * lx(), p[1] - 1.9, p[2])), []);
  const curve = useMemo(() => {
    const start = new THREE.Vector3(0, -2.2, -122);
    const end = new THREE.Vector3(0, -2.0, GATES.teach.z + 2);
    return new THREE.CatmullRomCurve3([start, ...pts, end], false, 'centripetal');
  }, [pts]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 300, 0.016, 6, false), [curve]);
  const pulse = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pulse.current) pulse.current.position.copy(curve.getPointAt((t * 0.06) % 1));
    rings.current.forEach((r, i) => {
      if (!r) return;
      const now = route[i].now;
      const s = now ? 1 + 0.25 * (0.5 + 0.5 * Math.sin(t * 3)) : 1;
      r.scale.setScalar(s);
      r.rotation.z = t * 0.3 * (i % 2 ? 1 : -1);
    });
  });

  const p = usePalette();
  return (
    <group>
      <mesh geometry={tube} material={M.glow} />
      <mesh ref={pulse} material={M.glow}>
        <sphereGeometry args={[0.12, 12, 12]} />
      </mesh>
      {route.map((s, i) => {
        const wp = W.teach.route[i];
        const x = wp[0] * lx();
        const big = s.feature ? 1.4 : s.now ? 1.25 : 1;
        return (
          <group key={s.id} position={[x, wp[1], wp[2]]}>
            {/* pole down to the route */}
            <mesh position={[0, -0.95, 0]} material={M.glowDim}>
              <boxGeometry args={[0.01, 1.9, 0.01]} />
            </mesh>
            <mesh ref={(m) => void (m && (rings.current[i] = m))} material={M.glow}>
              <torusGeometry args={[0.42 * big, 0.018, 8, 48]} />
            </mesh>
            <mesh material={s.now ? M.glow : M.ink}>
              <sphereGeometry args={[0.09 * big, 16, 16]} />
            </mesh>
            <Billboard position={[0, 0.62 * big, 0]}>
              <Label position={[0, 0.3, 0]} size={0.15} tone="mist" letterSpacing={0.3}>
                {(s.now ? 'NOW · ' : '') + s.country.toUpperCase()}
              </Label>
              <Label size={0.26} font="display" tone="ink" maxWidth={3.2} textAlign="center">
                {s.org.split(',')[0]}
              </Label>
            </Billboard>
          </group>
        );
      })}
      <pointLight position={[5.5, 1.5, -154]} intensity={p.dark ? 10 : 4} distance={10} color={p.accent} />
    </group>
  );
}

