/*
  Retratos del deck de kickoff.

  Los originales (public/brand-assets/source/portraits/**) son PNG de ~500 KB
  con fondo transparente; veinte de ellos en una sola slide son 10 MB. Este
  script los deja en WebP de 320 px bajo public/deck/**, que es donde viven los
  assets de deck.

  Los nombres de archivo del original no siempre coinciden con el slug oficial
  del mentor (el de public/brand-assets/social/roles/mentors), así que el mapeo
  es explícito: inventarlo por heurística fallaba en cesar/ellin/nicolas/…

  bun scripts/generate-kickoff-portraits.mjs
*/
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const SRC = "public/brand-assets/source/portraits";
const OUT = "public/deck/kickoff/people";

const MENTORS = {
  "arturo-barrantes": "arturo-barrantes.png",
  "cesar-duenas": "cesar.png",
  "danitza-rosas": "danitza-rosas.png",
  "ellin-orjuela": "ellin.png",
  "emmy-pardo": "emmy-pardo.png",
  "fiorella-cisneros": "fiorella-cisneros.png",
  "ignacio-velasquez": "ignacio-velasquez.png",
  "juan-ortega": "juan-ortega.png",
  "maria-cristina-ruelas": "maria-cristina-ruelas.png",
  "nicolas-vargas": "nicolas.png",
  "sandra-carrillo": "sandra.png",
  "victor-galvez": "victor-galvez.png",
  "yesica-qu": "yesica.png",
};

const JUDGES = {
  "arturo-barrantes": "arturo-barrantes.png",
  "daniel-lesage": "daniel-lesage.png",
  "duvan-salcedo": "duvan-salcedo.png",
  "fausto-rolandi": "fausto-rolandi.png",
  "josue-hernandez": "josue-hernandez.png",
  "terry-cruz": "terry-cruz.png",
};

async function run(role, map) {
  const outDir = join(OUT, role);
  await mkdir(outDir, { recursive: true });

  for (const [slug, file] of Object.entries(map)) {
    const out = join(outDir, `${slug}.webp`);
    await sharp(join(SRC, role, file))
      .resize(320, 320, { fit: "cover", position: "top" })
      .webp({ quality: 82 })
      .toFile(out);
    console.log(`✓ ${out}`);
  }
}

await run("mentors", MENTORS);
await run("judges", JUDGES);
