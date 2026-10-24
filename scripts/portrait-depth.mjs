// Erzeugt die Tiefenkarte für den 3D-Kopf aus public/images/portrait.webp – lokal mit der KI
// „Depth Anything V2“ (das Foto verlässt den Rechner nicht; nur das Modell wird einmalig geladen).
//
// Einmalig installieren (groß, deshalb nicht fest im Projekt):
//   npm install --no-save @huggingface/transformers@4.3.1
// Dann:
//   npm run portrait-depth            → public/images/portrait-depth.png
//   npm run portrait-depth -- out.png → in eine andere Datei
//
// Ausgabe: 400 px breit, 16 Bit in Rot (oberes Byte) und Grün (unteres Byte), hell = nah.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(root, 'public/images/portrait-depth.png');
const PORTRAIT = join(root, 'public/images/portrait.webp');

let transformers;
try {
  transformers = await import('@huggingface/transformers');
} catch {
  console.error('Bitte zuerst installieren: npm install --no-save @huggingface/transformers@4.3.1');
  process.exit(1);
}
const { pipeline, RawImage, env } = transformers;
env.cacheDir = join(root, 'node_modules/.cache/depth-model');

// Porträt auf neutralem Grau (das Modell braucht ein volles Bild)
const meta = await sharp(PORTRAIT).metadata();
const flat = await sharp(PORTRAIT).flatten({ background: '#9a948c' }).png().toBuffer();
const tmp = join(root, 'node_modules/.cache/portrait-flat.png');
writeFileSync(tmp, flat);

console.log('Tiefenschätzung läuft (beim ersten Mal wird das Modell geladen, ~400 MB) …');
const estimator = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-base', {
  dtype: 'fp32',
});
const result = await estimator(await RawImage.read(tmp));
const t = result.predicted_depth;
const [sh, sw] = t.dims.slice(-2);
const raw = Float32Array.from(t.data);

// Auf 400 px Breite verkleinern (Box-Filter)
const W = 400,
  H = Math.round((meta.height / meta.width) * W);
const d = new Float32Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const x0 = Math.floor((x / W) * sw),
      x1 = Math.max(x0 + 1, Math.floor(((x + 1) / W) * sw));
    const y0 = Math.floor((y / H) * sh),
      y1 = Math.max(y0 + 1, Math.floor(((y + 1) / H) * sh));
    let s = 0,
      n = 0;
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) {
        s += raw[yy * sw + xx];
        n++;
      }
    d[y * W + x] = s / n;
  }
const alpha = await sharp(PORTRAIT)
  .ensureAlpha()
  .resize(W, H)
  .extractChannel('alpha')
  .raw()
  .toBuffer();

// Innerhalb der Person normalisieren
const N = W * H,
  known = new Uint8Array(N),
  inside = [];
for (let i = 0; i < N; i++)
  if (alpha[i] > 160) {
    known[i] = 1;
    inside.push(d[i]);
  }
inside.sort((a, b) => a - b);
const lo = inside[Math.floor(inside.length * 0.02)],
  hi = inside[Math.floor(inside.length * 0.995)];
const v = new Float32Array(N);
for (let i = 0; i < N; i++) v[i] = known[i] ? Math.min(1, Math.max(0, (d[i] - lo) / (hi - lo))) : 0;

// Rand um 3 px schrumpfen (Randpixel tragen oft Hintergrund-Tiefe)
for (let it = 0; it < 3; it++) {
  const drop = [];
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (known[i] && (!known[i - 1] || !known[i + 1] || !known[i - W] || !known[i + W]))
        drop.push(i);
    }
  for (const i of drop) known[i] = 0;
}

// Hintergrund weich von der Silhouette aus auffüllen (Push-Pull über eine Bildpyramide)
function pushPull(val, wt, w, h) {
  if (w <= 2 || h <= 2) return val;
  const w2 = Math.ceil(w / 2),
    h2 = Math.ceil(h / 2);
  const v2 = new Float32Array(w2 * h2),
    k2 = new Float32Array(w2 * h2);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x,
        j = (y >> 1) * w2 + (x >> 1);
      v2[j] += val[i] * wt[i];
      k2[j] += wt[i];
    }
  for (let j = 0; j < v2.length; j++) {
    if (k2[j] > 0) v2[j] /= k2[j];
    k2[j] = Math.min(1, k2[j]);
  }
  const c2 = pushPull(v2, k2, w2, h2),
    res = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const fx = Math.min(w2 - 1, Math.max(0, x / 2 - 0.25)),
        fy = Math.min(h2 - 1, Math.max(0, y / 2 - 0.25));
      const x0 = Math.floor(fx),
        y0 = Math.floor(fy),
        x1 = Math.min(w2 - 1, x0 + 1),
        y1 = Math.min(h2 - 1, y0 + 1);
      const tx = fx - x0,
        ty = fy - y0;
      const c =
        (c2[y0 * w2 + x0] * (1 - tx) + c2[y0 * w2 + x1] * tx) * (1 - ty) +
        (c2[y1 * w2 + x0] * (1 - tx) + c2[y1 * w2 + x1] * tx) * ty;
      const i = y * w + x;
      res[i] = val[i] * wt[i] + c * (1 - wt[i]);
    }
  return res;
}
const wt = Float32Array.from(known);
let f = pushPull(v, wt, W, H);

// Gauß-Weichzeichner (σ 1.8)
const sigma = 1.8,
  R = Math.ceil(sigma * 3),
  k = [];
let ks = 0;
for (let i = -R; i <= R; i++) {
  const g = Math.exp(-(i * i) / (2 * sigma * sigma));
  k.push(g);
  ks += g;
}
k.forEach((_, i) => (k[i] /= ks));
const blur = (src, horiz) => {
  const out = new Float32Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let t = -R; t <= R; t++) {
        const xx = horiz ? Math.min(W - 1, Math.max(0, x + t)) : x,
          yy = horiz ? y : Math.min(H - 1, Math.max(0, y + t));
        s += src[yy * W + xx] * k[t + R];
      }
      out[y * W + x] = s;
    }
  return out;
};
f = blur(blur(f, true), false);

// 16 Bit in Rot/Grün packen
const png = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) {
  const q = Math.round(Math.min(1, Math.max(0, f[i])) * 65535);
  png[i * 3] = q >> 8;
  png[i * 3 + 1] = q & 255;
  png[i * 3 + 2] = q >> 8;
}
await sharp(png, { raw: { width: W, height: H, channels: 3 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);
console.log('Tiefenkarte gespeichert:', OUT);
