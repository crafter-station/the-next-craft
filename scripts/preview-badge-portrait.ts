/**
 * Genera el retrato pixel art de una foto sin pasar por Trigger ni por la base
 * de datos, para iterar sobre `PIXEL_ART_PROMPT` y comparar resultados.
 *
 *   bun scripts/preview-badge-portrait.ts <foto> [--name "Emmy Pardo"] [--number 145]
 *
 * Escribe en `reports/badge-preview/<slug>/`: la entrada que ve el modelo, la
 * salida cruda, el retrato ya recortado y —si se pasa `--name`— el badge final.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

import { generateImage } from "ai";
import sharp from "sharp";

import { renderBadgeImage } from "@/lib/badge/image";

import {
  BADGE_IMAGE_MODEL,
  BADGE_IMAGE_QUALITY,
  PIXEL_ART_PROMPT,
} from "@/trigger/generate-participant-badge";

function arg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function runPython(input: string, output: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.env.PYTHON_BIN ?? "python3",
      ["python/remove_green_background.py", input, output],
      { stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`remove_green_background.py exited with ${code}`)),
    );
  });
}

const photoPath = process.argv[2];
if (!photoPath || photoPath.startsWith("--")) {
  throw new Error(
    'Usage: bun scripts/preview-badge-portrait.ts <foto> [--name "Nombre"] [--number 145]',
  );
}
if (!process.env.AI_GATEWAY_API_KEY) {
  throw new Error("AI_GATEWAY_API_KEY is missing");
}

const slug = basename(photoPath, extname(photoPath)).replace(
  /[^a-zA-Z0-9]+/g,
  "-",
);
const outDir = join("reports", "badge-preview", slug);
await mkdir(outDir, { recursive: true });

// Mismo preprocesado que la task.
const aiInput = await sharp(await readFile(photoPath), {
  limitInputPixels: 40_000_000,
})
  .rotate()
  .resize({
    width: 1024,
    height: 1536,
    fit: "contain",
    background: { r: 0, g: 255, b: 0, alpha: 1 },
  })
  .webp({ quality: 90 })
  .toBuffer();
await writeFile(join(outDir, "1-model-input.webp"), aiInput);

console.log(`Generando con ${BADGE_IMAGE_MODEL} (${slug})...`);
const startedAt = Date.now();
const { image } = await generateImage({
  model: BADGE_IMAGE_MODEL,
  prompt: { text: PIXEL_ART_PROMPT, images: [aiInput] },
  size: "1024x1536",
  providerOptions: { openai: { quality: BADGE_IMAGE_QUALITY } },
  abortSignal: AbortSignal.timeout(5 * 60 * 1000),
});
console.log(`Listo en ${Math.round((Date.now() - startedAt) / 1000)}s`);

const rawPath = join(outDir, "2-raw.png");
await writeFile(rawPath, image.uint8Array);

const portraitPath = join(outDir, "3-portrait.png");
await runPython(rawPath, portraitPath);

const name = arg("--name");
if (name) {
  const badge = await renderBadgeImage({
    displayName: name,
    participantNumber: Number(arg("--number") ?? 1),
    portrait: await readFile(portraitPath),
    shareUrl: "https://thenextcraft.org/es/participant/001",
  });
  await writeFile(join(outDir, "4-badge.jpg"), badge);
}

console.log(`Resultados en ${outDir}`);
