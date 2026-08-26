import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

import { BADGE_THEME } from "./theme";

const brandDirectory = join(process.cwd(), "assets", "brand");
const organizerFiles = [
  { id: "open2", file: "open2.png" },
  { id: "ai-labs", file: "ai-labs.png" },
  { id: "nucleo-labs", file: "nucleo-labs.png" },
] as const;

const cache = new Map<string, Promise<{ uri: string; ratio: number }>>();

async function brandMark(file: string, height: number) {
  const key = `${file}:${height}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const built = (async () => {
    const source = await readFile(join(brandDirectory, file));
    const resized = await sharp(source, { density: 400 })
      .ensureAlpha()
      .resize({ height, fit: "inside" })
      .png()
      .toBuffer({ resolveWithObject: true });
    const tinted = await sharp({
      create: {
        width: resized.info.width,
        height: resized.info.height,
        channels: 4,
        background: BADGE_THEME.textDim,
      },
    })
      .composite([{ input: resized.data, blend: "dest-in" }])
      .png()
      .toBuffer();
    return {
      uri: `data:image/png;base64,${tinted.toString("base64")}`,
      ratio: resized.info.width / resized.info.height,
    };
  })();

  cache.set(key, built);
  return built;
}

export function crafterMark(height: number) {
  return brandMark("crafter-station-icon.svg", height);
}

export async function organizerMarks(height: number) {
  return Promise.all(
    organizerFiles.map(async ({ id, file }) => ({
      id,
      ...(await brandMark(file, height)),
    })),
  );
}
