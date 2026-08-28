import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Roll-up de Crafter Station — muro de monitores.
 *
 * 85 x 200 cm, viewBox en milímetros, zona ciega del cassette respetada.
 *
 * La computadora del proyecto se repite en rejilla para armar el muro y una
 * copia grande queda al frente. El tratamiento es duotono, no un bit: pasar
 * el render a blanco y negro puro lo desfiguraba y dejaba de parecerse al de
 * la web. Acá conserva todos sus medios tonos y solo se le cambia el color.
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
  ground: "#04100f",
  deep: "#020a09",
  tealDim: "#2a8f85",
  teal: "#4fd8c8",
  tealBright: "#9bfff0",
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

const hero = { x: 172, y: 690, size: 506 };

/* Fracciones medidas sobre el PNG, no estimadas. */
const screen = {
  x: hero.x + 0.3125 * hero.size,
  y: hero.y + 0.2168 * hero.size,
  w: 0.4736 * hero.size,
  h: 0.3408 * hero.size,
};

/* Rejilla del fondo: tres columnas por cinco filas, recortadas por los bordes. */
const wall = [];
for (let row = 0; row < 6; row += 1) {
  for (let col = 0; col < 3; col += 1) {
    wall.push({ x: -18 + col * 296, y: 120 + row * 268, size: 286 });
  }
}

function scanlines(w, h, opacity) {
  const step = Math.max(1, Math.round(0.85 * scale));
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <pattern id="s" width="1" height="${step * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${step}" fill="#000" fill-opacity="${opacity}"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#s)"/>
    </svg>
  `);
}

/**
 * Duotono: gris normalizado y teñido. tint() conserva la luminancia, así que
 * la máquina mantiene su volumen en vez de aplanarse.
 */
async function machine({ size, dim, blur, hue = colors.teal }) {
  const s = px(size);

  let pipeline = sharp(computerPath)
    .resize(s, s, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .greyscale()
    .normalise();

  if (blur) pipeline = pipeline.blur(blur);
  if (dim !== 1) pipeline = pipeline.linear(dim, 0);

  const grey = await pipeline.png().toBuffer();

  const tinted = await sharp(grey)
    .composite([
      {
        input: {
          create: { width: s, height: s, channels: 3, background: hue },
        },
        blend: "multiply",
      },
    ])
    .png()
    .toBuffer();

  const withScan = await sharp(tinted)
    .composite([{ input: scanlines(s, s, blur ? 0.4 : 0.32), blend: "over" }])
    .png()
    .toBuffer();

  // Las scanlines se pintan sobre todo el cuadro, así que hay que volver a
  // recortar por la silueta o reaparece el rectángulo de fondo.
  const silhouette = await sharp(computerPath)
    .resize(s, s, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp(withScan)
    .composite([{ input: silhouette, blend: "dest-in" }])
    .png()
    .toBuffer();
}

const wallLayers = [];
for (const [index, cell] of wall.entries()) {
  // Las filas de arriba quedan más apagadas: da profundidad al muro.
  const depth = 0.3 + 0.05 * Math.min(index % 5, 3);
  wallLayers.push({
    input: await machine({ size: cell.size, dim: depth, blur: 1.1 * scale }),
    left: px(cell.x),
    top: px(cell.y),
  });
}

const heroLayer = {
  input: await machine({
    size: hero.size,
    dim: 1.3,
    blur: 0,
    hue: colors.tealBright,
  }),
  left: px(hero.x),
  top: px(hero.y),
};

function overlayArtwork() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      <defs>
        <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.78">
          <stop offset="0.45" stop-color="${colors.ground}" stop-opacity="0"/>
          <stop offset="1" stop-color="${colors.deep}" stop-opacity="0.94"/>
        </radialGradient>
        <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="${colors.teal}" stop-opacity="0.3"/>
          <stop offset="1" stop-color="${colors.teal}" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="4.5"/>
        </filter>
        <filter id="glow-soft" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="9"/>
        </filter>
      </defs>

      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${colors.deep}" stop-opacity="0"/>
        <stop offset="0.55" stop-color="${colors.deep}" stop-opacity="0.92"/>
        <stop offset="1" stop-color="${colors.deep}" stop-opacity="1"/>
      </linearGradient>

      <rect width="${widthMm}" height="${heightMm}" fill="url(#vignette)"/>
      <rect x="0" y="1420" width="${widthMm}" height="580" fill="url(#floor)"/>

      <!-- Pantalla del frente: negra, como se pidió, con el mensaje en fósforo -->
      <ellipse cx="${screen.x + screen.w / 2}" cy="${screen.y + screen.h / 2}" rx="${screen.w * 0.78}" ry="${screen.h * 0.85}" fill="url(#halo)"/>
      <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="14" fill="#000"/>
      <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="14"
            fill="none" stroke="${colors.tealDim}" stroke-opacity="0.5" stroke-width="1.2"/>

      <g font-family="${pixelFontFamily}" font-weight="700" text-anchor="middle">
        <g filter="url(#glow)" opacity="0.8" fill="${colors.teal}">
          <text x="${screen.x + screen.w / 2}" y="${screen.y + 78}" font-size="42">JUST</text>
          <text x="${screen.x + screen.w / 2}" y="${screen.y + 134}" font-size="42">SHIP IT</text>
        </g>
        <g fill="${colors.tealBright}">
          <text x="${screen.x + screen.w / 2}" y="${screen.y + 78}" font-size="42">JUST</text>
          <text x="${screen.x + screen.w / 2}" y="${screen.y + 134}" font-size="42">SHIP IT</text>
        </g>
      </g>

      <g font-family="${fontFamily}" font-size="20" font-weight="600" letter-spacing="3.4">
        <text x="55" y="95" fill="${colors.teal}" filter="url(#glow-soft)" opacity="0.6">CRAFTER STATION</text>
        <text x="55" y="95" fill="${colors.tealBright}">CRAFTER STATION</text>
      </g>

      <g text-anchor="middle">
        <text x="425" y="1666" font-family="${scriptFontFamily}" font-size="104" fill="${colors.teal}" filter="url(#glow-soft)" opacity="0.75">the next craft</text>
        <text x="425" y="1666" font-family="${scriptFontFamily}" font-size="104" fill="${colors.tealBright}">the next craft</text>
        <text x="425" y="1742" font-family="${fontFamily}" font-size="21" font-weight="600" letter-spacing="2.6" fill="${colors.tealDim}">THENEXTCRAFT.CRAFTER.RUN</text>
      </g>
    </svg>
  `);
}

const png = await sharp({
  create: { width, height, channels: 3, background: colors.ground },
})
  .composite([
    ...wallLayers,
    heroLayer,
    { input: overlayArtwork(), left: 0, top: 0 },
    { input: scanlines(width, height, 0.18), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .withMetadata({ density: dpi })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const basename = `crafter-station-rollup-wall-85x200-${dpi}dpi`;
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
