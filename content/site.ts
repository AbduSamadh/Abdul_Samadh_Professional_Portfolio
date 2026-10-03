// All copy on the site lives in this folder. Edit here; the 3D code reads from it.
// Source: reference/original-index.html. Do not add facts that are not true.

export const person = {
  name: 'Abdul Samadh',
  handle: 'abdul.samadh',
  location: 'Dubai · UAE',
  prompt: 'abdul@dubai:~$',
  now: 'Manager of Lab Learning & Operations, Sunmarke School by Fortes Education, Dubai',
  nowShort: 'Manager of Lab Learning & Operations, Sunmarke School, Dubai',
  oneLine:
    'I build outcomes-driven ICT, AI and STREAM curriculum, for classrooms and for screens, then build the software that teaches it when the software does not exist.',
  span: 'Twelve years, kindergarten to university, across four countries.',
  linkedin: 'https://www.linkedin.com/in/abdul-samadh-stream-ai-specialist/',
  linkedinShort: 'linkedin.com/in/abdul-samadh-stream-ai-specialist',
  // Drop a PDF into public/assets/ and set this to e.g. '/assets/abdul-samadh-cv.pdf' to show the button.
  cv: '' as string,
  ticker: ['DUBAI', 'UAE', 'GCC', 'SINGAPORE', 'INDIA'],
};


export const who = {
  kicker: '01 / Who',
  title: 'Twelve years of making the lessons work',
  body:
    'I started in classrooms and never really left them. What changed is the size of the thing I get handed: a worksheet, then a unit, then a whole-school scheme, then a competition season, then the software the lesson needed and nobody had built.',
  facts: [
    { k: 'Now', v: 'Manager of Lab Learning & Operations, Sunmarke School, Dubai' },
    { k: 'Taught and built', v: 'Kindergarten to University, in three languages' },
    { k: 'Worked', v: 'UAE, GCC, Singapore and India' },
    { k: 'Writes', v: 'ICT, AI literacy and STREAM, offline and online' },
  ],
  fragments: ['a worksheet', 'a unit', 'a whole-school scheme', 'a competition season', 'the software'],
};

export const abstract = {
  kicker: '02 / Abstract',
  // [text, highlighted?]
  parts: [
    ['I design and build learning systems for schools and universities. The work runs from the ', false],
    ['scope and sequence', true],
    [' down to the worksheet, and from the ', false],
    ['competition rulebook', true],
    [' out to the simulator a learner opens in a browser. I write for rooms that have the hardware and for screens that do not, and I train the people who have to teach it on a Monday morning. ', false],
    ['And where the right tool does not exist yet, I build it.', true],
  ] as [string, boolean][],
  tags: [
    'Curriculum architecture',
    'Teacher training',
    'Competition programmes',
    'Educational software',
    'ICT',
    'AI literacy',
    'STREAM',
  ],
};

export type Stop = {
  id: string;
  country: string;
  org: string;
  role?: string;
  body: string;
  now?: boolean;
  feature?: boolean;
};

// Oldest to newest, so the camera travels toward the present.
export const route: Stop[] = [
  {
    id: 'chrysalis',
    country: 'India',
    org: 'Chrysalis',
    body: 'Curriculum writing and classroom delivery at scale, in the publishing model where the material has to work in a school you will never visit.',
  },
  {
    id: 'alphagen',
    country: 'Singapore',
    org: 'AlphaGen',
    body: 'Curriculum and programme work across year groups and schools.',
  },
  {
    id: 'coding-school',
    country: 'United Arab Emirates',
    org: 'Coding School',
    body: 'Computing taught as a craft, with the progression from first block to first program built deliberately rather than left to chance.',
  },
  {
    id: 'atlab',
    country: 'United Arab Emirates',
    org: 'ATLAB',
    role: 'STEM and AI Specialist',
    body: 'Curriculum development, educator training and programme delivery across the UAE and the wider GCC. Core team member for FIRST LEGO League UAE, as Head Referee and on the Judging Panel.',
    feature: true,
  },
  {
    id: 'sunmarke',
    country: 'United Arab Emirates',
    org: 'Sunmarke School, Fortes Education',
    role: 'Manager of Lab Learning & Operations',
    body: 'Running and building the curriculum for the labs and the learning that happens inside them.',
    now: true,
  },
];

export const authoring = {
  kicker: '04 / Authoring',
  title: 'Books, across curricula and grade levels',
  body: 'Written for whole-school adoption, sequenced so each grade stands alone and still builds on the one before.',
  books: [
    { n: '01', title: 'Scope and sequence', body: 'Grade-by-grade progression maps, written so a coordinator sees the whole arc on one page and can defend it in a meeting.' },
    { n: '02', title: 'Student books', body: 'Graded activities, worked examples and projects pitched at the reading level of the grade they are for, not the one above.' },
    { n: '03', title: 'Teacher editions', body: 'Pacing, misconceptions, differentiation and answer keys, so the book teaches the teacher as well as the class.' },
    { n: '04', title: 'Workbooks', body: 'Practice that actually gets practised: short, self-marking where possible, and printable on a school photocopier.' },
    { n: '05', title: 'Assessment packs', body: 'Formative checks, end-of-unit tasks and rubrics tied back to the outcome the unit opened with.' },
    { n: '06', title: 'Digital companions', body: 'The same content again for a screen: modular, gradeable, and usable when the hardware never arrives.' },
  ],
  grades: ['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
};

export type Build = {
  id: string;
  name: string;
  body: string;
  tags: string[];
  live?: string;
  liveLabel?: string;
};

export const builds = {
  kicker: '05 / Builds',
  title: 'Software I wrote because the lesson needed it',
  body: 'Each of these began as a teaching problem. None of them use a framework.',
  items: [
    {
      id: 'swarm',
      name: 'Swarm',
      body: 'A drone light show you conduct in a browser. Type a word and a thousand drones spell it. One switch flips the planner from collision-free assignment to random pairing, so a class can watch the maths fail: zero collisions against a hundred and seven.',
      tags: ['CANVAS', 'CAPT PLANNING', '1000 DRONES'],
      live: 'https://abdusamadh.github.io/DroneShow/',
      liveLabel: 'Open the live build',
    },
    {
      id: 'asciicity',
      name: 'ASCII City',
      body: 'A city of roads, towers, parks, traffic and pedestrians, raycast every frame and drawn with nothing but letters and symbols. It rains, snows and fogs, and the traffic obeys signals without ever deadlocking.',
      tags: ['RAYCASTER', 'NO LIBRARIES', 'WEATHER'],
      live: 'https://abdusamadh.github.io/ASCII-City/',
      liveLabel: 'Walk the live city',
    },
    {
      id: 'bench',
      name: 'Bench',
      body: 'A build-a-robot sandbox where bad builds visibly misbehave. Wire one wheel backwards and it spins on the spot. Hang the battery off the nose and it scrapes. Live motor current, encoder ticks and battery sag, then a report card telling you what to change.',
      tags: ['3D FROM SCRATCH', 'HONEST PHYSICS'],
    },
    {
      id: 'plotter',
      name: 'LEGO pen plotter',
      body: 'A two-axis plotter built from LEGO Education kits and driven from a PC over Bluetooth. It converts an arbitrary image into horizontal line strokes and draws it in four pen colours.',
      tags: ['BLE', 'PYTHON'],
    },
    {
      id: 'landing',
      name: 'Landing surface detection',
      body: 'A pi-top camera system that decides whether a surface is safe to land on, using a Teachable Machine TFLite model, servos and an encoder motor, with ROS 2 handling sensor fusion.',
      tags: ['TFLITE', 'ROS 2'],
    },
    {
      id: 'hula',
      name: 'Hula drone SDK',
      body: 'Flight scripts and a video lesson series on the HighGreat Hula Python SDK: flight basics, obstacle sensing and altitude, then AprilTag recognition.',
      tags: ['PYHULA', 'APRILTAG'],
    },
  ] as Build[],
  hulaLessons: ['Flight basics', 'Obstacle sensing and altitude', 'AprilTag recognition'],
};

export const briefs = {
  kicker: '06 / Custom projects',
  title: 'Briefs I have been handed, and built',
  body: 'Schools rarely ask for a subject. They ask for an outcome.',
  items: [
    { n: '01', title: 'AI literacy', body: 'What a model is, what it is not, where the data came from, and where a human still has to decide. Runs from kindergarten up without a single equation.' },
    { n: '02', title: 'Digital citizenship', body: 'Footprint, consent, sources and tone, taught through cases students recognise from their own feeds.' },
    { n: '03', title: 'Computational thinking', body: 'Decomposition, pattern, abstraction and algorithm, practised unplugged before anyone touches a keyboard.' },
    { n: '04', title: 'Robotics pathway', body: 'One ladder from a floor turtle in Year 1 to an autonomous line follower and a full competition season.' },
    { n: '05', title: 'Data literacy', body: 'Collect it, clean it, chart it, then argue with it. Spreadsheets as an instrument rather than a subject.' },
    { n: '06', title: 'Cyber safety', body: 'Passwords, phishing, permissions, and the quiet social engineering that gets past all three.' },
    { n: '07', title: 'Physical computing', body: 'Sensors, actuators, and the moment a student realises code can move something in the room.' },
    { n: '08', title: 'Creative coding', body: 'Generative art, sound and animation, for students who would never call themselves programmers.' },
    { n: '09', title: 'Sustainability tech', body: 'Sensing a real environment, logging it over weeks, then proposing something defensible from the data.' },
    { n: '10', title: 'Assistive technology', body: 'Designing for one person with one need, which turns out to be the fastest route to empathy in engineering.' },
    { n: '11', title: 'Game design', body: 'Rules, feedback loops, balance and playtesting, shipped to classmates who will be honest.' },
    { n: '12', title: 'Maker lab setup', body: 'The unglamorous half: kit lists, storage, consumables, rotation, safety and a timetable that fits.' },
  ],
};

export type Bay = { id: string; title: string; items: string[]; kind: 'plinth' | 'screen' | 'hover' };

export const lab = {
  kicker: '08 / Stack',
  title: 'What I work in',
  body: 'Hardware on the bench, code in the browser, frameworks on the wall.',
  bays: [
    { id: 'robotics', title: 'Robotics', kind: 'plinth', items: ['Unitree G1 EDU Ultimate C', 'Unitree Go2-W', 'Booster K1', 'Robosen K1', 'myBuddy 280', 'myController S570', 'uKit Advanced', 'VinciBot', 'Ozobot Ari', 'Magician Go', 'LEGO SPIKE Prime', 'Sphero BOLT+', 'fischertechnik', 'pi-top'] },
    { id: 'ai', title: 'AI and machine learning', kind: 'screen', items: ['Teachable Machine', 'TensorFlow Lite', 'OpenCV', 'ROS 2'] },
    { id: 'drones', title: 'Drones and aviation', kind: 'hover', items: ['CoDrone EDU', 'HighGreat Hula', 'Boeing flight simulator'] },
    { id: 'xr', title: 'Extended reality', kind: 'plinth', items: ['Meta Quest 3S', 'Omni One', 'MergeCube'] },
    { id: 'design', title: 'Design technology', kind: 'plinth', items: ['Bambu P1 Series', 'Bambu P2S', 'Infento Pro Kit 2'] },
    { id: 'mobility', title: 'Mobility and motorsport', kind: 'plinth', items: ['F1 Race System Halo', 'EduKart', 'Automobile simulation models', 'Founder Edition bike'] },
    { id: 'emerging', title: 'Emerging technology', kind: 'plinth', items: ['Gemini Mini', 'Epoc X EEG', 'Werkstation 10'] },
  ] as Bay[],
};

export const scale = {
  kicker: '07 / Scale',
  title: 'By the numbers',
  stats: [
    { value: 15, label: 'Grade levels, KG to 13' },
    { value: 12, label: 'Years in education' },
    { value: 6, label: 'Competition programmes run' },
    { value: 4, label: 'Countries reached' },
    { value: 4, label: 'Languages taught in' },
    { value: 3, label: 'Publishers authored for' },
  ],
  lines: ['Kindergarten to university', 'UAE · GCC · Singapore · India', 'For classrooms and for screens'],
  fll: {
    title: 'FIRST LEGO League UAE',
    body: 'Core team member, Head Referee and Judging Panel.',
    roles: ['Core team member', 'Head Referee', 'Judging Panel'],
    judged: 'Judged prestigious STEM and robotics competitions in the UAE and online across the globe.',
  },
  places: ['UAE', 'GCC', 'Singapore', 'India'],
};

export const contact = {
  kicker: '09 / Contact',
  title: "Let's build something students remember.",
  body: 'Curriculum, competitions, teacher training, or a simulator that does not exist yet.',
  sign: 'learning never stops',
  footer: 'Abdul Samadh · Dubai, UAE · 2026',
  credit: 'Hand built',
};
