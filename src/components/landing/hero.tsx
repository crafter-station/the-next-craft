import { useTranslations } from "next-intl";

import { CircularText } from "@/components/effects/circular-text";
import { ScrambleText } from "@/components/effects/scramble-text";

import { Countdown } from "./countdown";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="hero"
      className="relative pt-0 pb-10 md:pb-14 bg-[var(--void)] overflow-hidden"
    >
      {/* Scanlines — cubren TODA la sección para que no se vea un "canvas" */}
      <div
        className="scanlines absolute inset-0 pointer-events-none z-10"
        aria-hidden="true"
      />

      <div className="relative z-20 flex flex-col items-center text-center">
        {/* H1 accesible — el wordmark visible vive dentro de la pantalla 3D */}
        <h1 className="sr-only">{t("h1")}</h1>

        {/*
          Escenario del C64: el modelo vive en el canvas fijo (C64Stage) y se
          estaciona sobre este anchor. Alrededor, un anillo de texto orbita
          la computadora.
        */}
        <div className="hero-stage reveal reveal-d1" aria-hidden="true">
          <div className="hero-orbit">
            <CircularText text={t("circular")} />
          </div>
          <div
            data-c64-anchor="hero"
            className="h-[380px] sm:h-[460px] lg:h-[540px] w-full"
          />
        </div>

        {/* Subhead — qué es, dónde, cuándo. Legible sin scroll. */}
        <div className="flex flex-col items-center gap-2 mt-6 md:mt-8 px-6 reveal reveal-d2">
          <p
            className="font-mono text-sm font-semibold text-[var(--bright)]"
            aria-hidden="true"
          >
            READY.
            <span className="cursor-blink">█</span>
          </p>
          <p
            className="font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
            style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
          >
            {t("subhead")}
          </p>
          <ScrambleText
            as="p"
            text={t("specs")}
            trigger="mount"
            delay={420}
            className="font-mono text-xs tracking-[0.18em] uppercase text-[var(--text-dim)] break-words max-w-full"
          />
        </div>

        {/* Countdown */}
        <div className="mt-4 px-6 reveal reveal-d3">
          <Countdown />
        </div>

        {/* CTAs — keycaps */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-5 px-6 reveal reveal-d4">
          <a
            href="#postular"
            data-magnetic
            className="cta-btn keycap font-mono font-semibold text-sm tracking-[0.12em] uppercase px-6 py-3 transition-colors duration-150"
          >
            {t("ctaApply")} <span className="cta-arrow">→</span>
          </a>
          <a
            href="#tracks"
            data-magnetic
            className="cta-btn keycap-ghost font-mono font-semibold text-sm tracking-[0.12em] uppercase px-6 py-3 transition-colors duration-150"
          >
            {t("ctaTracks")} <span className="cta-arrow">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
