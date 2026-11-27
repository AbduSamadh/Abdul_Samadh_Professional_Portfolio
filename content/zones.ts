// The lab on the home page. Each zone is a place in the lab image (public/assets/lab/) that opens
// a panel about one part of the work. Positions are fractions of the image (x from the left,
// y from the top), so they hold at any size. If the lab image is re-rendered, re-place the pins.
// All copy is drawn from content/site.ts so the two never drift apart.

import { authoring, briefs, builds, lab, scale } from './site';

export const LAB_IMAGE = {
  jpg: '/assets/lab/lab-v1.jpg',
  webp: '/assets/lab/lab-v1.webp',
  width: 1376,
  height: 768,
  sketch: '/assets/lab/lab-v1-sketch.webp',
  alt: 'A bright school innovation lab: an AI vision screen, coding desks, a humanoid robot and robot arm, a competition table, a drone cage, a learning-pathway board under a shelf of books and trophies, 3D printers, a VR headset and an electronics bench.',
};

export type ZoneLink = { label: string; href: string };
export type ZoneBuild = { name: string; body: string; links: ZoneLink[] };

export type Zone = {
  id: string;
  /** Short name on the pin. */
  label: string;
  /** Where the pin sits, as fractions of the image. */
  x: number;
  y: number;
  /** Where the callout label sits, as fractions of the image. */
  lx: number;
  ly: number;
  title: string;
  body: string;
  /** Kit and tools, shown as chips. */
  kit?: string[];
  /** Short points. */
  points?: string[];
  builds?: ZoneBuild[];
};

const group = (id: string) => lab.groups.find((g) => g.id === id)?.items ?? [];
const brief = (title: string) => briefs.items.find((b) => b.title === title)?.body ?? '';
const build = (id: string): ZoneBuild => {
  const b = builds.items.find((x) => x.id === id)!;
  const links: ZoneLink[] = [];
  if (b.live) links.push({ label: b.liveLabel ?? 'Open', href: b.live });
  if (b.code) links.push({ label: 'Code', href: b.code });
  return { name: b.name, body: b.body, links };
};

export const zones: Zone[] = [
  {
    id: 'vision',
    label: 'AI vision',
    x: 0.138,
    y: 0.423,
    lx: 0.035,
    ly: 0.29,
    title: 'AI literacy, taught on a real camera feed',
    body: brief('AI literacy'),
    kit: group('ai'),
    builds: [build('landing')],
  },
  {
    id: 'coding',
    label: 'Coding desks',
    x: 0.113,
    y: 0.677,
    lx: 0.03,
    ly: 0.88,
    title: 'Computing as a craft',
    body: `${brief('Computational thinking')} Then the languages, from first block to first program.`,
    kit: group('code'),
    builds: [build('asciicity')],
  },
  {
    id: 'robotics',
    label: 'Robotics',
    x: 0.327,
    y: 0.6,
    lx: 0.235,
    ly: 0.9,
    title: 'Robotics, from floor turtle to humanoid',
    body: brief('Robotics pathway'),
    kit: group('robotics'),
    builds: [build('bench')],
  },
  {
    id: 'fll',
    label: 'Competition table',
    x: 0.545,
    y: 0.573,
    lx: 0.47,
    ly: 0.92,
    title: scale.fll.title,
    body: `${scale.fll.body} ${scale.fll.judged}`,
    points: [
      'Robotics and STEM competitions for 1,000+ students',
      'Competition seasons planned from the rulebook down to the practice table',
    ],
  },
  {
    id: 'drones',
    label: 'Drone cage',
    x: 0.665,
    y: 0.49,
    lx: 0.585,
    ly: 0.36,
    title: 'Drones, flown in code',
    body: 'Flight is the quickest way to make a loop or a sensor reading matter: the drone either lands on the pad or it does not.',
    kit: group('drones'),
    builds: [build('swarm'), build('hula')],
  },
  {
    id: 'pathway',
    label: 'Learning pathway',
    x: 0.872,
    y: 0.482,
    lx: 0.73,
    ly: 0.64,
    title: 'Curriculum, from scope and sequence to Monday morning',
    body: 'Whole-school schemes for ICT, AI and STREAM, written for rooms that have the hardware and for screens that do not, with the teacher training attached.',
    points: briefs.items.map((b) => b.title),
  },
  {
    id: 'shelf',
    label: 'Books and trophies',
    x: 0.836,
    y: 0.322,
    lx: 0.72,
    ly: 0.2,
    title: authoring.title,
    body: authoring.body,
    points: authoring.books.map((b) => b.title),
  },
  {
    id: 'printers',
    label: '3D printing',
    x: 0.716,
    y: 0.755,
    lx: 0.59,
    ly: 0.66,
    title: 'Design technology and the maker lab',
    body: brief('Maker lab setup'),
    kit: [...group('design'), ...group('mobility')],
    builds: [build('plotter')],
  },
  {
    id: 'xr',
    label: 'VR station',
    x: 0.948,
    y: 0.6,
    lx: 0.975,
    ly: 0.42,
    title: 'Extended reality and what comes next',
    body: 'Headsets, motion platforms and brain-computer interfaces, tried in a lesson before anyone signs a purchase order.',
    kit: [...group('xr'), ...group('emerging')],
  },
  {
    id: 'bench',
    label: 'Electronics bench',
    x: 0.872,
    y: 0.833,
    lx: 0.975,
    ly: 0.95,
    title: 'Physical computing',
    body: brief('Physical computing'),
    kit: group('boards'),
  },
];
