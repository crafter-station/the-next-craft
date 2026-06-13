import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { LanguageToggle } from "./language-toggle";

const NAV_LINKS = [
  { key: "about", href: "#que-es" },
  { key: "tracks", href: "#tracks" },
  { key: "schedule", href: "#agenda" },
  { key: "prizes", href: "#premios" },
  { key: "faq", href: "#faq" },
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
              <a
                href={href}
                className="nav-link font-mono text-[11px] uppercase tracking-[0.14em] leading-[1.4] px-2.5 py-3"
              >
                {t(`links.${key}`)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />

          {/* CTA — keycap beige */}
          <a
            href="#postular"
            data-magnetic
            className="cta-btn keycap font-mono text-xs font-semibold tracking-[0.12em] uppercase px-4 py-2 transition-colors duration-150"
          >
            {t("cta")} <span className="cta-arrow">→</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
