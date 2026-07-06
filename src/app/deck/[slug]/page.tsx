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
    ...(deck.meta.image
      ? {
          openGraph: {
            type: "website",
            url: `/deck/${slug}`,
            title: deck.meta.title,
            description: deck.meta.description,
            images: [
              {
                url: deck.meta.image,
                width: 1200,
                height: 630,
                alt: deck.meta.title,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: deck.meta.title,
            description: deck.meta.description,
            images: [deck.meta.image],
          },
        }
      : {}),
    ...(deck.meta.icon || deck.meta.appleIcon
      ? {
          icons: {
            ...(deck.meta.icon ? { icon: deck.meta.icon } : {}),
            ...(deck.meta.appleIcon ? { apple: deck.meta.appleIcon } : {}),
          },
        }
      : {}),
    ...(deck.meta.manifest ? { manifest: deck.meta.manifest } : {}),
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
