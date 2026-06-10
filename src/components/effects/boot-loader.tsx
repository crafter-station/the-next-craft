"use client";

import { useEffect, useRef, useState } from "react";

/*
  BootLoader — splash de arranque estilo Commodore 64: secuencia de boot en
  mono, contador 000→100 en pixel, barra de bloques █, y al llegar a 100 el
  overlay se levanta (translateY) revelando la página.

  - Solo en la primera carga de la sesión (sessionStorage) y sin reduced-motion.
  - Bloquea el scroll mientras carga; lo restaura al terminar.
  - aria-hidden: es decorativo y no atrapa foco (sin elementos focusables).
*/

const DURATION = 1600;
const BAR_SLOTS = 18;

const BOOT_LINES = [
  "**** THE NEXT CRAFT BASIC V2 ****",
  "64K RAM SYSTEM · 38911 BYTES FREE",
  "",
  'LOAD "THE NEXT CRAFT",8,1',
  "SEARCHING FOR THE NEXT CRAFT",
  "LOADING",
] as const;

export function BootLoader() {
  const [phase, setPhase] = useState<"loading" | "lifting" | "done">("loading");
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const booted = sessionStorage.getItem("tnc-booted");
    if (reduced || booted) {
      setPhase("done");
      return;
    }

    const rootEl = document.documentElement;
    rootEl.style.overflow = "hidden";

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out para que desacelere al llegar a 100
      const eased = 1 - (1 - t) ** 2;
      const pct = Math.round(eased * 100);
      if (counterRef.current) {
        counterRef.current.textContent = String(pct).padStart(3, "0");
      }
      if (barRef.current) {
        const filled = Math.round(eased * BAR_SLOTS);
        barRef.current.textContent =
          "█".repeat(filled) + "·".repeat(BAR_SLOTS - filled);
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("lifting");
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase !== "lifting") return;
    sessionStorage.setItem("tnc-booted", "1");
    const id = setTimeout(() => {
      document.documentElement.style.overflow = "";
      setPhase("done");
    }, 900);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`boot-loader${phase === "lifting" ? " is-lifting" : ""}`}
      aria-hidden="true"
    >
      <div className="scanlines absolute inset-0 pointer-events-none" />
      <div className="boot-inner">
        <div className="boot-log">
          {BOOT_LINES.map((line, i) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: log estático ordenado
              key={i}
              className="font-mono text-[11px] sm:text-xs leading-[1.7] text-[var(--text-dim)] uppercase tracking-[0.08em]"
            >
              {line || " "}
            </p>
          ))}
        </div>

        <div className="boot-meter">
          <span
            ref={counterRef}
            className="boot-counter font-pixel font-bold text-[var(--text)] tabular-nums leading-none"
          >
            000
          </span>
          <span className="font-pixel font-bold text-[var(--text-dim)] leading-none text-2xl sm:text-4xl">
            %
          </span>
        </div>

        <span
          ref={barRef}
          className="boot-bar font-mono text-sm sm:text-base text-[var(--bright)] tracking-[0.1em]"
        >
          {"·".repeat(BAR_SLOTS)}
        </span>

        <p className="font-mono text-sm font-semibold text-[var(--bright)] mt-1">
          RUN<span className="cursor-blink">█</span>
        </p>
      </div>
    </div>
  );
}
