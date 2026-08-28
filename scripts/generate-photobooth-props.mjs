import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import React from "react";

import { Document, Image, Page, renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";

/**
 * Props de photobooth para The Next Craft — los carteles que la gente sostiene
 * en la foto ("él no quería venir", pero en versión hackathon).
 *
 * La paleta es la de `public/brand-assets/assets.json` y nada más: negros,
 * huesos y el ámbar de Crafter. Con tres tonos no se puede variar por color,
 * así que la variedad sale de la forma y del valor — cinco tratamientos y sus
 * inversiones, con el tramado de Bayer haciendo de tonos intermedios.
 *
 *   terminal — ventana con barra de título y cursor.
 *   bubble   — bocadillo de cómic recortado, con cola para agarrarlo.
 *   dither   — degradado tramado y tipografía calada.
 *   crt      — tubo de fósforo con scanlines y halo.
 *   tape     — carátula de casete: papel, franja y filetes.
 *
 * Salida: PNG de 30 x 18 cm + 4 mm de sangrado, un PDF por cartel y un PDF
 * de 18 páginas para mandar entero a imprimir.
 */

const root = process.cwd();
const outputDirectory = path.join(
  root,
  "public",
  "brand-assets",
  "print",
  "props",
);
const pdfDirectory = path.join(outputDirectory, "pdf");
const manifestPath = path.join(root, "public", "brand-assets", "assets.json");

const dpi = Number(process.argv[2] ?? 150);

const trimMm = { w: 300, h: 180 };
const bleedMm = 4;
const widthMm = trimMm.w + bleedMm * 2;
const heightMm = trimMm.h + bleedMm * 2;

const width = Math.round((widthMm / 25.4) * dpi);
const height = Math.round((heightMm / 25.4) * dpi);
const scale = width / widthMm;
const px = (mm) => Math.max(1, Math.round(mm * scale));
const pt = (mm) => (mm / 25.4) * 72;

/* La paleta del kit, tal cual. Nada fuera de esta lista entra en el arte. */
const brand = {
  void: "#1a1a17",
  screen: "#161613",
  line: "#8c8a82",
  dim: "#a2a096",
  bone: "#e6e3d8",
  bright: "#e9e7de",
  text: "#f2f0e9",
  crafter: "#f8bb2d",
};

const fontFamily = "IBM Plex Mono";
const pixelFontFamily = "Silkscreen";

/* Silkscreen es de píxel: el tracking negativo justo lo aprieta sin pegarlo. */
const letterSpacingRatio = -0.02;

/*
  `look` elige la variante dentro de cada plantilla. La palabra entre
  asteriscos es la que se acentúa; según la variante va coloreada o calada
  sobre un tapón del color contrario.
*/
const props = [
  {
    slug: "en-mi-maquina",
    template: "terminal",
    look: "amber",
    lines: ["EN MI MÁQUINA", "*SÍ* FUNCIONA"],
  },
  {
    slug: "no-toque-nada",
    template: "bubble",
    look: "paper",
    lines: ["NO TOQUÉ", "*NADA*"],
  },
  {
    slug: "fue-el-merge",
    template: "dither",
    look: "amber-rise",
    lines: ["FUE EL", "*MERGE*"],
  },
  {
    slug: "demo-5-minutos",
    template: "crt",
    look: "white",
    lines: ["EL DEMO FUNCIONABA", "HACE *5 MINUTOS*"],
  },
  {
    slug: "lo-hizo-la-ia",
    template: "tape",
    look: "amber",
    lines: ["LO HIZO", "LA *IA*"],
  },
  {
    slug: "solo-el-pitch",
    template: "terminal",
    look: "mono",
    lines: ["YO SOLO", "HICE EL *PITCH*"],
  },
  {
    slug: "deploy-viernes",
    template: "dither",
    look: "mono-fall",
    lines: ["DEPLOY EN", "*VIERNES*"],
  },
  {
    slug: "es-un-feature",
    template: "bubble",
    look: "mono",
    lines: ["NO ES UN BUG,", "ES UN *FEATURE*"],
  },
  {
    slug: "falta-el-css",
    template: "crt",
    look: "amber",
    lines: ["SOLO FALTA", "EL *CSS*"],
  },
  {
    slug: "cofounder-miente",
    template: "tape",
    look: "ink",
    lines: ["MI COFOUNDER", "ESTÁ *MINTIENDO*"],
  },
  {
    slug: "vine-por-la-pizza",
    template: "dither",
    look: "amber-fall",
    lines: ["VINE POR", "LA *PIZZA*"],
  },
  {
    slug: "ella-escribio-el-readme",
    template: "bubble",
    look: "amber",
    lines: ["ELLA ESCRIBIÓ", "EL *README*"],
  },
  {
    slug: "push-force",
    template: "terminal",
    look: "amber",
    lines: ["GIT PUSH", "--*FORCE*"],
  },
  {
    slug: "36-horas",
    template: "crt",
    look: "amber",
    lines: ["LLEVO *36 HORAS*", "DESPIERTO"],
  },
  {
    slug: "hay-wifi",
    template: "tape",
    look: "amber",
    lines: ["¿HAY *WIFI*?"],
  },
  {
    slug: "no-lei-las-bases",
    template: "bubble",
    look: "paper",
    lines: ["NO LEÍ", "LAS *BASES*"],
  },
  {
    slug: "arreglo-en-prod",
    template: "dither",
    look: "mono-rise",
    lines: ["ESO LO ARREGLO", "EN *PROD*"],
  },
  {
    slug: "rm-rf",
    template: "terminal",
    look: "mono",
    lines: ["RM -RF", "*NODE_MODULES*"],
  },
];

const escapeXml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------------ *
 * Medición de texto
 * ------------------------------------------------------------------ */

/*
  librsvg no expone métricas de texto, así que se miden rasterizando: cada
  cadena se dibuja a cuerpo 100 sobre un lienzo transparente y se recorta el
  alfa. Todo escala linealmente desde ahí. Sin esto no hay forma de centrar el
  bloque ni de saber dónde empieza la palabra acentuada.
*/
const MEASURE_SIZE = 100;
const MEASURE_BASELINE = 260;
const inkCache = new Map();
const advanceCache = new Map();

function measureSvg(text) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="7000" height="400">
      <text x="100" y="${MEASURE_BASELINE}" fill="#ffffff"
            font-family="${pixelFontFamily}" font-weight="700"
            font-size="${MEASURE_SIZE}"
            letter-spacing="${MEASURE_SIZE * letterSpacingRatio}"
            xml:space="preserve">${escapeXml(text)}</text>
    </svg>
  `);
}

async function measureInk(text) {
  if (inkCache.has(text)) return inkCache.get(text);

  const { info } = await sharp(measureSvg(text))
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });

  const inkTop = -(info.trimOffsetTop ?? 0);
  const metrics = {
    w: info.width,
    ascent: MEASURE_BASELINE - inkTop,
    descent: inkTop + info.height - MEASURE_BASELINE,
  };
  inkCache.set(text, metrics);
  return metrics;
}

/*
  Recortar por alfa mide tinta, no avance: el espacio final de "HACE " se
  evapora y la palabra acentuada se pega a la anterior. Encerrando el trozo
  entre barras y restando el ancho de "||" queda el avance real, espacios
  incluidos, sin depender de los bearings laterales.
*/
async function measureAdvance(text) {
  if (advanceCache.has(text)) return advanceCache.get(text);

  const [wrapped, empty] = await Promise.all([
    measureInk(`|${text}|`),
    measureInk("||"),
  ]);
  const advance = wrapped.w - empty.w;
  advanceCache.set(text, advance);
  return advance;
}

/* "ESTÁ *MINTIENDO*" -> [{ text: "ESTÁ ", accent: false }, { text: "MINTIENDO", accent: true }] */
function parseLine(line) {
  return line
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((chunk) =>
      chunk.startsWith("*") && chunk.endsWith("*")
        ? { text: chunk.slice(1, -1), accent: true }
        : { text: chunk, accent: false },
    );
}

/*
  Cada segmento se posiciona con su propia x en vez de encadenar tspans: así
  el tapón cae exactamente bajo la palabra y no a ojo.
*/
async function layoutBlock(lines, box, maxSize = 92) {
  const parsed = lines.map(parseLine);

  const measured = await Promise.all(
    parsed.map(async (segments) => {
      const withWidths = await Promise.all(
        segments.map(async (segment) => ({
          ...segment,
          advance: await measureAdvance(segment.text),
          ink: await measureInk(segment.text.trim() || "X"),
        })),
      );
      return {
        segments: withWidths,
        w: withWidths.reduce((total, s) => total + s.advance, 0),
      };
    }),
  );

  const ascent = Math.max(
    ...measured.flatMap((l) => l.segments.map((s) => s.ink.ascent)),
  );
  const descent = Math.max(
    ...measured.flatMap((l) => l.segments.map((s) => s.ink.descent)),
  );
  const leading = 1.24;

  const widest = Math.max(...measured.map((l) => l.w));
  const sizeByWidth = (box.w * MEASURE_SIZE) / widest;
  const inkPerSize =
    (lines.length - 1) * leading + (ascent + descent) / MEASURE_SIZE;
  const size = Math.min(sizeByWidth, box.h / inkPerSize, maxSize);

  const k = size / MEASURE_SIZE;
  const blockHeight =
    (lines.length - 1) * leading * size + (ascent + descent) * k;
  const firstBaseline = box.y + (box.h - blockHeight) / 2 + ascent * k;

  const placed = measured.map((line, index) => {
    let cursor = box.x + (box.w - line.w * k) / 2;
    const segments = line.segments.map((segment) => {
      const placedSegment = { ...segment, x: cursor, w: segment.advance * k };
      cursor += placedSegment.w;
      return placedSegment;
    });
    return {
      segments,
      baseline: firstBaseline + index * leading * size,
      end: cursor,
    };
  });

  return { size, lines: placed, ascent: ascent * k, descent: descent * k };
}

/*
  `ink`  color de la frase.  `accent` color de la palabra acentuada.
  `slab` tapón bajo la palabra acentuada, o null si va suelta.
  `outline` contorno de toda la frase, para que aguante sobre el tramado.
*/
function typeLayer(block, { ink, accent, slab, outline }) {
  const attrs = (fill) =>
    `fill="${fill}" font-family="${pixelFontFamily}" font-weight="700" font-size="${block.size}" letter-spacing="${block.size * letterSpacingRatio}" xml:space="preserve"`;

  const pass = (fillFor, extra = "") =>
    block.lines
      .map((line) =>
        line.segments
          .map(
            (segment) => `
        <text x="${segment.x}" y="${line.baseline}" ${attrs(fillFor(segment))} ${extra}>${escapeXml(segment.text)}</text>`,
          )
          .join(""),
      )
      .join("");

  const padX = block.size * 0.09;
  const padY = block.size * 0.15;
  const slabs = slab
    ? block.lines
        .flatMap((line) =>
          line.segments
            .filter((segment) => segment.accent)
            .map(
              (segment) => `
        <rect x="${segment.x - padX}" y="${line.baseline - block.ascent - padY}"
              width="${segment.w + padX * 2}"
              height="${block.ascent + block.descent + padY * 2}" fill="${slab}"/>`,
            ),
        )
        .join("")
    : "";

  /* El calado se pinta como una copia trazada por debajo: `paint-order` no es
     fiable en librsvg y aquí el contorno tiene que aguantar sobre la trama. */
  const outlinePass = outline
    ? pass(
        () => outline,
        `stroke="${outline}" stroke-width="${block.size * 0.22}" stroke-linejoin="round"`,
      )
    : "";

  return outlinePass + slabs + pass((s) => (s.accent ? accent : ink));
}

/* Marcas de corte en el sangrado: el borde del arte cae justo donde apuntan. */
function cropMarks(stroke) {
  const b = bleedMm;
  const arm = b * 0.7;
  return [
    [b, b, -1, -1],
    [b + trimMm.w, b, 1, -1],
    [b, b + trimMm.h, -1, 1],
    [b + trimMm.w, b + trimMm.h, 1, 1],
  ]
    .map(
      ([x, y, dx, dy]) => `
      <path d="M${x + dx * (b - arm)} ${y} H${x + dx * b}" stroke="${stroke}" stroke-opacity="0.7" stroke-width="0.35"/>
      <path d="M${x} ${y + dy * (b - arm)} V${y + dy * b}" stroke="${stroke}" stroke-opacity="0.7" stroke-width="0.35"/>`,
    )
    .join("");
}

const svgLayer = (body) =>
  Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${widthMm} ${heightMm}">
      ${body}
    </svg>
  `);

/* ------------------------------------------------------------------ *
 * Tramado ordenado
 * ------------------------------------------------------------------ */

// prettier-ignore
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

const rgb = (hex) => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

/*
  El tramado se calcula sobre una rejilla gruesa y se amplía con vecino más
  cercano: a 150 dpi un punto de un píxel real desaparece en la impresión y el
  degradado se lee como un plano liso, que es justo lo contrario del efecto.
*/
async function ditherField(ramp, colorA, colorB, cellMm = 0.85) {
  const cell = px(cellMm);
  const gw = Math.ceil(width / cell);
  const gh = Math.ceil(height / cell);
  const a = rgb(colorA);
  const b = rgb(colorB);
  const data = Buffer.alloc(gw * gh * 3);

  for (let y = 0; y < gh; y += 1) {
    for (let x = 0; x < gw; x += 1) {
      const t = Math.min(1, Math.max(0, ramp(x / (gw - 1), y / (gh - 1))));
      const threshold = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) / 64;
      const color = t > threshold ? b : a;
      const offset = (y * gw + x) * 3;
      data[offset] = color[0];
      data[offset + 1] = color[1];
      data[offset + 2] = color[2];
    }
  }

  return sharp(data, { raw: { width: gw, height: gh, channels: 3 } })
    .resize(width, height, { kernel: "nearest" })
    .png()
    .toBuffer();
}

/* ------------------------------------------------------------------ *
 * Plantillas
 * ------------------------------------------------------------------ */

const terminalLooks = {
  amber: {
    ink: brand.text,
    accent: brand.crafter,
    slab: null,
    cursor: brand.crafter,
  },
  mono: {
    ink: brand.text,
    accent: brand.void,
    slab: brand.bright,
    cursor: brand.bright,
  },
};

async function terminalTemplate(prop) {
  const look = terminalLooks[prop.look];
  const inner = {
    x: bleedMm + 11,
    y: bleedMm + 11,
    w: trimMm.w - 22,
    h: trimMm.h - 22,
  };
  const chromeH = 24;
  const promptBaseline = inner.y + inner.h - 12;
  const block = await layoutBlock(prop.lines, {
    x: inner.x + 16,
    y: inner.y + chromeH + 14,
    w: inner.w - 32,
    h: inner.h - chromeH - 14 - 34,
  });

  return {
    background: brand.void,
    layers: [
      {
        input: svgLayer(`
          <rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" rx="6" fill="${brand.screen}"/>
          <rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" rx="6"
                fill="none" stroke="${brand.line}" stroke-width="1.1"/>

          <path d="M${inner.x} ${inner.y + 6} a6 6 0 0 1 6 -6 h${inner.w - 12} a6 6 0 0 1 6 6 v${chromeH - 6} h${-inner.w} Z"
                fill="${brand.line}" fill-opacity="0.2"/>
          <path d="M${inner.x} ${inner.y + chromeH} h${inner.w}" stroke="${brand.line}" stroke-width="1"/>
          <rect x="${inner.x + 12}" y="${inner.y + 8.5}" width="7" height="7" fill="${look.cursor}"/>
          <rect x="${inner.x + 25}" y="${inner.y + 8.5}" width="7" height="7" fill="${brand.line}"/>
          <rect x="${inner.x + 38}" y="${inner.y + 8.5}" width="7" height="7" fill="${brand.dim}"/>
          <text x="${inner.x + inner.w / 2}" y="${inner.y + 16.5}" text-anchor="middle"
                fill="${brand.dim}" font-family="${fontFamily}" font-size="10"
                font-weight="500" letter-spacing="1.4">bash — 80x24</text>

          ${typeLayer(block, look)}

          <text x="${inner.x + 16}" y="${promptBaseline}" fill="${look.cursor}"
                font-family="${fontFamily}" font-size="12" font-weight="700">&gt;</text>
          <rect x="${inner.x + 29}" y="${promptBaseline - 8.5}" width="6.5" height="9" fill="${look.cursor}"/>

          ${cropMarks(brand.dim)}
        `),
        left: 0,
        top: 0,
      },
    ],
  };
}

const bubbleLooks = {
  paper: {
    fill: brand.bone,
    ink: brand.void,
    accent: brand.void,
    slab: brand.crafter,
    texture: brand.line,
  },
  mono: {
    fill: brand.text,
    ink: brand.void,
    accent: brand.text,
    slab: brand.void,
    texture: brand.line,
  },
  amber: {
    fill: brand.crafter,
    ink: brand.void,
    accent: brand.crafter,
    slab: brand.void,
    texture: brand.void,
  },
};

async function bubbleTemplate(prop) {
  const look = bubbleLooks[prop.look];
  const b = bleedMm;
  const bubble = {
    x0: b + 7,
    y0: b + 7,
    x1: b + trimMm.w - 7,
    y1: b + trimMm.h - 34,
    r: 18,
  };
  /* La cola no es decorativa: es por donde se agarra el cartel. */
  const tail = {
    left: b + 78,
    right: b + 128,
    tipX: b + 62,
    tipY: b + trimMm.h - 4,
  };

  const outline = [
    `M${bubble.x0 + bubble.r} ${bubble.y0}`,
    `H${bubble.x1 - bubble.r}`,
    `A${bubble.r} ${bubble.r} 0 0 1 ${bubble.x1} ${bubble.y0 + bubble.r}`,
    `V${bubble.y1 - bubble.r}`,
    `A${bubble.r} ${bubble.r} 0 0 1 ${bubble.x1 - bubble.r} ${bubble.y1}`,
    `H${tail.right}`,
    `L${tail.tipX} ${tail.tipY}`,
    `L${tail.left} ${bubble.y1}`,
    `H${bubble.x0 + bubble.r}`,
    `A${bubble.r} ${bubble.r} 0 0 1 ${bubble.x0} ${bubble.y1 - bubble.r}`,
    `V${bubble.y0 + bubble.r}`,
    `A${bubble.r} ${bubble.r} 0 0 1 ${bubble.x0 + bubble.r} ${bubble.y0}`,
    "Z",
  ].join(" ");

  const block = await layoutBlock(prop.lines, {
    x: bubble.x0 + 24,
    y: bubble.y0 + 20,
    w: bubble.x1 - bubble.x0 - 48,
    h: bubble.y1 - bubble.y0 - 40,
  });

  /* La trama vive dentro del bocadillo y se recorta con `dest-in`: pintarla
     sobre todo el pliego tapaba el borde negro que marca por dónde cortar. */
  const texture = await ditherField(
    (x, y) => Math.max(0, 0.4 - (x * 0.55 + y * 0.5)),
    look.fill,
    look.texture,
    1.1,
  );
  const shaded = await sharp(texture)
    .composite([
      {
        input: svgLayer(`<path d="${outline}" fill="#ffffff"/>`),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  return {
    background: brand.void,
    layers: [
      {
        input: svgLayer(`<path d="${outline}" fill="${look.fill}"/>`),
        left: 0,
        top: 0,
      },
      { input: shaded, left: 0, top: 0 },
      {
        input: svgLayer(`
          <path d="${outline}" fill="none" stroke="${brand.void}" stroke-width="2.6" stroke-linejoin="round"/>
          ${typeLayer(block, look)}
          ${cropMarks(brand.dim)}
        `),
        left: 0,
        top: 0,
      },
    ],
  };
}

/*
  El degradado siempre corre entre un extremo oscuro y uno claro; `rise` sube
  hacia el claro y `fall` cae hacia el oscuro. La frase va calada en claro con
  contorno oscuro, así que se lee en los dos extremos sin cambiar de color.
*/
const ditherLooks = {
  "amber-rise": {
    from: brand.void,
    to: brand.crafter,
    flip: false,
    accent: brand.crafter,
  },
  "amber-fall": {
    from: brand.crafter,
    to: brand.void,
    flip: true,
    accent: brand.crafter,
  },
  "mono-rise": {
    from: brand.void,
    to: brand.bright,
    flip: false,
    accent: brand.bright,
  },
  "mono-fall": {
    from: brand.bright,
    to: brand.void,
    flip: true,
    accent: brand.text,
  },
};

async function ditherTemplate(prop) {
  const look = ditherLooks[prop.look];
  const block = await layoutBlock(prop.lines, {
    x: bleedMm + 24,
    y: bleedMm + 26,
    w: trimMm.w - 48,
    h: trimMm.h - 52,
  });

  const ramp = look.flip
    ? (x, y) => 1.08 - ((1 - x) * 0.45 + (1 - y) * 0.75)
    : (x, y) => 1.08 - (x * 0.45 + y * 0.75);
  const field = await ditherField(ramp, look.from, look.to);

  return {
    background: brand.void,
    layers: [
      { input: field, left: 0, top: 0 },
      {
        input: svgLayer(`
          <!-- La palabra acentuada cruza el degradado de punta a punta: sin el
               tapón oscuro se desvanece justo en la mitad clara. -->
          ${typeLayer(block, {
            ink: brand.text,
            accent: look.accent,
            slab: brand.void,
            outline: brand.void,
          })}

          <!-- Doble filete: el degradado va de oscuro a claro, así que una
               sola línea se pierde en una de las dos esquinas. -->
          <rect x="${bleedMm + 10.7}" y="${bleedMm + 10.7}" width="${trimMm.w - 20}" height="${trimMm.h - 20}"
                fill="none" stroke="${brand.void}" stroke-opacity="0.45" stroke-width="1.6" stroke-dasharray="9 6"/>
          <rect x="${bleedMm + 10}" y="${bleedMm + 10}" width="${trimMm.w - 20}" height="${trimMm.h - 20}"
                fill="none" stroke="${brand.bone}" stroke-width="1.6" stroke-dasharray="9 6"/>
          ${cropMarks(brand.dim)}
        `),
        left: 0,
        top: 0,
      },
    ],
  };
}

/* Un monitor de fósforo pinta de un solo color: ámbar o blanco, nunca los dos. */
const crtLooks = {
  amber: { phosphor: brand.crafter, accent: brand.text },
  white: { phosphor: brand.bright, accent: brand.crafter },
};

async function crtTemplate(prop) {
  const look = crtLooks[prop.look];
  const tube = {
    x: bleedMm + 9,
    y: bleedMm + 9,
    w: trimMm.w - 18,
    h: trimMm.h - 18,
    r: 26,
  };
  const block = await layoutBlock(prop.lines, {
    x: tube.x + 17,
    y: tube.y + 22,
    w: tube.w - 34,
    h: tube.h - 44,
  });

  /* El desenfoque y el fantasma van en fracción del cuerpo: en valores fijos
     las frases largas —que salen a cuerpo pequeño— se comían bajo su halo. */
  const halo = block.size * 0.035;
  const ghost = block.size * 0.03;

  const step = px(0.85);
  const scanlines = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <pattern id="scan" width="1" height="${step * 2}" patternUnits="userSpaceOnUse">
          <rect width="1" height="${step}" fill="#000" fill-opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#scan)"/>
    </svg>
  `);

  const type = (options) => typeLayer(block, { slab: null, ...options });

  return {
    background: brand.screen,
    layers: [
      {
        input: svgLayer(`
          <defs>
            <radialGradient id="glow" cx="0.5" cy="0.44" r="0.68">
              <stop offset="0" stop-color="${look.phosphor}" stop-opacity="0.3"/>
              <stop offset="0.62" stop-color="${look.phosphor}" stop-opacity="0.08"/>
              <stop offset="1" stop-color="${look.phosphor}" stop-opacity="0"/>
            </radialGradient>
            <filter id="halo" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="${halo}"/>
            </filter>
          </defs>
          <rect x="${tube.x}" y="${tube.y}" width="${tube.w}" height="${tube.h}" rx="${tube.r}" fill="${brand.void}"/>
          <rect x="${tube.x}" y="${tube.y}" width="${tube.w}" height="${tube.h}" rx="${tube.r}" fill="url(#glow)"/>

          <!-- Fantasma de convergencia: la misma imagen desplazada, no una
               separación RGB, que se saldría de la paleta. -->
          <g transform="translate(${ghost} ${ghost * 0.4})" opacity="0.3">
            ${type({ ink: look.phosphor, accent: look.phosphor })}
          </g>
          <g filter="url(#halo)" opacity="0.45">
            ${type({ ink: look.phosphor, accent: look.accent })}
          </g>
          ${type({ ink: look.phosphor, accent: look.accent })}
        `),
        left: 0,
        top: 0,
      },
      { input: scanlines, left: 0, top: 0 },
      {
        input: svgLayer(`
          <rect x="${tube.x}" y="${tube.y}" width="${tube.w}" height="${tube.h}" rx="${tube.r}"
                fill="none" stroke="${look.phosphor}" stroke-opacity="0.45" stroke-width="1.8"/>
          <rect x="${bleedMm}" y="${bleedMm}" width="${trimMm.w}" height="${trimMm.h}"
                fill="none" stroke="${brand.screen}" stroke-width="8"/>
          ${cropMarks(brand.dim)}
        `),
        left: 0,
        top: 0,
      },
    ],
  };
}

const tapeLooks = {
  amber: {
    strip: brand.crafter,
    stripInk: brand.void,
    slab: brand.crafter,
    accent: brand.void,
  },
  ink: {
    strip: brand.void,
    stripInk: brand.bone,
    slab: brand.void,
    accent: brand.bone,
  },
};

async function tapeTemplate(prop) {
  const look = tapeLooks[prop.look];
  const b = bleedMm;
  const stripH = 30;
  const block = await layoutBlock(
    prop.lines,
    {
      x: b + 26,
      y: b + stripH + 16,
      w: trimMm.w - 52,
      h: trimMm.h - stripH - 42,
    },
    82,
  );

  /*
     Franja superior que se deshace hacia abajo: es la trama la que hace de
     degradado, porque un `linearGradient` liso rompe el registro retro. Los
     dos primeros tercios van planos — arrancando el tramado desde arriba, el
     "SIDE A" de la variante negra se perdía entre los puntos.
  */
  const top = b / heightMm;
  const bottom = (b + stripH) / heightMm;
  const solid = top + (bottom - top) * 0.62;
  const stripFade = await ditherField(
    (_x, y) => {
      if (y < solid) return 1;
      if (y > bottom) return 0;
      return 1 - (y - solid) / (bottom - solid);
    },
    brand.bone,
    look.strip,
  );

  const ruleY = b + trimMm.h - 26;

  return {
    background: brand.bone,
    layers: [
      { input: stripFade, left: 0, top: 0 },
      {
        input: svgLayer(`
          <rect x="${b}" y="${b}" width="${trimMm.w}" height="${trimMm.h}"
                fill="none" stroke="${brand.void}" stroke-width="3"/>
          <path d="M${b} ${b + stripH} H${b + trimMm.w}" stroke="${brand.void}" stroke-width="1.4" stroke-dasharray="4 3"/>

          <text x="${b + 14}" y="${b + 19.5}" fill="${look.stripInk}" font-family="${fontFamily}"
                font-size="11" font-weight="700" letter-spacing="3.4">SIDE A</text>
          <g fill="${look.stripInk}">
            <rect x="${b + trimMm.w - 62}" y="${b + 11}" width="9" height="9"/>
            <rect x="${b + trimMm.w - 46}" y="${b + 11}" width="9" height="9"/>
            <rect x="${b + trimMm.w - 30}" y="${b + 11}" width="9" height="9"/>
          </g>

          ${typeLayer(block, { ink: brand.void, accent: look.accent, slab: look.slab })}

          <path d="M${b + 26} ${ruleY} H${b + trimMm.w - 26}" stroke="${brand.line}" stroke-width="1"/>
          <path d="M${b + 26} ${ruleY + 7} H${b + trimMm.w - 26}" stroke="${brand.line}" stroke-opacity="0.5" stroke-width="1"/>
          ${cropMarks(brand.void)}
        `),
        left: 0,
        top: 0,
      },
    ],
  };
}

const templates = {
  terminal: terminalTemplate,
  bubble: bubbleTemplate,
  dither: ditherTemplate,
  crt: crtTemplate,
  tape: tapeTemplate,
};

async function renderProp(prop) {
  const { background, layers } = await templates[prop.template](prop);

  return sharp({ create: { width, height, channels: 3, background } })
    .composite(layers)
    .png({ compressionLevel: 9 })
    .withMetadata({ density: dpi })
    .toBuffer();
}

/* ------------------------------------------------------------------ *
 * PDF
 * ------------------------------------------------------------------ */

/* Página del tamaño exacto del pliego con sangrado, sin márgenes: la imprenta
   corta por las marcas, no por el borde del papel. */
const pageSize = [pt(widthMm), pt(heightMm)];

/*
  La imagen va posicionada en absoluto y en puntos, no en porcentaje: en flujo
  normal react-pdf la trata como un bloque que podría partirse y avisa de que
  no cabe. `wrap: false` tampoco sirve — colapsa la altura de la página a 0.
*/
const pdfPage = (png, key) =>
  React.createElement(
    Page,
    { key, size: pageSize, style: { width: pageSize[0], height: pageSize[1] } },
    React.createElement(Image, {
      src: { data: png, format: "png" },
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: pageSize[0],
        height: pageSize[1],
      },
    }),
  );

const renderPdf = (pages) =>
  renderToBuffer(React.createElement(Document, null, pages));

/* ------------------------------------------------------------------ *
 * Hoja de contactos
 * ------------------------------------------------------------------ */

async function contactSheet(rendered) {
  const columns = 3;
  const rows = Math.ceil(rendered.length / columns);
  const cell = { w: 760, h: 456 };
  const gap = 28;
  const pad = 44;
  const labelH = 34;
  const headerH = 96;

  const sheetW = pad * 2 + columns * cell.w + (columns - 1) * gap;
  const sheetH = pad * 2 + headerH + rows * (cell.h + labelH + gap) - gap;

  const tiles = await Promise.all(
    rendered.map(async ({ png }, index) => ({
      input: await sharp(png)
        .resize(cell.w, cell.h, { fit: "contain", background: brand.void })
        .png()
        .toBuffer(),
      left: pad + (index % columns) * (cell.w + gap),
      top:
        pad + headerH + Math.floor(index / columns) * (cell.h + labelH + gap),
    })),
  );

  const labels = rendered
    .map(({ prop }, index) => {
      const x = pad + (index % columns) * (cell.w + gap) + cell.w / 2;
      const y =
        pad +
        headerH +
        Math.floor(index / columns) * (cell.h + labelH + gap) +
        cell.h +
        23;
      return `<text x="${x}" y="${y}" text-anchor="middle" fill="${brand.dim}"
        font-family="${fontFamily}" font-size="16" font-weight="500" letter-spacing="1.4"
        >${escapeXml(`${prop.slug} · ${prop.template}/${prop.look}`)}</text>`;
    })
    .join("");

  const header = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}">
      <text x="${pad}" y="${pad + 40}" fill="${brand.text}" font-family="${pixelFontFamily}"
            font-size="38" font-weight="700" letter-spacing="-1">PROPS DE PHOTOBOOTH</text>
      <text x="${pad}" y="${pad + 70}" fill="${brand.dim}" font-family="${fontFamily}"
            font-size="17" font-weight="500" letter-spacing="2">30 x 18 CM + 4 MM DE SANGRADO · ${dpi} DPI</text>
      ${labels}
    </svg>
  `);

  return sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: brand.void,
    },
  })
    .composite([...tiles, { input: header, left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/* ------------------------------------------------------------------ */

await mkdir(pdfDirectory, { recursive: true });

const rendered = [];
for (const prop of props) {
  const png = await renderProp(prop);
  const basename = `the-next-craft-prop-${prop.slug}-30x18-${dpi}dpi`;
  await writeFile(path.join(outputDirectory, `${basename}.png`), png);
  await writeFile(
    path.join(pdfDirectory, `the-next-craft-prop-${prop.slug}.pdf`),
    await renderPdf([pdfPage(png, prop.slug)]),
  );
  rendered.push({ prop, png, basename });
  console.log(
    `  ${prop.template.padEnd(9)} ${prop.look.padEnd(11)} ${prop.slug}`,
  );
}

await writeFile(
  path.join(outputDirectory, "the-next-craft-props.pdf"),
  await renderPdf(rendered.map(({ prop, png }) => pdfPage(png, prop.slug))),
);

const sheet = await contactSheet(rendered);
const sheetName = "the-next-craft-props-contact-sheet";
await writeFile(path.join(outputDirectory, `${sheetName}.png`), sheet);
const sheetMeta = await sharp(sheet).metadata();

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.files = {
  ...manifest.files,
  ...Object.fromEntries(
    rendered.flatMap(({ prop, basename }) => [
      [`print/props/${basename}.png`, `${width}x${height}`],
      [
        `print/props/pdf/the-next-craft-prop-${prop.slug}.pdf`,
        `${trimMm.w}x${trimMm.h}mm`,
      ],
    ]),
  ),
  "print/props/the-next-craft-props.pdf": `${trimMm.w}x${trimMm.h}mm x${rendered.length}`,
  [`print/props/${sheetName}.png`]: `${sheetMeta.width}x${sheetMeta.height}`,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `\n${rendered.length} props · PNG ${width}x${height} + PDF por cartel + the-next-craft-props.pdf (${rendered.length} páginas)`,
);
