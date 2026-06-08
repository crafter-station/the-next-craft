import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

/*
  Un solo track — el corazón de la hackathon: que tu producto tenga
  usuarios reales (o al menos uno) antes de que acabe el reloj.
*/
export function Tracks() {
  const t = useTranslations("tracks");
  const examples = t.raw("examples") as readonly string[];

  return (
    <section
      id="tracks"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <SectionHeader line="30" name={t("label")} />

        <h2
          className="pixel-heading"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        >
          {t("headlineLine1")}
          <br />
          {t("headlineLine2")}
        </h2>

        <p
          className="font-sans text-[var(--text)] leading-[1.75] max-w-2xl"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
        >
          {t("intro")}
        </p>

        {/* Panel único — qué cuenta como "tener usuarios" */}
        <div className="panel flex flex-col overflow-hidden max-w-3xl">
          <div className="px-7 py-5">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
              {t("whatCountsLabel")}
            </p>
          </div>

          <ul
            className="flex flex-col list-none m-0 p-0"
            aria-label={t("examplesAria")}
          >
            {examples.map((example) => (
              <li key={example} className="flex items-start gap-3 px-7 py-4">
                <span
                  className="font-mono text-sm text-[var(--bright)] shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
                <span className="font-sans text-[15px] text-[var(--text)] leading-relaxed">
                  {example}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
