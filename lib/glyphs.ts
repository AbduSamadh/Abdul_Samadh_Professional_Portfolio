'use client';
import * as THREE from 'three';
import { onPalette } from './materials';

// ASCII glyph rendering: one atlas texture + one instanced shader, reused by the portal tunnel,
// ASCII City, the portrait decode and the convergence. Thousands of characters in one draw call.

export const GLYPHS =
  " .:-=+*#%@|/\\<>^v[](){}_~!?$&;'\"`,0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const COLS = 16;
const ROWS = Math.ceil(GLYPHS.length / COLS);
const CELL = 64;
export const ATLAS = { cols: COLS, rows: ROWS };

export const gi = (ch: string) => Math.max(0, GLYPHS.indexOf(ch));
export const RAMP = ' .:-=+*#%@';

let atlas: THREE.CanvasTexture | null = null;

export function glyphAtlas() {
  if (atlas) return atlas;
  const c = document.createElement('canvas');
  c.width = COLS * CELL;
  c.height = ROWS * CELL;
  const g = c.getContext('2d')!;
  atlas = new THREE.CanvasTexture(c);
  atlas.colorSpace = THREE.NoColorSpace;
  atlas.anisotropy = 4;
  const draw = () => {
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `500 ${CELL * 0.78}px "IBM Plex Mono", ui-monospace, monospace`;
    for (let i = 0; i < GLYPHS.length; i++) {
      const x = (i % COLS) * CELL + CELL / 2;
      const y = Math.floor(i / COLS) * CELL + CELL / 2 + 2;
      g.fillText(GLYPHS[i], x, y);
    }
    atlas!.needsUpdate = true;
  };
  draw();
  // Redraw once the webfont is in, so glyphs match the rest of the site.
  document.fonts?.load(`500 40px "IBM Plex Mono"`).then(draw).catch(() => {});
  return atlas;
}

export type GlyphMaterialOptions = {
  /** Units per second for falling glyphs (rain/snow). 0 = static. */
  fall?: number;
  fallBase?: number;
  fallHeight?: number;
  /** Fraction of glyphs flickering to a random character each tick. */
  scramble?: number;
  opacity?: number;
  /** Multiply the palette accent (true) or use instance colours as-is (false). */
  tint?: 'accent' | 'ink' | 'none';
  intensity?: number;
};

export function glyphMaterial(o: GlyphMaterialOptions = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uAtlas: { value: null },
        uTime: { value: 0 },
        uFall: { value: o.fall ?? 0 },
        uFallBase: { value: o.fallBase ?? 0 },
        uFallHeight: { value: o.fallHeight ?? 10 },
        uScramble: { value: o.scramble ?? 0 },
        uOpacity: { value: o.opacity ?? 1 },
        uColor: { value: new THREE.Color(1, 1, 1) },
        uGlyphSwap: { value: -1 },
      },
    ]),
    vertexShader: /* glsl */ `
      attribute float aGlyph;
      attribute float aSeed;
      uniform float uTime;
      uniform float uFall;
      uniform float uFallBase;
      uniform float uFallHeight;
      uniform float uScramble;
      uniform float uGlyphSwap;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vGlyph;
      varying float vFlick;
      #include <fog_pars_vertex>
      float hash(float n){ return fract(sin(n) * 43758.5453123); }
      void main() {
        vUv = uv;
        vColor = vec3(1.0);
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #endif
        float g = uGlyphSwap >= 0.0 ? uGlyphSwap : aGlyph;
        vFlick = 1.0;
        if (uScramble > 0.0) {
          float t = floor(uTime * 9.0 + aSeed * 37.0);
          float r = hash(t * 12.9898 + aSeed * 78.233);
          if (r < uScramble) { g = 1.0 + floor(hash(r * 91.7) * 90.0); vFlick = 1.6; }
        }
        vGlyph = g;
        vec4 world = instanceMatrix * vec4(position, 1.0);
        if (uFall > 0.0) {
          float y0 = instanceMatrix[3].y;
          float y1 = uFallBase + mod(y0 - uFallBase - uTime * uFall * (0.6 + aSeed), uFallHeight);
          world.y += y1 - y0;
        }
        vec4 mvPosition = modelViewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vGlyph;
      varying float vFlick;
      #include <fog_pars_fragment>
      void main() {
        float cols = ${COLS.toFixed(1)};
        float rows = ${ROWS.toFixed(1)};
        float col = mod(vGlyph, cols);
        float row = floor(vGlyph / cols);
        vec2 uv = (vec2(col, rows - 1.0 - row) + vUv) / vec2(cols, rows);
        float a = texture2D(uAtlas, uv).a;
        if (a < 0.08) discard;
        gl_FragColor = vec4(uColor * vColor * vFlick, a * uOpacity);
        #include <fog_fragment>
      }
    `,
  });
  mat.uniforms.uAtlas.value = glyphAtlas();
  const tint = o.tint ?? 'accent';
  const intensity = o.intensity ?? 1;
  onPalette((p) => {
    const c = mat.uniforms.uColor.value as THREE.Color;
    if (tint === 'accent') c.set(p.accent).multiplyScalar(p.dark ? p.glow * intensity : 1);
    else if (tint === 'ink') c.set(p.ink).multiplyScalar(p.dark ? intensity : 1);
    else c.setRGB(1, 1, 1);
  });
  return mat;
}

/** Build an instanced glyph mesh from flat arrays. */
export function glyphMesh(opts: {
  count: number;
  positions: Float32Array; // xyz
  glyphs: Float32Array;
  size?: number | Float32Array;
  rotations?: Float32Array; // xyz euler per instance
  colors?: Float32Array; // rgb per instance
  material: THREE.ShaderMaterial;
}) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const seeds = new Float32Array(opts.count);
  for (let i = 0; i < opts.count; i++) seeds[i] = Math.random();
  geo.setAttribute('aGlyph', new THREE.InstancedBufferAttribute(opts.glyphs, 1));
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  const mesh = new THREE.InstancedMesh(geo, opts.material, opts.count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  for (let i = 0; i < opts.count; i++) {
    p.set(opts.positions[i * 3], opts.positions[i * 3 + 1], opts.positions[i * 3 + 2]);
    if (opts.rotations) e.set(opts.rotations[i * 3], opts.rotations[i * 3 + 1], opts.rotations[i * 3 + 2]);
    else e.set(0, 0, 0);
    q.setFromEuler(e);
    const k = typeof opts.size === 'number' ? opts.size : opts.size ? opts.size[i] : 1;
    s.set(k, k, k);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
  }
  if (opts.colors) {
    mesh.instanceColor = new THREE.InstancedBufferAttribute(opts.colors, 3);
  }
  mesh.frustumCulled = false;
  return mesh;
}
