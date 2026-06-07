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

import { CornerMarks } from "./corner-marks";

export function Sponsors() {
  return (
    <section
      id="sponsors"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper-dim)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        {/* Section label */}
        <p className="section-label">[06] — SPONSORS</p>

        {/* Headline sponsors — 2 large cells side by side */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--blue)] list-none m-0 p-0"
          aria-label="Headline sponsors"
        >
          {HEADLINE_SPONSORS.map(({ wordmark, role, href }) => (
            <li key={wordmark} className="group bg-[var(--paper-dim)]">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between gap-8 px-6 py-8 md:px-10 md:py-12 h-full
                           bg-[var(--paper-dim)] hover:bg-[var(--blue)]
                           transition-colors duration-150 no-underline"
              >
                {/* Wordmark */}
                <span
                  className="font-sans font-extrabold leading-none
                             text-[var(--blue)] group-hover:text-white
                             transition-colors duration-150 select-none break-words"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 4.5rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {wordmark}
                </span>

                {/* Role label */}
                <span
                  className="font-mono text-xs font-medium tracking-[0.15em] uppercase
                             text-[var(--ink-dim)] group-hover:text-white/60
                             transition-colors duration-150"
                >
                  {role}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Tour partners */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-[var(--ink-dim)]">
            TOUR PARTNERS
          </p>
          <ul
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--blue)] list-none m-0 p-0"
            aria-label="Tour partners"
          >
            {PARTNERS.map((name) => (
              <li
                key={name}
                className="bg-[var(--paper-dim)] px-6 py-8 flex flex-col gap-3"
              >
                <span
                  className="font-mono font-bold leading-none tracking-[0.05em]
                             text-[var(--blue)] select-none"
                  style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
                >
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sponsor CTA */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.4] text-[var(--ink-dim)] border-t border-[var(--blue)] pt-4">
          {"¿Quieres ser sponsor? →"}{" "}
          <a
            href="mailto:sponsors@crafterstation.com"
            className="text-[var(--blue)] hover:text-[var(--blue-bright)] underline underline-offset-2 transition-colors duration-150"
          >
            sponsors@crafterstation.com
          </a>
        </p>
      </div>
    </section>
  );
}
