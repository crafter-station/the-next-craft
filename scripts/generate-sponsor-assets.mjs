import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const outputRoot = path.join(root, "public", "brand-assets");
const outputDirectory = path.join(outputRoot, "social", "sponsors");
const computerSource = path.join(outputRoot, "source", "c64-social.png");
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

const sponsors = [
  {
    slug: "3devlabs",
    logo: "public/sponsors/3DevLabs.svg",
    width: 600,
  },
  {
    slug: "clerk",
    logo: "public/sponsors/clerk.svg",
    width: 830,
  },
  {
    slug: "cloudforge",
    logo: "public/sponsors/cloudforge/imagotipo_cloudforge.svg",
    width: 780,
  },
  {
    slug: "cursor",
    logo: "public/sponsors/cursor.svg",
    width: 780,
  },
  { slug: "exa", logo: "public/sponsors/exa.svg", width: 660 },
  {
    slug: "elevenlabs",
    logo: "public/sponsors/elevenlabs.svg",
    width: 820,
  },
  {
    slug: "tavily",
    logo: "public/sponsors/tavily.svg",
    width: 700,
  },
  { slug: "vapi", logo: "public/sponsors/vapi.svg", width: 680 },
];

const formats = [
  { platform: "instagram", width: 1080, height: 1350 },
  { platform: "linkedin", width: 1080, height: 1350 },
  { platform: "x", width: 1200, height: 1500 },
];

const colors = {
  void: "#1a1a17",
  line: "#8c8a82",
  text: "#f2f0e9",
  dim: "#a2a096",
  bright: "#e9e7de",
};

const screen = { left: 350, top: 61, width: 226, height: 162 };
const computerOpacity = 0.08;
const grainOpacity = 0.09;

async function centeredComputer() {
  const source = sharp(computerSource);
  const cleanScreen = await source
    .clone()
    .extract(screen)
    .blur(18)
    .png()
    .toBuffer();
  const screenMask = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${screen.width}" height="${screen.height}">
      <rect width="${screen.width}" height="${screen.height}" rx="12" fill="#fff"/>
    </svg>
  `);
  const maskedScreen = await sharp(cleanScreen)
    .joinChannel(await sharp(screenMask).extractChannel("alpha").toBuffer())
    .png()
    .toBuffer();
  const wordmark = await sharp(
    Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
        <text x="150" y="50" fill="#292b26" font-family="${scriptFontFamily}" font-size="23" text-anchor="middle" dominant-baseline="middle">the next craft</text>
      </svg>
    `),
  )
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const wordmarkMetadata = await sharp(wordmark).metadata();

  return source
    .composite([
      { input: maskedScreen, left: screen.left, top: screen.top },
      {
        input: wordmark,
        left: Math.round(
          screen.left + (screen.width - (wordmarkMetadata.width ?? 0)) / 2,
        ),
        top: Math.round(
          screen.top + (screen.height - (wordmarkMetadata.height ?? 0)) / 2,
        ),
      },
    ])
    .png()
    .toBuffer();
}

function artwork({ width, height }) {
  const scale = width / 1080;
  const center = width / 2;
  const headerNudge = Math.round(40 * scale);
  const wordmarkY = height - Math.round(244 * scale);
  const dateY = height - Math.round(188 * scale);
  const citiesY = height - Math.round(140 * scale);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <g font-family="${pixelFontFamily}">
        <text x="${center}" y="${Math.round(126 * scale) + headerNudge}" fill="${colors.dim}" font-size="${Math.round(22 * scale)}" font-weight="700" letter-spacing="5" text-anchor="middle">WELCOME TO OUR</text>
        <text x="${center}" y="${Math.round(230 * scale) + headerNudge}" fill="${colors.text}" font-size="${Math.round(76 * scale)}" font-weight="700" letter-spacing="4" text-anchor="middle">SPONSOR</text>
      </g>
      <text x="${center}" y="${wordmarkY}" fill="${colors.bright}" font-family="${scriptFontFamily}" font-size="${Math.round(31 * scale)}" text-anchor="middle">the next craft</text>
      <g font-family="${fontFamily}">
        <text x="${center}" y="${dateY}" fill="${colors.text}" font-size="${Math.round(34 * scale)}" font-weight="700" letter-spacing="3.5" text-anchor="middle">29 AUGUST 2026</text>
        <text x="${center}" y="${citiesY}" fill="${colors.dim}" font-size="${Math.round(12 * scale)}" font-weight="500" letter-spacing="1.5" text-anchor="middle">LIMA · AREQUIPA · BOGOTA · GUATEMALA · EL SALVADOR</text>
      </g>
    </svg>
  `);
}

function grain({ width, height }) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves="1" seed="64" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 ${grainOpacity}"/>
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>
  `);
}

function scanlines({ width, height }) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="#000" fill-opacity="0.14"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#scanlines)"/>
    </svg>
  `);
}

async function render(sponsor, format) {
  const scale = format.width / 1080;
  const computer = await sharp(await centeredComputer())
    .resize({ width: Math.round(900 * scale) })
    .removeAlpha()
    .ensureAlpha(computerOpacity)
    .png()
    .toBuffer();
  const computerMetadata = await sharp(computer).metadata();
  const resizedLogo = await sharp(await readFile(path.join(root, sponsor.logo)))
    .resize({ width: Math.round(sponsor.width * scale) })
    .png()
    .toBuffer();
  const metadata = await sharp(resizedLogo).metadata();
  const alpha = await sharp(resizedLogo)
    .ensureAlpha()
    .extractChannel("alpha")
    .toBuffer();
  const logo = await sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 3,
      background: colors.text,
    },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  const logoLeft = Math.round((format.width - (metadata.width ?? 0)) / 2);
  const logoTop = Math.round((format.height - (metadata.height ?? 0)) / 2);
  const computerLeft = Math.round(
    (format.width - (computerMetadata.width ?? 0)) / 2,
  );
  const computerTop = Math.round(
    (format.height - (computerMetadata.height ?? 0)) / 2,
  );

  const image = sharp({
    create: {
      width: format.width,
      height: format.height,
      channels: 3,
      background: colors.void,
    },
  }).composite([
    {
      input: computer,
      left: computerLeft,
      top: computerTop,
    },
    { input: artwork(format), left: 0, top: 0 },
    {
      input: logo,
      left: logoLeft,
      top: logoTop,
    },
    { input: grain(format), left: 0, top: 0, blend: "multiply" },
    { input: scanlines(format), left: 0, top: 0 },
  ]);

  const baseName = `${sponsor.slug}-${format.platform}`;
  const pngPath = path.join(outputDirectory, `${baseName}.png`);
  const webpPath = path.join(outputDirectory, `${baseName}.webp`);
  const png = await image.png({ compressionLevel: 9 }).toBuffer();

  await Promise.all([
    writeFile(pngPath, png),
    sharp(png).webp({ quality: 92, smartSubsample: true }).toFile(webpPath),
  ]);

  return {
    [`social/sponsors/${baseName}.png`]: `${format.width}x${format.height}`,
    [`social/sponsors/${baseName}.webp`]: `${format.width}x${format.height}`,
  };
}

await mkdir(outputDirectory, { recursive: true });

const generated = await Promise.all(
  sponsors.flatMap((sponsor) =>
    formats.map((format) => render(sponsor, format)),
  ),
);
const files = Object.assign({}, ...generated);
const manifestPath = path.join(outputRoot, "assets.json");
let manifest = { palette: colors, files: {} };

try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  // This generator can initialize the manifest in a fresh checkout.
}

manifest.palette = colors;
manifest.files = {
  ...Object.fromEntries(
    Object.entries(manifest.files).filter(
      ([name]) => !name.startsWith("social/sponsors/"),
    ),
  ),
  ...files,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Generated ${Object.keys(files).length} sponsor assets in ${path.relative(root, outputDirectory)}`,
);
