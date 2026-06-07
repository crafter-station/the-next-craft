import { C64Model } from "./c64-model";
import { Countdown } from "./countdown";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative px-4 sm:px-6 md:px-12 lg:px-24 pt-0 pb-8 md:pb-10 bg-[var(--void)]"
    >
      {/* Boot screen full-bleed */}
      <div className="relative mx-auto max-w-6xl overflow-hidden">
        {/* Scanlines del monitor — decorativas */}
        <div
          className="scanlines absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center text-center gap-4 px-5 pt-0 pb-4 md:px-12">
          {/* H1 accesible — el wordmark visible vive dentro de la pantalla 3D */}
          <h1 className="sr-only">the next craft</h1>

          {/* Set Commodore 64 de frente, "the next craft" en la pantalla */}
          <div className="w-full reveal reveal-d1">
            <C64Model />
          </div>

          {/* READY. + specs */}
          <div className="flex flex-col items-center gap-2 reveal reveal-d4">
            <p
              className="font-mono text-sm font-semibold text-[var(--bright)] self-start sm:self-center"
              aria-hidden="true"
            >
              READY.
              <span className="cursor-blink">█</span>
            </p>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-dim)] break-words max-w-full">
              24–26 JUL 2026 · LIMA, PERÚ · 150 HACKERS
            </p>
          </div>

          {/* Countdown */}
          <div className="reveal reveal-d4">
            <Countdown />
          </div>

          {/* CTAs — keycaps */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1 reveal reveal-d5">
            <a
              href="#postular"
              className="cta-btn keycap font-mono font-semibold text-sm tracking-[0.12em] uppercase px-6 py-3 transition-colors duration-150"
            >
              RUN Postular <span className="cta-arrow">→</span>
            </a>
            <a
              href="#tracks"
              className="cta-btn keycap-ghost font-mono font-semibold text-sm tracking-[0.12em] uppercase px-6 py-3 transition-colors duration-150"
            >
              GOTO Track <span className="cta-arrow">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
