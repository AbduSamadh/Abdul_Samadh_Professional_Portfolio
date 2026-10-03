'use client';
import { useSyncExternalStore } from 'react';

export type ThemeName = 'amber' | 'phosphor' | 'paper';

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

// Colours carried over from the original site's three modes.
export const palettes: Record<ThemeName, Palette> = {
  amber: {
    name: 'amber',
    label: 'Amber',
    bg: '#100D0B',
    bg2: '#19130F',
    ink: '#F6EDE2',
    mist: '#A99787',
    accent: '#FF9D2E',
    solid: '#0E0B09',
    glow: 2.4,
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

export const themeOrder: ThemeName[] = ['amber', 'phosphor', 'paper'];

let current: ThemeName = 'amber';
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
  return useSyncExternalStore(subscribeTheme, getPalette, () => palettes.amber);
}
