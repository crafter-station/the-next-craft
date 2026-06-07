const SPECS = [
  {
    label: "FECHA",
    value: "24–26 JUL 2026",
    sub: null,
  },
  {
    label: "LUGAR",
    value: "Lima, Perú",
    sub: "-12.0464, -77.0428",
  },
  {
    label: "FORMATO",
    value: "36 horas presencial",
    sub: null,
  },
  {
    label: "HACKERS",
    value: "150",
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

import { CornerMarks } from "./corner-marks";

export function Tldr() {
  return (
    <section
      id="tldr"
      className="relative px-6 md:px-12 lg:px-24 py-16 bg-[var(--paper-dim)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-12">
        {/* Section label */}
        <h2 className="section-label">[02] — TL;DR</h2>

        {/* Specs grid — gap-px + blue bg = shared 1px borders */}
        <ul
          className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--blue)] list-none m-0 p-0"
          aria-label="Especificaciones del evento"
        >
          {SPECS.map(({ label, value, sub }) => (
            <li
              key={label}
              className="bg-[var(--paper)] px-6 py-8 flex flex-col gap-3"
            >
              <p className="section-label text-[var(--blue)]">{label}</p>
              <p
                className="font-sans font-extrabold leading-none tracking-tight text-[var(--ink)]"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
              >
                {value}
              </p>
              {sub !== null && (
                <p className="font-mono text-[10px] text-[var(--ink-dim)] tracking-wide">
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
