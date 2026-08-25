import type { Metadata } from "next";
import { connection } from "next/server";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { listPublishedParticipants } from "@/lib/badge/published";

import { BadgeGallery } from "@/components/badge/badge-gallery";
import { LanguageToggle } from "@/components/landing/language-toggle";

import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gallery">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/gallery`,
      languages: {
        es: "/es/gallery",
        en: "/en/gallery",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function GalleryPage({
  params,
}: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await connection();

  const t = await getTranslations({ locale, namespace: "gallery" });
  const participants = await listPublishedParticipants();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--line)]/40 bg-[var(--void)]/95 backdrop-blur-[2px]">
        <nav
          className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6 md:px-12"
          aria-label={t("navAria")}
        >
          <Link
            href="/"
            className="shrink-0 pt-2 font-script text-base leading-none text-[var(--bright)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            the next craft
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/"
              className="nav-link px-2.5 py-3 font-mono text-[11px] uppercase leading-[1.4] tracking-[0.14em]"
            >
              {t("backHome")}
            </Link>
          </div>
        </nav>
      </header>

      <main
        id="main-content"
        className="relative min-h-screen px-5 py-10 md:px-12 md:py-16"
      >
        <div className="grid-bg" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10">
          <header className="flex flex-col gap-5">
            <p className="section-label">
              <span className="text-[var(--text-dim)]">10 </span>
              PRINT &quot;{t("label")}&quot;
            </p>
            <h1
              className="pixel-heading"
              style={{ fontSize: "clamp(1.75rem, 6vw, 3.5rem)" }}
            >
              {t("headline")}
            </h1>
            <p className="max-w-2xl font-mono text-base leading-relaxed text-[var(--text-dim)]">
              {t("intro")}
            </p>
          </header>

          {participants.length === 0 ? (
            <section className="border border-[var(--line)] bg-[var(--screen-dim)] px-6 py-10 md:px-10">
              <p className="font-pixel text-xl uppercase text-[var(--text)]">
                {t("emptyTitle")}
              </p>
              <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-[var(--text-dim)]">
                {t("emptyBody")}
              </p>
              <Link
                href="/badge"
                className="keycap mt-8 inline-flex min-h-12 items-center justify-center px-6 font-pixel text-sm uppercase"
              >
                {t("emptyCta")}
              </Link>
            </section>
          ) : (
            <BadgeGallery
              participants={participants}
              labels={{
                search: t("search"),
                searchPlaceholder: t("searchPlaceholder"),
                emptySearch: t("emptySearch"),
                count: String(t.raw("count")),
                badgeAlt: String(t.raw("badgeAlt")),
              }}
            />
          )}

          <p className="font-mono text-sm text-[var(--bright)]">
            READY.<span className="cursor-blink">█</span>
          </p>
        </div>
      </main>
    </>
  );
}
