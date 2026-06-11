import { SectionHeader } from "./section-header";

const SPECS = [
  {
    label: "FECHA",
    value: "25 JUL 2026",
    sub: null,
  },
  {
    label: "LUGAR",
    value: "Lima · Bogotá · Guatemala",
    sub: "3 sedes presenciales",
  },
  {
    label: "FORMATO",
    value: "12 horas presencial",
    sub: null,
  },
  {
    label: "CUPOS",
    value: "120",
    sub: null,
  },
  {
    label: "EQUIPOS",
    value: "3–5 personas",
    sub: null,
  },
  {
    label: "DEADLINE",
    value: "10 JUL 2026",
    sub: "23:59 GMT-5",
  },
] as const;

export function Tldr() {
  return (
    <section
      id="tldr"
      className="relative px-6 md:px-12 lg:px-24 py-16 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="20" name="TL;DR" />

        {/* Specs — tabla 3×2 fusionada, bordes compartidos sin radius */}
        <ul
          className="grid grid-cols-2 md:grid-cols-3 list-none m-0 p-0 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]"
          aria-label="Especificaciones del evento"
        >
          {SPECS.map(({ label, value, sub }) => (
            <li
              key={label}
              className="border-r border-b border-[var(--line)] px-6 py-7 flex flex-col gap-3"
            >
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                {label}
              </p>
              <p
                className="font-pixel font-bold leading-tight text-[var(--text)] tabular-nums"
                style={{
                  fontSize: "clamp(0.875rem, 1.8vw, 1.25rem)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </p>
              {sub !== null && (
                <p
                  className="font-mono text-xs text-[var(--text-dim)] tracking-wide tabular-nums"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {sub}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
