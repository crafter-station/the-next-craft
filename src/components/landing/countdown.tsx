"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { cityUtcOffset, DEFAULT_CITY, viewerCity } from "@/lib/cities";
import { EVENT_DAY, EVENT_OPENS as EVENT_START } from "@/lib/dashboard/content";

/*
  El evento arranca a las 09:00 LOCALES de cada sede, y las sedes no comparten
  hora: Lima, Bogotá y Arequipa van a -05; Guatemala y El Salvador, a -06. Un
  único instante clavado a -05 —que es lo que había— le decía a quien entra
  desde Guatemala o El Salvador que empieza una hora antes de lo que empieza
  para él.

  Aquí no hay sesión ni sede, así que la deducimos de la zona del navegador. Si
  coincide con la de una sede, contamos contra el arranque de esa sede; si no
  —alguien mirando desde Madrid o México—, contra el de la sede por defecto,
  que es el comportamiento de siempre.
*/
function resolveDeadline(): number {
  const city = viewerCity() ?? DEFAULT_CITY;
  return new Date(
    `${EVENT_DAY}T${EVENT_START}:00${cityUtcOffset(city)}`,
  ).getTime();
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(deadline: number): TimeLeft {
  const diff = Math.max(0, deadline - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

type Cell = {
  value: string;
  label: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function Countdown() {
  const t = useTranslations("countdown");
  // null until client hydrates — avoids hydration mismatch
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // La zona solo se puede leer en el cliente, así que el objetivo se resuelve
    // aquí y no en el módulo: en el servidor sería siempre la sede por defecto.
    const deadline = resolveDeadline();
    setTimeLeft(getTimeLeft(deadline));
    const id = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, []);

  // Estado "en vivo": cuando el countdown llega a 0 y ya se ha hidratado
  const isLive =
    timeLeft !== null &&
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isLive) {
    return (
      <div
        className="inline-flex items-center gap-3 border border-[var(--line)] rounded-lg px-6 py-4 bg-[var(--screen-dim)]"
        role="status"
        aria-label={t("liveAria")}
      >
        <span
          className="font-pixel font-bold text-[var(--bright)] leading-none uppercase"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
        >
          {t("live")}
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-dim)]">
          {t("liveSub")}
        </span>
      </div>
    );
  }

  const cells: Cell[] = [
    {
      value: timeLeft !== null ? pad(timeLeft.days) : "--",
      label: t("units.days"),
    },
    {
      value: timeLeft !== null ? pad(timeLeft.hours) : "--",
      label: t("units.hours"),
    },
    {
      value: timeLeft !== null ? pad(timeLeft.minutes) : "--",
      label: t("units.minutes"),
    },
    {
      value: timeLeft !== null ? pad(timeLeft.seconds) : "--",
      label: t("units.seconds"),
    },
  ];

  return (
    <div
      className="grid grid-cols-4 w-full max-w-sm sm:max-w-none sm:flex sm:items-stretch gap-2"
      aria-label={t("ariaLabel")}
      role="timer"
      aria-live="off"
    >
      {cells.map(({ value, label }, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static ordered list, index is stable
          key={i}
          className="flex flex-col items-center justify-center bg-[var(--screen-dim)] border border-[var(--line)] rounded-lg px-2 sm:px-4 py-3 sm:min-w-[84px]"
        >
          {/* Dígitos pixel PETSCII */}
          <span
            className="font-pixel font-bold text-[var(--text)] leading-none tabular-nums"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)] mt-1.5">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
