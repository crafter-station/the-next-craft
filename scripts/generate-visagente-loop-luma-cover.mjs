import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "public",
  "media",
  "events",
  "visagente",
  "pilot-dog.jpg",
);
const outputDirectory = path.join(root, "public", "brand-assets", "events");
const visagenteLogoPath = path.join(
  root,
  "public",
  "sponsors",
  "visagente.svg",
);
const manifestPath = path.join(root, "public", "brand-assets", "assets.json");

const size = 1080;
const colors = {
  void: "#1a1a17",
  line: "#8c8a82",
  text: "#f2f0e9",
  dim: "#a2a096",
  bright: "#e9e7de",
};

const fontFamily = "IBM Plex Mono";
const pixelFontFamily = "Silkscreen";
const scriptFontFamily = "Borel";

for (const family of [fontFamily, pixelFontFamily, scriptFontFamily]) {
  const resolvedFamily = execFileSync("fc-match", [
    "--format=%{family}",
    family,
  ]).toString();
  if (!resolvedFamily.split(",").includes(family)) {
    throw new Error(
      "Install the website fonts with `bun run font:setup` before generating assets.",
    );
  }
}

function artwork() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <filter id="title-shadow" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="3" dy="3" stdDeviation="1.5" flood-color="#000" flood-opacity="0.42"/>
        </filter>
      </defs>

      <g transform="translate(70 70)">
        <rect width="182" height="176" fill="${colors.bright}"/>
        <text x="91" y="42" fill="${colors.void}" font-family="${fontFamily}" font-size="18" font-weight="700" letter-spacing="4" text-anchor="middle">AUG</text>
        <text x="91" y="137" fill="${colors.void}" font-family="${pixelFontFamily}" font-size="90" font-weight="700" text-anchor="middle">24</text>
      </g>

      <g aria-label="Pixel particles">
        <rect x="84" y="286" width="36" height="36" fill="${colors.text}"/>
        <rect x="120" y="322" width="36" height="36" fill="${colors.line}"/>
        <rect x="700" y="174" width="52" height="52" fill="${colors.dim}"/>
        <rect x="752" y="174" width="52" height="52" fill="${colors.void}" fill-opacity="0.92"/>
        <rect x="974" y="292" width="40" height="40" fill="${colors.text}"/>
        <rect x="1014" y="332" width="56" height="56" fill="${colors.void}" fill-opacity="0.94"/>
        <rect x="72" y="706" width="32" height="32" fill="${colors.text}"/>
        <rect x="104" y="738" width="48" height="48" fill="${colors.line}"/>
        <rect x="152" y="786" width="48" height="48" fill="${colors.void}" fill-opacity="0.94"/>
        <rect x="956" y="662" width="42" height="42" fill="${colors.bright}"/>
        <rect x="998" y="704" width="42" height="42" fill="${colors.dim}"/>
        <rect x="1040" y="704" width="40" height="42" fill="${colors.void}" fill-opacity="0.94"/>
      </g>

      <g font-family="${pixelFontFamily}" font-weight="700" fill="${colors.text}" letter-spacing="-1" text-anchor="middle" filter="url(#title-shadow)">
        <text x="540" y="455" font-size="72">WTF IS</text>
        <text x="540" y="565" font-size="106">LOOP</text>
        <text x="540" y="660" font-size="68">ENGINEERING</text>
      </g>

      <path fill="${colors.bright}" d="M0 986 H155 V962 H310 V938 H465 V914 H620 V890 H775 V866 H930 V842 H1080 V1080 H0 Z"/>
      <g fill="${colors.void}">
        <rect x="84" y="926" width="36" height="36"/>
        <rect x="775" y="826" width="40" height="40"/>
        <rect x="930" y="802" width="40" height="40"/>
      </g>
      <text x="900" y="983" fill="${colors.void}" font-family="${scriptFontFamily}" font-size="39" text-anchor="middle">the next craft</text>
    </svg>
  `);
}

function grain() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.48" numOctaves="3" seed="24" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.36"/>
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>
  `);
}

const background = await sharp(sourcePath)
  .resize(size, size, { fit: "cover", position: "centre" })
  .greyscale()
  .blur(2.1)
  .linear(1.16, -14)
  .png()
  .toBuffer();

const visagenteMark = (await readFile(visagenteLogoPath, "utf8")).replace(
  'fill="#fff"',
  `fill="${colors.void}"`,
);
const visagenteMarkContent = visagenteMark
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "");
const visagenteLogo = await sharp(
  Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="48" viewBox="0 0 240 48">
      <svg x="0" y="8" width="74" height="30" viewBox="120 350 785 320">${visagenteMarkContent}</svg>
      <text x="82" y="35" fill="${colors.void}" font-family="${fontFamily}" font-size="28" font-weight="700" letter-spacing="-1">visagente</text>
    </svg>
  `),
)
  .png()
  .toBuffer();

const blackOverlay = await sharp({
  create: {
    width: size,
    height: size,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0.48 },
  },
})
  .png()
  .toBuffer();

const cover = await sharp(background)
  .composite([
    { input: blackOverlay, left: 0, top: 0 },
    { input: grain(), left: 0, top: 0, blend: "screen" },
    { input: artwork(), left: 0, top: 0 },
    { input: visagenteLogo, left: 450, top: 945 },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "visagente-loop-engineering-luma-square.png"),
    cover,
  ),
  sharp(cover)
    .webp({ quality: 94, smartSubsample: true })
    .toFile(
      path.join(outputDirectory, "visagente-loop-engineering-luma-square.webp"),
    ),
]);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
delete manifest.files["events/visagente-loop-engineering-luma-square.svg"];
manifest.palette = colors;
manifest.files = {
  ...manifest.files,
  "events/visagente-loop-engineering-luma-square.png": "1080x1080",
  "events/visagente-loop-engineering-luma-square.webp": "1080x1080",
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  "Generated public/brand-assets/events/visagente-loop-engineering-luma-square.{png,webp}",
);
