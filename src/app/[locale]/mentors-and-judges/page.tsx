import type { Metadata } from "next";
import Image from "next/image";

import { Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageToggle } from "@/components/landing/language-toggle";

import { Link } from "@/i18n/navigation";
import assetManifest from "../../../../public/brand-assets/assets.json";

const roles = ["mentors", "judges"] as const;

const nameOverrides: Record<string, string> = {
  "cesar-duenas": "Cesar Duenas",
  "maria-cristina-ruelas": "Maria Cristina Ruelas",
  "terry-cruz": "Terry Cruz Melo",
};

function displayName(slug: string) {
  return (
    nameOverrides[slug] ??
    slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

const assetsByRole = Object.fromEntries(
  roles.map((role) => [
    role,
    Object.keys(assetManifest.files)
      .filter(
        (path) =>
          path.startsWith(`social/roles/${role}/`) && path.endsWith(".png"),
      )
      .map((path) => {
        const slug = path.split("/").at(-1)?.replace("-linkedin-4x5.png", "");

        if (!slug) throw new Error(`Invalid role asset path: ${path}`);

        return {
          name: displayName(slug),
          pngPath: `/brand-assets/${path}`,
          previewPath: `/brand-assets/${path.replace(".png", ".webp")}`,
        };
      })
      .toSorted((a, b) => a.name.localeCompare(b.name)),
  ]),
) as Record<(typeof roles)[number], RoleAsset[]>;

type RoleAsset = {
  name: string;
  pngPath: string;
  previewPath: string;
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/mentors-and-judges">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roleGallery" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${locale}/mentors-and-judges`,
      languages: {
        es: "/es/mentors-and-judges",
        en: "/en/mentors-and-judges",
      },
    },
  };
}

export default async function MentorsAndJudgesPage({
  params,
}: PageProps<"/[locale]/mentors-and-judges">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "roleGallery" });

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
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-16">
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

          {roles.map((role, roleIndex) => (
            <section key={role} className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-4">
                <h2 className="font-pixel text-xl uppercase text-[var(--text)] md:text-2xl">
                  {t(role)}
                </h2>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-dim)]">
                  {t("count", { count: assetsByRole[role].length })}
                </p>
              </div>

              <ul className="m-0 grid list-none grid-cols-1 gap-px bg-[var(--line)] p-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {assetsByRole[role].map((asset) => (
                  <li
                    key={asset.pngPath}
                    className="flex flex-col bg-[var(--screen-dim)]"
                  >
                    <Image
                      src={asset.previewPath}
                      width={1080}
                      height={1350}
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      alt={t("imageAlt", {
                        name: asset.name,
                        role: t(role),
                      })}
                      className="aspect-[4/5] h-auto w-full bg-[var(--void)] object-cover"
                      preload={
                        roleIndex === 0 && asset === assetsByRole[role][0]
                      }
                    />
                    <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] p-4">
                      <p className="min-w-0 font-mono text-sm font-semibold uppercase leading-snug text-[var(--text)]">
                        {asset.name}
                      </p>
                      <a
                        href={asset.pngPath}
                        download
                        className="keycap inline-flex min-h-10 shrink-0 items-center justify-center gap-2 px-3 font-pixel text-[10px] uppercase"
                        aria-label={t("downloadFor", { name: asset.name })}
                      >
                        <Download aria-hidden="true" className="size-4" />
                        <span className="hidden sm:inline">
                          {t("download")}
                        </span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="font-mono text-sm text-[var(--bright)]">
            READY.<span className="cursor-blink">█</span>
          </p>
        </div>
      </main>
    </>
  );
}
