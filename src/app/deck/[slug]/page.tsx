import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { compileMDX } from "next-mdx-remote/rsc";

import { listDecks, loadDeck } from "@/lib/decks/loader";

import { mdxComponents } from "@/components/decks/mdx-components";

import { DeckPager } from "./deck-pager";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await listDecks();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deck = await loadDeck(slug);
  if (!deck) return {};

  return {
    title: deck.meta.title,
    description: deck.meta.description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/deck/${slug}` },
  };
}

export default async function DeckPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deck = await loadDeck(slug);
  if (!deck) notFound();

  const compiledSlides = await Promise.all(
    deck.slides.map(async (slide) => {
      const { content } = await compileMDX({
        source: slide.source,
        components: mdxComponents,
        options: { parseFrontmatter: false, blockJS: false },
      });
      return {
        id: slide.id,
        title: slide.meta.title ?? slide.id,
        content,
      };
    }),
  );

  return (
    <DeckPager
      slug={slug}
      title={deck.meta.title}
      description={deck.meta.description}
      slides={compiledSlides}
    />
  );
}
