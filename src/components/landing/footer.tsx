const EVENTO_LINKS = [
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Tracks", href: "#tracks" },
  { label: "Agenda", href: "#agenda" },
  { label: "Premios", href: "#premios" },
  { label: "FAQ", href: "#faq" },
] as const;

const COMUNIDAD_LINKS = [
  {
    label: "crafterstation.com",
    href: "https://crafterstation.com",
  },
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
            Hackathon por
            <br />
            Crafter Station × Next
            <br />
            Lima · Bogotá · Guatemala · Jul 2026
          </p>
        </div>

        {/* EVENTO */}
        <div className="flex flex-col gap-4">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">80 </span>EVENTO
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {EVENTO_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150 py-1 inline-block"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* COMUNIDAD */}
        <div className="flex flex-col gap-4">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">90 </span>COMUNIDAD
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {COMUNIDAD_LINKS.map(({ label, href }) => (
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

        {/* CONTACTO */}
        <div className="flex flex-col gap-4">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">100 </span>CONTACTO
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
          © 2026 Crafter Station × Next · Lima · Bogotá · Guatemala
        </p>
        <p className="font-mono text-xs" aria-hidden="true">
          <span className="text-[var(--text-dim)]">110 END · </span>
          <span className="text-[var(--bright)]">
            READY.<span className="cursor-blink">█</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
