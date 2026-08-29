import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

/*
  Rúbrica — va justo después de Premios porque responde la pregunta que deja
  Premios: con qué vara se decide. Cinco líneas y nada más: peso a la
  izquierda (la cifra manda, en pixel), criterio y una descripción.
  Los pesos suman 100 y no cambian por track ni por sede.
*/

type Criterion = {
  weight: string;
  name: string;
  desc: string;
};

export function Rubric() {
  const t = useTranslations("rubric");
  const tSections = useTranslations("sections");

  const items = t.raw("items") as readonly Criterion[];

  return (
    <section
      id="rubrica"
      className="relative px-6 md:px-12 lg:px-24 py-16 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="60" name={tSections("rubric")} />

        <p className="font-sans text-[15px] leading-relaxed text-[var(--text-dim)] max-w-3xl">
          {t("intro")}
        </p>

        <ul
          className="list-none m-0 p-0 border-t border-[var(--line)]"
          aria-label={t("criteriaAria")}
        >
          {items.map(({ weight, name, desc }) => (
            <li
              key={name}
              className="grid grid-cols-[4.5rem_1fr] md:grid-cols-[6rem_14rem_1fr] gap-x-5 gap-y-2 items-baseline border-b border-[var(--line)] px-1 py-5"
            >
              {/* En mono, no en pixel: el glifo «%» de la pixel se lee como
                  un borrón a este tamaño. */}
              <span
                className="font-mono font-semibold leading-none tracking-[-0.02em] text-[var(--bright)] tabular-nums"
                style={{
                  fontSize: "clamp(1.125rem, 2.2vw, 1.375rem)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {weight}
              </span>
              <h3 className="font-mono text-sm font-semibold tracking-[0.1em] uppercase text-[var(--text)]">
                {name}
              </h3>
              <p className="col-span-2 md:col-span-1 font-sans text-sm leading-snug text-[var(--text-dim)]">
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
