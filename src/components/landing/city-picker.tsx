"use client";

import { useCallback, useEffect, useState } from "react";

import { Dialog } from "@base-ui/react/dialog";
import { useTranslations } from "next-intl";

import { CITIES } from "@/lib/cities";

/*
  CityPicker — el CTA "Postular" no puede ir directo a Luma porque el registro
  está partido en 5 eventos, uno por sede. Abre un modal con forma de menú de
  arranque C64: opciones numeradas, video inverso en hover, y las teclas 1–5
  como atajo (el detalle que hace que se sienta terminal y no formulario).

  El trigger es el propio botón: quien lo usa le pasa la clase del keycap que
  corresponda (nav chico, hero grande) y el contenido del label.
*/

export function CityPicker({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("cityPicker");
  const tCity = useTranslations("cities");
  const [open, setOpen] = useState(false);

  /* Atajo 1–5: abre la sede en una pestaña nueva, igual que el click */
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const index = Number(event.key) - 1;
    const city = CITIES[index];
    if (!city || event.metaKey || event.ctrlKey || event.altKey) return;
    window.open(city.luma, "_blank", "noopener,noreferrer");
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<button type="button" className={className} data-magnetic />}
      >
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-[var(--void)]/85 motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0" />

        <Dialog.Popup
          className="fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg
                     -translate-x-1/2 -translate-y-1/2 overflow-hidden
                     rounded-[8px] border border-[var(--line)] bg-[var(--screen-dim)]
                     shadow-[0_6px_0_var(--key-shadow)] outline-none
                     motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-open:zoom-in-95
                     motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0 motion-safe:data-closed:zoom-out-95"
        >
          <div
            className="scanlines pointer-events-none absolute inset-0 z-10"
            aria-hidden="true"
          />

          {/* Barra de título: línea BASIC + salida */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-3">
            <span
              className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
              aria-hidden="true"
            >
              {t("loadLine")}
            </span>
            <Dialog.Close className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-dim)] transition-colors duration-150 hover:text-[var(--bright)]">
              {t("close")}
            </Dialog.Close>
          </div>

          <div className="px-5 pt-5 pb-4">
            <Dialog.Title className="pixel-heading text-[var(--text)] text-lg md:text-xl">
              {t("title")}
              <span className="cursor-blink">█</span>
            </Dialog.Title>
            <Dialog.Description className="mt-2 font-mono text-xs leading-[1.6] text-[var(--text-dim)]">
              {t("hint")}
            </Dialog.Description>
          </div>

          {/* Menú de sedes — cada fila es una opción numerada */}
          <ul className="m-0 list-none border-t border-[var(--line)] p-0">
            {CITIES.map(({ key, luma }, index) => (
              <li
                key={key}
                className="border-b border-[var(--line)] last:border-b-0"
              >
                <a
                  href={luma}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="city-option group flex items-center gap-4 px-5 py-4 no-underline"
                >
                  <span
                    className="font-mono text-xs tracking-[0.14em] text-[var(--text-dim)] group-hover:text-[var(--void)]"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 font-mono text-sm font-semibold tracking-[0.12em] uppercase">
                    {tCity(key)}
                  </span>
                  <span
                    className="cta-arrow font-mono text-sm"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p
            className="border-t border-[var(--line)] px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
            aria-hidden="true"
          >
            {t("keyHint")}
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
