/**
 * Genera los QR estáticos que usan los decks.
 *
 * Los slides se renderizan como MDX estatico, asi que el QR no se puede
 * generar en render. Se genera aca y se commitea el SVG en public/deck/qr.
 *
 * Uso: node scripts/generate-deck-qr.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";

const OUT_DIR = path.join(process.cwd(), "public", "deck", "qr");

// Colores del design system (globals.css / badge theme).
const DARK = "#1a1a17"; // --void
const LIGHT = "#f2f0e9"; // --text

const CODES = [
  {
    name: "bogota-jam",
    url: "https://spotify.link/c3zgBo84Z5b",
  },
  {
    name: "dashboard",
    url: "https://thenextcraft.org/es/dashboard",
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { name, url } of CODES) {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 0,
      color: { dark: DARK, light: LIGHT },
      errorCorrectionLevel: "M",
    });
    const file = path.join(OUT_DIR, `${name}.svg`);
    await writeFile(file, svg, "utf8");
    console.log(`${path.relative(process.cwd(), file)}  <-  ${url}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
