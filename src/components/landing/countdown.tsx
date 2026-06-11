"use client";

import { useEffect, useState } from "react";

// 2026-07-25T09:00:00-05:00 → UTC ms (arranque del evento)
const DEADLINE = new Date("2026-07-25T09:00:00-05:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, DEADLINE - Date.now());
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
  // null until client hydrates — avoids hydration mismatch
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
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
        aria-label="El evento está en curso"
      >
        <span
          className="font-pixel font-bold text-[var(--bright)] leading-none uppercase"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
        >
          EN VIVO
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-dim)]">
          — HACKATHON EN CURSO
        </span>
      </div>
    );
  }

  const cells: Cell[] = [
    { value: timeLeft !== null ? pad(timeLeft.days) : "--", label: "DÍAS" },
    { value: timeLeft !== null ? pad(timeLeft.hours) : "--", label: "HRS" },
    { value: timeLeft !== null ? pad(timeLeft.minutes) : "--", label: "MIN" },
    { value: timeLeft !== null ? pad(timeLeft.seconds) : "--", label: "SEG" },
  ];

  return (
    <div
      className="grid grid-cols-4 w-full max-w-sm sm:max-w-none sm:flex sm:items-stretch gap-2"
      aria-label="Cuenta regresiva al evento"
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
