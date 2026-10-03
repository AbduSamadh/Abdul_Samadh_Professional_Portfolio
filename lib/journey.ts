// Shared, mutable state for the whole experience. Read every frame by the 3D scene and the DOM
// overlays, so it is a plain object rather than React state (no re-renders on scroll).

export const journey = {
  /** Smoothed master-timeline progress, 0..1. Drives overlays and HUD. */
  progress: 0,
  /** Camera curve parameter written by the GSAP master timeline. */
  u: 0,
  /** Index of the reduced-motion "still" currently shown. */
  still: 0,
  mobile: false,
  reduced: false,
  /** Reading panels docked at the bottom (phones, portrait tablets). */
  sheet: false,
  /** Lateral spread of content and camera, 0.5..1. */
  lx: 1,
  /** Extra field of view on narrow screens. */
  fovBoost: 0,
  tier: 'high' as 'low' | 'mid' | 'high',
  /** Swarm planner: false = collision-free assignment, true = random pairing. */
  swarmRandom: false,
  /** Set once the boot screen has gone, so the room can start its intro. */
  booted: false,
  /** Pointer in normalised device coordinates, for subtle parallax. */
  pointer: { x: 0, y: 0 },
};

export type ModalPayload =
  | { type: 'live'; title: string; url: string; body?: string }
  | { type: 'text'; kicker?: string; title: string; body: string; tags?: string[]; link?: { href: string; label: string } };

type Events = {
  swarm: boolean;
  modal: ModalPayload | null;
  terminal: boolean;
  decode: null;
};

const subs: { [K in keyof Events]?: Set<(v: Events[K]) => void> } = {};

export function on<K extends keyof Events>(ev: K, fn: (v: Events[K]) => void) {
  const set = (subs[ev] ??= new Set() as never) as Set<(v: Events[K]) => void>;
  set.add(fn);
  return () => {
    set.delete(fn);
  };
}

export function emit<K extends keyof Events>(ev: K, v: Events[K]) {
  (subs[ev] as Set<(v: Events[K]) => void> | undefined)?.forEach((fn) => fn(v));
}

/** Scroll to a timeline progress value. Replaced by the scroll system once it mounts. */
let navigateImpl: (p: number, immediate?: boolean) => void = () => {};
export const navigate = (p: number, immediate?: boolean) => navigateImpl(p, immediate);
export const setNavigate = (fn: typeof navigateImpl) => {
  navigateImpl = fn;
};

export function setSwarmRandom(v: boolean) {
  journey.swarmRandom = v;
  emit('swarm', v);
}
