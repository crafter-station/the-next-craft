import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/**
 * Piezas de photobooth para el evento. Tres diseños que no comparten forma:
 *
 *   c64    — marco de mano de 90x70 cm: el cartón ES una computadora, con
 *            cuerpo beige, bisel de tubo y teclado impreso abajo.
 *   perfil — marco de mano de 90x70 cm: tarjeta de perfil en oscuro, con
 *            campos para escribir con plumón y botones falsos.
 *   wall   — panel vertical de 120x240 cm: muro de palabras a distintos
 *            tamaños. Se tira más de un panel cambiando el número de panel,
 *            y puestos uno al lado del otro forman una pared sin repetirse.
 *
 * Los marcos van troquelados: el interior de la ventana se descarta, así que
 * ahí viven las instrucciones de corte — el impresor las ve, la foto no.
 *
 *   node scripts/generate-photobooth.mjs <diseño> [dpi] [panel]
 */

const root = process.cwd();
const outputDirectory = path.join(root, "public", "brand-assets", "print");
const iconPath = path.join(
  root,
  "public",
  "brand",
  "the-next-craft-icon-light.svg",
);
const manifestPath = path.join(root, "public", "brand-assets", "assets.json");

/*
  No hay hashtag oficial en el repo; este es el derivado obvio del nombre.
  Si marketing define otro, se cambia acá y se vuelve a generar.
*/
const hashtag = "#THENEXTCRAFT";

const colors = {
  void: "#1a1a17",
  deep: "#0f0f0d",
  tube: "#0b0b0d",
  bright: "#e9e7de",
  text: "#f2f0e9",
  bone: "#e6e3d8",
  keycap: "#d8d4c6",
  dim: "#a2a096",
  line: "#8c8a82",
  crafter: "#f8bb2d",
};

const fontFamily = "IBM Plex Mono";
const pixelFontFamily = "Silkscreen";
const scriptFontFamily = "Borel";
/* Solo la usa el muro impreso; el sitio no tiene sans. */
const sansFontFamily = "Archivo Black";

for (const family of [
  fontFamily,
  pixelFontFamily,
  scriptFontFamily,
  sansFontFamily,
]) {
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

const designs = {
  c64: {
    trim: { w: 900, h: 700 },
    bleed: 5,
    background: colors.bone,
    scanlines: false,
    label: "90x70",
    dpi: 150,
    render: renderC64,
  },
  perfil: {
    trim: { w: 900, h: 700 },
    bleed: 5,
    background: colors.void,
    scanlines: true,
    label: "90x70",
    dpi: 150,
    render: renderPerfil,
  },
  wall: {
    trim: { w: 1200, h: 2400 },
    bleed: 10,
    background: colors.void,
    scanlines: false,
    label: "120x240",
    dpi: 100,
    render: renderWall,
  },
};

const designName = process.argv[2] ?? "c64";
const design = designs[designName];
if (!design) {
  throw new Error(
    `Unknown design "${designName}". Available: ${Object.keys(designs).join(", ")}.`,
  );
}

const dpi = Number(process.argv[3] ?? design.dpi);
/* Solo lo usa el muro: siembra el azar para que cada panel salga distinto. */
const panel = Number(process.argv[4] ?? 1);
const trimW = design.trim.w;
const trimH = design.trim.h;
const bleed = design.bleed;
const canvasW = trimW + bleed * 2;
const canvasH = trimH + bleed * 2;
const width = Math.round((canvasW / 25.4) * dpi);
const height = Math.round((canvasH / 25.4) * dpi);
const scale = width / canvasW;
/** mm del sistema de recorte (0,0 = esquina de corte) a px del lienzo. */
const px = (mm) => Math.round((mm + bleed) * scale);
/** Longitud en mm a px, sin desplazar por el sangrado. */
const size = (mm) => Math.round(mm * scale);

/** Scanlines finas sobre todo el lienzo, para los diseños de tubo. */
function scanlines() {
  const step = Math.max(2, Math.round(1.2 * scale));
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <pattern id="scan" width="1" height="${step * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${step}" fill="#000" fill-opacity="0.22"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#scan)"/>
    </svg>
  `);
}

/** Pinta el isotipo de un solo color usando su alfa como silueta. */
async function paintedIcon(heightMm, color) {
  const resized = await sharp(iconPath, { density: 600 })
    .resize({ height: size(heightMm), fit: "inside" })
    .ensureAlpha()
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

/**
 * Marca de troquel más las instrucciones dentro de la ventana. Todo lo que
 * se dibuja acá desaparece al cortar, así que puede ser explícito.
 */
function dieCut(cut, rx = 0) {
  return `
    <rect x="${cut.x}" y="${cut.y}" width="${cut.w}" height="${cut.h}" rx="${rx}"
          fill="${colors.tube}"/>
    <rect x="${cut.x}" y="${cut.y}" width="${cut.w}" height="${cut.h}" rx="${rx}"
          fill="none" stroke="${colors.bright}" stroke-width="1.2"
          stroke-dasharray="14 8" stroke-opacity="0.7"/>
    <g font-family="${fontFamily}" font-weight="600" fill="${colors.line}"
       font-size="14" letter-spacing="2">
      <text x="${cut.x + 22}" y="${cut.y + 34}">TROQUEL — CORTAR POR LA LÍNEA PUNTEADA</text>
      <text x="${cut.x + 22}" y="${cut.y + 56}">ESTA ÁREA SE DESCARTA · NO IMPRIMIR SIN CORTE</text>
    </g>
    <text x="${cut.x + cut.w / 2}" y="${cut.y + cut.h / 2 + 16}" fill="${colors.line}"
          font-family="${pixelFontFamily}" font-weight="700" font-size="40"
          letter-spacing="-1" text-anchor="middle" opacity="0.45">AQUÍ VA TU CARA</text>
  `;
}

/* ─── Diseño: la computadora ─────────────────────────────────────── */

/**
 * Una fila de teclas centrada. Cada tecla lleva su sombra inferior, que es
 * lo que la hace leer como plástico moldeado y no como una caja dibujada.
 */
function keyRow(y, keys, { h = 34, gap = 7 } = {}) {
  const widths = keys.map((key) => key.w ?? 44);
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * (keys.length - 1);
  let cursor = (trimW - total) / 2;

  return keys
    .map((key, index) => {
      const w = widths[index];
      const x = cursor;
      cursor += w + gap;
      const face = key.accent ? colors.crafter : colors.keycap;
      return `
        <rect x="${x}" y="${y + 3}" width="${w}" height="${h}" rx="5" fill="${colors.line}" fill-opacity="0.55"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${face}"/>
        <text x="${x + w / 2}" y="${y + h / 2 + 5}" fill="${colors.void}" font-family="${fontFamily}"
              font-weight="600" font-size="${key.size ?? 14}" letter-spacing="1"
              text-anchor="middle">${key.label ?? ""}</text>
      `;
    })
    .join("");
}

function letterKeys(letters) {
  return [...letters].map((label) => ({ label }));
}

async function renderC64() {
  const bezel = { x: 68, y: 118, w: 764, h: 384, r: 34 };
  /* El anillo inferior es más ancho: ahí van la placa de marca y el LED. */
  const cut = {
    x: bezel.x + 24,
    y: bezel.y + 24,
    w: bezel.w - 48,
    h: bezel.h - 24 - 52,
  };

  const icon = await paintedIcon(46, colors.void);
  const vents = Array.from({ length: 6 }, (_, i) => {
    const y = 40 + i * 11;
    return `<rect x="646" y="${y}" width="192" height="4" rx="2" fill="${colors.line}" fill-opacity="0.5"/>`;
  }).join("");

  const svg = `
    <!-- Cuerpo: el beige lo pone el lienzo; acá solo la costura del molde -->
    <rect x="0" y="102" width="${trimW}" height="1.6" fill="${colors.line}" fill-opacity="0.35"/>
    ${vents}

    <text x="118" y="72" fill="${colors.void}" font-family="${pixelFontFamily}"
          font-weight="700" font-size="34" letter-spacing="-1">NEXT CRAFT 64</text>
    <text x="118" y="92" fill="${colors.line}" font-family="${fontFamily}"
          font-weight="600" font-size="13" letter-spacing="4.5">PERSONAL COMPUTER · 29 AGO 2026 · 12 HORAS</text>

    <!-- Tubo: bisel oscuro alrededor de la ventana -->
    <rect x="${bezel.x - 6}" y="${bezel.y - 6}" width="${bezel.w + 12}" height="${bezel.h + 12}"
          rx="${bezel.r + 6}" fill="${colors.line}" fill-opacity="0.45"/>
    <rect x="${bezel.x}" y="${bezel.y}" width="${bezel.w}" height="${bezel.h}" rx="${bezel.r}"
          fill="${colors.void}"/>

    ${dieCut(cut, 18)}

    <text x="${bezel.x + 26}" y="${bezel.y + bezel.h - 14}" fill="${colors.bone}"
          font-family="${scriptFontFamily}" font-size="20">the next craft</text>
    <text x="${bezel.x + bezel.w / 2}" y="${bezel.y + bezel.h - 18}" fill="${colors.dim}"
          font-family="${fontFamily}" font-weight="600" font-size="13" letter-spacing="4"
          text-anchor="middle">THENEXTCRAFT.ORG · <tspan fill="${colors.crafter}">${hashtag}</tspan></text>
    <circle cx="${bezel.x + bezel.w - 30}" cy="${bezel.y + bezel.h - 24}" r="6" fill="${colors.crafter}"/>
    <text x="${bezel.x + bezel.w - 46}" y="${bezel.y + bezel.h - 19}" fill="${colors.dim}"
          font-family="${fontFamily}" font-weight="600" font-size="12" letter-spacing="3"
          text-anchor="end">POWER</text>

    <!-- Teclado -->
    ${keyRow(524, [
      ...letterKeys("1234567890"),
      { label: "+" },
      { label: "-" },
      { label: "RUN", w: 84, accent: true, size: 15 },
    ])}
    ${keyRow(566, [...letterKeys("QWERTYUIOP@*"), { label: "CLR", w: 66 }])}
    ${keyRow(608, [...letterKeys("ASDFGHJKL:;"), { label: "RETURN", w: 110 }])}
    ${keyRow(650, [
      { label: "CTRL", w: 70 },
      { label: "C=", w: 50 },
      { label: "JUST SHIP IT", w: 360, size: 15 },
      { label: "SHIFT", w: 70 },
    ])}
  `;

  return { svg, layers: [{ input: icon.buffer, left: px(52), top: px(38) }] };
}

/* ─── Diseño: la tarjeta de perfil ───────────────────────────────── */

/** Botón falso de la barra inferior: contorno, o relleno si es el principal. */
function fakeButton(x, y, label, { filled = false } = {}) {
  const w = label.length * 9.4 + 44;
  const h = 42;
  return {
    w,
    svg: `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="21"
            fill="${filled ? colors.crafter : "none"}" stroke="${filled ? colors.crafter : colors.line}"
            stroke-width="1.8"/>
      <text x="${x + w / 2}" y="${y + h / 2 + 6}" fill="${filled ? colors.void : colors.bright}"
            font-family="${fontFamily}" font-weight="600" font-size="16" letter-spacing="2"
            text-anchor="middle">${label}</text>
    `,
  };
}

async function renderPerfil() {
  const cut = { x: 86, y: 122, w: 728, h: 348 };
  const icon = await paintedIcon(48, colors.text);

  /*
    Las celdas imitan la rejilla inferior del marco de LinkedIn: una para
    escribir con plumón y dos ya resueltas, que es donde está el chiste.
  */
  const cells = [
    { x: 48, w: 300, label: "NOMBRE", value: null },
    {
      x: 358,
      w: 240,
      label: "ROL",
      value: "CONSTRUYE COSAS",
      fill: colors.bright,
    },
    {
      x: 608,
      w: 244,
      label: "ESTADO",
      value: "SHIPPEANDO",
      fill: colors.crafter,
    },
  ];

  const cellSvg = cells
    .map(
      (cell) => `
        <text x="${cell.x}" y="${510}" fill="${colors.dim}" font-family="${fontFamily}"
              font-weight="600" font-size="13" letter-spacing="4.5">${cell.label}</text>
        ${
          cell.value
            ? `<text x="${cell.x}" y="${552}" fill="${cell.fill}" font-family="${fontFamily}"
                     font-weight="600" font-size="22" letter-spacing="1">${cell.value}</text>`
            : `<line x1="${cell.x}" y1="${556}" x2="${cell.x + cell.w - 20}" y2="${556}"
                     stroke="${colors.line}" stroke-width="1.6" stroke-dasharray="7 6"/>`
        }
      `,
    )
    .join("");

  const dividers = [348, 598]
    .map(
      (x) =>
        `<line x1="${x}" y1="486" x2="${x}" y2="572" stroke="${colors.line}" stroke-width="1" stroke-opacity="0.45"/>`,
    )
    .join("");

  const buttonLabels = [
    { label: "CONECTAR" },
    { label: "SEGUIR" },
    { label: "CONTRATAR", filled: true },
  ];
  const measured = buttonLabels.map((b) => fakeButton(0, 0, b.label, b).w);
  const gap = 18;
  let cursor =
    (trimW -
      (measured.reduce((s, w) => s + w, 0) + gap * (measured.length - 1))) /
    2;
  const buttons = buttonLabels
    .map((b, i) => {
      const button = fakeButton(cursor, 600, b.label, b);
      cursor += measured[i] + gap;
      return button.svg;
    })
    .join("");

  const svg = `
    <rect x="14" y="14" width="${trimW - 28}" height="${trimH - 28}" fill="none"
          stroke="${colors.line}" stroke-width="2.6" stroke-opacity="0.5"/>

    <text x="118" y="92" fill="${colors.text}" font-family="${scriptFontFamily}"
          font-size="60">the next craft</text>
    <g font-family="${fontFamily}" font-weight="600" text-anchor="end" letter-spacing="3">
      <text x="852" y="66" fill="${colors.dim}" font-size="15">HACKATHON · 12 HORAS</text>
      <text x="852" y="92" fill="${colors.bright}" font-size="15">29 AGO 2026 · 5 SEDES</text>
    </g>

    ${dieCut(cut)}

    <line x1="48" y1="486" x2="852" y2="486" stroke="${colors.line}" stroke-width="1" stroke-opacity="0.45"/>
    ${dividers}
    ${cellSvg}
    <line x1="48" y1="572" x2="852" y2="572" stroke="${colors.line}" stroke-width="1" stroke-opacity="0.45"/>

    ${buttons}

    <g font-family="${fontFamily}" font-weight="600" font-size="15" letter-spacing="8">
      <text x="48" y="682" fill="${colors.bright}">THENEXTCRAFT.ORG</text>
      <text x="852" y="682" fill="${colors.crafter}" text-anchor="end">${hashtag}</text>
    </g>
  `;

  return { svg, layers: [{ input: icon.buffer, left: px(50), top: px(44) }] };
}

/* ─── Diseño: el muro tipográfico ────────────────────────────────── */

/**
 * Ancho de tinta de un texto, en múltiplos del tamaño de fuente. Estimarlo
 * por número de caracteres solapaba las repeticiones al empaquetar, porque
 * ninguna de las familias que usa el muro es monoespaciada.
 */
async function inkWidth(text, family) {
  const probe = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="6000" height="400">
      <rect width="6000" height="400" fill="#000"/>
      <text x="20" y="260" font-family="${family}" font-size="100"
            xml:space="preserve" fill="#fff">${text}</text>
    </svg>
  `);
  const rendered = await sharp(probe).png().toBuffer();
  const { info } = await sharp(rendered)
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });

  return info.width / 100;
}

/**
 * Muro de una sola frase, un solo tamaño y una sola familia. La variedad
 * viene únicamente del tratamiento — relleno, apagado o solo contorno — y
 * del desfase de cada fila, que es lo que evita que se lea como una tabla.
 */
async function renderWall() {
  let state = (panel * 2654435761) >>> 0 || 1;
  const rand = () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };

  const phrase = "JUST SHIP IT";
  const ratio = await inkWidth(phrase, sansFontFamily);
  /* Tamaño único, calculado para que entren ~1,6 frases por fila. */
  const fontSize = Math.round(trimW / 1.6 / ratio);
  /* Un pelo de aire entre repeticiones: pegadas del todo dejan de leerse. */
  const advance = ratio * fontSize + fontSize * 0.14;
  const rowHeight = Math.round(fontSize * 0.94);

  const parts = [];
  let y = Math.round(fontSize * 0.6);

  while (y < trimH + rowHeight) {
    let x = -Math.floor(rand() * advance) - 30;
    const placed = [];

    while (x < trimW + 30) {
      /* Reparto parejo entre los tres tratamientos, no un fondo blanco. */
      const roll = rand();
      placed.push({
        x: Math.round(x),
        weight: roll < 1 / 3 ? "solid" : roll < 2 / 3 ? "dim" : "outline",
      });
      x += advance;
    }

    /*
      Al menos una repetición sólida y bien visible por fila. Dejándolo al
      azar salían bandas enteras en gris, y forzando una cualquiera a veces
      tocaba la que queda casi entera fuera del panel.
    */
    const visible = placed.filter(
      (item) => item.x > -advance * 0.35 && item.x < trimW - advance * 0.6,
    );
    const candidates = visible.length > 0 ? visible : placed;
    if (!candidates.some((item) => item.weight === "solid")) {
      candidates[Math.floor(rand() * candidates.length)].weight = "solid";
    }

    for (const item of placed) {
      const style =
        item.weight === "solid"
          ? `fill="${colors.text}"`
          : item.weight === "dim"
            ? `fill="${colors.line}" fill-opacity="0.5"`
            : `fill="none" stroke="${colors.line}" stroke-width="${Math.max(1.6, fontSize * 0.022)}" stroke-opacity="0.55"`;

      parts.push(
        `<text x="${item.x}" y="${y}" font-family="${sansFontFamily}" font-size="${fontSize}" xml:space="preserve" ${style}>${phrase}</text>`,
      );
    }

    y += rowHeight;
  }

  return { svg: parts.join("\n"), layers: [] };
}

/* ─── Render ─────────────────────────────────────────────────────── */

const { svg, layers } = await design.render();

const artwork = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
       viewBox="${-bleed} ${-bleed} ${canvasW} ${canvasH}">
    ${svg}
  </svg>
`);

const png = await sharp({
  create: { width, height, channels: 3, background: design.background },
})
  .composite([
    ...(design.scanlines ? [{ input: scanlines(), left: 0, top: 0 }] : []),
    ...layers,
    { input: artwork, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .withMetadata({ density: dpi })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const kind = designName === "wall" ? "backdrop" : "photobooth";
const suffix = designName === "wall" ? `panel${panel}-` : "";
const basename = `the-next-craft-${kind}-${designName}-${suffix}${design.label}-${dpi}dpi`;
await writeFile(path.join(outputDirectory, `${basename}.png`), png);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.files = {
  ...manifest.files,
  [`print/${basename}.png`]: `${width}x${height}`,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated public/brand-assets/print/${basename}.png — ${width}x${height}px (${design.label.replace("x", " x ")}cm + ${bleed}mm bleed @ ${dpi}dpi)`,
);
