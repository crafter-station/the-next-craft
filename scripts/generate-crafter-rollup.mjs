import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Roll-up de Crafter Station con la estética de The Next Craft.
 *
 * Formato 85 x 200 cm — el estándar de roller banner en LATAM. Se dibuja en
 * un viewBox en milímetros (850 x 2000) y se rasteriza al DPI pedido, así
 * que subir o bajar la resolución no toca ni una coordenada.
 *
 * Zonas muertas del formato, respetadas abajo:
 *  - los 50 mm de arriba se enrollan sobre el riel,
 *  - los 180 mm de abajo entran al cassette y no se ven,
 *  - 55 mm de margen lateral.
 * Nada legible vive fuera de esos límites.
 */

const root = process.cwd();
const outputDirectory = path.join(root, "public", "brand-assets", "print");
const crafterLogoPath = path.join(
  root,
  "public",
  "organizadores",
  "crafter-logotipo.svg",
);
const manifestPath = path.join(root, "public", "brand-assets", "assets.json");

const dpi = Number(process.argv[2] ?? 150);
const widthMm = 850;
const heightMm = 2000;
const width = Math.round((widthMm / 25.4) * dpi);
const height = Math.round((heightMm / 25.4) * dpi);

const colors = {
  void: "#1a1a17",
  screen: "#161613",
  line: "#8c8a82",
  text: "#f2f0e9",
  dim: "#a2a096",
  bright: "#e9e7de",
  crafter: "#f8bb2d",
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

const terminalLines = [
  "NO HAY CUPO PARA ESPECTADORES",
  "NI ESPACIO PARA SLIDES BONITAS",
  "SE VIENE A SHIPPEAR PRODUCTO REAL",
  "CON USUARIOS. CON DATOS.",
  "CON ALGO QUE FUNCIONE AL FINAL DEL RELOJ",
];

function grain() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="29" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 0.14"/></feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>
  `);
}

const crafterLogo = (await readFile(crafterLogoPath, "utf8"))
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "")
  .replace(/fill="white"/g, `fill="${colors.text}"`);

function artwork() {
  const terminal = terminalLines
    .map(
      (message, index) => `
        <text x="55" y="${800 + index * 42}" font-family="${fontFamily}" font-size="22" font-weight="500" letter-spacing="0.6">
          <tspan fill="${colors.crafter}">&gt;</tspan><tspan dx="13" fill="${colors.text}">${message}</tspan>
        </text>`,
    )
    .join("");

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      <rect width="${widthMm}" height="${heightMm}" fill="${colors.void}"/>

      <g aria-label="Pixel fragments" opacity="0.9">
        <rect x="0" y="330" width="26" height="26" fill="${colors.line}"/>
        <rect x="26" y="356" width="26" height="26" fill="${colors.screen}"/>
        <rect x="798" y="286" width="30" height="30" fill="${colors.bright}"/>
        <rect x="828" y="316" width="22" height="46" fill="${colors.screen}"/>
        <rect x="812" y="944" width="26" height="26" fill="${colors.dim}"/>
        <rect x="0" y="1246" width="24" height="24" fill="${colors.text}"/>
        <rect x="24" y="1270" width="24" height="24" fill="${colors.line}"/>
        <rect x="806" y="1330" width="28" height="28" fill="${colors.crafter}"/>
      </g>

      <g transform="translate(245 86) scale(0.5092)" aria-label="Crafter Station">${crafterLogo}</g>

      <text x="55" y="228" fill="${colors.dim}" font-family="${fontFamily}" font-size="20" font-weight="500" letter-spacing="1.2">LOAD "CRAFTER STATION",8,1</text>
      <text x="55" y="272" font-family="${fontFamily}" font-size="20" font-weight="600" letter-spacing="1.2">
        <tspan fill="${colors.bright}">READY.</tspan>
      </text>
      <rect x="133" y="252" width="17" height="26" fill="${colors.crafter}"/>

      <g font-family="${pixelFontFamily}" font-size="82" font-weight="700" fill="${colors.text}" letter-spacing="-3">
        <text x="55" y="440">DE CERO</text>
        <text x="55" y="538">A PRODUCTO</text>
        <text x="55" y="636" fill="${colors.bright}">EN 12 HORAS</text>
      </g>
      <rect x="55" y="700" width="120" height="6" fill="${colors.crafter}"/>
      <rect x="175" y="702" width="620" height="2" fill="${colors.line}" opacity="0.5"/>

      ${terminal}

      <rect x="55" y="1240" width="740" height="2" fill="${colors.line}" opacity="0.5"/>
      <text x="55" y="1300" fill="${colors.dim}" font-family="${fontFamily}" font-size="21" font-weight="500" letter-spacing="1.4">LIMA · BOGOTÁ · GUATEMALA · AREQUIPA · EL SALVADOR</text>
      <text x="55" y="1348" fill="${colors.text}" font-family="${fontFamily}" font-size="21" font-weight="600" letter-spacing="1.4">SÁBADO 29 AGO 2026 · HACKATHON PRESENCIAL</text>

      <path fill="${colors.bright}" d="M0 1560 H122 V1538 H244 V1516 H366 V1494 H488 V1472 H610 V1450 H732 V1428 H850 V2000 H0 Z"/>
      <g fill="${colors.void}">
        <rect x="66" y="1478" width="26" height="26"/>
        <rect x="610" y="1390" width="30" height="30"/>
        <rect x="732" y="1368" width="30" height="30"/>
      </g>

      <text x="425" y="1704" fill="${colors.void}" font-family="${scriptFontFamily}" font-size="70" text-anchor="middle">the next craft</text>
      <text x="425" y="1772" fill="${colors.void}" font-family="${fontFamily}" font-size="24" font-weight="600" letter-spacing="2.4" text-anchor="middle">THENEXTCRAFT.CRAFTER.RUN</text>
    </svg>
  `);
}

const png = await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: colors.void,
  },
})
  .composite([
    { input: artwork(), left: 0, top: 0 },
    { input: grain(), left: 0, top: 0, blend: "screen" },
  ])
  .png({ compressionLevel: 9 })
  .withMetadata({ density: dpi })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const basename = `crafter-station-rollup-85x200-${dpi}dpi`;
await writeFile(path.join(outputDirectory, `${basename}.png`), png);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.palette = colors;
manifest.files = {
  ...manifest.files,
  [`print/${basename}.png`]: `${width}x${height}`,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated public/brand-assets/print/${basename}.png — ${width}x${height}px (85x200cm @ ${dpi}dpi)`,
);
