// Generate PWA icons from an inline SVG mark. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import fs from "node:fs";

const BOLT = "M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 Z";
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#00E5A0"/><stop offset="1" stop-color="#7C5CFF"/>
</linearGradient></defs>`;
const bolt = `<g transform="translate(88,86) scale(14)"><path d="${BOLT}" fill="#08130f"/></g>`;

// Rounded (purpose: any)
const rounded = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  ${grad}<rect width="512" height="512" rx="112" fill="url(#g)"/>${bolt}</svg>`;

// Full-bleed (purpose: maskable + apple-touch — OS applies its own mask/rounding)
const fullbleed = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  ${grad}<rect width="512" height="512" fill="url(#g)"/>${bolt}</svg>`;

fs.mkdirSync("public/icons", { recursive: true });

const jobs = [
  { svg: rounded, size: 512, out: "public/icons/icon-512.png" },
  { svg: rounded, size: 192, out: "public/icons/icon-192.png" },
  { svg: fullbleed, size: 512, out: "public/icons/icon-maskable-512.png" },
  { svg: fullbleed, size: 180, out: "public/icons/apple-touch-icon.png" },
  { svg: rounded, size: 32, out: "public/icons/favicon-32.png" },
];

for (const j of jobs) {
  await sharp(Buffer.from(j.svg)).resize(j.size, j.size).png().toFile(j.out);
  console.log("wrote", j.out);
}
// also keep the source svg
fs.writeFileSync("public/icons/icon.svg", rounded);
console.log("done");
