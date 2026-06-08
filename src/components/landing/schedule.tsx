"use client";

import { useState } from "react";

import { SectionHeader } from "./section-header";

type Event = {
  time: string;
  description: string;
  mono?: string;
  highlight?: boolean;
};

type Day = {
  id: string;
  label: string;
  weekday: string;
  events: Event[];
};

const DAYS: Day[] = [
  {
    id: "vie",
    label: "24 JUL",
    weekday: "VIERNES",
    events: [
      { time: "17:00", description: "Registro y acreditación" },
      {
        time: "18:00",
        description: "Kickoff — reglas y formación de equipos",
        highlight: true,
      },
      { time: "19:00", description: "Empieza el hacking", highlight: true },
      { time: "21:00", description: "Cena" },
    ],
  },
  {
    id: "sab",
    label: "25 JUL",
    weekday: "SÁBADO",
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
    id: "dom",
    label: "26 JUL",
    weekday: "DOMINGO",
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

export function Schedule() {
  const [activeId, setActiveId] = useState<string>(DAYS[0].id);
  const activeDay = DAYS.find((d) => d.id === activeId) ?? DAYS[0];

  return (
    <section
      id="agenda"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <SectionHeader line="40" name="AGENDA" />

        <h2
          className="pixel-heading"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        >
          36 horas.
          <br />
          Cero relleno.
        </h2>

        {/* Dos columnas: selector de día | agenda del día */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-14">
          {/* ── Selector de día — keycaps ── */}
          <div
            role="tablist"
            aria-label="Días del evento"
            aria-orientation="vertical"
            className="flex flex-row lg:flex-col gap-3 lg:gap-4 items-stretch"
          >
            {DAYS.map((day) => {
              const selected = day.id === activeId;
              return (
                <button
                  key={day.id}
                  type="button"
                  role="tab"
                  id={`tab-${day.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${day.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(day.id)}
                  onKeyDown={(e) => {
                    const idx = DAYS.findIndex((d) => d.id === activeId);
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      const next = DAYS[(idx + 1) % DAYS.length];
                      setActiveId(next.id);
                      document.getElementById(`tab-${next.id}`)?.focus();
                    }
                    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const prev = DAYS[(idx - 1 + DAYS.length) % DAYS.length];
                      setActiveId(prev.id);
                      document.getElementById(`tab-${prev.id}`)?.focus();
                    }
                  }}
                  className={[
                    "flex-1 lg:flex-none flex flex-col items-start gap-1 px-5 py-4 text-left",
                    selected ? "keycap" : "keycap-ghost",
                  ].join(" ")}
                >
                  <span className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase opacity-70">
                    {day.weekday}
                  </span>
                  <span
                    className="font-pixel font-bold leading-none"
                    style={{ fontSize: "clamp(1rem, 1.8vw, 1.375rem)" }}
                  >
                    {day.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Agenda del día seleccionado ── */}
          <div
            role="tabpanel"
            id={`panel-${activeDay.id}`}
            aria-labelledby={`tab-${activeDay.id}`}
            className="relative"
          >
            {/* Línea vertical */}
            <div
              className="absolute top-0 bottom-0 left-0 w-px bg-[var(--line)]"
              aria-hidden="true"
            />

            <ul className="list-none m-0 p-0 flex flex-col gap-0">
              {activeDay.events.map((event) => (
                <li
                  key={`${activeDay.id}-${event.time}`}
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
      </div>
    </section>
  );
}
