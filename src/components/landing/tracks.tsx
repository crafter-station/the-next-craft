import { SectionHeader } from "./section-header";

/*
  Un solo track — el corazón de la hackathon: que tu producto tenga
  usuarios reales (o al menos uno) antes de que acabe el reloj.
*/
const EXAMPLES = [
  "Una landing + MVP funcionando que consigue signups durante la hackathon.",
  "Una herramienta lanzada en un grupo de WhatsApp, Discord, colegio o comunidad.",
  "Un micro-SaaS donde al menos un usuario completa la acción principal.",
  "Un marketplace pequeño con publicaciones reales.",
  "Una herramienta de comunidad probada en vivo con otros participantes.",
] as const;

export function Tracks() {
  return (
    <section
      id="tracks"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <SectionHeader line="30" name="TRACK" />

        <h2
          className="pixel-heading"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        >
          Un solo track:
          <br />
          usuarios.
        </h2>

        <p
          className="font-sans text-[var(--text)] leading-[1.75] max-w-2xl"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
        >
          No hay frentes ni categorías. Hay una sola vara: que lo que construyas
          lo use alguien de verdad — aunque sea una persona — antes de que suene
          la campana. Ese es el corazón de la hackathon.
        </p>

        {/* Panel único — qué cuenta como "tener usuarios" */}
        <div className="panel flex flex-col overflow-hidden max-w-3xl">
          <div className="px-7 py-5">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
              ¿QUÉ CUENTA?
            </p>
          </div>

          <ul
            className="flex flex-col list-none m-0 p-0"
            aria-label="Ejemplos de productos con usuarios reales"
          >
            {EXAMPLES.map((example) => (
              <li key={example} className="flex items-start gap-3 px-7 py-4">
                <span
                  className="font-mono text-sm text-[var(--bright)] shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
                <span className="font-sans text-[15px] text-[var(--text)] leading-relaxed">
                  {example}
                </span>
              </li>
            ))}
          </ul>

          {/* Footer — comando LOAD */}
          <div className="px-7 py-3 border-t border-[var(--line)]/40">
            <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--bright)]">
              LOAD &quot;USUARIOS&quot;,8,1
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
