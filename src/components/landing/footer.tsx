const STATS = [
  { value: "36", unit: "HORAS" },
  { value: "150", unit: "HACKERS" },
  { value: "$5,000", unit: "USD" },
] as const;

const EVENTO_LINKS = [
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Track", href: "#tracks" },
  { label: "Agenda", href: "#agenda" },
  { label: "Premios", href: "#premios" },
  { label: "FAQ", href: "#faq" },
  { label: "Organizers", href: "#organizers" },
] as const;

const COMUNIDAD_LINKS = [
  {
    label: "crafterstation.com",
    href: "https://crafterstation.com",
    external: true,
  },
  {
    label: "GitHub crafter-station",
    href: "https://github.com/crafter-station",
    external: true,
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-[var(--void)] border-t border-[var(--line)]/40">
      {/* ── Stats row ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-10 grid grid-cols-3 gap-3">
        {STATS.map(({ value, unit }) => (
          <div
            key={unit}
            className="panel flex flex-col items-center justify-center gap-2 py-6 px-4"
          >
            <span
              className="font-pixel font-bold leading-none text-[var(--text)] tabular-nums"
              style={{
                fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)]">
              {unit}
            </span>
          </div>
        ))}
      </div>

      {/* ── Middle row: wordmark + link columns ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-[var(--line)]/30">
        {/* Wordmark */}
        <div className="flex flex-col gap-3">
          <p className="font-script text-xl leading-[1.6] text-[var(--bright)]">
            the next craft
          </p>
          <p className="font-mono text-xs text-[var(--text-dim)] leading-[1.65]">
            Hackathon por
            <br />
            Crafter Station × Next
            <br />
            Lima, Perú · Jul 2026
          </p>
        </div>

        {/* EVENTO */}
        <div className="flex flex-col gap-4">
          <p className="section-label">EVENTO</p>
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
          <p className="section-label">COMUNIDAD</p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {COMUNIDAD_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACTO */}
        <div className="flex flex-col gap-4">
          <p className="section-label">CONTACTO</p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            <li>
              <a
                href="mailto:hola@crafterstation.com"
                className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150 py-1 inline-block"
              >
                hola@crafterstation.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Final row: boot de despedida ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="font-mono text-xs text-[var(--text-dim)]">
          © 2026 Crafter Station × Next · Lima, Perú · -12.0464, -77.0428
        </p>
        <p className="font-mono text-xs text-[var(--text-dim)]">
          hecho a mano, no vibecodeado.{" "}
          <span className="text-[var(--bright)]" aria-hidden="true">
            READY.<span className="cursor-blink">█</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
