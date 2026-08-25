import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Renderer } from "@takumi-rs/core";

const fontDirectory = join(process.cwd(), "assets", "fonts");
const fontFiles = [
  "IBMPlexMono-Regular.ttf",
  "IBMPlexMono-Medium.ttf",
  "IBMPlexMono-Bold.ttf",
  "Silkscreen-Regular.ttf",
  "Silkscreen-Bold.ttf",
  "Borel-Regular.ttf",
];

let rendererPromise: Promise<Renderer> | null = null;

export function getBadgeRenderer(): Promise<Renderer> {
  if (!rendererPromise) {
    rendererPromise = (async () => {
      const renderer = new Renderer();
      for (const file of fontFiles) {
        await renderer.registerFont(await readFile(join(fontDirectory, file)));
      }
      return renderer;
    })();
  }
  return rendererPromise;
}
