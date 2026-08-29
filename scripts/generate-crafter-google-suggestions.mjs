import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const width = 1500;
const height = 3000;
const outputDirectory = path.join(
  process.cwd(),
  "public",
  "brand-assets",
  "exports",
);
const logoPath = path.join(
  process.cwd(),
  "public",
  "brand-assets",
  "source",
  "logos",
  "google-logo.png",
);

const suggestions = [
  "events",
  "community",
  "hackathons",
  "latam",
  "is the best community in latam",
  "lima",
  "bogota",
  "china",
  "builders",
  "founders",
  "workshops",
  "join",
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function searchIcon(y) {
  return `
    <g transform="translate(258 ${y})" fill="none" stroke="#9aa0a6" stroke-width="4" stroke-linecap="round">
      <circle cx="0" cy="0" r="10"/>
      <path d="M7.5 7.5 16 16"/>
    </g>`;
}

const rows = suggestions
  .map((suggestion, index) => {
    const y = 1190 + index * 84;
    return `
      ${searchIcon(y - 10)}
      <text x="310" y="${y}" fill="#202124" font-family="Arial, sans-serif" font-size="31">
        <tspan>crafter station</tspan><tspan dx="10" font-weight="700">${escapeXml(suggestion)}</tspan>
      </text>`;
  })
  .join("");

const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#3c4043" flood-opacity="0.22"/>
        <feDropShadow dx="0" dy="7" stdDeviation="14" flood-color="#3c4043" flood-opacity="0.13"/>
      </filter>
    </defs>

    <rect width="1500" height="3000" fill="#ffffff"/>

    <g filter="url(#shadow)">
      <rect x="205" y="1011" width="1090" height="1178" rx="46" fill="#ffffff"/>
    </g>

    <line x1="205" y1="1110" x2="1295" y2="1110" stroke="#dfe1e5" stroke-width="2"/>
    ${searchIcon(1060)}
    <text x="310" y="1072" fill="#202124" font-family="Arial, sans-serif" font-size="32">crafter station</text>

    ${rows}
  </svg>`;

await mkdir(outputDirectory, { recursive: true });

const pngPath = path.join(
  outputDirectory,
  "crafter-station-google-suggestions.png",
);

await writeFile(
  pngPath,
  await sharp(Buffer.from(svg))
    .composite([
      {
        input: await sharp(logoPath).resize({ width: 408 }).png().toBuffer(),
        left: 546,
        top: 774,
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer(),
);

console.log(`Generated ${path.relative(process.cwd(), pngPath)}`);
