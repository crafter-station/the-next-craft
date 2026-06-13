import { useTranslations } from "next-intl";

const EVENT_LINKS = [
  { key: "about", href: "#que-es" },
  { key: "tracks", href: "#tracks" },
  { key: "schedule", href: "#agenda" },
  { key: "prizes", href: "#premios" },
  { key: "faq", href: "#faq" },
] as const;

const COMMUNITY_LINKS = [
  { label: "crafterstation.com", href: "https://crafterstation.com" },
  { label: "nextfellow.ai", href: "https://nextfellow.ai" },
  {
    label: "GitHub crafter-station",
    href: "https://github.com/crafter-station",
  },
] as const;

/* Wordmark gigante: cada letra ondea con delay propio (keyframe letter-bob).
   Las letras se agrupan por palabra para que el wrap nunca parta una. */
const WAVE_WORD = "THE NEXT CRAFT";

function WaveWordmark() {
  let li = 0;
  return (
    <p className="wave-word">
      <span className="sr-only">{WAVE_WORD}</span>
      {WAVE_WORD.split(" ").map((word) => (
        <span key={word} className="wave-word-unit" aria-hidden="true">
          {word.split("").map((ch, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: letras estáticas ordenadas
              key={i}
              style={{ "--li": li++ } as React.CSSProperties}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}

/*
  Footer — las últimas líneas del programa BASIC: el wordmark gigante
  ondeando, tres columnas numeradas (80/90/100) que continúan los labels
  de sección de toda la página, y el END + READY. final.
*/
export function Footer() {
  const t = useTranslations("footer");
  const bylineLines = t("byline").split("\n");

  return (
    <footer className="bg-[var(--void)] border-t border-[var(--line)]/40 overflow-hidden">
      {/* ── Wordmark gigante ondeando ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-16 pb-4">
        <WaveWordmark />
      </div>

      {/* ── Columnas: continúan el programa BASIC ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-[var(--line)]/30">
        {/* Wordmark script + byline */}
        <div className="flex flex-col gap-3">
          <p className="font-script text-xl leading-[1.6] text-[var(--bright)]">
            the next craft
          </p>
          <p className="font-mono text-xs text-[var(--text-dim)] leading-[1.65]">
            {bylineLines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ordered static byline
              <span key={i}>
                {line}
                {i < bylineLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>

        {/* EVENT */}
        <div className="flex flex-col gap-4">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">80 </span>
            {t("sections.event")}
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {EVENT_LINKS.map(({ key, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150 py-1 inline-block"
                >
                  {t(`links.${key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* COMMUNITY */}
        <div className="flex flex-col gap-4">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">90 </span>
            {t("sections.community")}
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {COMMUNITY_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150 py-1 inline-block"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div className="flex flex-col gap-4">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">100 </span>
            {t("sections.contact")}
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            <li>
              <a
                href="mailto:hello@crafterstation.com"
                className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150 py-1 inline-block"
              >
                hello@crafterstation.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Final row: el programa termina ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="font-mono text-xs text-[var(--text-dim)]">
          {t("copyright")}
        </p>
        <p className="font-mono text-xs" aria-hidden="true">
          <span className="text-[var(--text-dim)]">{t("endLabel")}</span>
          <span className="text-[var(--bright)]">
            READY.<span className="cursor-blink">█</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
