"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Reloj y cuenta atrás al code freeze. Si el reloj está anclado fuera de la
 * ventana del evento, se queda con el valor del servidor en vez de contar
 * hacia un pasado.
 */
export function Countdown({
  deadlineIso,
  fallbackClock,
  anchored,
  freezeLabel,
  timeZone,
  offsetLabel,
  locale,
}: {
  deadlineIso: string;
  fallbackClock: string;
  anchored: boolean;
  freezeLabel: string;
  /** Zona IANA de la sede. Antes estaba fija en America/Bogota. */
  timeZone: string;
  /** «GMT-5» o «GMT-6», según la sede. Antes era literal. */
  offsetLabel: string;
  locale: string;
}) {
  const [clock, setClock] = useState<string | null>(null);
  const [left, setLeft] = useState<{ h: number; m: number; s: number } | null>(
    null,
  );

  useEffect(() => {
    if (anchored) return;
    const tick = () => {
      const now = new Date();
      setClock(
        new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone,
        }).format(now),
      );
      const ms = Math.max(0, new Date(deadlineIso).getTime() - now.getTime());
      setLeft({
        h: Math.floor(ms / 3_600_000),
        m: Math.floor((ms % 3_600_000) / 60_000),
        s: Math.floor((ms % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineIso, anchored, timeZone, locale]);

  return (
    <span className="flex items-center gap-3 font-mono text-[12px] tabular-nums">
      {left && (
        <span className="hidden items-baseline gap-1.5 sm:flex">
          <span className="text-[var(--bright)]">
            {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
          </span>
          <span className="text-[9px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
            {freezeLabel}
          </span>
        </span>
      )}
      <span className="text-[var(--text)]">{clock ?? fallbackClock}</span>
      <span className="text-[var(--text-dim)]">{offsetLabel}</span>
    </span>
  );
}
