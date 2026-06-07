const TRACKS = [
  {
    number: "01",
    name: "AI CRAFT",
    description:
      "Agentes, copilots, productos AI-native que alguien usaría el lunes. Construidos con IA de verdad — no demos, no playgrounds.",
    ref: "→ track/ai-craft",
  },
  {
    number: "02",
    name: "OPEN WEB",
    description:
      "Librerías, CLIs, infraestructura abierta que sobreviva al evento. Herramientas para la comunidad dev que sigan siendo útiles la semana siguiente.",
    ref: "→ track/open-web",
  },
  {
    number: "03",
    name: "LOCAL IMPACT",
    description:
      "Fintech, logística, gobierno, educación — problemas de acá resueltos por gente de acá. Tecnología para LATAM, no adaptaciones de Silicon Valley.",
    ref: "→ track/local-impact",
  },
] as const;

import { CornerMarks } from "./corner-marks";

export function Tracks() {
  return (
    <section
      id="tracks"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-12">
        {/* Section label */}
        <p className="section-label">[03] — TRACKS</p>

        {/* Section headline */}
        <h2
          className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Tres frentes.
          <br />
          Un fin de semana.
        </h2>

        {/* Cards grid — gap-px + blue bg = shared 1px borders */}
        <ul
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--blue)] list-none m-0 p-0"
          aria-label="Tracks del hackathon"
        >
          {TRACKS.map(({ number, name, description, ref }) => (
            <li
              key={number}
              className="group bg-[var(--paper)] hover:bg-[var(--blue)] transition-colors duration-150 flex flex-col gap-0 overflow-hidden"
            >
              <div className="flex flex-col gap-4 px-6 pt-8 pb-6 flex-1">
                {/* Track number — mono giant, decorative */}
                <span
                  className="font-mono font-bold leading-none select-none text-[var(--blue)] group-hover:text-white/20 transition-colors duration-150"
                  style={{ fontSize: "clamp(4rem, 8vw, 6rem)" }}
                  aria-hidden="true"
                >
                  {number}
                </span>

                {/* Track name */}
                <h3
                  className="font-sans font-extrabold leading-none tracking-tight text-[var(--ink)] group-hover:text-white transition-colors duration-150"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}
                >
                  {name}
                </h3>

                {/* Description */}
                <p
                  className="font-sans text-[var(--ink-dim)] group-hover:text-white/80 leading-relaxed transition-colors duration-150"
                  style={{ fontSize: "clamp(0.875rem, 1.25vw, 1rem)" }}
                >
                  {description}
                </p>
              </div>

              {/* Footer ref — referencia de plano, sin prompt de terminal */}
              <div className="border-t border-[var(--blue)] group-hover:border-white/30 px-6 py-4 transition-colors duration-150">
                <p className="font-mono text-xs tracking-wide text-[var(--blue)] group-hover:text-white/60 transition-colors duration-150">
                  {ref}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
