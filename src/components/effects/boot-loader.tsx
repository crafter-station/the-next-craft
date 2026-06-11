"use client";

import { useEffect, useRef, useState } from "react";

import { CircularText } from "@/components/effects/circular-text";

/*
  BootLoader v2 — splash de arranque: un grid deformado (distorsión de
  barril, como si la pantalla CRT empujara desde el centro) que respira,
  un núcleo circular negro con el porcentaje en pixel, y un anillo de
  texto girando alrededor. Al llegar a 100 el overlay se levanta.

  - Solo en la primera carga de la sesión (sessionStorage) y sin reduced-motion.
  - Bloquea el scroll mientras carga; lo restaura al terminar.
  - aria-hidden: es decorativo y no atrapa foco (sin elementos focusables).
*/

const DURATION = 1800;

/* ── Grid deformado (determinista → mismo SVG en server y client) ───── */
const GRID_SIZE = 1000;
const GRID_LINES = 14;
const GRID_SEGMENTS = 36;
const BULGE = 0.16; // fuerza de la distorsión de barril
const RADIUS = 480; // alcance de la distorsión

function warp(x: number, y: number): [number, number] {
  const c = GRID_SIZE / 2;
  const dx = x - c;
  const dy = y - c;
  const d = Math.hypot(dx, dy);
  const g = Math.exp(-((d / RADIUS) ** 2));
  const f = 1 + BULGE * g;
  return [c + dx * f, c + dy * f];
}

function warpedGridPaths(): string[] {
  const paths: string[] = [];
  const step = GRID_SIZE / (GRID_LINES - 1);
  const seg = GRID_SIZE / GRID_SEGMENTS;
  for (let i = 0; i < GRID_LINES; i++) {
    const fixed = i * step;
    let h = "";
    let v = "";
    for (let s = 0; s <= GRID_SEGMENTS; s++) {
      const t = s * seg;
      const [hx, hy] = warp(t, fixed);
      const [vx, vy] = warp(fixed, t);
      h += `${s === 0 ? "M" : "L"}${hx.toFixed(1)} ${hy.toFixed(1)}`;
      v += `${s === 0 ? "M" : "L"}${vx.toFixed(1)} ${vy.toFixed(1)}`;
    }
    paths.push(h, v);
  }
  return paths;
}

const GRID_PATHS = warpedGridPaths();

export function BootLoader() {
  const [phase, setPhase] = useState<"loading" | "lifting" | "done">("loading");
  const counterRef = useRef<HTMLSpanElement>(null);

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
      {/* Grid deformado de fondo (respira) */}
      <svg
        className="boot-grid"
        viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {GRID_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>

      <div className="scanlines absolute inset-0 pointer-events-none" />

      <div className="boot-inner">
        {/* Núcleo: porcentaje dentro del círculo, texto orbitando fuera */}
        <div className="boot-core">
          <div className="boot-orbit">
            <CircularText text="THE NEXT CRAFT · LOADING · THE NEXT CRAFT · LOADING · " />
          </div>
          <div className="boot-meter">
            <span
              ref={counterRef}
              className="boot-counter-sm font-pixel font-bold text-[var(--text)] tabular-nums leading-none"
            >
              000
            </span>
            <span className="font-pixel font-bold text-[var(--text-dim)] leading-none text-lg">
              %
            </span>
          </div>
          <p className="font-mono text-xs font-semibold text-[var(--bright)]">
            RUN<span className="cursor-blink">█</span>
          </p>
        </div>

        {/* Línea de boot al pie */}
        <p className="font-mono text-[11px] sm:text-xs leading-[1.7] text-[var(--text-dim)] uppercase tracking-[0.08em] mt-10">
          LOAD &quot;THE NEXT CRAFT&quot;,8,1
        </p>
      </div>
    </div>
  );
}
