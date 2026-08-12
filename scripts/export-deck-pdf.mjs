import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import playwright from "/Users/cuevaio/.bun/install/global/node_modules/playwright/index.js";

const { chromium } = playwright;
const execFileAsync = promisify(execFile);

const [, , url, output] = process.argv;

if (!url || !output) {
  throw new Error("Usage: node scripts/export-deck-pdf.mjs <url> <output>");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const renderDir = await mkdtemp(join(tmpdir(), "interbank-deck-"));

await page.goto(url, { waitUntil: "networkidle" });
await page.addStyleTag({
  content:
    ".deck-chrome,.deck-controls,.deck-index,nextjs-portal{display:none!important}",
});

const slideCount = await page.locator(".deck-slide").count();
const images = [];

for (let index = 0; index < slideCount; index += 1) {
  const image = join(renderDir, `${String(index + 1).padStart(2, "0")}.png`);
  await page.screenshot({ path: image });
  images.push(image);
  if (index < slideCount - 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(250);
  }
}

await execFileAsync("magick", [...images, "-density", "150", output]);

await browser.close();
await rm(renderDir, { recursive: true, force: true });
