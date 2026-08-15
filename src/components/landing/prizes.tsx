import { useTranslations } from "next-intl";

/*
  Sección invertida: el único golpe de luz a mitad del scroll — fondo
  marfil con tinta oscura, como prender la pantalla. Colores locales
  (tinta sobre bone) en vez de los tokens de dark.

  El premio en efectivo es la cifra protagonista. Lo garantizado para todos
  va debajo, a lo ancho y repartido en celdas: como columna lateral la lista
  crecía en vertical cada vez que entraba un partner nuevo y desbalanceaba
  la sección.
*/
const INK = "#1a1a17";
const INK_DIM = "#6f6a5d";
const RULE = "rgb(26 26 23 / 35%)";

export function Prizes() {
  const t = useTranslations("prizes");
  const perks = t.raw("perks") as readonly string[];
  const winners = t.raw("winners") as readonly {
    place: string;
    rewards: readonly {
      partner: string;
      credits: string;
      value: string;
    }[];
  }[];

  return (
    <section
      id="premios"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--bone)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <div className="flex flex-col gap-10">
          {/* ── Cifra protagonista en tinta ── */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span
                className="font-pixel font-bold leading-none select-none"
                style={{
                  color: INK,
                  fontSize: "clamp(3rem, 9vw, 7rem)",
                }}
                aria-hidden="true"
              >
                {t("amount")}
              </span>
              <span className="sr-only">{t("amountAria")}</span>
              <p
                className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: INK_DIM }}
              >
                {t("amountSub")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p
                className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: INK_DIM }}
              >
                {t("winnersLabel")}
              </p>
              <ul
                className="grid grid-cols-1 sm:grid-cols-3 list-none m-0 p-0 border-t border-l"
                style={{ borderColor: RULE }}
                aria-label={t("winnersAria")}
              >
                {winners.map(({ place, rewards }) => (
                  <li
                    key={place}
                    className="flex flex-col gap-4 px-5 py-5 border-r border-b"
                    style={{ borderColor: RULE }}
                  >
                    <span
                      className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase"
                      style={{ color: INK_DIM }}
                    >
                      {place}
                    </span>
                    <div className="flex flex-col gap-4">
                      {rewards.map(({ partner, credits, value }) => (
                        <div key={partner} className="flex flex-col gap-1">
                          <span
                            className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase"
                            style={{ color: INK_DIM }}
                          >
                            {partner}
                          </span>
                          <span
                            className="font-pixel text-lg leading-tight"
                            style={{ color: INK }}
                          >
                            {credits}
                          </span>
                          <span
                            className="font-sans text-sm leading-snug"
                            style={{ color: INK_DIM }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Perks: banda a lo ancho, dividida en celdas ──
              Los bordes de las celdas del borde derecho e inferior se salen
              1px (los márgenes negativos) y los recorta el overflow-hidden,
              así no se duplican con el borde de la caja. */}
          <div
            className="flex flex-col overflow-hidden rounded-[0.625rem] border"
            style={{ borderColor: RULE }}
          >
            <div
              className="px-6 py-5 md:px-7"
              style={{ borderBottom: `1px solid ${RULE}` }}
            >
              <p
                className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: INK }}
              >
                {t("perksLabel")}
              </p>
            </div>

            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0 -mr-px -mb-px"
              aria-label={t("perksAria")}
            >
              {perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-3 px-6 py-4 md:px-7 border-r border-b"
                  style={{ borderColor: RULE }}
                >
                  <span
                    className="font-mono text-sm shrink-0 mt-0.5"
                    style={{ color: INK }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                  <span
                    className="font-sans text-[15px] leading-snug"
                    style={{ color: INK }}
                  >
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nota del jurado */}
        <p
          className="font-mono text-xs tracking-[0.05em] leading-[1.5]"
          style={{ color: INK_DIM }}
        >
          {t("note")}
        </p>
      </div>
    </section>
  );
}
