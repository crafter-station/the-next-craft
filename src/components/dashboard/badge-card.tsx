"use client";

import { useEffect, useState } from "react";

/**
 * La credencial física, tal como se imprime: cartón marfil, todo en mono.
 * El modo escaneo la lleva a pantalla completa para que el lector del staff
 * no pelee con el fondo oscuro del dashboard.
 */
export function BadgeCard({
  qrDataUri,
  name,
  code,
  hub,
  dates,
  team,
  table,
  track,
  partners,
  scanLabel,
  scanHint,
  closeLabel,
  labels,
}: {
  qrDataUri: string;
  name: string;
  code: string;
  hub: string;
  dates: string;
  team: string | null;
  table: string | null;
  track: string | null;
  partners: string[];
  scanLabel: string;
  scanHint: string;
  closeLabel: string;
  labels: { team: string; table: string; track: string };
}) {
  const [scan, setScan] = useState(false);

  useEffect(() => {
    if (!scan) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setScan(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [scan]);

  const card = (
    <div className="w-full max-w-[360px] border border-[var(--void)] bg-[var(--bone)] text-[var(--void)]">
      <div className="flex items-center justify-between border-b border-[var(--void)]/25 px-4 py-2.5">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
          {dates}
        </span>
        <span className="font-[family-name:var(--font-script)] text-[13px] lowercase">
          the next craft
        </span>
      </div>

      <div className="px-4 py-4 text-center">
        <p className="font-mono text-[15px] leading-tight font-semibold uppercase">
          {name}
        </p>
        <div className="mx-auto mt-4 w-[168px]">
          {/* biome-ignore lint/performance/noImgElement: data URI generado en el servidor */}
          <img src={qrDataUri} alt="" className="h-auto w-full" />
        </div>
      </div>

      <div className="border-y border-[var(--void)]/25 px-4 py-3 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase">
          {hub}
        </p>
        <p className="mt-1 font-mono text-[26px] leading-none font-bold tracking-tight">
          TNC↗26
        </p>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-[var(--void)]/20 border-b border-[var(--void)]/25">
        {[
          [labels.team, team],
          [labels.table, table],
          [labels.track, track],
        ].map(([k, v]) => (
          <div key={k as string} className="px-2.5 py-2">
            <dt className="font-mono text-[8px] tracking-[0.16em] uppercase opacity-60">
              {k}
            </dt>
            <dd className="mt-0.5 truncate font-mono text-[11px]">
              {(v as string) ?? "—"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 py-2.5">
        {partners.map((p) => (
          <span
            key={p}
            className="font-mono text-[8px] tracking-[0.1em] uppercase opacity-70"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="border-t border-[var(--void)]/25 px-4 py-2 text-center">
        <span className="font-mono text-[10px] tracking-[0.16em]">{code}</span>
      </div>
    </div>
  );

  return (
    <>
      {card}
      <button
        type="button"
        onClick={() => setScan(true)}
        className="mt-3 w-full border border-[var(--line)] px-3 py-2.5 font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--bright)] transition-colors hover:bg-[var(--screen-dim)]"
      >
        {scanLabel}
      </button>

      {scan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={scanHint}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--void)]/98 p-6"
        >
          {/* Fondo pulsable para cerrar, detrás del contenido. */}
          <button
            type="button"
            aria-label={closeLabel}
            tabIndex={-1}
            onClick={() => setScan(false)}
            className="absolute inset-0 cursor-default"
          />
          <p className="relative font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-dim)]">
            {scanHint}
          </p>
          <div className="relative">{card}</div>
          <button
            type="button"
            onClick={() => setScan(false)}
            className="relative border border-[var(--line)] px-3.5 py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text-dim)] hover:text-[var(--bright)]"
          >
            {closeLabel}
          </button>
        </div>
      )}
    </>
  );
}
