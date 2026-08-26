import sharp from "sharp";

import { BADGE_HEIGHT, BADGE_WIDTH } from "./constants";

let texturePromise: Promise<Buffer> | null = null;

export function badgeTexture(): Promise<Buffer> {
  if (texturePromise) return texturePromise;

  const noise = Buffer.alloc(BADGE_WIDTH * BADGE_HEIGHT * 4);
  let seed = 0x4e584352;
  for (let offset = 0; offset < noise.length; offset += 4) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;

    const tone = seed & 1 ? 255 : 0;
    noise[offset] = tone;
    noise[offset + 1] = tone;
    noise[offset + 2] = tone;
    noise[offset + 3] = 3 + ((seed >>> 8) & 15);
  }

  texturePromise = sharp(noise, {
    raw: { width: BADGE_WIDTH, height: BADGE_HEIGHT, channels: 4 },
  })
    .png()
    .toBuffer();
  return texturePromise;
}
