import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const brandDirectory = path.join(root, "public", "brand-assets");
const requestedRole = process.argv[2];
const requestedPerson = process.argv[3];

const roleConfigs = {
  mentors: {
    label: "MENTOR OFICIAL",
    people: [
      {
        firstName: "ARTURO",
        image: "arturo-barrantes.png",
        lastName: "BARRANTES",
        slug: "arturo-barrantes",
      },
      {
        firstName: "DAVID",
        image: "david-morales-norato.png",
        lastName: "MORALES NORATO",
        slug: "david-morales-norato",
      },
      {
        firstName: "EMMY",
        image: "emmy-pardo.png",
        lastName: "PARDO",
        slug: "emmy-pardo",
      },
      {
        firstName: "IGNACIO",
        image: "ignacio-velasquez.png",
        lastName: "VELASQUEZ",
        slug: "ignacio-velasquez",
      },
      {
        firstName: "JUAN",
        image: "juan-ortega.png",
        lastName: "ORTEGA",
        slug: "juan-ortega",
      },
      {
        firstName: "MARIA CRISTINA",
        image: "maria-cristina-ruelas.png",
        lastName: "RUELAS",
        slug: "maria-cristina-ruelas",
      },
      {
        firstName: "VICTOR",
        image: "victor-galvez.png",
        lastName: "GALVEZ",
        slug: "victor-galvez",
      },
      {
        firstName: "DANITZA",
        image: "danitza-rosas.png",
        lastName: "ROSAS",
        slug: "danitza-rosas",
      },
      {
        firstName: "FIORELLA",
        image: "fiorella-cisneros.png",
        lastName: "CISNEROS",
        slug: "fiorella-cisneros",
      },
      {
        firstName: "ELLIN",
        image: "ellin.png",
        lastName: "ORJUELA",
        slug: "ellin-orjuela",
      },
      {
        firstName: "NICOLAS",
        image: "nicolas.png",
        lastName: "VARGAS",
        slug: "nicolas-vargas",
      },
      {
        firstName: "SANDRA",
        image: "sandra.png",
        lastName: "CARRILLO",
        slug: "sandra-carrillo",
      },
      {
        firstName: "YESICA",
        image: "yesica.png",
        lastName: "QU",
        slug: "yesica-qu",
      },
      {
        firstName: "CESAR",
        image: "cesar.png",
        lastName: "DUENAS",
        slug: "cesar-duenas",
      },
    ],
  },
  judges: {
    label: "JURADO OFICIAL",
    people: [
      {
        firstName: "ADALIA",
        image: "adalia-zhao.png",
        lastName: "ZHAO",
        slug: "adalia-zhao",
      },
      {
        firstName: "ARTURO",
        image: "arturo-barrantes.png",
        lastName: "BARRANTES",
        slug: "arturo-barrantes",
      },
      {
        firstName: "DANIEL",
        image: "daniel-lesage.png",
        lastName: "LESAGE",
        slug: "daniel-lesage",
      },
      {
        firstName: "FAUSTO",
        image: "fausto-rolandi.png",
        lastName: "ROLANDI",
        slug: "fausto-rolandi",
      },
      {
        firstName: "JOSE LUIS",
        image: "jose-luis-koller.png",
        lastName: "KOLLER",
        slug: "jose-luis-koller",
      },
      {
        firstName: "JOSUE",
        image: "josue-hernandez.png",
        lastName: "HERNANDEZ",
        slug: "josue-hernandez",
      },
      {
        firstName: "NAHUEL",
        image: "nahuel-alberti.png",
        lastName: "ALBERTI",
        slug: "nahuel-alberti",
      },
      {
        firstName: "YAKKO",
        image: "yakko-majuri.png",
        lastName: "MAJURI",
        slug: "yakko-majuri",
      },
      {
        firstName: "DUVAN",
        image: "duvan-salcedo.png",
        lastName: "SALCEDO",
        slug: "duvan-salcedo",
      },
      {
        firstName: "TERRY",
        image: "terry-cruz.png",
        lastName: "CRUZ MELO",
        slug: "terry-cruz",
      },
    ],
  },
};

const selectedRoles = requestedRole
  ? Object.entries(roleConfigs).filter(([role]) => role === requestedRole)
  : Object.entries(roleConfigs);

if (selectedRoles.length === 0) {
  throw new Error('Use "mentors" or "judges" as the first argument.');
}

const colors = {
  void: "#1a1a17",
  screen: "#161613",
  line: "#8c8a82",
  text: "#f2f0e9",
  dim: "#a2a096",
  bright: "#e9e7de",
};
const fontFamily = "IBM Plex Mono";
const pixelFontFamily = "Silkscreen";
const scriptFontFamily = "Borel";
const width = 1080;
const height = 1350;

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

function asDataUri(buffer, mediaType) {
  return `data:${mediaType};base64,${buffer.toString("base64")}`;
}

function grain(seed) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="2" seed="${seed}" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 0.16"/></feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>
  `);
}

function nameSize(value) {
  if (value.length > 12) return 64;
  if (value.length > 9) return 72;
  return 82;
}

function artwork({ person, portraitUri, role }) {
  const firstNameSize = nameSize(person.firstName);
  const lastNameSize = nameSize(person.lastName);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="portrait-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stop-color="${colors.void}" stop-opacity="0"/>
          <stop offset="0.9" stop-color="${colors.void}" stop-opacity="0.9"/>
          <stop offset="1" stop-color="${colors.void}"/>
        </linearGradient>
      </defs>

      <rect width="1080" height="1350" fill="${colors.void}"/>
      <text x="540" y="89" fill="${colors.bright}" font-family="${scriptFontFamily}" font-size="34" text-anchor="middle">the next craft</text>

      <text x="540" y="190" fill="${colors.bright}" font-family="${pixelFontFamily}" font-size="24" font-weight="700" letter-spacing="3" text-anchor="middle">${role.label}</text>

      <image href="${portraitUri}" x="100" y="240" width="880" height="880" preserveAspectRatio="xMidYMid meet"/>
      <rect x="60" y="680" width="960" height="440" fill="url(#portrait-fade)"/>

      <g aria-label="Pixel fragments">
        <rect x="30" y="336" width="30" height="30" fill="${colors.text}"/>
        <rect x="0" y="366" width="30" height="30" fill="${colors.line}"/>
        <rect x="1020" y="424" width="34" height="34" fill="${colors.bright}"/>
        <rect x="1054" y="458" width="26" height="58" fill="${colors.screen}"/>
        <rect x="60" y="742" width="28" height="28" fill="${colors.dim}"/>
        <rect x="992" y="720" width="28" height="28" fill="${colors.text}"/>
      </g>

      <g font-family="${pixelFontFamily}" font-weight="700" text-anchor="middle">
        <text x="540" y="1210" fill="${colors.text}" font-size="${firstNameSize}" letter-spacing="-2">${person.firstName}</text>
        <text x="540" y="1300" fill="${colors.bright}" font-size="${lastNameSize}" letter-spacing="-2">${person.lastName}</text>
      </g>
    </svg>
  `);
}

const generatedFiles = {};

for (const [roleName, role] of selectedRoles) {
  const people = requestedPerson
    ? role.people.filter(({ slug }) => slug === requestedPerson)
    : role.people;
  if (people.length === 0) {
    throw new Error(`No ${roleName} entry found for "${requestedPerson}".`);
  }

  const portraitDirectory = path.join(
    brandDirectory,
    "source",
    "portraits",
    roleName,
  );
  const outputDirectory = path.join(
    brandDirectory,
    "social",
    "roles",
    roleName,
  );
  await mkdir(outputDirectory, { recursive: true });

  for (const [index, person] of people.entries()) {
    const portraitPath = path.join(portraitDirectory, person.image);
    const portrait = await sharp(portraitPath)
      .resize(880, 880, { fit: "contain", kernel: "nearest" })
      .greyscale()
      .linear(1.08, -5)
      .png()
      .toBuffer();
    const svg = artwork({
      person,
      portraitUri: asDataUri(portrait, "image/png"),
      role,
    });
    const png = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: colors.void,
      },
    })
      .composite([
        { input: svg, left: 0, top: 0 },
        {
          input: grain(index + (roleName === "mentors" ? 10 : 20)),
          left: 0,
          top: 0,
          blend: "screen",
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();
    const basename = `${person.slug}-linkedin-4x5`;

    await Promise.all([
      writeFile(path.join(outputDirectory, `${basename}.png`), png),
      sharp(png)
        .webp({ quality: 92, smartSubsample: true })
        .toFile(path.join(outputDirectory, `${basename}.webp`)),
    ]);

    generatedFiles[`social/roles/${roleName}/${basename}.png`] =
      `${width}x${height}`;
    generatedFiles[`social/roles/${roleName}/${basename}.webp`] =
      `${width}x${height}`;
    generatedFiles[`source/portraits/${roleName}/${person.image}`] =
      "1254x1254";
  }
}

const manifestPath = path.join(brandDirectory, "assets.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.palette = colors;
manifest.files = { ...manifest.files, ...generatedFiles };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated ${Object.keys(generatedFiles).filter((name) => name.includes("social/roles/")).length} LinkedIn role assets.`,
);
