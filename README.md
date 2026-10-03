# Abdul Samadh — immersive 3D portfolio

One continuous, scroll-driven camera journey. It starts in a black room with a desk and a laptop,
drops through the laptop screen and travels through six worlds, each ending in a giant word the
camera flies through:

**TEACH → WRITE → BUILD → SOLVE → LAB → SCALE → ABDUL SAMADH**

| World | What it shows |
| --- | --- |
| Room + portal | Boot screen, the black room, the laptop opening and booting `./descend`, a fall through a tunnel of glyphs |
| TEACH | Who, abstract, the "size of the thing I get handed" fragments, the portrait decoding from ASCII, the career route (India → Singapore → UAE → now) with the FIRST LEGO League moment |
| WRITE | An infinite library ordered KG–13, six authored book types that open as you pass, the scope-and-sequence arc overhead |
| BUILD | Three method frames, and each build as a working mini-world: Swarm (1,000 drones, with a collision-free / random toggle), ASCII City (traffic, signals, weather), Bench, the LEGO pen plotter drawing the portrait, landing detection, the Hula lesson wall |
| SOLVE | The twelve briefs as a constellation, a flyby of AI literacy and a climb up the robotics ladder |
| LAB | The full hardware stack as a gallery of lit plinths, with the humanoid at the end |
| SCALE | The numbers as monuments, a globe with the route, the FIRST LEGO League monolith |
| Finale | Everything converges and the drones spell the name. Contact call to action |

The terminal from the original site is still there (press <kbd>`</kbd> or the `>_` button). `cd build`, `cd lab` and so on fly the camera there.

## Stack

Next.js (static export) · React · React Three Fiber · three.js · drei · GSAP ScrollTrigger · Lenis · postprocessing.
Fonts (Space Grotesk, IBM Plex Mono, VT323) are self-hosted. Nothing is loaded from a third-party CDN.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.
In the repository settings, set **Pages → Source** to **GitHub Actions** once.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo-name>`. For a custom domain or a `<user>.github.io`
repository, set it to an empty string.

## Editing content

All copy lives in `content/`, taken from the original site (`reference/original-index.html`).

- `content/site.ts`: every line of text, the route, books, builds, briefs, hardware and stats
- `content/testimonials.ts`: empty on purpose. Add real quotes (with permission) and the
  testimonial monoliths and overlay appear automatically. Nothing is shown while it is empty
- `person.cv` in `content/site.ts`: set to a PDF path in `public/assets/` to show a **Download CV** button

## Tuning the journey

`lib/path.ts` is the single source of truth for the camera:

- `DESKTOP` is the list of shots. `p` is when (0–1 of the scroll), `pos` / `look` are where.
  The GSAP master timeline tweens between shots with each shot's `ease`
- `W` holds the world anchors that the scene components are laid out against
- `GATES` are the giant words and which letter the camera flies through
- `SCROLL_VH` is the total scroll length
- Mobile uses the same shots, pulled toward the centre line (`MOBILE_LX`) with a wider lens

The readable HTML overlays live in `components/dom/Overlays.tsx`. Their timing windows come from the
same shot names, so if you move a shot, its copy moves with it.

## Real assets to add

Placeholders are built so these can drop in without layout changes:

- [ ] Screen recordings of Swarm, ASCII City and Bench
- [ ] Photos or video of the LEGO pen plotter, the landing-detection rig and the Hula lessons
- [ ] Book covers and spreads (the covers in WRITE are typographic placeholders: `drawCover` in `components/canvas/worlds/Write.tsx`)
- [ ] FIRST LEGO League season, lab and teacher-training photos
- [ ] Product photos for the LAB hero items
- [ ] Testimonials (`content/testimonials.ts`)
- [ ] CV as PDF

## Accessibility and performance

- All readable copy is real HTML (also good for search). The numbers in SCALE have a screen-reader list
- `prefers-reduced-motion`: no smooth scrolling, no boot animation, and the camera cuts between resting shots behind a short fade instead of flying
- Keyboard: skip link to contact, chapter rail, terminal, focus-managed modals
- Repeated objects are instanced (drones, glyphs, book spines, plinths), worlds only render near the camera, resolution adapts to frame rate, and phones get fewer objects and lighter post-processing
- Three themes from the original site: Amber (default), Phosphor and Paper

## Layout

```
app/                 Next.js entry, global styles and theme tokens
components/
  Experience.tsx     the root: canvas, overlays, HUD, terminal, boot
  ScrollSystem.tsx   Lenis + GSAP ScrollTrigger master timeline
  canvas/            the WebGL world (Scene, CameraRig, worlds/, parts/)
  dom/               HTML layers: overlays, HUD, terminal, modal, boot
content/             all the words
lib/                 camera path, shared state, theme, materials, glyph renderer
public/fonts         self-hosted fonts + the 3D typeface (npm run fonts regenerates it)
reference/           the original single-file site
REDESIGN_PROMPT.md   the creative brief this was built from
```
