import { CornerMarks } from "./corner-marks";
import { Countdown } from "./countdown";

export function Hero() {
  return (
    <section
      id="hero"
      className="blueprint-grid relative min-h-[calc(100svh-3.5rem)] flex flex-col justify-center px-6 md:px-12 lg:px-24 py-16 overflow-hidden"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-6">
        {/* Terminal prompt — first to appear */}
        <p className="font-mono text-xs text-[var(--ink-dim)] reveal reveal-d0">
          the-next-craft$ init --lima --36h
          <span className="cursor-blink" aria-hidden="true">
            ▌
          </span>
        </p>

        {/* Hero name */}
        <h1
          className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)] reveal reveal-d1"
          style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
        >
          THE NEXT
          <br />
          CRAFT
        </h1>

        {/* Tagline */}
        <p
          className="font-sans font-medium text-[var(--ink)] reveal reveal-d2"
          style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)" }}
        >
          De cero a producto en 36 horas.
        </p>

        {/* Countdown — protagonista sin label verbal */}
        <div className="pt-2 reveal reveal-d3">
          <Countdown />
        </div>

        {/* Specs — debajo del countdown para jerarquia correcta */}
        <p className="section-label text-[var(--ink-dim)] reveal reveal-d4 break-words max-w-full">
          24–26 JUL 2026 · LIMA, PERÚ · 150 HACKERS
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1 reveal reveal-d5">
          <a
            href="#postular"
            className="cta-btn font-mono font-semibold text-sm tracking-widest uppercase bg-[var(--blue)] text-white px-6 py-3 hover:bg-[var(--blue-bright)] transition-colors duration-150"
          >
            Postular <span className="cta-arrow">→</span>
          </a>
          <a
            href="#tracks"
            className="cta-btn font-mono font-semibold text-sm tracking-widest uppercase border border-[var(--blue)] text-[var(--blue)] px-6 py-3 hover:bg-[var(--blue)] hover:text-white transition-colors duration-150"
          >
            Ver tracks <span className="cta-arrow">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
