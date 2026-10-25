/**
 * Verschiebungskarte für den „Liquid Glass“-Effekt: Am Rand einer abgerundeten Fläche wird der
 * Hintergrund wie durch eine gewölbte Glaskante nach innen gebrochen, in der Mitte bleibt er klar.
 *
 * Kodierung für feDisplacementMap: Rot = Verschiebung in x, Grün = Verschiebung in y (128 = keine).
 */
export function createDisplacementMap(
  doc: Document,
  width: number,
  height: number,
  radius: number,
  bezel: number,
): string {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const r = Math.min(radius, w / 2, h / 2);
  const canvas = doc.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(w, h);
  const px = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Abstand zum inneren Rechteck (Fläche ohne Rundung) → Richtung und Tiefe der Kante
      const cx = x + 0.5;
      const cy = y + 0.5;
      const vx = cx - Math.min(Math.max(cx, r), w - r);
      const vy = cy - Math.min(Math.max(cy, r), h - r);
      const len = Math.hypot(vx, vy);
      const edge = r - len; // Abstand zum Rand, innen positiv
      let dx = 0;
      let dy = 0;
      if (edge > 0 && edge < bezel && len > 0) {
        const t = 1 - edge / bezel; // 1 direkt am Rand, 0 am Ende der Glaskante
        const m = t * t * (3 - 2 * t); // weicher Verlauf wie eine gewölbte Kante
        dx = (-vx / len) * m;
        dy = (-vy / len) * m;
      }
      const i = (y * w + x) * 4;
      px[i] = 128 + dx * 127;
      px[i + 1] = 128 + dy * 127;
      px[i + 2] = 128;
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/** Nur Chromium kann SVG-Filter als backdrop-filter anwenden; alle anderen bekommen Milchglas. */
export function supportsRefraction(win: Window): boolean {
  return /Chrome\/\d+/.test(win.navigator.userAgent);
}
