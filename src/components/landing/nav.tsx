import { Gamepad2, Grid3x3 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { CityPicker } from "./city-picker";
import { LanguageToggle } from "./language-toggle";

const NAV_LINKS = [
  { key: "about", href: "#que-es" },
  { key: "tracks", href: "#tracks" },
  { key: "schedule", href: "#agenda" },
  { key: "prizes", href: "#premios" },
  { key: "gallery", href: "/gallery" },
  { key: "faq", href: "#faq" },
] as const;

/*
  Apps externas (subdominios propios): el bingo y el juego de catch. Van
  como iconos siempre visibles — en desktop acompañados del label.
*/
const APP_LINKS = [
  {
    key: "bingo",
    href: "https://bingo.thenextcraft.crafter.run",
    Icon: Grid3x3,
  },
  {
    key: "game",
    href: "https://catch.thenextcraft.crafter.run",
    Icon: Gamepad2,
  },
] as const;

export function Nav() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 bg-[var(--void)]/95 backdrop-blur-[2px] border-b border-[var(--line)]/40">
      <nav
        className="mx-auto max-w-7xl px-6 md:px-12 h-14 flex items-center justify-between gap-4"
        aria-label={t("ariaLabel")}
      >
        {/* Wordmark — script estilo "hello." */}
        <Link
          href="/"
          className="font-script text-base leading-none text-[var(--bright)] hover:text-[var(--text)] transition-colors duration-150 shrink-0 pt-2"
        >
          the next craft
        </Link>

        {/* Links centro — ocultos en mobile */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={href}>
              {/*
                nav-link: color → lavanda bright en hover + subrayado
                1px que crece de izquierda a derecha (scaleX).
              */}
              {href.startsWith("/") ? (
                <Link
                  href={href}
                  className="nav-link font-mono text-[11px] uppercase tracking-[0.14em] leading-[1.4] px-2.5 py-3"
                >
                  {t(`links.${key}`)}
                </Link>
              ) : (
                <a
                  href={href}
                  className="nav-link font-mono text-[11px] uppercase tracking-[0.14em] leading-[1.4] px-2.5 py-3"
                >
                  {t(`links.${key}`)}
                </a>
              )}
            </li>
          ))}
          {APP_LINKS.map(({ key, href, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link font-mono text-[11px] uppercase tracking-[0.14em] leading-[1.4] px-2.5 py-3 inline-flex items-center gap-1.5"
              >
                <Icon aria-hidden="true" className="size-3.5" />
                {t(`links.${key}`)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-stretch gap-2 shrink-0">
          <Link
            href="/gallery"
            className="nav-link font-mono text-[11px] uppercase tracking-[0.14em] leading-[1.4] px-2.5 py-3 md:hidden"
          >
            {t("links.gallery")}
          </Link>
          {APP_LINKS.map(({ key, href, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(`links.${key}`)}
              title={t(`links.${key}`)}
              className="nav-link flex items-center px-2 py-3 md:hidden"
            >
              <Icon aria-hidden="true" className="size-4" />
            </a>
          ))}
          <LanguageToggle />

          {/* CTA — keycap beige. Abre el selector de sede: el registro son 5
              eventos de Luma, uno por ciudad. */}
          <CityPicker className="cta-btn keycap font-mono text-xs font-semibold tracking-[0.12em] uppercase px-4 py-2 transition-colors duration-150">
            {t("cta")} <span className="cta-arrow">→</span>
          </CityPicker>
        </div>
      </nav>
    </header>
  );
}
