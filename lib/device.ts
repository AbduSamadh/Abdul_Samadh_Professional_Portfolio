'use client';

/**
 * How this screen should be treated. Layout follows the screen's shape, render quality follows
 * its likely power, so a portrait tablet reads like a phone and a small laptop renders lighter.
 */
export type Profile = {
  /** Phone-sized: fewer objects, phone typography. */
  mobile: boolean;
  /** Reading panels dock to the bottom and the camera frames the subject above them. */
  sheet: boolean;
  /** How far content and camera spread sideways (1 on wide screens, 0.5 on tall ones). */
  lx: number;
  /** Extra field of view for narrow screens, in degrees. */
  fovBoost: number;
  /** Render quality. */
  tier: 'low' | 'mid' | 'high';
  key: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const step = (v: number, s: number) => Math.round(v / s) * s;

export function detectProfile(): Profile {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const mobile = w <= 760 || (coarse && Math.min(w, h) <= 520);
  // Landscape phones keep side panels; tall screens dock them at the bottom.
  const sheet = (mobile || w <= 1100) && aspect < 1;
  const lx = step(clamp(0.5 + ((aspect - 0.6) / 1.0) * 0.5, 0.5, 1), 0.05);
  const fovBoost = step(clamp((1.6 - aspect) * 12, 0, 16), 2);
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;
  const tier: Profile['tier'] = mobile || weak ? 'low' : coarse || w < 1200 ? 'mid' : 'high';
  return { mobile, sheet, lx, fovBoost, tier, key: `${mobile}-${sheet}-${lx}-${fovBoost}-${tier}` };
}
