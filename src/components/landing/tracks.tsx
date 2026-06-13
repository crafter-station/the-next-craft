import { useTranslations } from "next-intl";

import { ScrambleText } from "@/components/effects/scramble-text";

/*
  Tracks — takeover tipográfico: una pared sticky de "TRACKS TRACKS TRACKS"
  (marquees en direcciones alternas, letra pixel hueca/sólida) ocupa toda la
  pantalla y encima se apilan las 3 cards de track como un deck sticky:
  cada card se queda pegada y la siguiente se monta sobre ella.
*/

type Track = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  ideas: string[];
  why: string;
};

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
  const t = useTranslations("tracks");
  const items = t.raw("items") as readonly Track[];

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
            PRINT &quot;{t("label")}&quot;
          </p>
          <ScrambleText
            as="h2"
            text={t("headline")}
            className="pixel-heading whitespace-pre-line"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
            spread={32}
            noise="glitch"
          />
          <p
            className="font-sans text-[var(--text)] leading-[1.75] max-w-xl"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            {t("intro")}
          </p>
        </div>
      </div>

      {/* Deck de cards apiladas */}
      <div className="tracks-deck">
        {items.map(({ id, name, tagline, desc, ideas, why }, i) => (
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
                {t("ideasLabel")}
              </p>
              <ul
                className="flex flex-col list-none m-0 p-0"
                aria-label={`${t("ideasAriaPrefix")} ${name}`}
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
