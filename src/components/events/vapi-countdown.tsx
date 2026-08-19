"use client";

import { useEffect, useState } from "react";

const START_TIME = new Date("2026-08-19T19:00:00-05:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EMPTY_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getTimeLeft(): TimeLeft {
  const difference = Math.max(0, START_TIME - Date.now());

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

type VapiCountdownProps = {
  locale: string;
};

export function VapiCountdown({ locale }: VapiCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft());
    update();

    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const copy =
    locale === "en"
      ? {
          heading: "We start in",
          live: "We have started",
          aria: "Countdown to the Vapi event",
          units: ["Days", "Hours", "Min", "Sec"],
        }
      : {
          heading: "Empezamos en",
          live: "Ya empezamos",
          aria: "Cuenta regresiva para el evento de Vapi",
          units: ["Días", "Horas", "Min", "Seg"],
        };

  const current = timeLeft ?? EMPTY_TIME;
  const isLive =
    timeLeft !== null && Object.values(current).every((value) => value === 0);
  const values = [
    pad(current.days),
    pad(current.hours),
    pad(current.minutes),
    pad(current.seconds),
  ];

  return (
    <div className="flex flex-col items-start">
      <p className="section-label">VAPI x THE NEXT CRAFT</p>
      <p
        className="pixel-heading mt-4 text-[clamp(2rem,5vw,5.5rem)]"
        role="status"
      >
        {isLive ? copy.live : copy.heading}
      </p>

      {isLive ? null : (
        <div
          className="mt-7 grid w-full grid-cols-4 gap-2 sm:mt-9 sm:gap-3"
          role="timer"
          aria-label={copy.aria}
          aria-live="off"
        >
          {values.map((value, index) => (
            <div
              className="flex min-w-0 flex-col bg-[var(--screen-dim)] px-2 py-4 sm:px-4 sm:py-5"
              key={copy.units[index]}
            >
              <span className="font-mono text-[clamp(1.65rem,5vw,4.5rem)] font-semibold leading-none tabular-nums text-[var(--text)]">
                {timeLeft === null ? "--" : value}
              </span>
              <span className="mt-2 truncate font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-dim)] sm:text-[11px] sm:tracking-[0.16em]">
                {copy.units[index]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
