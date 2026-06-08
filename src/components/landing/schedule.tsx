"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

type EventItem = {
  time: string;
  description: string;
  mono?: string;
  highlight?: boolean;
};

type Day = {
  id: "fri" | "sat" | "sun";
  label: string;
  weekday: string;
  events: EventItem[];
};

const DAY_IDS = ["fri", "sat", "sun"] as const;

export function Schedule() {
  const t = useTranslations("schedule");

  const days: Day[] = DAY_IDS.map((id) => ({
    id,
    label: t(`days.${id}.label`),
    weekday: t(`days.${id}.weekday`),
    events: t.raw(`days.${id}.events`) as EventItem[],
  }));

  const [activeId, setActiveId] = useState<Day["id"]>(days[0].id);
  const activeDay = days.find((d) => d.id === activeId) ?? days[0];

  return (
    <section
      id="agenda"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 scroll-reveal">
        <SectionHeader line="40" name={t("label")} />

        <h2
          className="pixel-heading"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        >
          {t("headlineLine1")}
          <br />
          {t("headlineLine2")}
        </h2>

        {/* Dos columnas: selector de día | agenda del día */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-14">
          {/* ── Selector de día — keycaps ── */}
          <div
            role="tablist"
            aria-label={t("tablistAria")}
            aria-orientation="vertical"
            className="flex flex-row lg:flex-col gap-3 lg:gap-4 items-stretch"
          >
            {days.map((day) => {
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
                    const idx = days.findIndex((d) => d.id === activeId);
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      const next = days[(idx + 1) % days.length];
                      setActiveId(next.id);
                      document.getElementById(`tab-${next.id}`)?.focus();
                    }
                    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const prev = days[(idx - 1 + days.length) % days.length];
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
