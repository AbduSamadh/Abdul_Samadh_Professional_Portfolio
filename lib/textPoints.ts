'use client';

/**
 * Sample N points that fill the shape of some text, in world units centred on the origin.
 * Lines are stacked top to bottom. Used to give the drones their formation targets.
 */
export function textPoints(lines: string[], count: number, width: number): Float32Array {
  const W = 900;
  const lineH = 210;
  const H = lineH * lines.length + 40;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // Fit the longest line to the canvas width.
  let size = 200;
  g.font = `700 ${size}px "Space Mono", system-ui, sans-serif`;
  const longest = Math.max(...lines.map((l) => g.measureText(l).width));
  size = Math.min(size, (size * (W - 40)) / longest);
  g.font = `700 ${size}px "Space Mono", system-ui, sans-serif`;
  lines.forEach((l, i) => g.fillText(l, W / 2, 20 + lineH * (i + 0.5)));
  const data = g.getImageData(0, 0, W, H).data;

  const filled: number[] = [];
  const step = 3;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }
  const out = new Float32Array(count * 3);
  const n = filled.length / 2;
  const scale = width / W;
  for (let i = 0; i < count; i++) {
    // Even spread over the filled pixels, with a little jitter so the grid does not show.
    const k = n ? Math.floor((i / count) * n + Math.random() * (n / count)) % n : 0;
    const x = n ? filled[k * 2] : W / 2;
    const y = n ? filled[k * 2 + 1] : H / 2;
    out[i * 3] = (x - W / 2) * scale + (Math.random() - 0.5) * scale * step;
    out[i * 3 + 1] = -(y - H / 2) * scale + (Math.random() - 0.5) * scale * step;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
  }
  return out;
}

/** Collision-free-ish assignment: pair starts and targets in the same sweep order, so paths rarely cross. */
export function orderedAssignment(starts: Float32Array, targets: Float32Array, count: number) {
  const key = (a: Float32Array, i: number) => a[i * 3] * 1.0 + a[i * 3 + 1] * 0.001;
  const si = [...Array(count).keys()].sort((a, b) => key(starts, a) - key(starts, b));
  const ti = [...Array(count).keys()].sort((a, b) => key(targets, a) - key(targets, b));
  const map = new Int32Array(count);
  for (let k = 0; k < count; k++) map[si[k]] = ti[k];
  return map;
}

export function randomAssignment(count: number) {
  const map = new Int32Array(count);
  const idx = [...Array(count).keys()];
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  for (let i = 0; i < count; i++) map[i] = idx[i];
  return map;
}
