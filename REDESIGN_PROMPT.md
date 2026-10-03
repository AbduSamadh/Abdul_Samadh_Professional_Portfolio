# Abdul Samadh — Immersive 3D Portfolio: Build Prompt

> Source material: `reference/original-index.html` (the current hand-built portfolio) and `assets/portrait.jpg` (extracted from it).
> Every fact, line of copy, project, number and product name below comes from that file. Do not invent new ones.

---

Redesign my professional portfolio (`reference/original-index.html`) as a fully immersive, cinematic, scroll-controlled 3D website.

It should not feel like a normal portfolio with sections stacked vertically.
It should feel like the visitor is entering a connected 3D world and moving through one continuous experience.

The site begins in a minimal, all black 3D room lit by neon: one clean sculptural desk, one laptop on top. As the visitor scrolls, the camera slowly moves toward the laptop. The laptop opens, boots, and becomes the portal into my world. The visitor then travels through the laptop screen into a sequence of connected 3D worlds built around six giant anchor words:

**TEACH · WRITE · BUILD · SOLVE · LAB · SCALE**

Each word is a chapter of my career. Each chapter should feel like a real place the visitor moves through, not a title on a screen.

The site should feel:

* premium
* futuristic
* minimal
* bold
* cinematic
* fluid
* dynamic
* immersive
* spatial
* unforgettable

This should be the kind of portfolio that a head of school, a publisher, an EdTech founder or a robotics partner screen records and sends to their team because it feels insane.

---

## WHO THIS IS FOR

I am **Abdul Samadh**, based in **Dubai, UAE**.

The one-line story of my career, taken from my current site:

> **I build outcomes-driven ICT, AI and STREAM curriculum, for classrooms and for screens, then build the software that teaches it when the software does not exist.**
> Twelve years, kindergarten to university, across four countries.

Currently: **Manager of Lab Learning & Operations, Sunmarke School by Fortes Education, Dubai.**

The people this site has to convince:

* school leaders and heads of digital learning hiring for curriculum, labs and AI literacy
* education groups and publishers commissioning curriculum and books
* EdTech and robotics companies looking for a curriculum and training partner
* competition and partnership organisers (FIRST LEGO League and similar)
* teachers who will be trained by me

They are not developers and not gamers. They should feel the craft, then understand exactly what I can do for them.

---

## CORE EXPERIENCE

The site is a single continuous camera journey.
The visitor does not feel like they are scrolling down a page.
They feel like they are steering a camera through a connected 3D world.

My current site already uses the language of descending: **SCROLL TO DESCEND**, a **DEPTH** counter, a **SECTOR** readout, a boot sequence. Keep that language. The new site is the same idea, made real: scroll is depth, and depth is a place.

Scrolling drives the camera through space.
The camera moves:

* forward
* slightly left and right
* slightly up and down
* occasionally around objects
* through giant typography
* through screens
* through content clusters
* through portals

Everything is connected.
Every transition should feel like moving through one world into the next.
Nothing should feel like a hard cut unless it is a deliberate dramatic moment.

A persistent, minimal HUD (inherited from my current site) sits on top of the 3D world:

* top-left: `abdul.samadh` wordmark
* top-right: `SECTOR` (current chapter name) and `DEPTH` (a 4-digit counter driven by scroll progress, 0000 → 9999)
* a thin location ticker: `DUBAI · UAE · GCC · SINGAPORE · INDIA`
* the theme toggle (see DESIGN LANGUAGE)
* a terminal button: `>_` that opens my terminal overlay at any time

---

## BIG CREATIVE DIRECTION

This website must combine:

* giant 3D typography
* immersive spatial storytelling
* real professional information
* credibility and partnerships
* image galleries
* live, interactive project demos
* videos
* product and software screenshots
* curriculum framework explanation
* personal presence and credibility
* a hardware lab worth exploring
* a strong call to action

The challenge is not just to look cool.
The challenge is to present twelve years of real, dense work (six software builds, six types of authored books, twelve custom curriculum briefs, five roles in four countries, and more than thirty pieces of specialist hardware) in a way that is beautiful, high end and easy to absorb.

So the solution is:
**Do not turn information into sections. Turn information into environments.**

---

## NARRATIVE FLOW

### SCENE 0: THE BOOT

Before the room appears, keep the boot screen from my current site, upgraded.

* full black
* monospaced boot lines typed out in amber, VT323 / IBM Plex Mono:
  `> abdul.samadh`
  `loading twelve years of practice...`
  `[ OK ] curriculum`
  `[ OK ] competitions`
  `[ OK ] software`
  `[ OK ] lab`
* a small `CLICK OR PRESS ANY KEY TO SKIP` line
* the boot lines collapse into a single horizontal amber scanline, and that scanline becomes the light edge of the desk in Scene 1

The boot must be short (under 3 seconds), skippable, and skipped automatically on return visits (sessionStorage).

### SCENE 1: THE BLACK ROOM

Start in a minimal all black 3D room.
It should feel like a futuristic design studio after hours, or a gallery that only exists at night.
It should not look like a real office or a gamer bedroom. It is highly curated and minimal.

Include:

* seamless matte black walls and floor, with a soft reflective floor that catches the neon
* one thin neon line (amber `#FF9D2E`) tracing the room's edges, like an architectural light strip
* subtle volumetric haze, very low density
* one sculptural desk: monolithic, black, with a single amber light edge
* one premium laptop on the desk, lid nearly closed, a thin line of amber light leaking from the gap
* at most one subtle object for balance: a small, still LEGO SPIKE Prime hub or a tiny quadcopter drone resting on the desk, silhouette only
* zero clutter

The room should feel calm, dark, and premium.
The camera begins on a wide shot.
The visitor sees the room and the desk.

Minimal overlay text appears in this space (HTML, not 3D), taken from my current hero:

* small label: `● NOW` — `Manager of Lab Learning & Operations, Sunmarke School, Dubai`
* main headline options (pick one, keep it minimal):
  * **"I build the lessons. Then I build the software that teaches them."**
  * **"Curriculum for classrooms and for screens."**
  * **"Twelve years. Kindergarten to university. Four countries."**
* bottom: `SCROLL TO DESCEND`

As the visitor scrolls, the camera slowly pushes toward the desk and laptop.
This movement should feel deliberate, heavy and smooth.

### SCENE 2: THE LAPTOP PORTAL

As the camera approaches, the laptop opens.
It begins almost closed and opens fully as the camera gets near.

The screen boots into my terminal:

```
abdul@dubai:~$ ./descend
```

The screen glows amber with soft CRT scanlines and a slight barrel curve, matching my current site's CRT aesthetic.

As the camera gets close, the screen fills more and more of the viewport.
Then the visitor travels into the screen.

The transition should feel like falling into the terminal:

* the scanlines stretch into a tunnel of horizontal amber light lines rushing past
* characters from the terminal break apart into a field of ASCII glyphs flying toward the camera (a nod to ASCII City)
* brief, restrained chromatic aberration at peak speed
* then the glyphs settle and resolve into the first giant word

This is the entry point into my world.

---

### SCENE 3: TEACH WORLD — who I am

Giant word: **TEACH**

The word is giant, architectural and spatial, extruded letterforms in Space Grotesk Bold, black material with amber light edges.

This world represents where everything started: the classroom. It is the emotional beginning.

This world must explain (all copy from sections **01 / WHO**, **02 / ABSTRACT** and **03 / ROUTE** of my current site):

* who I am
* what I do in one sentence
* the scale of my experience: twelve years, KG to university, three languages, four countries
* my current role
* the route my career has taken

**Visual elements in TEACH:**

* a floating, oversized chalk-line wireframe of a classroom (desks, a board) drawn in thin amber lines, the camera flying over it
* floating worksheet and lesson-plan fragments that grow in size as the camera passes: a worksheet, then a unit, then a whole-school scheme, then a competition season, then a browser window. This visualises my line: *"What changed is the size of the thing I get handed."*
* short copy panels with the WHO facts:
  * **Now** — Manager of Lab Learning & Operations, Sunmarke School, Dubai
  * **Taught and built** — Kindergarten to University, in three languages
  * **Worked** — UAE, GCC, Singapore and India
  * **Writes** — ICT, AI literacy and STREAM, offline and online
* the ABSTRACT paragraph as an HTML overlay, with the key phrases (**scope and sequence**, **competition rulebook**, **And where the right tool does not exist yet, I build it.**) highlighted in amber
* five capability tags floating as small light objects in space: Curriculum architecture, Teacher training, Competition programmes, Educational software, ICT, AI literacy, STREAM

**Personal presence: the portrait.**
My portrait (`assets/portrait.jpg`) appears on a tall floating panel, first rendered as an ASCII / glyph image in amber (as on my current site, where it says **CLICK TO DECODE**). As the camera approaches, or on click, it decodes from glyphs into the real photo. Caption: **ABDUL SAMADH · DUBAI · UAE**.

**THE ROUTE: a spatial career map.**
The career timeline becomes a physical path. A thin amber line runs ahead of the camera through space, like a route on a dark globe, and passes five glowing waypoints. The camera follows the line and each waypoint reveals a panel as it passes:

1. **INDIA — Chrysalis.** Curriculum writing and classroom delivery at scale, in the publishing model where the material has to work in a school you will never visit.
2. **SINGAPORE — AlphaGen.** Curriculum and programme work across year groups and schools.
3. **UAE — Coding School.** Computing taught as a craft, with the progression from first block to first program built deliberately rather than left to chance.
4. **UAE — STEM and AI Specialist, ATLAB.** Curriculum development, educator training and programme delivery across the UAE and the wider GCC, including the **official FIRST LEGO League partnership for the UAE, Qatar and Kuwait**.
5. **NOW · UAE — Manager of Lab Learning & Operations, Sunmarke School, Fortes Education.** Running and building the curriculum for the labs and the learning that happens inside them.

Ordered oldest to newest so the camera travels toward the present. The "NOW" waypoint pulses.

The FIRST LEGO League partnership is my strongest credibility signal. When the camera passes the ATLAB waypoint, give it a moment: a slightly larger panel, a short hold, and a subtle three-pin map showing UAE, Qatar and Kuwait lighting up.

The camera moves forward through these objects, drifting left and right to reveal content.
Use large statement copy, but keep it concise.

At the end of TEACH, the visitor should understand:

* I am an educator first
* I design learning systems end to end, from scope and sequence to the worksheet
* I have done this in four countries, across every age group
* I train the teachers who deliver it
* there is a real person behind this

**Exit:** the camera flies through the counter of the **A** in TEACH, and the open space inside the A becomes the first page of a book.

---

### SCENE 4: WRITE WORLD — authoring

Giant word: **WRITE**

This world is about my books and curriculum authoring (section **04 / AUTHORING**): *Books, across curricula and grade levels. Written for whole-school adoption, sequenced so each grade stands alone and still builds on the one before.*

**Visual concept: an infinite, architectural library.**

* the camera enters between two towering, minimal shelves of black book spines with thin amber titles
* the shelves are ordered by grade, KG to 13, with small grade labels glowing on the floor, so the visitor literally travels up the grade levels
* six giant, opened books float in the space ahead, one for each authoring type. As the camera passes each one, its pages turn and an HTML panel reveals the detail:

| # | Book type | Copy |
|---|---|---|
| 01 | Scope and sequence | Grade-by-grade progression maps, written so a coordinator sees the whole arc on one page and can defend it in a meeting. |
| 02 | Student books | Graded activities, worked examples and projects pitched at the reading level of the grade they are for, not the one above. |
| 03 | Teacher editions | Pacing, misconceptions, differentiation and answer keys, so the book teaches the teacher as well as the class. |
| 04 | Workbooks | Practice that actually gets practised: short, self-marking where possible, and printable on a school photocopier. |
| 05 | Assessment packs | Formative checks, end-of-unit tasks and rubrics tied back to the outcome the unit opened with. |
| 06 | Digital companions | The same content again for a screen: modular, gradeable, and usable when the hardware never arrives. |

* the **Scope and sequence** book unfolds into a long horizontal map of the grade ladder, a single glowing arc from KG to Grade 13: the visual "whole arc on one page"
* the **Digital companions** book is last. Its pages dissolve into pixels and screens, which is the bridge to BUILD

Use real book covers and interior spreads when I supply them. Until then, render covers as clean typographic black-and-amber placeholders, clearly marked in code as placeholders.

**Exit:** the pixels from the Digital companions book stream forward into the letters of **BUILD**.

---

### SCENE 5: BUILD WORLD — the software (the centrepiece)

Giant word: **BUILD**

This is the most important and most visually rich world.
It is the proof that I am not only a curriculum writer: I write the software the lesson needs.

From section **05 / BUILDS**: *Software I wrote because the lesson needed it. Each of these began as a teaching problem.*

This world should feel like entering the engine room: mechanical, alive, productive. Each build gets its own small environment that **behaves like the project itself**. The camera travels past them like walking through an exhibition: one on the left, one ahead, one rising from below, one overhead.

**1. Swarm — the drone light show** *(live: https://abdusamadh.github.io/DroneShow/)*

* environment: an open dark sky. The camera rises into a field of ~1,000 tiny instanced point lights (drones)
* as the camera arrives, the drones fly into formation and spell **BUILD**, then **SWARM**
* a small, spatial toggle labelled `PLANNER: COLLISION-FREE ⟷ RANDOM PAIRING` lets the visitor flip it. In random mode, the drones tangle and a counter shows collisions climbing: **0 collisions** vs **107 collisions**. This is exactly the teaching point of the real project: *watch the maths fail*
* copy: *A drone light show you conduct in a browser. Type a word and a thousand drones spell it.*
* tags: CANVAS · CAPT PLANNING · 1000 DRONES
* button: **Open the live build →**

**2. ASCII City** *(live: https://abdusamadh.github.io/ASCII-City/)*

* environment: the camera drops down into a city built entirely from glowing characters: towers, roads, parks, moving traffic and pedestrians made of letters and symbols
* weather drifts through: rain as falling `|` characters, snow as `*`, fog as low-density `.`
* traffic lights cycle and the glyph traffic obeys them
* copy: *A city of roads, towers, parks, traffic and pedestrians, raycast every frame and drawn with nothing but letters and symbols. It rains, snows and fogs, and the traffic obeys signals without ever deadlocking.*
* tags: RAYCASTER · NO LIBRARIES · WEATHER
* button: **Walk the live city →**

**3. Bench — the robot sandbox**

* environment: a minimal workbench platform floating in space with a simple wheeled robot on it
* the robot visibly misbehaves in a short loop: one wheel wired backwards so it spins on the spot, then the battery hung off the nose so it scrapes
* small live gauges float beside it: motor current, encoder ticks, battery sag
* a "report card" panel slides in: what to change
* copy: *A build-a-robot sandbox where bad builds visibly misbehave.*
* tags: 3D FROM SCRATCH · HONEST PHYSICS

**4. LEGO pen plotter**

* environment: a giant vertical sheet of paper. A two-axis plotter head traces my portrait (or the word BUILD) in horizontal strokes, in four pen colours, while the camera drifts past
* copy: *A two-axis plotter built from LEGO Education kits and driven from a PC over Bluetooth. It converts an arbitrary image into horizontal line strokes and draws it in four pen colours.*
* tags: BLE · PYTHON

**5. Landing surface detection**

* environment: the camera looks down, as if from a descending drone, onto three surfaces. A scanning reticle tests each: one turns amber **SAFE**, the others turn red **UNSAFE**
* copy: *A pi-top camera system that decides whether a surface is safe to land on, using a Teachable Machine TFLite model, servos and an encoder motor, with ROS 2 handling sensor fusion.*
* tags: TFLITE · ROS 2

**6. Hula drone SDK**

* environment: a floating monitor wall playing my video lesson series (flight basics, obstacle sensing and altitude, AprilTag recognition), with a small drone hovering and locking onto a floating AprilTag
* copy: *Flight scripts and a video lesson series on the HighGreat Hula Python SDK.*
* tags: PYHULA · APRILTAG

**Making BUILD readable — the three-part framework.**
Inside BUILD, make my working method spatial. Three large, architectural light frames (portals) that the camera passes through in sequence, each with a short HTML overlay:

1. **Start with the lesson.** Every build began as a teaching problem, not a tech idea.
2. **Build what's missing.** When the right tool does not exist, I write it, from scratch.
3. **Make the failure visible.** The best builds let a class watch the wrong answer fail: 107 collisions, a robot spinning on the spot.

Left side reveals frame 1, forward movement reveals frame 2, then a rising reveal brings frame 3.

**Real content in BUILD:**

* screen recordings of Swarm, ASCII City and Bench, playing on floating screens (record them from the live builds)
* photos and video of the LEGO plotter, the landing detection rig and the Hula lessons (I will supply these)
* clicking any screen opens a full-size modal with the video or a live iframe of the project

Use short headline language, not paragraphs. Readable detail lives in HTML overlays tied to content moments.

**Exit:** the camera flies through the **U** of BUILD, which becomes a bracket-shaped gateway into SOLVE.

---

### SCENE 6: SOLVE WORLD — custom briefs

Giant word: **SOLVE**

From section **06 / CUSTOM PROJECTS**: *Briefs I have been handed, and built. Schools rarely ask for a subject. They ask for an outcome.*

**Visual concept: a constellation of briefs.**

* twelve brief "cards" float in a slow orbit in a wide dark space, like a constellation
* from a distance, each shows only its number and title in large type
* as the camera drifts through the constellation (gentle curve, not a straight line), the nearest card turns to face the camera and expands to show its one-line outcome
* on hover or tap, a card opens fully (HTML panel)

| # | Brief | Outcome line |
|---|---|---|
| 01 | AI literacy | What a model is, what it is not, where the data came from, and where a human still has to decide. Runs from kindergarten up without a single equation. |
| 02 | Digital citizenship | Footprint, consent, sources and tone, taught through cases students recognise from their own feeds. |
| 03 | Computational thinking | Decomposition, pattern, abstraction and algorithm, practised unplugged before anyone touches a keyboard. |
| 04 | Robotics pathway | One ladder from a floor turtle in Year 1 to an autonomous line follower and a full competition season. |
| 05 | Data literacy | Collect it, clean it, chart it, then argue with it. Spreadsheets as an instrument rather than a subject. |
| 06 | Cyber safety | Passwords, phishing, permissions, and the quiet social engineering that gets past all three. |
| 07 | Physical computing | Sensors, actuators, and the moment a student realises code can move something in the room. |
| 08 | Creative coding | Generative art, sound and animation, for students who would never call themselves programmers. |
| 09 | Sustainability tech | Sensing a real environment, logging it over weeks, then proposing something defensible from the data. |
| 10 | Assistive technology | Designing for one person with one need, which turns out to be the fastest route to empathy in engineering. |
| 11 | Game design | Rules, feedback loops, balance and playtesting, shipped to classmates who will be honest. |
| 12 | Maker lab setup | The unglamorous half: kit lists, storage, consumables, rotation, safety and a timetable that fits. |

Give three briefs a special mini-environment, as the camera's "close flybys":

* **AI literacy** — a simple neural-net-like web of nodes where one node is marked with a human silhouette: *where a human still has to decide*
* **Robotics pathway** — a literal ladder of light rising upward, from a floor turtle at the bottom to a line follower and a competition trophy at the top. The camera rides up it
* **Maker lab setup** — the brief card opens into a doorway, and that doorway is the entrance to LAB

---

### SCENE 7: LAB WORLD — the hardware

Giant word: **LAB**

From section **08 / STACK**: *What I work in. Hardware on the bench, code in the browser, frameworks on the wall.*

This is a reward chapter: the visitor walks into the most impressive education lab they have ever seen. It also proves my title, Manager of **Lab** Learning & Operations.

**Visual concept: a dark gallery of illuminated plinths.**
Each technology category is a "bay" the camera glides past, left and right, like a museum of the future. Each product sits on a plinth as a clean silhouette or simple low-poly model, lit from below with a thin amber ring, with its name as a small label. Hero items get a slow turntable rotation.

* **Robotics** — Unitree G1 EDU Ultimate C (the humanoid is the hero object of the whole room: life-size, standing, catches the light last), Unitree Go2-W, Booster K1, Robosen K1, myBuddy 280, myController S570, uKit Advanced, VinciBot, Ozobot Ari, Magician Go, LEGO SPIKE Prime, Sphero BOLT+, fischertechnik, pi-top
* **AI and machine learning** — Teachable Machine, TensorFlow Lite, OpenCV, ROS 2 (shown as floating holographic screens, not plinths)
* **Drones and aviation** — CoDrone EDU, HighGreat Hula, Boeing flight simulator (drones hover above their plinths)
* **Extended reality** — Meta Quest 3S, Omni One, MergeCube
* **Design technology** — Bambu P1 Series, Bambu P2S, Infento Pro Kit 2
* **Mobility and motorsport** — F1 Race System Halo, EduKart, Automobile simulation models, Founder Edition bike
* **Emerging technology** — Gemini Mini, Epoc X EEG, Werkstation 10

Rules for LAB:

* do not model every item in detail. Use 2–4 hero models (humanoid, quadruped, drone, 3D printer) and represent the rest as instanced plinths with a product photo card or a clean silhouette
* use real product photos where I supply them; do not use manufacturer logos or branding beyond the product name as plain text
* the full list is also available as a clean, accessible HTML list (screen readers and mobile)

**Exit:** the camera rises up and out of the lab ceiling into open space, where the numbers are waiting.

---

### SCENE 8: SCALE WORLD — proof and momentum

Giant word: **SCALE**

This world is energetic, outward and proof-driven. Things are no longer being designed. They are happening, at scale.

From section **07 / SCALE**, the numbers become **monumental architecture**, not tiny stats. Each number is a huge extruded 3D object the camera flies between and around, counting up as it is approached:

* **15** grade levels, KG to 13
* **12** years in education
* **6** competition programmes run
* **4** countries reached
* **4** languages taught in
* **3** publishers authored for

Around the numbers, the proof:

* **FIRST LEGO League** — official partnership for the UAE, Qatar and Kuwait, shown as a large monolith
* **Sunmarke School · Fortes Education** — current role
* **Countries** — UAE, GCC, Singapore, India, lighting up as points on a dark, minimal globe that slowly turns beneath the numbers
* **Competition season gallery** — photos from competition programmes, flying past in layered ribbons at different depths (I will supply)
* **Classroom and lab gallery** — students building, teacher training sessions, lab setups (I will supply)

**Testimonials as monoliths.** Tall black quote monoliths stand in the space. From a distance, each shows the strongest short line in large type. Up close, the name, role and organisation appear. My current site has no testimonials, so build the component with clearly marked placeholder slots and **do not invent quotes, names or organisations**. I will supply real ones from colleagues, school leaders, partners and LinkedIn recommendations. If none are supplied at launch, the monoliths are omitted, not faked.

Short, very bold lines can fly through this world (all true to my work):

* Kindergarten to university
* Four countries
* Classrooms and screens
* Written. Taught. Built.
* The lesson came first.

Motion in SCALE is slightly faster and more energetic than in TEACH or WRITE. This world feels like momentum.

Then the world starts converging.

---

### SCENE 9: FINAL CONVERGENCE

As the visitor finishes SCALE, everything they have passed starts flying back toward one point: the drones, ASCII glyphs, book pages, brief cards, lab silhouettes, the numbers, the route line.

The drones from Swarm do the final trick: all ~1,000 of them fly in and spell

**ABDUL SAMADH**

in one bold, glowing composition, while the other objects settle into an orbit around it.

This is the emotional payoff.

Then the camera pulls back slightly and the final call to action fades in (HTML overlay):

* headline (from my current site): **Let's build something students remember.**
* subline: *Curriculum, competitions, teacher training, or a simulator that does not exist yet.*
* primary CTA: **Connect on LinkedIn** → https://www.linkedin.com/in/abdul-samadh-stream-ai-specialist/
* secondary CTA: **Open a terminal** → opens my terminal overlay
* optional third CTA (if I supply the files): **Download CV**
* footer line: `learning never stops` · `ABDUL SAMADH · DUBAI, UAE · 2026`

The final section should feel powerful, clean, and confident.

---

## THE TERMINAL (keep it, upgrade it)

My current site has a working terminal (`abdul@dubai:~$`) with commands like `about`, `builds`, `projects`, `contact`. Keep it. In the new site:

* it opens as an HTML overlay from the HUD `>_` button, the final CTA, or by pressing `` ` ``
* commands **move the camera**: `cd teach`, `cd write`, `cd build`, `cd solve`, `cd lab`, `cd scale` fly the camera (via the master timeline) to that chapter
* `ls` lists the chapters, `about` prints my one-line story, `builds` lists the six builds with links, `contact` prints LinkedIn, `help` lists commands, `clear` clears
* this doubles as keyboard-first navigation and a fast route for recruiters who just want the facts

---

## HOW CONTENT SHOULD BE DISPLAYED

This is critical.
Do not present everything as flat blocks.
Different content types behave differently.

**Live projects (Swarm, ASCII City)**
Show them as working mini-environments in the world first, with a recorded loop on a floating screen as a fallback, and a link or modal iframe to the real live build.

**Testimonials**
Large spatial quote monoliths. Strongest short line from a distance; name, role and organisation up close. Interactive on hover or click. Real quotes only.

**Image galleries** (classroom, lab, competitions, book spreads)
Display as:
* layered floating ribbons
* moving walls
* staggered panels at different depths
* tunnels (for competition seasons)

No basic grids, except as the mobile / reduced-motion fallback.

**Videos** (Hula lesson series, build recordings, training sessions)
On floating screens or large spatial monitors, embedded inside the world. Click to expand into a modal player.

**Stats and proof**
Monumental number objects and environmental text: **15 · 12 · 6 · 4 · 4 · 3**. Architecture, not stat cards.

**Framework and explanation copy**
Concise overlay copy blocks that appear at the right moment and leave when the camera moves on.
All long-form readable copy is accessible HTML, never tiny 3D text.

---

## INFORMATION ARCHITECTURE

The full story the site must communicate, in order:

1. I am an educator: twelve years, KG to university, four countries, three languages
2. I design learning systems end to end: from scope and sequence down to the worksheet
3. I author books for whole-school adoption, across six types of material
4. When the right tool does not exist, I build it, and the software is real and live
5. Schools hand me outcomes, and I turn them into curriculum: twelve briefs and counting
6. I run labs full of serious hardware and know how to teach with all of it
7. This has happened at scale, with real partners: FIRST LEGO League, Sunmarke / Fortes Education, publishers in multiple countries
8. You can work with me now

The visitor should leave thinking:

> **"Abdul writes the curriculum, trains the teachers, runs the lab, and builds the software when it doesn't exist. We need Abdul on this."**

---

## MOTION SYSTEM

This experience must feel like one connected motion system.

* one master scroll timeline; scroll maps to timeline progress (0 → 1)
* the `DEPTH` counter in the HUD is driven by that same progress
* forward scroll moves forward through the world; back scroll reverses naturally
* movement is heavy, cinematic, and intentional
* no twitchy motion, minimal spinning
* most motion is forward, with carefully timed lateral and vertical reveals

Use moments of:

* slow anticipation (the black room, the laptop opening)
* accelerated portal travel (into the screen; between chapters)
* controlled drift (TEACH, WRITE)
* close flybys (BUILD exhibits, SOLVE briefs)
* reveal turns (LAB bays)
* rising motion (Swarm sky, Robotics ladder, leaving LAB)
* converging motion (final)

Approximate scroll budget (tune later):

| Scene | Share of timeline |
|---|---|
| Black room + laptop portal | 10% |
| TEACH (incl. route) | 14% |
| WRITE | 10% |
| BUILD | 24% |
| SOLVE | 12% |
| LAB | 12% |
| SCALE | 10% |
| Convergence + CTA | 8% |

The camera is the main character.

---

## TECHNOLOGY

Build with:

* Next.js (App Router, static export so it can still deploy to GitHub Pages)
* React
* React Three Fiber
* Three.js (with drei helpers)
* GSAP ScrollTrigger
* Lenis (smooth scroll, wired into the GSAP ticker)

Architecture:

* one continuous experience, one main WebGL canvas, fixed full-screen
* a tall scroll spacer drives a single GSAP master timeline
* camera path defined as a CatmullRom curve (position) plus a separate look-at curve, sampled by timeline progress, with per-chapter easing
* HTML overlays positioned in a fixed layer above the canvas, shown and hidden by timeline progress
* all content (copy, projects, briefs, hardware, stats, routes) lives in typed data files (`content/*.ts`), not hard-coded in components, so I can edit it without touching 3D code

Reusable components:

* `<AnchorWord>` — giant 3D chapter typography, with a configurable fly-through letter
* `<PortalFrame>` — the light-frame gateways
* `<RouteLine>` + `<Waypoint>` — the career map
* `<BookObject>` — WRITE books with page-turn
* `<BuildExhibit>` — wrapper for each software environment
* `<DroneSwarm>` — instanced drones that can target any text (used in BUILD and the finale)
* `<GlyphField>` — ASCII glyph particles (portal, ASCII City, portrait decode)
* `<BriefCard>` / `<BriefConstellation>`
* `<Plinth>` / `<LabBay>`
* `<StatMonument>`
* `<TestimonialMonolith>`
* `<VideoScreen>` (with modal)
* `<GalleryRibbon>`
* `<OverlayPanel>` and `<CTAOverlay>`
* `<HUD>` and `<Terminal>`

Create separate camera tuning values (path points, FOV, offsets) for desktop and mobile.

**Note on "HAND BUILT · NO FRAMEWORKS":** my current footer says this, and the BUILD copy says *None of them use a framework*. That is still true of the six builds, so keep that line on the BUILD projects. Replace the site footer line with **HAND BUILT · EVERY WORLD DESIGNED, NOT TEMPLATED** (or similar), since the portfolio itself will now use a framework.

---

## PERFORMANCE

Keep performance high. It must feel premium and smooth.

* optimise models (Draco/Meshopt-compressed GLB, low-poly hero models only)
* optimise textures (KTX2 / WebP, power-of-two, capped sizes)
* lazy load each chapter's assets just before the camera reaches it
* instance everything repeated: drones, glyphs, book spines, plinths, brief cards
* text with troika / SDF, not geometry, except the six giant anchor words
* minimal post-processing: subtle bloom on the amber only, light vignette, optional film grain. No heavy depth of field
* adaptive quality: lower DPR and particle counts automatically when frame rate drops
* reduce density on mobile (e.g. 300 drones instead of 1,000)
* preserve the narrative even in simplified versions
* **respect `prefers-reduced-motion`**: replace camera flights with gentle crossfades between chapter stills, keep all content and the terminal

---

## MOBILE APPROACH

Mobile preserves the same story with simpler density and a simpler camera path.

Keep:

* boot (shorter)
* black room
* laptop portal
* TEACH (with the route)
* WRITE
* BUILD
* SOLVE
* LAB
* SCALE
* convergence and CTA

Reduce:

* object counts (fewer drones, glyphs, plinths; LAB shows hero objects plus a scrollable list)
* lateral camera movement (mostly forward and vertical on a portrait screen)
* SOLVE constellation becomes a vertical stream of brief cards the camera descends through

Use mobile-specific camera positions. All HTML overlays must be readable at phone width with a 16px side gutter.

---

## DESIGN LANGUAGE

Visual language should feel:

* Apple-level clean
* high end
* futuristic
* editorial
* immersive
* premium
* minimal but powerful

It carries over the identity of my current site: a dark CRT terminal, amber phosphor, monospaced readouts, ASCII art.

**Base palette (from my current site):**

* background: near-black `#100D0B`
* secondary background: `#19130F`
* ink (primary text): warm off-white `#F6EDE2`
* mist (secondary text): `#A99787`
* accent: amber `#FF9D2E` — the one neon colour. Glow sparingly
* edges: `rgba(255,224,189,.13)` / `.26`

**Theme toggle (keep the three modes from my current site, now as world lighting moods):**

* **Amber (default)** — dark room, amber neon
* **Phosphor** — the "ascii" mode: `#03120A` background, `#8BFF9B` green phosphor accent. The whole world re-lights green
* **Paper** — light mode: `#EFE9DF` background, `#1A1510` ink, `#B2560A` accent. The black room becomes a warm white gallery. This is the accessible, high-contrast option

**Type (from my current site):**

* display: **Space Grotesk** (anchor words, headlines)
* mono: **IBM Plex Mono** (labels, HUD, tags, body detail)
* CRT: **VT323** (boot, terminal, laptop screen only)

**Rules:**

* glow only on amber, and only on edges, active elements, and the portal
* atmospheric haze sparingly
* subtle CRT scanlines only on screens and the terminal, never across the whole site
* avoid cheap neon overload
* avoid generic floating glass UI spam
* avoid gaming aesthetics (no HUD clutter, no sci-fi crosshairs except the landing-detection reticle, which is part of the project)
* everything should feel intentional and elegant

---

## ASSETS

### Real assets (priority)

Prioritise real material over generated material everywhere.

Available now:

* `assets/portrait.jpg` — my portrait (560×626), used in TEACH and the decode effect
* live builds to screen-record: https://abdusamadh.github.io/DroneShow/ and https://abdusamadh.github.io/ASCII-City/
* all copy, project data and hardware lists in `reference/original-index.html`

I will supply (build with marked placeholder slots until then):

* [ ] screen recordings of Bench
* [ ] photos / video of the LEGO pen plotter drawing
* [ ] photos / video of the landing surface detection rig
* [ ] Hula drone SDK lesson videos
* [ ] book covers and interior spreads (all six types)
* [ ] FIRST LEGO League season photos (UAE, Qatar, Kuwait)
* [ ] lab photos from Sunmarke School
* [ ] teacher training session photos
* [ ] student project photos (with consent; no identifiable children without permission)
* [ ] product photos for LAB hero items
* [ ] testimonials (quote, name, role, organisation, permission to publish)
* [ ] CV as PDF

**Never fabricate** testimonials, names, logos, partner organisations, numbers, or project screenshots.

### Generated assets (supporting only)

Use **Higgsfield** and **Seedance** to generate supporting visual assets for the world. Use them for:

* ambient cinematic loops
* abstract concept visuals
* spatial screen content
* background moving textures
* premium motion assets
* transition screens
* gallery support content

Do not use generated assets as the whole website. They support the real content, never replace it. Never generate imagery that looks like a real classroom, a real student, a real colleague, or a real event and present it as real.

**Style direction for every generated asset:**

* cinematic
* premium
* minimal
* clean
* depth-rich
* near-black with a single amber `#FF9D2E` accent (phosphor green variants for the alternate theme)
* spatial
* polished
* not cheesy
* not over-designed
* no text baked in (all text is rendered live)

**Asset categories to generate:**

1. **Portal tunnel loop** — horizontal amber scanlines stretching into a deep tunnel, ASCII glyphs streaming toward camera, black background (Scene 2)
2. **Chalk-line classroom** — abstract wireframe classroom drawn in thin amber light lines, floating in black space (TEACH)
3. **Dark globe route** — minimal black globe with a thin amber route line connecting India, Singapore and the UAE (TEACH / SCALE)
4. **Infinite library** — towering black shelves with thin amber edges receding into darkness (WRITE background)
5. **Pages to pixels** — book pages dissolving into glowing square pixels (WRITE → BUILD transition)
6. **Drone sky** — night sky with hundreds of tiny amber drone lights, slow drift, no formation (BUILD ambient)
7. **Engine-room monitors** — abstract code and robot telemetry graphs for background monitors (BUILD)
8. **Constellation field** — slow-rotating star field with faint connecting lines (SOLVE background)
9. **Dark lab gallery** — empty black museum with amber-lit plinths, haze, reflective floor (LAB backdrop / poster image)
10. **Kinetic momentum** — amber light streaks and particles rushing outward (SCALE background)
11. **Convergence burst** — particles collapsing to a single bright point, then calm (final)

---

## DEVELOPMENT PHASES

**Phase 1** — Shell: Next.js app, single canvas, Lenis + GSAP master timeline, camera path system, HUD with DEPTH/SECTOR, content data files, theme system.

**Phase 2** — Boot, black room, and laptop portal.

**Phase 3** — TEACH world: anchor word, classroom wireframe, WHO panels, portrait decode, career route with five waypoints.

**Phase 4** — WRITE world: library, six books, scope-and-sequence arc.

**Phase 5** — BUILD world: six exhibits (Swarm and ASCII City interactive first), three-frame method, video screens with modal.

**Phase 6** — SOLVE world: twelve-brief constellation, three close flybys.

**Phase 7** — LAB world: bays, plinths, hero models, accessible list.

**Phase 8** — SCALE world: stat monuments, FLL monolith, globe, gallery ribbons, testimonial monoliths (placeholder-safe).

**Phase 9** — Convergence (drones spell ABDUL SAMADH), CTA, terminal with camera navigation.

**Phase 10** — Integrate supplied real content: recordings, photos, books, testimonials.

**Phase 11** — Performance, mobile, reduced motion, accessibility (keyboard nav, focus states, screen-reader flow of all content, alt text), SEO (meta description from current site, Open Graph image from the black room).

---

## IMPORTANT CREATIVE RULES

* This must feel like one connected 3D world
* Every chapter transitions fluidly into the next, through its own giant word
* The visitor should feel like they are travelling, not browsing
* Information is staged, not dumped
* Visually insane, but still understandable in one pass
* Motion reveals the story
* The builds should be **experienced**, not described: the drones fly, the city rains, the robot spins
* Use movement in all directions when appropriate: left, right, up, down, forward, through, around
* Keep my voice: plain, precise, a little dry, first person, no buzzwords. Reuse my existing copy wherever possible; it is already written the way I speak
* Everything works together as one system
* Bold, original, cinematic, and built to get me hired

---

## FINAL GOAL

Create a portfolio that makes someone instantly understand:

> **"This person designs the curriculum, writes the books, trains the teachers, runs the lab, and builds the software when it doesn't exist — and has done it for twelve years across four countries."**

This should be one of the most visually impressive educator portfolios anywhere, while still clearly telling my story and getting someone to click **Connect**.

Make it feel like falling into a terminal and finding a whole world of learning inside it.
Make it beautiful.
Make it immersive.
Make it unforgettable.
Make it badass.
