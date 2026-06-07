type Event = {
  time: string;
  description: string;
  mono?: string;
  highlight?: boolean;
};

type Day = {
  header: string;
  events: Event[];
};

const DAYS: Day[] = [
  {
    header: "── VIE 24 JUL ──",
    events: [
      { time: "17:00", description: "Registro y acreditación" },
      {
        time: "18:00",
        description: "Kickoff — reglas y formación de equipos",
        highlight: true,
      },
      { time: "19:00", description: "Empieza el hacking" },
      { time: "21:00", description: "Cena" },
    ],
  },
  {
    header: "── SÁB 25 JUL ──",
    events: [
      { time: "09:00", description: "Desayuno" },
      {
        time: "10:00",
        description: "Mentorías con el equipo de Next y Crafter Station",
      },
      { time: "14:00", description: "Almuerzo" },
      {
        time: "19:00",
        description: "Check-in de avances",
        mono: "git status",
      },
      { time: "21:00", description: "Cena" },
      { time: "23:59", description: "Mid-hack — quedan 10 horas" },
    ],
  },
  {
    header: "── DOM 26 JUL ──",
    events: [
      {
        time: "07:00",
        description: "Code freeze warning",
        mono: 'git commit -m "final"',
        highlight: true,
      },
      {
        time: "09:00",
        description: "Code freeze + submit",
        highlight: true,
      },
      {
        time: "10:00",
        description: "Demos — 3 minutos por equipo, producto en vivo",
        highlight: true,
      },
      { time: "12:30", description: "Deliberación del jurado" },
      {
        time: "13:00",
        description: "Premiación y cierre",
        highlight: true,
      },
    ],
  },
] as const;

import { CornerMarks } from "./corner-marks";

export function Schedule() {
  return (
    <section
      id="agenda"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper-dim)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-12">
        {/* Section label */}
        <p className="section-label">[04] — AGENDA</p>

        {/* Headline */}
        <h2
          className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          36 horas.
          <br />
          Cero relleno.
        </h2>

        {/* Timeline */}
        <div className="flex flex-col gap-10">
          {DAYS.map((day) => (
            <div key={day.header} className="flex flex-col gap-0">
              {/* Day header */}
              <p className="font-mono text-xs font-bold tracking-widest text-[var(--blue)] uppercase mb-4 select-none">
                {day.header}
              </p>

              {/* Events — vertical line via left border on the inner wrapper */}
              <div className="relative">
                {/* Vertical 1px blue line */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-px bg-[var(--blue)]"
                  aria-hidden="true"
                />

                <ul className="list-none m-0 p-0 flex flex-col gap-0">
                  {day.events.map((event) => (
                    <li
                      key={`${day.header}-${event.time}`}
                      className="group relative flex items-baseline gap-6 pl-6 pr-4 py-3 hover:bg-[var(--paper-dim)] transition-colors duration-100"
                    >
                      {/* Square node on the vertical line */}
                      <span
                        className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-[var(--blue)] shrink-0"
                        aria-hidden="true"
                      />

                      {/* Time — mono tabular-nums */}
                      <span
                        className="font-mono text-sm font-medium tabular-nums text-[var(--blue)] shrink-0 w-12"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {event.time}
                      </span>

                      {/* Description */}
                      <span
                        className={
                          event.highlight
                            ? "font-sans text-sm font-bold text-[var(--blue)]"
                            : "font-sans text-sm text-[var(--ink)]"
                        }
                      >
                        {event.description}
                        {event.mono && (
                          <>
                            {" "}
                            <code className="font-mono text-xs text-[var(--blue)] bg-[var(--blue-grid)] px-1 py-0.5">
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
          ))}
        </div>
      </div>
    </section>
  );
}
