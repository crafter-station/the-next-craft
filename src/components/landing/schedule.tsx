"use client";

import { useEffect, useRef } from "react";

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
  { time: "16:00", description: "Check-in de avances", mono: "git status" },
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

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/*
  Schedule — agenda cinemática "pinned": al entrar, un titular AGENDA gigante
  ocupa la pantalla; al seguir scrolleando, un backdrop oscurece el fondo y la
  pantalla CRT con el timeline del día (09:00–21:00) aparece y se construye
  fila por fila según el progreso de scroll.

  Accesible: el timeline vive en el DOM (solo opacity/transform, nunca
  visibility) → lo lee el lector de pantalla. Bajo reduced-motion / sin JS la
  sección es estática (sin pin, todo visible).
*/
export function Schedule() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      section.dataset.pinned = "false";
      return;
    }
    section.dataset.pinned = "true";

    const rows = Array.from(
      section.querySelectorAll<HTMLElement>(".agenda-row"),
    );
    const n = rows.length;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;

      // Titular gigante se va (0.02 → 0.2)
      const hide = ramp(p, 0.02, 0.2);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(1 - hide);
        titleRef.current.style.transform = `translateY(${hide * -28}px) scale(${1 - hide * 0.07})`;
      }
      // Backdrop + panel entran (0.08 → 0.28)
      const show = ramp(p, 0.08, 0.28);
      if (backdropRef.current) backdropRef.current.style.opacity = String(show);
      if (panelRef.current) {
        panelRef.current.style.opacity = String(show);
        panelRef.current.style.transform = `translateY(${(1 - show) * 28}px)`;
      }
      // Filas se construyen (0.3 → 0.95)
      for (let i = 0; i < n; i++) {
        const thr = 0.3 + (0.95 - 0.3) * (i / Math.max(1, n - 1));
        rows[i].classList.toggle("is-in", p >= thr);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="agenda" className="agenda">
      <div className="agenda-sticky">
        <div className="grid-bg" />

        {/* Titular gigante */}
        <div ref={titleRef} className="agenda-giant-wrap" aria-hidden="true">
          <span className="agenda-giant">AGENDA</span>
          <span className="agenda-giant-sub font-mono text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[var(--bright)]">
            SÁBADO 25 JUL 2026 · 09:00–21:00
          </span>
        </div>

        {/* Backdrop que oscurece */}
        <div ref={backdropRef} className="agenda-backdrop" aria-hidden="true" />

        {/* Pantalla CRT con el timeline */}
        <div ref={panelRef} className="agenda-panel panel">
          <div
            className="scanlines absolute inset-0 pointer-events-none z-10"
            aria-hidden="true"
          />
          <div className="agenda-panel-inner relative z-20">
            <h2 className="sr-only">
              Agenda — sábado 25 de julio 2026, de 09:00 a 21:00
            </h2>
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)] mb-5">
              <span className="text-[var(--bright)]">40 PRINT</span>{" "}
              &quot;AGENDA&quot; · 12 HORAS
            </p>

            <ul className="agenda-list" aria-label="Agenda del día">
              {EVENTS.map((event) => (
                <li key={event.time} className="agenda-row">
                  <span className="agenda-node" aria-hidden="true" />
                  <span className="agenda-time font-mono text-sm font-medium tabular-nums text-[var(--bright)]">
                    {event.time}
                  </span>
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
                        <code className="font-mono text-xs text-[var(--bright)] bg-[var(--void)] border border-[var(--line)]/40 rounded px-1 py-0.5">
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
