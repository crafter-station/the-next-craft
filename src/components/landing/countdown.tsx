"use client";

import { useEffect, useState } from "react";

// 2026-07-24T18:00:00-05:00 → UTC ms
const DEADLINE = new Date("2026-07-24T18:00:00-05:00").getTime();

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

  const cells: Cell[] = [
    { value: timeLeft !== null ? pad(timeLeft.days) : "--", label: "DÍAS" },
    { value: timeLeft !== null ? pad(timeLeft.hours) : "--", label: "HRS" },
    { value: timeLeft !== null ? pad(timeLeft.minutes) : "--", label: "MIN" },
    { value: timeLeft !== null ? pad(timeLeft.seconds) : "--", label: "SEG" },
  ];

  return (
    <div
      className="flex items-stretch gap-0"
      aria-label="Cuenta regresiva al evento"
      role="timer"
    >
      {cells.map(({ value, label }, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static ordered list, index is stable
          key={i}
          className="flex flex-col items-center justify-center border border-[var(--blue)] px-4 py-3 min-w-[72px]"
          style={{ borderRight: i < cells.length - 1 ? "none" : undefined }}
        >
          <span
            className="font-mono font-semibold text-[var(--blue)] leading-none tabular-nums"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </span>
          <span
            className="section-label mt-1"
            style={{ color: "var(--ink-dim)" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
