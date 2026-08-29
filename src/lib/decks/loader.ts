import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import matter from "gray-matter";

const DECKS_DIR = join(process.cwd(), "src", "content", "decks");

/**
 * `style: "plain"` activa la variante tipográfica plana del deck: una sola
 * fuente (IBM Plex Mono) en vez del par pixel/mono, y listas sin recuadros.
 * Se opta por deck desde su deck.json; el resto mantiene el look C64.
 *
 * `style: "clean"` va más lejos: sale del look de marca por completo —fondo
 * claro, sans, sin pixel ni monoespaciada— para los decks que se proyectan en
 * sala iluminada y tienen que leerse desde la última fila.
 */
export type DeckStyle = "plain" | "editorial" | "clean";

export type DeckMeta = {
  title: string;
  description: string;
  image?: string;
  icon?: string;
  appleIcon?: string;
  manifest?: string;
  style?: DeckStyle;
} & Record<string, unknown>;

export type SlideMeta = {
  title: string;
} & Record<string, unknown>;

export type SlideSource = {
  meta: SlideMeta;
  source: string;
  number: number;
  id: string;
};

export type LoadedDeck = {
  meta: DeckMeta;
  slug: string;
  slides: SlideSource[];
};

const SLIDE_FILE_RE = /^(\d{2,})-.+\.mdx$/;

function parseSlideFilename(
  name: string,
): { number: number; id: string } | null {
  const match = SLIDE_FILE_RE.exec(name);
  if (!match) return null;
  return {
    number: Number.parseInt(match[1], 10),
    id: name.replace(/\.mdx$/, ""),
  };
}

export async function listDecks(): Promise<string[]> {
  const entries = await readdir(DECKS_DIR, { withFileTypes: true });
  const slugs: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await readFile(join(DECKS_DIR, entry.name, "deck.json"), "utf-8");
      slugs.push(entry.name);
    } catch {
      // missing deck.json — not a valid deck
    }
  }

  return slugs.sort();
}

export async function loadDeck(slug: string): Promise<LoadedDeck | null> {
  const deckDir = join(DECKS_DIR, slug);

  let rawMeta: string;
  try {
    rawMeta = await readFile(join(deckDir, "deck.json"), "utf-8");
  } catch {
    return null;
  }

  const meta = JSON.parse(rawMeta) as DeckMeta;
  const entries = await readdir(deckDir, { withFileTypes: true });
  const slides: SlideSource[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
    const parsed = parseSlideFilename(entry.name);
    if (!parsed) continue;

    const raw = await readFile(join(deckDir, entry.name), "utf-8");
    const { data, content } = matter(raw);

    slides.push({
      meta: data as SlideMeta,
      source: content,
      number: parsed.number,
      id: parsed.id,
    });
  }

  slides.sort((a, b) => a.number - b.number);

  return { meta, slug, slides };
}
