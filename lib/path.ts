// The single camera journey. Every world is laid out against these numbers.
//
// The world runs down the -Z axis. The black room sits at the origin; everything "inside the laptop"
// starts just behind its screen. Each chapter ends in a giant word that the camera flies through.
//
// Shots are camera keyframes. `p` is the share of the master scroll timeline at which the camera
// arrives at that shot. Tune p to change pacing; tune pos/look to change framing.

export type V3 = [number, number, number];
export type Shot = {
  id: string;
  p: number;
  pos: V3;
  look: V3;
  fov?: number;
  ease?: string;
  /** A resting point: used as a "still" in reduced-motion mode. */
  stop?: boolean;
  /** Keep x as authored on mobile (e.g. flying down a street). */
  fixedX?: boolean;
};

/** Typeface size for anchor words: cap height is 0.7 of this. */
export const WORD_SIZE = 22;

export type Gate = { word: string; letter: number; z: number; y: number; label: string };

export const GATES: Record<'teach' | 'write' | 'build' | 'solve' | 'lab' | 'scale', Gate> = {
  teach: { word: 'TEACH', letter: 2, z: -175, y: 0, label: '01 — who I am' },
  write: { word: 'WRITE', letter: 1, z: -265, y: 0, label: '02 — authoring' },
  build: { word: 'BUILD', letter: 2, z: -455, y: 0, label: '03 — software' },
  solve: { word: 'SOLVE', letter: 1, z: -560, y: 9, label: '04 — custom briefs' },
  lab: { word: 'LAB', letter: 1, z: -660, y: 0, label: '05 — the hardware' },
  scale: { word: 'SCALE', letter: 2, z: -770, y: 0, label: '06 — proof' },
};

/** World anchors shared by the scene components and the shots below. */
export const W = {
  laptop: { x: 0, y: 1.0, z: 0 },
  tunnel: { from: -1, to: -58 },
  teach: {
    classroom: [0, -6, -78] as V3,
    fragments: [
      [-3.0, 0.1, -90.5],
      [3.6, 1.0, -93.5],
      [-5.0, 1.8, -98],
      [5.8, 0.4, -102.5],
      [-0.4, 3.6, -109],
    ] as V3[],
    portrait: [6.2, 0.8, -118] as V3,
    route: [
      [-5, -0.4, -131],
      [5, -0.4, -139],
      [-5, -0.4, -147],
      [5.5, 0.2, -155],
      [-4.2, 0.5, -164],
    ] as V3[],
  },
  write: {
    books: [-199, -208, -217, -226, -235, -244].map((z, i) => [i % 2 ? 3.2 : -3.2, 0.4, z] as V3),
    shelves: { from: -182, to: -258, x: 8.5 },
    arc: { from: -190, to: -252, y: 6.5 },
  },
  build: {
    frames: [
      [-0.6, 1.4, -281],
      [0.5, 0.75, -361],
      [0, 3.5, -433],
    ] as V3[],
    swarm: { center: [0, 9.5, -310] as V3, pad: [0, -3, -300] as V3, width: 30 },
    city: { center: [0, -9, -336] as V3, size: [34, 30] as [number, number] },
    bench: [5.2, -1.7, -371] as V3,
    plotter: [-6.4, 1.6, -385] as V3,
    landing: { y: -6, z: -399, xs: [-0.5, 4, 8.5] },
    hula: [6.8, 1.2, -415] as V3,
  },
  solve: {
    helix: { from: -468, step: 4.2, radius: 6.2 },
    web: [-4.5, 2, -528] as V3,
    ladder: { x: 3.4, from: [-4, -536] as [number, number], to: [12, -550] as [number, number] },
  },
  lab: {
    floor: -2.6,
    bays: {
      robotics: { side: -1, z: -588, len: 18 },
      ai: { side: 1, z: -585, len: 8 },
      drones: { side: 1, z: -598, len: 8 },
      xr: { side: -1, z: -606, len: 7 },
      design: { side: 1, z: -613, len: 7 },
      mobility: { side: -1, z: -621, len: 9 },
      emerging: { side: 1, z: -629, len: 7 },
    } as Record<string, { side: number; z: number; len: number }>,
    humanoid: [-3.8, -2.6, -642] as V3,
  },
  scale: {
    stats: [
      [-7, 1.2, -679],
      [7, -0.8, -691],
      [-7, 2.2, -703],
      [7, 0.2, -715],
      [-7, -0.8, -727],
      [7, 1.2, -739],
    ] as V3[],
    globe: [0, -15, -716] as V3,
    fll: [-3.8, 1, -753] as V3,
  },
  finale: { name: [0, 5.2, -832] as V3 },
};

const S = (id: string, p: number, pos: V3, look: V3, extra: Partial<Shot> = {}): Shot => ({ id, p, pos, look, ...extra });

const DESKTOP: Shot[] = [
  // ROOM
  S('room', 0, [0, 1.8, 7.6], [0, 1.0, 0], { fov: 40, stop: true }),
  S('room-drift', 0.03, [-1.5, 1.6, 4.6], [0, 1.05, 0], { fov: 40 }),
  S('room-desk', 0.058, [-0.35, 1.36, 1.5], [0, 1.16, -0.2], { fov: 42, stop: true }),
  S('screen', 0.082, [0, 1.222, 0.02], [0, 1.22, -0.6], { fov: 46, ease: 'power2.in' }),
  S('tunnel', 0.1, [0, 0.8, -14], [0, 0.2, -40], { fov: 72, ease: 'power1.out' }),
  S('tunnel-exit', 0.125, [0, 0, -52], [0, 0, -80], { fov: 54 }),
  // TEACH
  S('teach-room', 0.15, [1.5, 1.4, -66], [0, -4, -82], { fov: 50, stop: true }),
  S('teach-fragments', 0.172, [0.2, 0.9, -84], [0, 1.2, -104], { stop: true }),
  S('teach-portrait', 0.192, [-2.4, 0.3, -110], [6.2, 0.8, -118.5], { stop: true }),
  S('teach-abstract', 0.208, [-0.8, 0.5, -121], [1, -0.4, -135], { stop: true }),
  S('route-0', 0.222, [0.6, 0.4, -126], [-4, -0.3, -132], { stop: true }),
  S('route-1', 0.233, [-0.6, 0.4, -134], [4, -0.3, -140], { stop: true }),
  S('route-2', 0.244, [0.6, 0.4, -142], [-4, -0.3, -148], { stop: true }),
  S('route-3', 0.256, [1.2, 0.6, -149.5], [5.5, 0.4, -156], { stop: true }),
  S('route-3b', 0.264, [1.5, 0.6, -151.5], [5.5, 0.4, -156.5]),
  S('route-4', 0.274, [-0.4, 0.4, -159], [-4.2, 0.5, -164.5], { stop: true }),
  S('gate-teach', 0.285, [0, 0, -175], [0, 0, -200], { ease: 'power1.in' }),
  // WRITE
  S('write-library', 0.298, [0, 0.8, -188], [0, 3.4, -205], { ease: 'power1.out', stop: true }),
  S('book-0', 0.31, [0.8, 0.4, -193], [-1.6, 0.3, -203], { stop: true }),
  S('book-1', 0.322, [-0.8, 0.4, -202], [1.6, 0.3, -212], { stop: true }),
  S('book-2', 0.334, [0.8, 0.4, -211], [-1.6, 0.3, -221], { stop: true }),
  S('book-3', 0.346, [-0.8, 0.4, -220], [1.6, 0.3, -230], { stop: true }),
  S('book-4', 0.358, [0.8, 0.4, -229], [-1.6, 0.3, -239], { stop: true }),
  S('book-5', 0.37, [-0.8, 0.4, -238], [1.6, 0.3, -248], { stop: true }),
  S('write-out', 0.382, [0, 0.3, -252], [0, 0, -265]),
  S('gate-write', 0.392, [0, 0, -265], [0, 0, -290], { ease: 'power1.in' }),
  // BUILD
  S('frame-1', 0.402, [-1.5, 0.6, -276], [0, 2, -295], { ease: 'power1.out', stop: true }),
  S('swarm', 0.418, [0, 2, -284], [0, 8.5, -310], { fov: 56, stop: true }),
  S('swarm-hold', 0.44, [0, 2.6, -288], [0, 9, -310], { fov: 56 }),
  S('city', 0.458, [-1, -1.2, -314], [2, -8, -331], { fov: 54, stop: true }),
  S('city-deep', 0.474, [3.5, -7.3, -331], [3.5, -7.5, -352], { fov: 60, fixedX: true }),
  S('frame-2', 0.488, [0, 0.5, -358], [2, 0, -372], { stop: true }),
  S('bench', 0.502, [2.2, 0.7, -365.5], [5.2, -1.2, -371.5], { stop: true }),
  S('plotter', 0.518, [-0.5, 1.0, -378], [-6.4, 1.6, -385.5], { stop: true }),
  S('landing', 0.534, [2.4, 2.4, -391], [4, -6, -399.5], { stop: true }),
  S('hula', 0.55, [3.2, 1.3, -409], [6.8, 1.6, -415.5], { stop: true }),
  S('frame-3', 0.567, [0, 5, -428], [0, 4, -445], { stop: true }),
  S('build-out', 0.58, [0, 1.2, -441], [0, 0, -455]),
  S('gate-build', 0.59, [0, 0, -455], [0, 0, -480], { ease: 'power1.in' }),
  // SOLVE
  S('briefs-0', 0.605, [0, 0, -458], [0, 0, -474], { ease: 'power1.out', stop: true }),
  S('briefs-1', 0.625, [0.3, 0.2, -470.6], [0, 0, -486.6], { stop: true }),
  S('briefs-2', 0.645, [-0.3, 0.2, -483.2], [0, 0, -499.2], { stop: true }),
  S('briefs-3', 0.665, [0.3, 0.2, -495.8], [0, 0, -511.8], { stop: true }),
  S('ai-web', 0.68, [-0.5, 1, -518], [-4.5, 2, -528.5], { stop: true }),
  S('ladder', 0.692, [1.4, 0, -530], [3.4, 6, -543], { stop: true }),
  S('ladder-top', 0.705, [1.4, 8, -543], [0.8, 9.5, -556]),
  S('gate-solve', 0.715, [0, 9, -560], [0, 8, -585], { ease: 'power1.in' }),
  // LAB
  S('lab-in', 0.728, [0, 2.2, -572], [0, 0.4, -590], { ease: 'power1.out', stop: true }),
  S('bay-robotics', 0.74, [0.5, 0.6, -580], [-6, -0.6, -588], { stop: true }),
  S('bay-ai', 0.752, [-0.5, 0.6, -588], [6, 0.4, -592], { stop: true }),
  S('bay-xr', 0.764, [0.5, 0.6, -600], [-6, -0.6, -607], { stop: true }),
  S('bay-design', 0.776, [-0.5, 0.6, -608], [6, -0.6, -614], { stop: true }),
  S('bay-mobility', 0.788, [0.5, 0.6, -616], [-6, -0.6, -622], { stop: true }),
  S('bay-emerging', 0.8, [-0.5, 0.6, -624], [6, -0.6, -630], { stop: true }),
  S('humanoid', 0.812, [-0.6, 0.3, -636.5], [-3.8, -1.0, -642], { stop: true }),
  S('gate-lab', 0.824, [0, 0, -660], [0, 0, -685], { ease: 'power1.in' }),
  // SCALE
  S('stat-0', 0.836, [1, 0.5, -670], [-6, 1.6, -679.5], { ease: 'power1.out', stop: true }),
  S('stat-1', 0.848, [-1, 0.5, -682], [6, -0.4, -691.5], { stop: true }),
  S('stat-2', 0.858, [1, 0.6, -694], [-6, 2.4, -703.5], { stop: true }),
  S('stat-3', 0.87, [0, 3.2, -703], [2, -8.5, -716], { stop: true }),
  S('stat-4', 0.882, [1, 0.5, -718], [-6, -0.4, -727.5], { stop: true }),
  S('stat-5', 0.892, [-1, 0.5, -730], [6, 1.4, -739.5], { stop: true }),
  S('fll', 0.905, [1.4, 0.9, -744], [-3.8, 2.2, -753], { stop: true }),
  S('gate-scale', 0.918, [0, 0, -770], [0, 0, -800], { ease: 'power1.in' }),
  // FINALE
  S('converge', 0.945, [0, 1.4, -788], [0, 4, -832], { fov: 50, ease: 'power1.out' }),
  S('name', 0.97, [0, 2.2, -800], [0, 4.6, -832], { fov: 50, stop: true }),
  S('cta', 1, [0, 0.4, -783], [0, 0.6, -832], { fov: 54, stop: true }),
];

/** Lateral scale for content and camera on narrow screens. */
export const MOBILE_LX = 0.5;

function toMobile(s: Shot): Shot {
  const lx = MOBILE_LX;
  return {
    ...s,
    pos: [s.fixedX ? s.pos[0] : s.pos[0] * lx, s.pos[1], s.pos[2]],
    look: [s.fixedX ? s.look[0] : s.look[0] * lx, s.look[1], s.look[2]],
    fov: (s.fov ?? 50) + 14,
  };
}

export const shots = (mobile: boolean) => (mobile ? DESKTOP.map(toMobile) : DESKTOP);

/** Timeline progress at which the camera reaches a shot. */
export const P = Object.fromEntries(DESKTOP.map((s) => [s.id, s.p])) as Record<string, number>;

export const CHAPTERS = [
  { id: 'studio', label: 'STUDIO', p: 0 },
  { id: 'portal', label: 'PORTAL', p: 0.075 },
  { id: 'teach', label: 'TEACH', p: 0.125 },
  { id: 'write', label: 'WRITE', p: 0.285 },
  { id: 'build', label: 'BUILD', p: 0.392 },
  { id: 'solve', label: 'SOLVE', p: 0.59 },
  { id: 'lab', label: 'LAB', p: 0.715 },
  { id: 'scale', label: 'SCALE', p: 0.824 },
  { id: 'contact', label: 'CONTACT', p: 0.93 },
];

/** Where `cd <chapter>` in the terminal lands. */
export const DESTINATIONS: Record<string, number> = {
  home: 0,
  studio: 0,
  teach: P['teach-room'],
  write: P['write-library'],
  build: P['frame-1'],
  solve: P['briefs-0'],
  lab: P['lab-in'],
  scale: P['stat-0'],
  contact: 1,
};

/** Total scroll length of the journey, in viewport heights. */
export const SCROLL_VH = 3600;
