import { SectionHeader } from "./section-header";

const TRACKS = [
  {
    number: "01",
    name: "AI CRAFT",
    description:
      "Agentes, copilots, productos AI-native que alguien usaría el lunes. Construidos con IA de verdad — no demos, no playgrounds.",
    ref: 'LOAD "AI-CRAFT",8,1',
  },
  {
    number: "02",
    name: "OPEN WEB",
    description:
      "Librerías, CLIs, infraestructura abierta que sobreviva al evento. Herramientas para la comunidad dev que sigan siendo útiles la semana siguiente.",
    ref: 'LOAD "OPEN-WEB",8,1',
  },
  {
    number: "03",
    name: "LOCAL IMPACT",
    description:
      "Fintech, logística, gobierno, educación — problemas de acá resueltos por gente de acá. Tecnología para LATAM, no adaptaciones de Silicon Valley.",
    ref: 'LOAD "LOCAL-IMPACT",8,1',
  },
] as const;

export function Tracks() {
  return (
    <section
      id="tracks"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <SectionHeader line="30" name="TRACKS" />

        <h2
          className="pixel-heading"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        >
          Tres frentes.
          <br />
          Un fin de semana.
        </h2>

        {/* Cards — paneles boot con hover a azul pleno */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none m-0 p-0"
          aria-label="Tracks del hackathon"
        >
          {TRACKS.map(({ number, name, description, ref }) => (
            <li
              key={number}
              className="group panel hover:bg-[var(--boot)] transition-colors duration-150 flex flex-col gap-0 overflow-hidden"
            >
              <div className="flex flex-col gap-4 px-6 pt-7 pb-6 flex-1">
                {/* Número pixel gigante */}
                <span
                  className="font-pixel font-bold leading-none select-none text-[var(--lav)] group-hover:text-[var(--lav-bright)] transition-colors duration-150"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
                  aria-hidden="true"
                >
                  {number}
                </span>

                {/* Track name */}
                <h3
                  className="font-pixel font-bold uppercase leading-tight text-[var(--text)]"
                  style={{ fontSize: "clamp(1rem, 1.6vw, 1.25rem)" }}
                >
                  {name}
                </h3>

                {/* Description */}
                <p
                  className="font-sans text-[var(--text-dim)] group-hover:text-[var(--text)]/85 leading-[1.65] transition-colors duration-150"
                  style={{ fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)" }}
                >
                  {description}
                </p>
              </div>

              {/* Footer — comando LOAD */}
              <div className="border-t border-[var(--lav)]/40 px-6 py-3">
                <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--lav-bright)]">
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
