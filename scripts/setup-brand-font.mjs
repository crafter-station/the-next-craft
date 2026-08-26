import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const fontCommit = "2f9ba1b25957d958db71a849e85d72e3ecfb845a";
const googleFontsCommit = "00e726a90e0b9698971c37b88c35ef958965448b";
const fontDirectoryByPlatform = {
  darwin: path.join(os.homedir(), "Library", "Fonts"),
  linux: path.join(os.homedir(), ".local", "share", "fonts"),
};
const fontDirectory = fontDirectoryByPlatform[process.platform];
const fonts = [
  {
    fileName: "IBMPlexMono-Regular.ttf",
    url: `https://raw.githubusercontent.com/IBM/plex/${fontCommit}/packages/plex-mono/fonts/complete/ttf/IBMPlexMono-Regular.ttf`,
    checksum:
      "7c6fbddca4b700be918f5f6183d9bd4464fa427fe435f0b480d77fe2bb8c5a43",
  },
  {
    fileName: "IBMPlexMono-Bold.ttf",
    url: `https://raw.githubusercontent.com/IBM/plex/${fontCommit}/packages/plex-mono/fonts/complete/ttf/IBMPlexMono-Bold.ttf`,
    checksum:
      "74e5eedcfa4596497d34e19023cabdabd3a8c852b903007a5654a59591a72ffb",
  },
  {
    fileName: "Borel-Regular.ttf",
    url: `https://raw.githubusercontent.com/google/fonts/${googleFontsCommit}/ofl/borel/Borel-Regular.ttf`,
    checksum:
      "14ba894fe6b13f361c5beafab15048b90c4abbf282e3dbb477672462b323b3a8",
  },
  {
    fileName: "Silkscreen-Regular.ttf",
    url: `https://raw.githubusercontent.com/google/fonts/${googleFontsCommit}/ofl/silkscreen/Silkscreen-Regular.ttf`,
    checksum:
      "c845473330b94c2079ce9af01c51ac8ba2d99c24f4d14c039843bbb8e642ebd8",
  },
  {
    fileName: "ArchivoBlack-Regular.ttf",
    url: `https://raw.githubusercontent.com/google/fonts/${googleFontsCommit}/ofl/archivoblack/ArchivoBlack-Regular.ttf`,
    checksum:
      "dd9a89a019b4849f66ab75455fe7bdf931311042cbb0f0f97acc061539703180",
  },
  {
    fileName: "Silkscreen-Bold.ttf",
    url: `https://raw.githubusercontent.com/google/fonts/${googleFontsCommit}/ofl/silkscreen/Silkscreen-Bold.ttf`,
    checksum:
      "768476aa712d4f5c3e18d3bce80f980a8bd3f72b7094d22ec5e768df3acfed61",
  },
];

if (!fontDirectory) {
  throw new Error(
    `Automatic font setup is not supported on ${process.platform}. Install IBM Plex Mono manually.`,
  );
}

try {
  execFileSync("fc-match", ["--version"], { stdio: "ignore" });
} catch {
  throw new Error(
    "fontconfig is required. Install it with `brew install fontconfig` on macOS or your Linux package manager, then rerun this command.",
  );
}

await mkdir(fontDirectory, { recursive: true });

for (const font of fonts) {
  const fontPath = path.join(fontDirectory, font.fileName);
  let installedChecksum;

  try {
    installedChecksum = createHash("sha256")
      .update(await readFile(fontPath))
      .digest("hex");
  } catch {}

  if (installedChecksum === font.checksum) {
    console.log(`Font already installed at ${fontPath}`);
    continue;
  }

  const response = await fetch(font.url);
  if (!response.ok) {
    throw new Error(`Could not download ${font.url}: ${response.status}`);
  }

  const data = Buffer.from(await response.arrayBuffer());
  const checksum = createHash("sha256").update(data).digest("hex");
  if (checksum !== font.checksum) {
    throw new Error(`Downloaded ${font.fileName} checksum did not match.`);
  }

  await writeFile(fontPath, data);
  console.log(`Installed ${font.fileName} at ${fontPath}`);
}

execFileSync("fc-cache", ["-f", fontDirectory], { stdio: "inherit" });

const resolvedFamily = execFileSync("fc-match", [
  "--format=%{family}",
  "IBM Plex Mono",
]).toString();
if (!resolvedFamily.split(",").includes("IBM Plex Mono")) {
  throw new Error(
    `Font setup completed, but fontconfig resolved ${resolvedFamily}.`,
  );
}

const resolvedScriptFamily = execFileSync("fc-match", [
  "--format=%{family}",
  "Borel",
]).toString();
if (!resolvedScriptFamily.split(",").includes("Borel")) {
  throw new Error(
    `Font setup completed, but fontconfig resolved ${resolvedScriptFamily}.`,
  );
}

const resolvedPixelFamily = execFileSync("fc-match", [
  "--format=%{family}",
  "Silkscreen",
]).toString();
if (!resolvedPixelFamily.split(",").includes("Silkscreen")) {
  throw new Error(
    `Font setup completed, but fontconfig resolved ${resolvedPixelFamily}.`,
  );
}

/* La sans no la usa el sitio: es solo para el muro tipográfico impreso. */
const resolvedSansFamily = execFileSync("fc-match", [
  "--format=%{family}",
  "Archivo Black",
]).toString();
if (!resolvedSansFamily.split(",").includes("Archivo Black")) {
  throw new Error(
    `Font setup completed, but fontconfig resolved ${resolvedSansFamily}.`,
  );
}

console.log(
  "IBM Plex Mono, Borel, Silkscreen, and Archivo Black are ready for brand asset generation.",
);
