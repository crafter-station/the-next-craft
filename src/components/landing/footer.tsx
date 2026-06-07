const STATS = [
  { value: "36", unit: "HORAS" },
  { value: "150", unit: "HACKERS" },
  { value: "$5,000", unit: "USD" },
  { value: "1", unit: "FIN DE SEMANA" },
] as const;

const EVENTO_LINKS = [
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Tracks", href: "#tracks" },
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
    <footer className="bg-[var(--paper)] border-t border-[var(--blue)]">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-px bg-[var(--blue)]">
        {STATS.map(({ value, unit }) => (
          <div
            key={unit}
            className="bg-[var(--paper)] flex flex-col items-center justify-center gap-1 py-6 px-4"
          >
            <span className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)] tabular-nums text-2xl md:text-3xl lg:text-4xl">
              {value}
            </span>
            <span className="font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--ink-dim)]">
              {unit}
            </span>
          </div>
        ))}
      </div>

      {/* ── Middle row: wordmark + link columns ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-[var(--blue)]">
        {/* Wordmark */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm font-medium text-[var(--blue)]">
            the-next-craft$
          </p>
          <p className="font-mono text-xs text-[var(--ink-dim)] leading-relaxed">
            Hackathon por
            <br />
            Crafter Station × Next
            <br />
            Lima, Perú · Jul 2026
          </p>
        </div>

        {/* EVENTO */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--blue)]">
            EVENTO
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {EVENTO_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="font-mono text-xs text-[var(--ink-dim)] hover:text-[var(--blue)] transition-colors duration-150"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* COMUNIDAD */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--blue)]">
            COMUNIDAD
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {COMUNIDAD_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--ink-dim)] hover:text-[var(--blue)] transition-colors duration-150"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACTO */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--blue)]">
            CONTACTO
          </p>
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            <li>
              <a
                href="mailto:hola@crafterstation.com"
                className="font-mono text-xs text-[var(--ink-dim)] hover:text-[var(--blue)] transition-colors duration-150"
              >
                hola@crafterstation.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Final row: copyright + tagline ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="font-mono text-xs text-[var(--ink-dim)]">
          © 2026 Crafter Station × Next · Lima, Perú · -12.0464, -77.0428
        </p>
        <p className="font-mono text-xs text-[var(--ink-dim)]">
          hecho a mano, no vibecodeado.
        </p>
      </div>
    </footer>
  );
}
