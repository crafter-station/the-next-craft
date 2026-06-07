import Link from "next/link";

const NAV_LINKS = [
  { label: "qué es", href: "#que-es" },
  { label: "tracks", href: "#tracks" },
  { label: "agenda", href: "#agenda" },
  { label: "premios", href: "#premios" },
  { label: "faq", href: "#faq" },
  { label: "organizers", href: "#organizers" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--paper)] border-b border-[var(--blue)]">
      <nav
        className="mx-auto max-w-7xl px-6 md:px-12 h-14 flex items-center justify-between"
        aria-label="Navegación principal"
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-mono text-sm font-medium text-[var(--blue)] hover:text-[var(--blue-bright)] transition-colors duration-150 shrink-0"
        >
          the-next-craft$
        </Link>

        {/* Links centro — ocultos en mobile */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="font-mono text-xs text-[var(--ink-dim)] hover:text-[var(--blue)] transition-colors duration-150 px-2 py-1"
              >
                [{label}]
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/postular"
          className="font-mono text-xs font-semibold tracking-widest uppercase bg-[var(--blue)] text-white px-4 py-2 hover:bg-[var(--blue-bright)] transition-colors duration-150 shrink-0"
        >
          Postular →
        </Link>
      </nav>
    </header>
  );
}
