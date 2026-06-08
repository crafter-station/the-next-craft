import { SectionHeader } from "./section-header";

type Event = {
  time: string;
  description: string;
  mono?: string;
  highlight?: boolean;
};

// Un solo día — sábado 25 de julio, 2026. Jornada de 12 horas.
const EVENTS: Event[] = [
  { time: "08:30", description: "Registro y acreditación" },
  {
    time: "09:00",
    description: "Kickoff — reglas y formación de equipos",
    highlight: true,
  },
  { time: "09:30", description: "Empieza el hacking", highlight: true },
  { time: "11:00", description: "Mentorías con Next Fellow y Crafter Station" },
  { time: "13:00", description: "Almuerzo" },
  {
    time: "16:00",
    description: "Check-in de avances",
    mono: "git status",
  },
  { time: "18:30", description: "Merienda — quedan 3 horas" },
  {
    time: "20:00",
    description: "Code freeze + submit",
    mono: 'git commit -m "final"',
    highlight: true,
  },
  {
    time: "20:15",
    description: "Demos — 3 minutos por equipo, producto en vivo",
    highlight: true,
  },
  { time: "21:00", description: "Premiación y cierre", highlight: true },
] as const;

export function Schedule() {
  return (
    <section
      id="agenda"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <SectionHeader line="40" name="AGENDA" />

        <div className="flex flex-col gap-3">
          <h2
            className="pixel-heading"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
          >
            Un día.
            <br />
            Cero relleno.
          </h2>
          <p className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--bright)]">
            ── SÁBADO 25 JUL 2026 · 09:00–21:00 ──
          </p>
        </div>

        {/* Timeline del día */}
        <div className="relative">
          {/* Línea vertical */}
          <div
            className="absolute top-0 bottom-0 left-0 w-px bg-[var(--line)]"
            aria-hidden="true"
          />

          <ul className="list-none m-0 p-0 flex flex-col gap-0">
            {EVENTS.map((event) => (
              <li
                key={event.time}
                className="schedule-row group relative flex items-baseline gap-3 sm:gap-6 pl-6 pr-4 py-3.5 rounded-r-lg hover:bg-[var(--screen-dim)] transition-colors duration-100"
              >
                {/* Nodo cuadrado pixel en la línea */}
                <span
                  className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-[var(--bright)] shrink-0"
                  aria-hidden="true"
                />

                {/* Hora — mono tabular */}
                <span
                  className="schedule-time font-mono text-sm font-medium tabular-nums text-[var(--bright)] shrink-0 w-12"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {event.time}
                </span>

                {/* Descripción */}
                <span
                  className={
                    event.highlight
                      ? "font-sans text-sm font-semibold leading-snug text-[var(--text)]"
                      : "font-sans text-sm leading-snug text-[var(--text-dim)]"
                  }
                >
                  {event.description}
                  {event.mono && (
                    <>
                      {" "}
                      <code className="font-mono text-xs text-[var(--bright)] bg-[var(--screen-dim)] border border-[var(--line)]/40 rounded px-1 py-0.5">
                        {event.mono}
                      </code>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
