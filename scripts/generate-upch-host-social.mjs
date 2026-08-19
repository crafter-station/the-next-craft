import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const brandDirectory = path.join(root, "public", "brand-assets");
const outputDirectory = path.join(brandDirectory, "social", "hosts");
const width = 1080;
const height = 1350;
const verticalOffset = 60;
const fontFamily = "IBM Plex Mono";
const pixelFontFamily = "Silkscreen";
const scriptFontFamily = "Borel";

const colors = {
  void: "#1a1a17",
  line: "#8c8a82",
  text: "#f2f0e9",
  dim: "#a2a096",
  bright: "#e9e7de",
};
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

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

function texture() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" seed="29" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.1"/></feComponentTransfer>
        </filter>
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="#000" fill-opacity="0.14"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain)"/>
      <rect width="100%" height="100%" fill="url(#scanlines)"/>
    </svg>
  `);
}

function artwork() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${colors.void}"/>

      <text x="540" y="${112 + verticalOffset}" fill="${colors.bright}" font-family="${scriptFontFamily}" font-size="34" text-anchor="middle">the next craft</text>

      <g font-family="${pixelFontFamily}" font-weight="700">
        <text x="540" y="${295 + verticalOffset}" fill="${colors.text}" font-size="82" letter-spacing="1" text-anchor="middle">YA TIENE</text>
        <text x="540" y="${397 + verticalOffset}" fill="${colors.text}" font-size="82" letter-spacing="1" text-anchor="middle">CASA</text>
      </g>

      <g font-family="${fontFamily}">
        <text x="540" y="${820 + verticalOffset}" fill="${colors.dim}" font-size="15" font-weight="700" letter-spacing="3" text-anchor="middle">HOST OFICIAL SEDE LIMA</text>
        <text x="540" y="${925 + verticalOffset}" fill="${colors.dim}" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle">GRACIAS A</text>
      </g>
    </svg>
  `);
}

const upchLockup = await sharp(
  path.join(
    root,
    "public",
    "deck",
    "brand-assets",
    "upch",
    "upch-logotipo-deck.svg",
  ),
)
  .resize({ width: 1000 })
  .grayscale()
  .png()
  .toBuffer();
const upchMetadata = await sharp(upchLockup).metadata();
const upchMark = await sharp(upchLockup)
  .extract({ left: 0, top: 0, width: 235, height: upchMetadata.height })
  .trim({ background: transparent })
  .resize({ height: 150 })
  .png()
  .toBuffer();
const upchNameTopSource = await sharp(upchLockup)
  .extract({ left: 257, top: 97, width: 559, height: 37 })
  .png()
  .toBuffer();
const upchNameBottomSource = await sharp(upchLockup)
  .extract({ left: 257, top: 152, width: 743, height: 57 })
  .png()
  .toBuffer();
const [upchNameTopMetadata, upchNameBottomMetadata] = await Promise.all([
  sharp(upchNameTopSource).metadata(),
  sharp(upchNameBottomSource).metadata(),
]);
const upchNameScale = 500 / upchNameBottomMetadata.width;
const upchNameTop = await sharp(upchNameTopSource)
  .resize({ width: Math.round(upchNameTopMetadata.width * upchNameScale) })
  .png()
  .toBuffer();
const upchNameBottom = await sharp(upchNameBottomSource)
  .resize({ width: 500 })
  .png()
  .toBuffer();

const bioincubaLockup = await sharp(
  path.join(brandDirectory, "source", "logos", "bioincuba.png"),
)
  .png()
  .toBuffer();
const bioincubaMark = await sharp(bioincubaLockup)
  .extract({ left: 0, top: 0, width: 267, height: 267 })
  .trim({ background: transparent })
  .resize({ height: 105 })
  .png()
  .toBuffer();
const bioincubaName = await sharp(bioincubaLockup)
  .extract({ left: 267, top: 50, width: 627, height: 170 })
  .trim({ background: transparent })
  .resize({ width: 330 })
  .png()
  .toBuffer();

function centered(input, top) {
  return sharp(input)
    .metadata()
    .then((metadata) => ({
      input,
      left: Math.round((width - metadata.width) / 2),
      top,
    }));
}

const png = await sharp(artwork())
  .composite([
    await centered(upchMark, 455 + verticalOffset),
    await centered(upchNameTop, 625 + verticalOffset),
    await centered(upchNameBottom, 675 + verticalOffset),
    await centered(bioincubaMark, 965 + verticalOffset),
    await centered(bioincubaName, 1075 + verticalOffset),
    { input: texture(), left: 0, top: 0, blend: "multiply" },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await mkdir(outputDirectory, { recursive: true });
const pngPath = path.join(outputDirectory, "upch-lima-linkedin.png");
const webpPath = path.join(outputDirectory, "upch-lima-linkedin.webp");
await Promise.all([
  writeFile(pngPath, png),
  sharp(png).webp({ quality: 92, smartSubsample: true }).toFile(webpPath),
]);

const manifestPath = path.join(brandDirectory, "assets.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.files["source/logos/bioincuba.png"] = "894x267";
manifest.files["social/hosts/upch-lima-linkedin.png"] = "1080x1350";
manifest.files["social/hosts/upch-lima-linkedin.webp"] = "1080x1350";
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated ${path.relative(root, pngPath)} and ${path.relative(root, webpPath)}`,
);
