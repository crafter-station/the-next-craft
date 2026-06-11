const PERKS = [
  "Mentorías durante las 12 horas",
  "Swag oficial del evento",
  "Acceso a la comunidad de Crafter Station",
  "Créditos de herramientas",
  "Comida durante el evento",
] as const;

/*
  Sección invertida: el único golpe de luz a mitad del scroll — fondo
  marfil con tinta oscura, como prender la pantalla. Colores locales
  (tinta sobre bone) en vez de los tokens de dark.

  El premio aún no se anuncia → "PRONTO" como cifra protagonista; lo
  garantizado para todos vive en la columna de perks.
*/
const INK = "#1a1a17";
const INK_DIM = "#6f6a5d";
const RULE = "rgb(26 26 23 / 35%)";

export function Prizes() {
  return (
    <section
      id="premios"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--bone)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        {/* Composición asimétrica 2/3 + 1/3 */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Cifra protagonista en tinta ── */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span
                className="font-pixel font-bold leading-none select-none"
                style={{
                  color: INK,
                  fontSize: "clamp(3rem, 9vw, 7rem)",
                }}
                aria-hidden="true"
              >
                PRONTO
              </span>
              <span className="sr-only">Premio por anunciar</span>
              <p
                className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: INK_DIM }}
              >
                PREMIO PRINCIPAL POR ANUNCIAR
              </p>
            </div>
          </div>

          {/* ── Columna secundaria 1/3: perks ── */}
          <div
            className="lg:w-1/3 flex flex-col overflow-hidden rounded-[0.625rem] border"
            style={{ borderColor: RULE }}
          >
            <div
              className="px-7 py-5"
              style={{ borderBottom: `1px solid ${RULE}` }}
            >
              <p
                className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: INK }}
              >
                PARA TODOS LOS QUE ENTRAN
              </p>
            </div>

            <ul
              className="flex flex-col list-none m-0 p-0 flex-1"
              aria-label="Beneficios para todos los participantes"
            >
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3 px-7 py-4">
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
          El jurado evalúa con demo en vivo + pitch. Dentro de poco estaremos
          subiendo la rúbrica.
        </p>
      </div>
    </section>
  );
}
