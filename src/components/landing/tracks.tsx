import { ScrambleText } from "@/components/effects/scramble-text";

/*
  Tracks — takeover tipográfico: una pared sticky de "TRACKS TRACKS TRACKS"
  (marquees en direcciones alternas, letra pixel hueca/sólida) ocupa toda la
  pantalla y encima se apilan las 3 cards de track como un deck sticky:
  cada card se queda pegada y la siguiente se monta sobre ella.
*/

const TRACKS = [
  {
    id: "01",
    name: "CONTENT MACHINE",
    tagline: "CREAR · PUBLICAR · DISTRIBUIR",
    desc: "Construye herramientas que ayuden a crear, editar, publicar, reutilizar o distribuir contenido. Para creadores, founders, estudiantes, comunidades, negocios pequeños o builders que documentan lo que hacen.",
    ideas: [
      "Notas de voz → posts de LinkedIn, TikToks, tweets o newsletters",
      "Asistente build-in-public: tus commits de GitHub → updates sociales",
      "Generador de calendario de contenido para negocios pequeños",
      "Videos largos → clips cortos, captions, hooks y thumbnails",
      "IA que ayuda a estudiantes a contar lo que aprendieron en short-form",
    ],
    why: "Así crecen los productos hoy. Y deja brillar a los perfiles no técnicos: storytelling, growth, diseño, distribución.",
  },
  {
    id: "02",
    name: "OUT OF THE BOX",
    tagline: "RARO · EXPERIMENTAL · INCLASIFICABLE",
    desc: "Construye algo raro, experimental, juguetón, sorprendente o imposible de categorizar. Puede ser útil, gracioso, artístico, caótico — o todo a la vez. La única regla: que haga reaccionar a la gente.",
    ideas: [
      "Generador de memes para pitches de startups",
      "Un juego donde peleas contra tu monstruo de la procrastinación",
      "Una interfaz de voz rarísima para manejar tus tareas",
      "Extensión de navegador que rostea tus tabs",
      "Tu calendario convertido en historia estilo Spotify Wrapped",
      "Una app «broma pero útil» para equipos de hackathon",
    ],
    why: "De aquí salen los proyectos virales. Permiso para crear en vez de construir otro SaaS de productividad.",
  },
  {
    id: "03",
    name: "LEARNING BY SHIPPING",
    tagline: "APRENDER HACIENDO · NO MIRANDO",
    desc: "Construye herramientas que ayuden a aprender más rápido creando, practicando, poniéndose a prueba o recibiendo feedback. Nada de educación pasiva: el producto tiene que lograr que el usuario haga.",
    ideas: [
      "Un tutor IA que enseña con proyectos, no con clases",
      "Entrevistas de práctica para becas, prácticas o trabajos",
      "Flashcards que se adaptan a lo que olvidas",
      "Tareas con feedback socrático en vez de respuestas",
      "Asistente «aprende a programar construyendo clones»",
      "Matching de mentores para estudiantes y builders jóvenes",
    ],
    why: "El track de educación, pero con mejor ángulo: menos escuela, más agencia.",
  },
] as const;

/* Filas de la pared — variante visual + dirección + duración del marquee */
const WALL_ROWS = [
  { variant: "tracks-row--ghost", dir: "l", dur: "44s" },
  { variant: "tracks-row--dim", dir: "r", dur: "58s" },
  { variant: "tracks-row--ghost", dir: "l", dur: "36s" },
  { variant: "tracks-row--solid", dir: "r", dur: "50s" },
  { variant: "tracks-row--ghost", dir: "l", dur: "62s" },
  { variant: "tracks-row--dim", dir: "r", dur: "40s" },
  { variant: "tracks-row--ghost", dir: "l", dur: "54s" },
] as const;

const ROW_TEXT = "TRACKS ✦ TRACKS ✦ TRACKS ✦ TRACKS ✦ TRACKS ✦ TRACKS ✦ ";

export function Tracks() {
  return (
    <section id="tracks" className="tracks-zone">
      {/* Pared sticky: TRACKS hasta donde alcance la vista */}
      <div className="tracks-wall" aria-hidden="true">
        <div className="tracks-wall-inner">
          {WALL_ROWS.map(({ variant, dir, dur }, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: filas decorativas estáticas
              key={i}
              className={`tracks-row ${variant}`}
              data-dir={dir}
              style={{ "--marquee-dur": dur } as React.CSSProperties}
            >
              <span>{ROW_TEXT}</span>
              <span>{ROW_TEXT}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Intro flotando sobre la pared — el takeover "de la nada" */}
      <div className="tracks-intro">
        <div className="tracks-intro-box">
          <p className="section-label">
            <span className="text-[var(--text-dim)]">30 </span>
            PRINT &quot;TRACKS&quot;
          </p>
          <ScrambleText
            as="h2"
            text={"3 TRACKS.\nELIGE TU ARMA."}
            className="pixel-heading whitespace-pre-line"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
            spread={32}
            noise="glitch"
          />
          <p
            className="font-sans text-[var(--text)] leading-[1.75] max-w-xl"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            La vara sigue siendo una sola: que lo que construyas lo use alguien
            de verdad antes de que suene la campana.
          </p>
        </div>
      </div>

      {/* Deck de cards apiladas */}
      <div className="tracks-deck">
        {TRACKS.map(({ id, name, tagline, desc, ideas, why }, i) => (
          <div
            key={id}
            className="track-slot"
            style={{ "--stack-i": i } as React.CSSProperties}
          >
            <article className="track-card" aria-labelledby={`track-${id}`}>
              <header className="track-card-head">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                    TRACK {id} — 03
                  </p>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)] text-right">
                    {tagline}
                  </p>
                </div>
                <h3 id={`track-${id}`} className="track-card-name">
                  {name}
                </h3>
                <p className="font-sans text-[15px] text-[var(--text-dim)] leading-relaxed max-w-2xl pb-2">
                  {desc}
                </p>
              </header>

              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)] px-[clamp(1.25rem,3.5vw,2.5rem)] pb-2">
                IDEAS PARA ARRANCAR ↓
              </p>
              <ul
                className="flex flex-col list-none m-0 p-0"
                aria-label={`Ideas de ejemplo para ${name}`}
              >
                {ideas.map((idea) => (
                  <li key={idea} className="track-idea">
                    <span className="track-idea-fill" aria-hidden="true" />
                    <span
                      className="font-mono text-xs text-[var(--text-dim)] shrink-0"
                      aria-hidden="true"
                    >
                      ▸
                    </span>
                    <span className="font-sans text-[15px] text-[var(--text)] leading-snug">
                      {idea}
                    </span>
                    <span
                      className="track-idea-arrow font-mono"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </li>
                ))}
              </ul>

              <p className="track-why">
                <span
                  className="font-mono text-sm text-[var(--bright)] shrink-0"
                  aria-hidden="true"
                >
                  ✦
                </span>
                <span className="font-sans text-sm text-[var(--text-dim)] leading-relaxed">
                  {why}
                </span>
              </p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
