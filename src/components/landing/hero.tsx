import { CornerMarks } from "./corner-marks";
import { Countdown } from "./countdown";

export function Hero() {
  return (
    <section
      id="hero"
      className="blueprint-grid relative min-h-[calc(100svh-3.5rem)] flex flex-col justify-center px-6 md:px-12 lg:px-24 py-16 overflow-hidden"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8">
        {/* Terminal prompt */}
        <p className="font-mono text-xs text-[var(--ink-dim)]">
          the-next-craft$ init --lima --36h
        </p>

        {/* Hero name */}
        <h1
          className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)]"
          style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
        >
          THE NEXT
          <br />
          CRAFT
        </h1>

        {/* Tagline */}
        <p
          className="font-sans font-medium text-[var(--ink)]"
          style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)" }}
        >
          De cero a producto en 36 horas.
        </p>

        {/* Specs */}
        <p className="section-label text-[var(--ink-dim)]">
          24–26 JUL 2026 · LIMA, PERÚ · 150 HACKERS
        </p>

        {/* Countdown */}
        <div className="flex flex-col gap-3">
          <p className="section-label text-[var(--ink-dim)]">Faltan</p>
          <Countdown />
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="#postular"
            className="font-mono font-semibold text-sm tracking-widest uppercase bg-[var(--blue)] text-white px-6 py-3 hover:bg-[var(--blue-bright)] transition-colors duration-150"
          >
            Postular →
          </a>
          <a
            href="#tracks"
            className="font-mono font-semibold text-sm tracking-widest uppercase border border-[var(--blue)] text-[var(--blue)] px-6 py-3 hover:bg-[var(--blue)] hover:text-white transition-colors duration-150"
          >
            Ver tracks ↓
          </a>
        </div>
      </div>
    </section>
  );
}
