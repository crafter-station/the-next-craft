import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

const SPEC_KEYS = [
  "date",
  "place",
  "format",
  "hackers",
  "teams",
  "deadline",
] as const;

export function Tldr() {
  const t = useTranslations("tldr");

  return (
    <section
      id="tldr"
      className="relative px-6 md:px-12 lg:px-24 py-16 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="20" name={t("label")} />

        {/* Specs grid — paneles boot */}
        <ul
          className="grid grid-cols-2 md:grid-cols-3 gap-3 list-none m-0 p-0"
          aria-label={t("ariaLabel")}
        >
          {SPEC_KEYS.map((key) => {
            const sub = t(`specs.${key}.sub`);
            return (
              <li key={key} className="panel px-6 py-7 flex flex-col gap-3">
                <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                  {t(`specs.${key}.label`)}
                </p>
                <p
                  className="font-pixel font-bold leading-tight text-[var(--text)] tabular-nums"
                  style={{
                    fontSize: "clamp(0.875rem, 1.8vw, 1.25rem)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {t(`specs.${key}.value`)}
                </p>
                {sub !== "" && (
                  <p
                    className="font-mono text-xs text-[var(--text-dim)] tracking-wide tabular-nums"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {sub}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
