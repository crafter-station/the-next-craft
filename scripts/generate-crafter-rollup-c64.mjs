import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Roll-up de Crafter Station — la computadora del proyecto como protagonista.
 *
 * 85 x 200 cm, viewBox en milímetros, zona ciega del cassette respetada.
 * El C64 se pasa a un bit y se tiñe de fósforo, y la pantalla se repinta
 * para que muestre el arranque en vez del render original: el titular grande
 * vive abajo, sobre la escalera, como en la versión sobria.
 */

const root = process.cwd();
const outputDirectory = path.join(root, "public", "brand-assets", "print");
const computerPath = path.join(
  root,
  "public",
  "brand-assets",
  "exports",
  "c64-computer-square.png",
);
const manifestPath = path.join(root, "public", "brand-assets", "assets.json");

const dpi = Number(process.argv[2] ?? 150);
const widthMm = 850;
const heightMm = 2000;
const width = Math.round((widthMm / 25.4) * dpi);
const height = Math.round((heightMm / 25.4) * dpi);
const scale = width / widthMm;
const px = (mm) => Math.round(mm * scale);

const colors = {
  crt: "#07070b",
  phosphor: "#a8d4ff",
  phosphorDim: "#5d7fa8",
  text: "#f2f0e9",
  bright: "#e9e7de",
  dim: "#7e8ea3",
  crafter: "#f8bb2d",
  bleedRed: "#ff2d3d",
  bleedCyan: "#31e8ff",
  void: "#1a1a17",
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

/* Caja de la computadora, en mm. El render de origen es cuadrado. */
const machine = { x: 75, y: 180, size: 700 };

/*
  Recorte de la pantalla dentro del render cuadrado. Las fracciones salen de
  medir el área clara del PNG, no de estimarla: con valores aproximados el
  repintado dejaba un borde del bisel asomando alrededor.
*/
const screen = {
  x: machine.x + 0.3125 * machine.size,
  y: machine.y + 0.2168 * machine.size,
  w: 0.4736 * machine.size,
  h: 0.3408 * machine.size,
};

function crtMask(w, h) {
  const lineStep = Math.max(2, Math.round(1.1 * scale));
  const grilleStep = Math.max(2, Math.round(0.9 * scale));
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <pattern id="scan" width="1" height="${lineStep * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${lineStep}" fill="#000" fill-opacity="0.68"/>
        </pattern>
        <pattern id="grille" width="${grilleStep * 2}" height="1" patternUnits="userSpaceOnUse">
          <rect width="${grilleStep}" height="1" fill="#000" fill-opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#scan)"/>
      <rect width="100%" height="100%" fill="url(#grille)"/>
    </svg>
  `);
}

async function buildMachine() {
  const w = px(machine.size);
  const h = px(machine.size);

  // El render trae alpha: se aplana sobre el negro del tubo antes de umbralar.
  const base = await sharp(computerPath)
    .resize(w, h, { fit: "contain", background: colors.crt })
    .flatten({ background: colors.crt })
    .greyscale()
    .normalise()
    .linear(1.1, -6)
    .threshold(96)
    .png()
    .toBuffer();

  const colorize = async (hex) =>
    sharp(base)
      .composite([
        {
          input: {
            create: { width: w, height: h, channels: 3, background: hex },
          },
          blend: "multiply",
        },
      ])
      .png()
      .toBuffer();

  const phosphor = await colorize(colors.phosphor);
  const red = await sharp(await colorize(colors.bleedRed))
    .linear(0.42, 0)
    .png()
    .toBuffer();
  const cyan = await sharp(await colorize(colors.bleedCyan))
    .linear(0.42, 0)
    .png()
    .toBuffer();
  const bleed = px(1.4);

  const composed = await sharp({
    create: { width: w, height: h, channels: 3, background: colors.crt },
  })
    .composite([
      { input: phosphor, left: 0, top: 0 },
      { input: red, left: bleed, top: 0, blend: "screen" },
      { input: cyan, left: -bleed, top: px(0.6), blend: "screen" },
      { input: crtMask(w, h), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  // Sin esto el panel se pega como un rectángulo y se le ve el borde contra
  // el fondo. El alpha del render original recorta la silueta de la máquina.
  // Sin recorte el panel se pega como un rectángulo y se le ve el borde
  // contra el fondo. dest-in conserva el resultado solo donde el render
  // original es opaco, así que sobrevive la silueta de la máquina.
  const silhouette = await sharp(computerPath)
    .resize(w, h, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const cut = await sharp(composed)
    .composite([{ input: silhouette, blend: "dest-in" }])
    .png()
    .toBuffer();

  return { input: cut, left: px(machine.x), top: px(machine.y) };
}

function band(y, before, accent, after, size) {
  const line = `${before}<tspan fill="${colors.crafter}">${accent}</tspan>${after}`;
  const plain = `${before}${accent}${after}`;
  return `
    <g font-family="${pixelFontFamily}" font-size="${size}" font-weight="700" letter-spacing="-2" text-anchor="middle">
      <text x="427.5" y="${y + 1.6}" fill="${colors.bleedRed}" opacity="0.55">${plain}</text>
      <text x="422.5" y="${y - 1.6}" fill="${colors.bleedCyan}" opacity="0.5">${plain}</text>
      <text x="425" y="${y}" fill="${colors.text}">${line}</text>
    </g>`;
}

function overlayArtwork() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      <g font-family="${fontFamily}" font-size="21" font-weight="600" letter-spacing="3.4">
        <text x="56.6" y="95.8" fill="${colors.bleedRed}" opacity="0.6">CRAFTER STATION</text>
        <text x="53.4" y="94.2" fill="${colors.bleedCyan}" opacity="0.55">CRAFTER STATION</text>
        <text x="55" y="95" fill="${colors.text}">CRAFTER STATION</text>
      </g>

      <!--
        Pantalla encendida. Un rectángulo negro plano leía como un agujero en
        el poster; acá el tubo tiene curvatura, degradado, halo y sus propias
        scanlines, así que se lee como una pantalla prendida.
      -->
      <defs>
        <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#16273d"/>
          <stop offset="0.45" stop-color="#0d1929"/>
          <stop offset="1" stop-color="#080f1a"/>
        </linearGradient>
        <radialGradient id="tube-glow" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stop-color="${colors.phosphor}" stop-opacity="0.22"/>
          <stop offset="0.6" stop-color="${colors.phosphor}" stop-opacity="0.06"/>
          <stop offset="1" stop-color="${colors.phosphor}" stop-opacity="0"/>
        </radialGradient>
        <pattern id="tube-scan" width="1" height="6" patternUnits="userSpaceOnUse">
          <rect width="1" height="3" fill="#000" fill-opacity="0.3"/>
        </pattern>
        <filter id="spill" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14"/>
        </filter>
        <filter id="text-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2"/>
        </filter>
      </defs>

      <rect x="${screen.x + 6}" y="${screen.y + 6}" width="${screen.w - 12}" height="${screen.h - 12}"
            rx="26" fill="${colors.phosphor}" opacity="0.16" filter="url(#spill)"/>

      <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="22" fill="url(#tube)"/>
      <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="22" fill="url(#tube-glow)"/>
      <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="22" fill="url(#tube-scan)"/>
      <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="22"
            fill="none" stroke="${colors.phosphor}" stroke-opacity="0.32" stroke-width="1.6"/>

      <g font-family="${pixelFontFamily}" font-weight="700" font-size="27">
        <g filter="url(#text-glow)" opacity="0.75" fill="${colors.phosphor}">
          <text x="${screen.x + 30}" y="${screen.y + 78}">READY.</text>
          <text x="${screen.x + 30}" y="${screen.y + 136}">RUN</text>
        </g>
        <g fill="${colors.phosphor}">
          <text x="${screen.x + 30}" y="${screen.y + 78}">READY.</text>
          <text x="${screen.x + 30}" y="${screen.y + 136}">RUN</text>
        </g>
      </g>
      <rect x="${screen.x + 91}" y="${screen.y + 114}" width="16" height="27" fill="${colors.crafter}"/>

      ${band(940, "JUST ", "SHIP", " IT", 74)}

      <g font-family="${fontFamily}" font-size="21" font-weight="500" letter-spacing="1">
        <text x="425" y="1010" text-anchor="middle">
          <tspan fill="${colors.crafter}">&gt;</tspan><tspan dx="12" fill="${colors.phosphor}">LET'S CREATE A REPO</tspan>
        </text>
        <text x="425" y="1050" text-anchor="middle">
          <tspan fill="${colors.crafter}">&gt;</tspan><tspan dx="12" fill="${colors.phosphor}">COMMIT EARLY. DEMO LOUD.</tspan>
        </text>
      </g>

      <g aria-label="Barras de estática">
        <rect x="55" y="1130" width="740" height="7" fill="${colors.phosphorDim}" opacity="0.55"/>
        <rect x="180" y="1152" width="490" height="4" fill="${colors.bleedCyan}" opacity="0.4"/>
        <rect x="55" y="1170" width="300" height="4" fill="${colors.bleedRed}" opacity="0.35"/>
        <rect x="470" y="1188" width="325" height="6" fill="${colors.phosphorDim}" opacity="0.4"/>
        <rect x="55" y="1208" width="180" height="3" fill="${colors.phosphor}" opacity="0.35"/>
      </g>

      <path fill="${colors.bright}" d="M0 1400 H122 V1378 H244 V1356 H366 V1334 H488 V1312 H610 V1290 H732 V1268 H850 V2000 H0 Z"/>
      <g fill="${colors.void}">
        <rect x="66" y="1432" width="26" height="26"/>
        <rect x="632" y="1322" width="30" height="30"/>
        <rect x="754" y="1300" width="30" height="30"/>
      </g>

      <text x="425" y="1652" fill="${colors.void}" font-family="${scriptFontFamily}" font-size="98" text-anchor="middle">the next craft</text>
      <text x="425" y="1734" fill="${colors.void}" font-family="${fontFamily}" font-size="23" font-weight="600" letter-spacing="2.6" text-anchor="middle">THENEXTCRAFT.CRAFTER.RUN</text>
    </svg>
  `);
}

function globalScan() {
  const step = Math.max(2, Math.round(1.4 * scale));
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <pattern id="s" width="1" height="${step * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${step}" fill="#000" fill-opacity="0.26"/>
        </pattern>
      </defs>
      <rect width="100%" height="${px(1400)}" fill="url(#s)"/>
    </svg>
  `);
}

const png = await sharp({
  create: { width, height, channels: 3, background: colors.crt },
})
  .composite([
    await buildMachine(),
    { input: overlayArtwork(), left: 0, top: 0 },
    { input: globalScan(), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .withMetadata({ density: dpi })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const basename = `crafter-station-rollup-c64-85x200-${dpi}dpi`;
await writeFile(path.join(outputDirectory, `${basename}.png`), png);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.files = {
  ...manifest.files,
  [`print/${basename}.png`]: `${width}x${height}`,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated public/brand-assets/print/${basename}.png — ${width}x${height}px (85x200cm @ ${dpi}dpi)`,
);
