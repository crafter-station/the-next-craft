import { SectionHeader } from "./section-header";

const PERKS = [
  "Créditos de Vercel para desplegar",
  "Créditos de API de Anthropic",
  "Swag oficial del evento",
  "Acceso a la comunidad de Crafter Station",
  "Mentorías durante las 36 horas",
] as const;

export function Prizes() {
  return (
    <section
      id="premios"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="50" name="PREMIOS" />

        {/* Composición asimétrica 2/3 + 1/3 */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* ── Bloque protagonista: pantalla boot encendida ── */}
          <div className="relative lg:w-2/3 bg-[var(--screen)] border border-[var(--line)] rounded-xl flex flex-col justify-between gap-8 p-6 md:p-10 lg:p-14 overflow-hidden">
            {/* Scanlines del monitor */}
            <div
              className="scanlines absolute inset-0 pointer-events-none"
              aria-hidden="true"
            />

            {/* Cifra pixel gigante */}
            <div className="relative flex flex-col gap-4">
              <span
                className="font-pixel font-bold leading-none text-[var(--text)] select-none tabular-nums"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  fontVariantNumeric: "tabular-nums",
                }}
                aria-hidden="true"
              >
                $5,000
              </span>
              <span className="sr-only">Cinco mil dólares</span>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                USD AL EQUIPO GANADOR
              </p>
            </div>

            {/* Output de programa */}
            <p
              className="relative font-mono text-sm text-[var(--text)]/80"
              aria-hidden="true"
            >
              &gt; transferencia directa. sin vueltas.
            </p>
          </div>

          {/* ── Columna secundaria 1/3: perks ── */}
          <div className="lg:w-1/3 panel flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-7 py-5 border-b border-[var(--line)]/40">
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
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
                  className="flex items-start gap-3 px-7 py-4 border-b border-[var(--line)]/25 last:border-b-0"
                >
                  <span
                    className="font-mono text-sm text-[var(--bright)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <span className="font-sans text-sm text-[var(--text)] leading-snug">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nota del jurado */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.5] text-[var(--text-dim)]">
          El jurado evalúa: producto funcionando {">"} idea. Demo en vivo
          obligatoria.
        </p>
      </div>
    </section>
  );
}
