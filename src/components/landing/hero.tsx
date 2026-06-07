import { C64Model } from "./c64-model";
import { Countdown } from "./countdown";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-8 md:py-12 bg-[var(--void)]"
    >
      {/* Pantalla C64 encendida: marco lavanda + boot screen azul */}
      <div className="crt-frame relative mx-auto max-w-6xl overflow-hidden">
        {/* Scanlines del monitor — decorativas */}
        <div
          className="scanlines absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center text-center gap-5 px-5 py-10 md:px-12 md:py-14">
          {/* Boot header */}
          <div className="flex flex-col gap-2 reveal reveal-d0">
            <p className="font-pixel text-[11px] sm:text-sm uppercase tracking-[0.04em] text-[var(--lav-bright)]">
              **** THE NEXT CRAFT 64 ****
            </p>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-dim)]">
              64K RAM SYSTEM · 36 HORAS FREE · LIMA BASIC V2
            </p>
          </div>

          {/* Wordmark script — letras unidas como el "hello." */}
          <h1
            className="font-script leading-[1.4] text-[var(--text)] reveal reveal-d1"
            style={{ fontSize: "clamp(2.75rem, 8vw, 5.5rem)" }}
          >
            the next craft
          </h1>

          {/* Tagline */}
          <p
            className="font-sans font-medium text-[var(--text)]/90 leading-[1.3] -mt-2 reveal reveal-d2"
            style={{ fontSize: "clamp(1.0625rem, 2.2vw, 1.375rem)" }}
          >
            De cero a producto en 36 horas.
          </p>

          {/* Commodore 64 en 3D — gira solo, arrastrable */}
          <div className="w-full reveal reveal-d3">
            <C64Model />
          </div>

          {/* READY. + specs */}
          <div className="flex flex-col items-center gap-2 reveal reveal-d4">
            <p
              className="font-mono text-sm font-semibold text-[var(--lav-bright)] self-start sm:self-center"
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
              GOTO Tracks <span className="cta-arrow">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
