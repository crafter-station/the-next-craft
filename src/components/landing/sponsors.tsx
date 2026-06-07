import { SectionHeader } from "./section-header";

const HEADLINE_SPONSORS = [
  {
    wordmark: "NEXT",
    role: "HEADLINE SPONSOR",
    href: "https://nextjs.org",
  },
  {
    wordmark: "CRAFTER STATION",
    role: "ORGANIZER · COMMUNITY",
    href: "https://crafterstation.com",
  },
] as const;

const PARTNERS = ["VERCEL", "ANTHROPIC", "SUPABASE", "ELEVENLABS"] as const;

export function Sponsors() {
  return (
    <section
      id="sponsors"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="60" name="SPONSORS" />

        {/* Headline sponsors */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none m-0 p-0"
          aria-label="Headline sponsors"
        >
          {HEADLINE_SPONSORS.map(({ wordmark, role, href }) => (
            <li key={wordmark} className="group">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="panel flex flex-col justify-between gap-8 px-6 py-8 md:px-10 md:py-12 h-full
                           hover:bg-[var(--boot)] transition-colors duration-150 no-underline"
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
                <span className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--lav-bright)]">
                  {role}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Partners */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)]">
            PARTNERS
          </p>
          <ul
            className="grid grid-cols-2 md:grid-cols-4 gap-3 list-none m-0 p-0"
            aria-label="Tour partners"
          >
            {PARTNERS.map((name) => (
              <li key={name} className="panel px-6 py-7 flex flex-col gap-3">
                <span
                  className="font-mono font-bold leading-none tracking-[0.05em]
                             text-[var(--lav-bright)] select-none"
                  style={{ fontSize: "clamp(0.9375rem, 1.4vw, 1.125rem)" }}
                >
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sponsor CTA */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.5] text-[var(--text-dim)] border-t border-[var(--lav)]/40 pt-4">
          {"¿Quieres ser sponsor? →"}{" "}
          <a
            href="mailto:sponsors@crafterstation.com"
            className="text-[var(--lav-bright)] hover:text-[var(--text)] underline underline-offset-2 transition-colors duration-150"
          >
            sponsors@crafterstation.com
          </a>
        </p>
      </div>
    </section>
  );
}
