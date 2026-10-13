'use client';
import { useSyncExternalStore } from 'react';

export type ThemeName = 'neon' | 'phosphor' | 'paper';

export type Palette = {
  name: ThemeName;
  label: string;
  bg: string;
  bg2: string;
  ink: string;
  mist: string;
  accent: string;
  /** Body colour of 3D solids (desk, letters, plinths). */
  solid: string;
  /** Multiplier pushing accent colours above 1.0 so bloom picks them up. */
  glow: number;
  dark: boolean;
};

// Neon purple by default; Phosphor and Paper are the original site's other two modes.
export const palettes: Record<ThemeName, Palette> = {
  neon: {
    name: 'neon',
    label: 'Neon',
    bg: '#0B0713',
    bg2: '#140C22',
    ink: '#F2EAFF',
    mist: '#A08FC0',
    accent: '#B65CFF',
    solid: '#0A0611',
    // purple carries less luminance than amber, so it is pushed further to bloom as brightly
    glow: 3.6,
    dark: true,
  },
  phosphor: {
    name: 'phosphor',
    label: 'Phosphor',
    bg: '#03120A',
    bg2: '#051A0E',
    ink: '#C9FFD0',
    mist: '#3E9E52',
    accent: '#8BFF9B',
    solid: '#04140B',
    glow: 2.0,
    dark: true,
  },
  paper: {
    name: 'paper',
    label: 'Paper',
    bg: '#EFE9DF',
    bg2: '#E2D9CA',
    ink: '#1A1510',
    mist: '#6B5D4F',
    accent: '#B2560A',
    solid: '#F7F2EA',
    glow: 1,
    dark: false,
  },
};

export const themeOrder: ThemeName[] = ['neon', 'phosphor', 'paper'];

let current: ThemeName = 'neon';
const listeners = new Set<() => void>();

export function initTheme() {
  try {
    const saved = localStorage.getItem('as-theme') as ThemeName | null;
    if (saved && palettes[saved]) current = saved;
  } catch {}
  document.documentElement.dataset.theme = current;
  listeners.forEach((l) => l());
}

export function setTheme(name: ThemeName) {
  current = name;
  document.documentElement.dataset.theme = name;
  try {
    localStorage.setItem('as-theme', name);
  } catch {}
  listeners.forEach((l) => l());
}

export function cycleTheme() {
  setTheme(themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length]);
}

export const getPalette = () => palettes[current];

export function subscribeTheme(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function usePalette(): Palette {
  return useSyncExternalStore(subscribeTheme, getPalette, () => palettes.neon);
}
