'use client';
import * as THREE from 'three';
import { getPalette, subscribeTheme, type Palette } from './theme';

// Shared materials, recoloured in place when the theme changes, so a theme switch re-lights the
// whole world without re-creating anything.

export const M = {
  /** Sculptural black (or paper-white) solids. */
  solid: new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0.28 }),
  /** Same, slightly lifted, for things that need to read against the background. */
  solidLift: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.35 }),
  /** Bright accent edges (bloom). */
  edge: new THREE.LineBasicMaterial({ toneMapped: false, transparent: true }),
  /** Quiet accent lines. */
  edgeDim: new THREE.LineBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.32, depthWrite: false }),
  /** Ink-coloured lines (wireframes that should not glow). */
  inkLine: new THREE.LineBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.22, depthWrite: false }),
  /** Emissive accent surfaces: light strips, rings, drones. */
  glow: new THREE.MeshBasicMaterial({ toneMapped: false }),
  /** Accent at low opacity, for light planes and haze. */
  glowSoft: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
  /** Quiet accent for thin meshes (rings, poles) that should not bloom. */
  glowDim: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.45, depthWrite: false }),
  /** Ink-coloured solid (paper, labels). */
  ink: new THREE.MeshBasicMaterial({ toneMapped: false }),
  /** Background-coloured, for paper/screens backing. */
  back: new THREE.MeshBasicMaterial({ toneMapped: false }),
  danger: new THREE.MeshBasicMaterial({ toneMapped: false, color: new THREE.Color('#ff4d3d').multiplyScalar(2) }),
};

export const accentColor = new THREE.Color();
export const glowColor = new THREE.Color();
export const inkColor = new THREE.Color();
export const bgColor = new THREE.Color();

const extra = new Set<(p: Palette) => void>();

/** Register a callback for things that own their own materials (shaders, canvases). */
export function onPalette(fn: (p: Palette) => void) {
  extra.add(fn);
  fn(getPalette());
  return () => {
    extra.delete(fn);
  };
}

function apply(p: Palette) {
  accentColor.set(p.accent);
  glowColor.set(p.accent).multiplyScalar(p.glow);
  inkColor.set(p.ink);
  bgColor.set(p.bg);
  M.solid.color.set(p.solid);
  M.solidLift.color.set(p.dark ? '#1a1512' : '#ffffff');
  M.solid.roughness = p.dark ? 0.62 : 0.85;
  M.solid.metalness = p.dark ? 0.28 : 0.05;
  M.edge.color.copy(glowColor);
  M.edgeDim.color.copy(accentColor);
  M.edgeDim.opacity = p.dark ? 0.32 : 0.5;
  M.inkLine.color.copy(inkColor);
  M.inkLine.opacity = p.dark ? 0.2 : 0.35;
  M.glow.color.copy(glowColor);
  M.glowSoft.color.copy(accentColor);
  M.glowDim.color.copy(accentColor);
  M.glowDim.opacity = p.dark ? 0.45 : 0.6;
  M.glowSoft.opacity = p.dark ? 0.16 : 0.22;
  M.ink.color.copy(inkColor);
  M.back.color.set(p.bg2);
  extra.forEach((fn) => fn(p));
}

if (typeof window !== 'undefined') {
  apply(getPalette());
  subscribeTheme(() => apply(getPalette()));
}
