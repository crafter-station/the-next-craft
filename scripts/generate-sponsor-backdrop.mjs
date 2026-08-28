import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Photocall de sponsors — banner para que la gente se fotografíe delante.
 *
 * 300 x 220 cm, viewBox en milímetros. A 100 dpi a tamaño real, que es lo
 * estándar en gran formato a esta escala; el DPI se pasa por argumento.
 *
 * Todos los logos se pintan con su propio alfa como silueta, en un solo
 * color. Es el mismo tratamiento monocromo que ya usa la landing, y evita
 * tener que corregir a mano cada logo (algunos vienen oscuros, como el de
 * CloudForge, y otros claros).
 */

const root = process.cwd();
const outputDirectory = path.join(root, "public", "brand-assets", "print");
const sponsorDirectory = path.join(root, "public", "sponsors");
const logosDirectory = path.join(
  root,
  "public",
  "brand-assets",
  "source",
  "logos",
);
const organizerDirectory = path.join(root, "public", "organizadores");
const manifestPath = path.join(root, "public", "brand-assets", "assets.json");

const dpi = Number(process.argv[2] ?? 100);
const widthMm = 3000;
const heightMm = 2200;
const width = Math.round((widthMm / 25.4) * dpi);
const height = Math.round((heightMm / 25.4) * dpi);
const scale = width / widthMm;
const px = (mm) => Math.round(mm * scale);

const colors = {
  void: "#1a1a17",
  deep: "#131311",
  bright: "#e9e7de",
  text: "#f2f0e9",
  dim: "#a2a096",
  line: "#8c8a82",
  crafter: "#f8bb2d",
  // dest-in multiplica el alfa del lienzo por el del logo, así que la
  // opacidad del fondo se define acá y no con un filtro aparte.
  ghost: { r: 233, g: 231, b: 222, alpha: 0.3 },
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

/*
  Jerarquía y alturas relativas copiadas de src/components/landing/partners.tsx
  para no inventar un orden de sponsors distinto al que ya está publicado.
  `k` corrige logos que son marca cuadrada frente a los que son wordmark.
*/
/*
  Jerarquía y alturas relativas tomadas de src/components/landing/partners.tsx
  para no inventar un orden distinto al que ya está publicado. `k` corrige los
  logos que son marca cuadrada frente a los que son wordmark.
*/
const roster = [
  // Fila principal: los tres de mayor tier van juntos arriba. Repartidos
  // entre las demás filas, un logo grande suelto se lee como error de escala.
  { file: "convex.svg" },
  { file: "yalo.svg" },
  { file: "cloudforge/imagotipo_cloudforge.svg" },

  { file: "clerk.svg" },
  { file: "tavily.svg" },
  { file: "elevenlabs.svg" },
  { file: "exa.svg" },

  { file: "vapi.svg" },
  { file: "apify.svg" },

  { file: "cursor.svg" },
  { file: "generated/codex.svg" },

  { file: "generated/n8n.svg" },
  { file: "generated/replit.svg" },
  { file: "3DevLabs.svg" },
  { file: "generated/visagente-lockup.svg" },

  { file: "upch.svg" },
  { file: "ucsm.png" },
  { file: "innicia-ucsm.png" },
  { file: "bioincuba.png", dir: logosDirectory },
];

/*
  Los sponsors ya no viven en dos bandas sino repartidos por toda la
  superficie, tenues y detrás de la frase. En un photocall eso además
  significa que cualquier recorte de la foto tiene marca: con bandas arriba
  y abajo, el cuerpo de la persona tapaba media lista.
*/
/*
  Las filas 3 y 4 cruzan el bloque central, así que llevan solo dos logos y
  quedan pegados a los bordes: con tres, el del medio desaparecía detrás del
  wordmark. Los seis conteos suman 18, uno por sponsor y sin repetir.
*/
const rowSpecs = [
  { count: 3, h: 172, y: 100 },
  { count: 4, h: 100, y: 470, stagger: true },
  { count: 2, h: 100, y: 690 },
  { count: 2, h: 100, y: 1300 },
  { count: 4, h: 100, y: 1530, stagger: true },
  { count: 4, h: 88, y: 1770 },
];

const rows = [];
let taken = 0;
for (const spec of rowSpecs) {
  const items = roster.slice(taken, taken + spec.count);
  taken += spec.count;
  rows.push({ y: spec.y, h: spec.h, items, stagger: Boolean(spec.stagger) });
}

/*
  Aspecto de referencia para normalizar ópticamente. A igual altura, un
  wordmark muy ancho ocupa mucha más superficie que una marca compacta y se
  lee más grande; escalar por la raíz del aspecto iguala el área percibida.
*/
const REFERENCE_ASPECT = 3.6;

/**
 * Pinta un logo de un solo color usando su alfa como silueta.
 *
 * Recorta antes el aire transparente del archivo: cada logo trae un margen
 * interno distinto — Cursor aprovecha el 14 % de su caja y ElevenLabs el
 * 80 % — así que sin recortar, la altura pedida no guarda relación con el
 * tamaño que se ve y la fila queda despareja.
 */
async function paintedLogo(
  file,
  baseHeightMm,
  color,
  tune = 1,
  baseDir = sponsorDirectory,
) {
  const nominal = px(baseHeightMm);

  const trimmed = await sharp(path.join(baseDir, file), { density: 600 })
    .resize({ height: Math.max(nominal * 2, 700), fit: "inside" })
    .ensureAlpha()
    .trim({ threshold: 1 })
    .png()
    .toBuffer();

  const inkMeta = await sharp(trimmed).metadata();
  const aspect = inkMeta.width / inkMeta.height;
  const target = Math.round(
    nominal * Math.sqrt(REFERENCE_ASPECT / aspect) * tune,
  );

  const resized = await sharp(trimmed)
    .resize({ height: target, fit: "inside" })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();

  const painted = await sharp({
    create: {
      width: meta.width,
      height: meta.height,
      channels: 4,
      background: color,
    },
  })
    .composite([{ input: resized, blend: "dest-in" }])
    .png()
    .toBuffer();

  return { buffer: painted, width: meta.width, height: meta.height };
}

/** Distribuye una fila de logos centrada, con huecos iguales entre ellos. */
async function layoutRow(row, color, marginMm) {
  const logos = [];
  for (const item of row.items) {
    logos.push(
      await paintedLogo(
        item.file,
        row.h,
        color,
        item.k ?? 1,
        item.dir ?? sponsorDirectory,
      ),
    );
  }

  const totalLogo = logos.reduce((sum, l) => sum + l.width, 0);
  const full = px(widthMm - marginMm * 2);
  // En las filas escalonadas se reserva medio hueco a cada lado, si no el
  // último logo se salía del margen y quedaba cortado.
  const usable = row.stagger ? full * 0.86 : full;
  const gap = (usable - totalLogo) / (logos.length - 1);

  const layers = [];
  let cursor = px(marginMm) + (row.stagger ? (full - usable) / 2 : 0);
  const centerY = px(row.y + row.h / 2);
  for (const logo of logos) {
    layers.push({
      input: logo.buffer,
      left: Math.round(cursor),
      top: Math.round(centerY - logo.height / 2),
    });
    cursor += logo.width + gap;
  }
  return layers;
}

const logoLayers = [];
for (const row of rows) {
  logoLayers.push(...(await layoutRow(row, colors.ghost, 90)));
}

/*
  Crafter Station no es sponsor sino quien organiza, así que no entra en el
  campo tenue: va más marcado y pegado a la línea de dominios, que son suyos.
*/
const organizer = await paintedLogo(
  "crafter-logotipo.svg",
  108,
  { r: 233, g: 231, b: 222, alpha: 0.72 },
  1,
  organizerDirectory,
);
logoLayers.push({
  input: organizer.buffer,
  left: Math.round(width / 2 - organizer.width / 2),
  top: px(1940),
});

/*
  Trama binaria de fondo. Va por debajo de los logos y del velo central, con
  la opacidad variando poco entre filas: un valor plano se lee como textura
  sucia y uno muy contrastado le compite a los sponsors.

  El generador es determinista a propósito — dos corridas del script tienen
  que dar el mismo archivo, si no cada re-render cambia el fondo.
*/
function binaryField() {
  const fontSize = 28;
  const tracking = 6;
  const advance = fontSize * 0.6 + tracking;
  const lineHeight = 46;
  const columns = Math.ceil(widthMm / advance) + 2;
  const lines = Math.ceil(heightMm / lineHeight) + 1;

  let seed = 20260829;
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };

  const rows = [];
  for (let row = 0; row < lines; row += 1) {
    let bits = "";
    for (let col = 0; col < columns; col += 1) bits += next() < 0.5 ? "0" : "1";
    const opacity = (0.046 + next() * 0.02).toFixed(3);
    const y = 30 + row * lineHeight;
    rows.push(`<text x="-20" y="${y}" opacity="${opacity}">${bits}</text>`);
  }

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      <g fill="${colors.bright}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="500" letter-spacing="${tracking}">
        ${rows.join("\n        ")}
      </g>
    </svg>
  `);
}

function artwork() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      <defs>
        <radialGradient id="scrim" cx="0.5" cy="0.47" r="0.58">
          <stop offset="0" stop-color="${colors.void}" stop-opacity="0.94"/>
          <stop offset="0.55" stop-color="${colors.void}" stop-opacity="0.88"/>
          <stop offset="1" stop-color="${colors.void}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="edge" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stop-color="${colors.void}" stop-opacity="0"/>
          <stop offset="1" stop-color="${colors.deep}" stop-opacity="0.92"/>
        </radialGradient>
      </defs>

      <rect width="${widthMm}" height="${heightMm}" fill="url(#edge)"/>

      <!-- Velo: sin esto la frase pelea con los logos de atrás -->
      <ellipse cx="1500" cy="1030" rx="1320" ry="520" fill="url(#scrim)"/>

      <text x="1500" y="1000" fill="${colors.text}" font-family="${scriptFontFamily}" font-size="300" text-anchor="middle">the next craft</text>

      <g font-family="${pixelFontFamily}" font-weight="700" font-size="150" letter-spacing="-4" text-anchor="middle">
        <text x="1500" y="1250" fill="${colors.text}">JUST <tspan fill="${colors.crafter}">SHIP</tspan> IT</text>
      </g>

      <text x="1500" y="2075" font-family="${fontFamily}" font-size="38" font-weight="600" letter-spacing="8" text-anchor="middle">
        <tspan fill="${colors.bright}">THENEXTCRAFT.ORG</tspan><tspan dx="26" fill="${colors.line}">/</tspan><tspan dx="26" fill="${colors.bright}">CRAFTER.RUN</tspan>
      </text>
    </svg>
  `);
}

const png = await sharp({
  create: { width, height, channels: 3, background: colors.void },
})
  .composite([
    { input: binaryField(), left: 0, top: 0 },
    ...logoLayers,
    { input: artwork(), left: 0, top: 0 },
  ])
  // Sin removeAlpha, sharp emite RGBA y el PDF termina con una máscara de
  // transparencia. Una pieza de imprenta opaca no la necesita.
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .withMetadata({ density: dpi })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const basename = `the-next-craft-photocall-300x220-${dpi}dpi`;
await writeFile(path.join(outputDirectory, `${basename}.png`), png);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.files = {
  ...manifest.files,
  [`print/${basename}.png`]: `${width}x${height}`,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated public/brand-assets/print/${basename}.png — ${width}x${height}px (300x220cm @ ${dpi}dpi)`,
);
