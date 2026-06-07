const PERKS = [
  "Créditos de Vercel para desplegar",
  "Créditos de API de Anthropic",
  "Swag oficial del evento",
  "Acceso a la comunidad de Crafter Station",
  "Mentorías durante las 36 horas",
] as const;

import { CornerMarks } from "./corner-marks";

export function Prizes() {
  return (
    <section
      id="premios"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        {/* Section label */}
        <p className="section-label">[05] — PREMIOS</p>

        {/* Main composition — asymmetric 2/3 + 1/3 */}
        <div className="flex flex-col lg:flex-row gap-0 border border-[var(--blue)]">
          {/* ── Bloque protagonista 2/3 ── */}
          <div className="lg:w-2/3 bg-[var(--blue)] flex flex-col justify-between gap-8 p-6 md:p-10 lg:p-14">
            {/* Prize amount — display gigantesco */}
            <div className="flex flex-col gap-4">
              <span
                className="font-sans font-extrabold leading-none tracking-tighter text-white select-none tabular-nums"
                style={{
                  fontSize: "clamp(4rem, 10vw, 8rem)",
                  fontVariantNumeric: "tabular-nums",
                }}
                aria-hidden="true"
              >
                $5,000
              </span>
              <span className="sr-only">Cinco mil dólares</span>
              <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-white/70">
                USD AL EQUIPO GANADOR
              </p>
            </div>

            {/* Terminal hint */}
            <p className="font-mono text-sm text-white/70" aria-hidden="true">
              {">"} transferencia directa. sin vueltas.
            </p>
          </div>

          {/* ── Columna secundaria 1/3 ── */}
          <div className="lg:w-1/3 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--blue)]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[var(--blue)]">
              <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-[var(--blue)]">
                PARA TODOS LOS QUE ENTRAN
              </p>
            </div>

            {/* Perks list */}
            <ul
              className="flex flex-col list-none m-0 p-0 flex-1"
              aria-label="Beneficios para todos los participantes"
            >
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-3 px-8 py-4 border-b border-[var(--blue)] last:border-b-0"
                >
                  <span
                    className="font-mono text-sm text-[var(--blue)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <span className="font-sans text-sm text-[var(--ink)] leading-snug">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer note — full width */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.4] text-[var(--ink-dim)] border-t border-[var(--blue)] pt-4">
          El jurado evalúa: producto funcionando {">"} idea. Demo en vivo
          obligatoria.
        </p>
      </div>
    </section>
  );
}
