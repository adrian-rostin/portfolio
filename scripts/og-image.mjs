// Erzeugt das Vorschaubild für LinkedIn & Co. (public/images/og-image.png, 1200 × 630).
// Aufruf: npm run og-image -- "Vorname" "Nachname" "SOFTWARE ENGINEER · PORTFOLIO"
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [first = 'Vorname', last = 'Nachname', tagline = 'SOFTWARE ENGINEER · PORTFOLIO'] =
  process.argv.slice(2);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const W = 1200,
  H = 630;
let rings = '';
for (let k = 1; k <= 9; k++)
  rings += `<ellipse cx="300" cy="140" rx="${k * 46}" ry="${k * 34}" fill="none" stroke="#ddd5c8" stroke-width="1.5"/>`;
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#f6f2ea"/>${rings}
  <circle cx="880" cy="400" r="250" fill="#b4462a"/>
  <circle cx="880" cy="400" r="205" fill="none" stroke="#f6f2ea" stroke-opacity=".35" stroke-width="1.5"/>
</svg>`;
const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="64" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="#1f1b16" letter-spacing="-2">${esc(first)}</text>
  <text x="64" y="345" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="92" fill="#b4462a" letter-spacing="-2">${esc(last)}</text>
  <text x="68" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600" fill="#6b6257" letter-spacing="3">${esc(tagline)}</text>
</svg>`;

const portrait = await sharp(join(root, 'public/images/portrait.webp'))
  .resize({ height: 600 })
  .png()
  .toBuffer();
const { width } = await sharp(portrait).metadata();
await sharp(Buffer.from(bg))
  .composite([
    { input: portrait, left: Math.round(880 - width / 2), top: 60 },
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public/images/og-image.png'));
console.log('public/images/og-image.png erstellt');
