import { ScrambleText } from "@/components/effects/scramble-text";

/*
  Un solo track — el corazón de la hackathon: que tu producto tenga
  usuarios reales (o al menos uno) antes de que acabe el reloj.
  Presentado como "Work": grid numerado (#0001…) con wipe en hover.
*/
const WORK = [
  {
    id: "0001",
    title: "Landing + MVP",
    desc: "Una landing + MVP funcionando que consigue signups durante la hackathon.",
  },
  {
    id: "0002",
    title: "Lanzado en comunidad",
    desc: "Una herramienta lanzada en un grupo de WhatsApp, Discord, colegio o comunidad.",
  },
  {
    id: "0003",
    title: "Micro-SaaS",
    desc: "Un micro-SaaS donde al menos un usuario completa la acción principal.",
  },
  {
    id: "0004",
    title: "Marketplace",
    desc: "Un marketplace pequeño con publicaciones reales.",
  },
  {
    id: "0005",
    title: "Herramienta de comunidad",
    desc: "Una herramienta de comunidad probada en vivo con otros participantes.",
  },
] as const;

export function Tracks() {
  return (
    <section
      id="tracks"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)]">
            UN SOLO TRACK
          </p>

          {/* Headline de transición — decode binario→texto */}
          <ScrambleText
            as="h2"
            text={"USUARIOS\nREALES."}
            className="pixel-heading heading-reveal whitespace-pre-line"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
            spread={32}
            noise="glitch"
          />

          <p
            className="font-sans text-[var(--text)] leading-[1.75] max-w-2xl"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            No hay frentes ni categorías. Hay una sola vara: que lo que
            construyas lo use alguien de verdad — aunque sea una persona — antes
            de que suene la campana. Ese es el corazón de la hackathon.
          </p>
        </div>

        {/* Grid numerado — qué cuenta como "tener usuarios" */}
        <div className="flex flex-col">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)] mb-2">
            ¿QUÉ CUENTA? · 05 EJEMPLOS
          </p>
          <ul
            className="flex flex-col list-none m-0 p-0"
            aria-label="Ejemplos de productos con usuarios reales"
          >
            {WORK.map(({ id, title, desc }) => (
              <li key={id}>
                <article className="work-card reveal-item" data-cursor>
                  <span className="work-card-fill" aria-hidden="true" />
                  <span className="work-card-index font-mono text-xs font-semibold tracking-[0.12em] text-[var(--text-dim)] pt-1 tabular-nums">
                    #{id}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="work-card-title font-mono text-base font-semibold tracking-[0.02em] text-[var(--text)]">
                      {title}
                    </h3>
                    <p className="font-sans text-[15px] text-[var(--text-dim)] leading-relaxed max-w-xl">
                      {desc}
                    </p>
                  </div>
                  <span
                    className="work-card-arrow font-mono text-lg text-[var(--bright)] pt-0.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
