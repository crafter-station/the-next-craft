import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

type Headline = {
  wordmark: string;
  role: string;
  href: string;
};

const PARTNERS = ["VERCEL", "ANTHROPIC", "SUPABASE", "ELEVENLABS"] as const;

export function Sponsors() {
  const t = useTranslations("sponsors");
  const headlineSponsors = t.raw("headlineSponsors") as readonly Headline[];

  return (
    <section
      id="sponsors"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="60" name={t("label")} />

        {/* Headline sponsors */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none m-0 p-0"
          aria-label={t("headlineAria")}
        >
          {headlineSponsors.map(({ wordmark, role, href }) => (
            <li key={wordmark} className="group">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="panel flex flex-col justify-between gap-8 px-6 py-8 md:px-10 md:py-12 h-full
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

        {/* Partners */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)]">
            {t("partnersLabel")}
          </p>
          <ul
            className="grid grid-cols-2 md:grid-cols-4 gap-3 list-none m-0 p-0"
            aria-label={t("partnersAria")}
          >
            {PARTNERS.map((name) => (
              <li key={name} className="panel px-6 py-7 flex flex-col gap-3">
                <span
                  className="font-mono font-bold leading-none tracking-[0.05em]
                             text-[var(--bright)] select-none"
                  style={{ fontSize: "clamp(0.9375rem, 1.4vw, 1.125rem)" }}
                >
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>

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
