import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

const HEADLINE_SPONSORS = [
  {
    wordmark: "NEXT FELLOW",
    role: "ORGANIZER",
    href: "https://nextfellow.ai",
  },
  {
    wordmark: "CRAFTER STATION",
    role: "ORGANIZER",
    href: "https://crafterstation.com",
  },
] as const;

export function Sponsors() {
  const t = useTranslations("sponsors");

  return (
    <section
      id="sponsors"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="60" name={t("label")} />

        {/* Headline sponsors — tabla fusionada, bordes compartidos sin radius */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 list-none m-0 p-0 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]"
          aria-label={t("headlineAria")}
        >
          {HEADLINE_SPONSORS.map(({ wordmark, role, href }) => (
            <li key={wordmark} className="group">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between gap-8 px-6 py-8 md:px-10 md:py-12 h-full
                           border-r border-b border-[var(--line)]
                           hover:bg-[var(--screen)] transition-colors duration-150 no-underline"
              >
                {/* Wordmark pixel */}
                <span
                  className="font-pixel font-bold uppercase leading-tight
                             text-[var(--text)] select-none break-words"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
                >
                  {wordmark}
                </span>

                {/* Role label */}
                <span className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                  {role}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Sponsor CTA */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.5] text-[var(--text-dim)]">
          {t("ctaPrefix")}{" "}
          <a
            href="mailto:sponsors@crafterstation.com"
            className="text-[var(--bright)] hover:text-[var(--text)] underline underline-offset-2 transition-colors duration-150"
          >
            sponsors@crafterstation.com
          </a>
        </p>
      </div>
    </section>
  );
}
