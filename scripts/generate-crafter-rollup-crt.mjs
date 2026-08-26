import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Roll-up de Crafter Station, versión muro de CRTs.
 *
 * Mismo formato de impresión que la versión sobria (85 x 200 cm, viewBox en
 * milímetros, zona ciega del cassette respetada), pero el tratamiento cambia:
 * fotos reales de la comunidad reducidas a un bit, teñidas de fósforo frío y
 * pasadas por scanlines, grilla vertical y separación de canales RGB.
 *
 * Las fotos se procesan como buffers y se componen bajo una única capa de
 * texto, porque el dithering necesita pasar por sharp y no se puede expresar
 * en el SVG.
 */

const root = process.cwd();
const outputDirectory = path.join(root, "public", "brand-assets", "print");
const photoDirectory = path.join(root, "public", "deck", "photos", "pucp");
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
  dim: "#7e8ea3",
  crafter: "#f8bb2d",
  bleedRed: "#ff2d3d",
  bleedCyan: "#31e8ff",
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

/** Paneles: foto, caja en mm y cuánto se pixela antes de tirar el umbral. */
const panels = [
  { file: "she-ships-lima-01-upright.jpg", x: 55, y: 205, w: 740, h: 410, blocks: 330, threshold: 108 },
  { file: "she-ships-lima-02.jpg", x: 55, y: 745, w: 740, h: 410, blocks: 320, threshold: 116 },
  { file: "she-ships-lima-04.jpg", x: 55, y: 1250, w: 740, h: 310, blocks: 330, threshold: 84 },
];

/** Scanlines + grilla vertical, del tamaño exacto del panel. */
function crtMask(w, h) {
  const lineStep = Math.max(2, Math.round(1.1 * scale));
  const grilleStep = Math.max(2, Math.round(0.9 * scale));
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <pattern id="scan" width="1" height="${lineStep * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${lineStep}" fill="#000" fill-opacity="0.72"/>
        </pattern>
        <pattern id="grille" width="${grilleStep * 2}" height="1" patternUnits="userSpaceOnUse">
          <rect width="${grilleStep}" height="1" fill="#000" fill-opacity="0.34"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#scan)"/>
      <rect width="100%" height="100%" fill="url(#grille)"/>
    </svg>
  `);
}

/** Rebanadas desplazadas: el glitch de cinta que arrastra una franja. */
function tearSlices(w, h, seed) {
  const slices = [];
  let cursor = seed % 37;
  for (let i = 0; i < 5; i += 1) {
    cursor = (cursor * 73 + 41) % 100;
    const top = Math.round((cursor / 100) * (h - px(14)));
    const thickness = px(3 + (cursor % 7));
    const shift = px(((cursor % 13) - 6) * 1.6);
    slices.push({ top, thickness, shift });
  }
  return slices;
}

async function buildPanel(panel) {
  const w = px(panel.w);
  const h = px(panel.h);

  const base = await sharp(path.join(photoDirectory, panel.file))
    .resize(w, h, { fit: "cover", position: "centre" })
    .greyscale()
    .normalise()
    .linear(1.18, -12)
    .blur(0.4)
    .resize(panel.blocks, null, { kernel: "cubic" })
    .resize(w, h, { kernel: "nearest" })
    .threshold(panel.threshold)
    .png()
    .toBuffer();

  // tint() no puede teñir blanco puro — sobre una imagen de un bit no tiene
  // croma donde aplicarse y los paneles salían blancos. Multiply sí: el
  // blanco toma el color y el negro se queda negro.
  const colorize = async (hex) =>
    sharp(base)
      .composite([
        {
          input: { create: { width: w, height: h, channels: 3, background: hex } },
          blend: "multiply",
        },
      ])
      .png()
      .toBuffer();

  // rojo + cian en screen vuelven a dar blanco y se comían el fósforo, así
  // que las copias corridas van atenuadas: el relleno queda azul y el color
  // sobrevive solo en los bordes, que es donde sangra un CRT de verdad.
  const phosphor = await colorize(colors.phosphor);
  const red = await sharp(await colorize(colors.bleedRed)).linear(0.42, 0).png().toBuffer();
  const cyan = await sharp(await colorize(colors.bleedCyan)).linear(0.42, 0).png().toBuffer();
  const bleed = px(1.4);

  let composed = await sharp({
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

  // Franjas arrastradas encima del panel ya compuesto.
  const slices = tearSlices(w, h, panel.threshold);
  const overlays = [];
  for (const slice of slices) {
    const strip = await sharp(composed)
      .extract({
        left: 0,
        top: Math.min(slice.top, h - slice.thickness - 1),
        width: w,
        height: slice.thickness,
      })
      .png()
      .toBuffer();
    overlays.push({
      input: strip,
      left: slice.shift,
      top: Math.min(slice.top, h - slice.thickness - 1),
    });
  }
  composed = await sharp(composed).composite(overlays).png().toBuffer();

  return { input: composed, left: px(panel.x), top: px(panel.y) };
}

const composedPanels = [];
for (const panel of panels) {
  composedPanels.push(await buildPanel(panel));
}

const corruptedLines = [
  "NO HAY CUPO PARA ESPECTADORES",
  "NI ESPACIO PARA SLIDES BONITAS",
  "CON ALGO QUE FUNCIONE AL FINAL DEL RELOJ",
];

/** Titular con fantasma rojo/cian detrás, como el sangrado de un CRT. */
function band(y, before, accent, after) {
  const line = `${before}<tspan fill="${colors.crafter}">${accent}</tspan>${after}`;
  const plain = `${before}${accent}${after}`;
  return `
    <g font-family="${pixelFontFamily}" font-size="46" font-weight="700" letter-spacing="-1">
      <text x="57.5" y="${y + 1.2}" fill="${colors.bleedRed}" opacity="0.55">${plain}</text>
      <text x="52.5" y="${y - 1.2}" fill="${colors.bleedCyan}" opacity="0.5">${plain}</text>
      <text x="55" y="${y}" fill="${colors.text}">${line}</text>
    </g>`;
}

function overlayArtwork() {
  const terminal = corruptedLines
    .map(
      (message, index) => `
        <text x="55" y="${665 + index * 32}" font-family="${fontFamily}" font-size="19" font-weight="500" letter-spacing="0.7">
          <tspan fill="${colors.crafter}">&gt;</tspan><tspan dx="11" fill="${colors.phosphor}">${message}</tspan>
        </text>`,
    )
    .join("");

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      <g font-family="${fontFamily}" font-size="21" font-weight="600" letter-spacing="3.4">
        <text x="56.6" y="95.8" fill="${colors.bleedRed}" opacity="0.6">CRAFTER STATION</text>
        <text x="53.4" y="94.2" fill="${colors.bleedCyan}" opacity="0.55">CRAFTER STATION</text>
        <text x="55" y="95" fill="${colors.text}">CRAFTER STATION</text>
      </g>
      <text x="795" y="95" fill="${colors.dim}" font-family="${fontFamily}" font-size="17" font-weight="500" letter-spacing="2" text-anchor="end">CH 29 · LIMA</text>

      ${band(175, "LAS SLIDES SON ", "FAKE", "")}
      ${terminal}
      ${band(1215, "SOLO EL DEMO ES ", "REAL", "")}

      <rect x="55" y="1620" width="740" height="2" fill="${colors.phosphorDim}" opacity="0.7"/>

      <text x="55" y="1676" fill="${colors.phosphor}" font-family="${fontFamily}" font-size="20" font-weight="500" letter-spacing="1.3">LIMA · BOGOTÁ · GUATEMALA · AREQUIPA · EL SALVADOR</text>
      <text x="55" y="1714" fill="${colors.text}" font-family="${fontFamily}" font-size="20" font-weight="600" letter-spacing="1.3">SÁBADO 29 AGO 2026 · HACKATHON PRESENCIAL</text>

      <text x="55" y="1782" fill="${colors.text}" font-family="${scriptFontFamily}" font-size="54">the next craft</text>
      <text x="795" y="1782" fill="${colors.crafter}" font-family="${fontFamily}" font-size="19" font-weight="600" letter-spacing="1.6" text-anchor="end">THENEXTCRAFT.CRAFTER.RUN</text>
    </svg>
  `);
}

/** Scanline global tenue: cose los paneles y el fondo en una sola pantalla. */
function globalScan() {
  const step = Math.max(2, Math.round(1.4 * scale));
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <pattern id="s" width="1" height="${step * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${step}" fill="#000" fill-opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#s)"/>
    </svg>
  `);
}

const png = await sharp({
  create: { width, height, channels: 3, background: colors.crt },
})
  .composite([
    ...composedPanels,
    { input: overlayArtwork(), left: 0, top: 0 },
    { input: globalScan(), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .withMetadata({ density: dpi })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const basename = `crafter-station-rollup-crt-85x200-${dpi}dpi`;
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
