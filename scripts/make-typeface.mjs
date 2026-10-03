// Converts Space Grotesk Bold into three.js typeface JSON for the extruded anchor words,
// and records a "through point" per letter: the spot the camera flies through.
// Run with: npm run fonts
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = path.join(root, 'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff');
const out = path.join(root, 'public/fonts/space-grotesk-700.typeface.json');

const buf = fs.readFileSync(src);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const scale = 1000 / font.unitsPerEm;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+ ';

const BANDS = { A: [0.12, 0.3], R: [0.55, 0.92], U: [0.3, 0.95] };
const r = (n) => Math.round(n * scale);
const glyphs = {};
const through = {};

for (const ch of chars) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, font.unitsPerEm);
  let o = '';
  for (const c of p.commands) {
    // opentype paths are y-down here; typeface JSON is y-up.
    switch (c.type) {
      case 'M': o += `m ${r(c.x)} ${r(-c.y)} `; break;
      case 'L': o += `l ${r(c.x)} ${r(-c.y)} `; break;
      case 'Q': o += `q ${r(c.x)} ${r(-c.y)} ${r(c.x1)} ${r(-c.y1)} `; break;
      case 'C': o += `b ${r(c.x)} ${r(-c.y)} ${r(c.x1)} ${r(-c.y1)} ${r(c.x2)} ${r(-c.y2)} `; break;
    }
  }
  const bb = g.getBoundingBox();
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.trim() };
  if (ch !== ' ') through[ch] = findThrough(g);
}

// Rasterise the glyph and find the roomiest empty point that has ink on both sides of it.
function findThrough(g) {
  const N = 200;
  const capH = font.tables.os2.sCapHeight || font.ascender * 0.7;
  const bb = g.getBoundingBox();
  const w = bb.x2 - bb.x1, h = capH;
  const s = N / Math.max(w, h);
  const W = Math.ceil(w * s) + 2, H = Math.ceil(h * s) + 2;
  const polys = flatten(g.getPath(0, 0, font.unitsPerEm).commands);
  const ink = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    const y = (j + 0.5) / s; // font units, y-up from baseline
    for (let i = 0; i < W; i++) {
      const x = bb.x1 + (i + 0.5) / s;
      let wn = 0;
      for (const poly of polys) wn += winding(poly, x, y);
      ink[j * W + i] = wn !== 0 ? 1 : 0;
    }
  }
  let best = null;
  for (let j = 1; j < H - 1; j++) {
    for (let i = 1; i < W - 1; i++) {
      if (ink[j * W + i]) continue;
      let left = false, right = false;
      for (let k = i; k >= 0; k--) if (ink[j * W + k]) { left = true; break; }
      for (let k = i; k < W; k++) if (ink[j * W + k]) { right = true; break; }
      if (!left || !right) continue;
      let d = Infinity;
      for (let jj = 0; jj < H; jj++) for (let ii = 0; ii < W; ii++) {
        if (!ink[jj * W + ii]) continue;
        const dd = (ii - i) ** 2 + (jj - j) ** 2;
        if (dd < d) d = dd;
      }
      // Keep to the band the camera should fly through (e.g. the bowl of an R, not its legs).
      const yy = j / H;
      const [lo, hi] = BANDS[g.name] || BANDS[String.fromCharCode(g.unicode)] || [0.14, 0.95];
      if (yy < lo || yy > hi) continue;
      d -= Math.abs(i - W / 2) * 1e-3; // break ties toward the middle of the letter
      if (!best || d > best.d) best = { d, i, j };
    }
  }
  if (!best) return null;
  return {
    x: r(bb.x1 + (best.i + 0.5) / s),
    y: r((best.j + 0.5) / s),
    radius: r(Math.sqrt(best.d) / s),
  };
}

function flatten(cmds) {
  const polys = [];
  let cur = [], px = 0, py = 0;
  for (const c of cmds) {
    if (c.type === 'M') { if (cur.length) polys.push(cur); cur = [[c.x, -c.y]]; px = c.x; py = c.y; }
    else if (c.type === 'L') { cur.push([c.x, -c.y]); px = c.x; py = c.y; }
    else if (c.type === 'Q') {
      for (let t = 0.1; t <= 1.001; t += 0.1) {
        const a = (1 - t) ** 2, b = 2 * (1 - t) * t, d = t * t;
        cur.push([a * px + b * c.x1 + d * c.x, -(a * py + b * c.y1 + d * c.y)]);
      }
      px = c.x; py = c.y;
    } else if (c.type === 'C') {
      for (let t = 0.1; t <= 1.001; t += 0.1) {
        const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, e = 3 * (1 - t) * t * t, d = t ** 3;
        cur.push([a * px + b * c.x1 + e * c.x2 + d * c.x, -(a * py + b * c.y1 + e * c.y2 + d * c.y)]);
      }
      px = c.x; py = c.y;
    } else if (c.type === 'Z') { if (cur.length) polys.push(cur); cur = []; }
  }
  if (cur.length) polys.push(cur);
  return polys;
}

function winding(poly, x, y) {
  let wn = 0;
  for (let k = 0; k < poly.length; k++) {
    const [x1, y1] = poly[k], [x2, y2] = poly[(k + 1) % poly.length];
    if (y1 <= y) { if (y2 > y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) > 0) wn++; }
    else if (y2 <= y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) < 0) wn--;
  }
  return wn;
}

const json = {
  glyphs,
  familyName: 'Space Grotesk',
  ascender: r(font.ascender),
  descender: r(font.descender),
  capHeight: r(font.tables.os2.sCapHeight || font.ascender * 0.7),
  underlinePosition: r(font.tables.post.underlinePosition),
  underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { xMin: r(font.tables.head.xMin), yMin: r(font.tables.head.yMin), xMax: r(font.tables.head.xMax), yMax: r(font.tables.head.yMax) },
  resolution: 1000,
  original_font_information: { format: 0, fontFamily: 'Space Grotesk', fontSubfamily: 'Bold' },
  through,
};
fs.writeFileSync(out, JSON.stringify(json));
console.log('wrote', path.relative(root, out), Object.keys(glyphs).length, 'glyphs');
for (const ch of 'AUORS') console.log(ch, JSON.stringify(through[ch]));
