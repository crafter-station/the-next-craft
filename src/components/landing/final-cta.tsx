"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { ScrambleText } from "@/components/effects/scramble-text";

/*
  FinalCta — la sección entera es una terminal C64 que ocupa TODA la
  pantalla y queda "pinned": al seguir scrolleando la pantalla no se va —
  cada golpe de scroll tipea más líneas de la sesión (header → boot →
  headline → specs → prompt). Solo cuando todo está cargado el scroll
  suelta la sección hacia el footer.

  Robustez: el contenido completo se renderiza de entrada (SSR / sin JS /
  reduced-motion = todo visible, sin pin). Solo cuando JS monta y el
  usuario acepta motion se arma la secuencia (data-armed) y el scroll
  va tipeando cada elemento según su umbral (data-thr, 0→1).
*/

// Registro por WhatsApp — único canal (ver docs/whatsapp-registration.md).
// Mientras no exista el número de producción (env vacía), el CTA cae al form:
// nunca shippear un placeholder.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const HEADER_THRESHOLDS = [0.03, 0.07] as const;
const BOOT_THRESHOLDS = [0.11, 0.15, 0.19, 0.23, 0.27] as const;

/* El headline (scramble) entra aquí */
const HEADLINE_THR = 0.33;

const SPEC_THRESHOLDS = [0.46, 0.54, 0.62, 0.7] as const;

/* Prompt + botón: lo último en cargar; después queda ~15% de scroll con
   todo visible antes de que la sección suelte */
const PROMPT_THR = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function FinalCta() {
  const t = useTranslations("finalCta");
  const headerLines = t.raw("headerLines") as readonly string[];
  const bootLines = t.raw("bootLines") as readonly string[];
  const specLines = t.raw("specs") as readonly string[];

  const headerItems = useMemo(
    () =>
      headerLines.map((text, i) => ({
        text,
        thr: HEADER_THRESHOLDS[i] ?? HEADER_THRESHOLDS[HEADER_THRESHOLDS.length - 1],
      })),
    [headerLines],
  );
  const bootItems = useMemo(
    () =>
      bootLines.map((text, i) => ({
        text,
        thr: BOOT_THRESHOLDS[i] ?? BOOT_THRESHOLDS[BOOT_THRESHOLDS.length - 1],
      })),
    [bootLines],
  );
  const specItems = useMemo(
    () =>
      specLines.map((text, i) => ({
        text,
        thr: SPEC_THRESHOLDS[i] ?? SPEC_THRESHOLDS[SPEC_THRESHOLDS.length - 1],
      })),
    [specLines],
  );

  const ctaHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        t("whatsappMessage"),
      )}`
    : "https://forms.crafterstation.com/the-next-craft";
  const ctaLabel = WHATSAPP_NUMBER ? t("ctaWhatsapp") : t("ctaForm");

  const sectionRef = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [run, setRun] = useState(false);

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
    setArmed(true);

    const els = Array.from(section.querySelectorAll<HTMLElement>("[data-thr]"));
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const p = total > 0 ? clamp01(scrolled / total) : 0;

      for (const el of els) {
        el.classList.toggle("is-typed", p >= Number(el.dataset.thr));
      }
      if (p >= HEADLINE_THR) setRun(true);
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
    <section
      ref={sectionRef}
      id="postular"
      className="terminal-cta"
      data-armed={armed ? "true" : "false"}
    >
      <div className="terminal-sticky">
        <div
          className="scanlines absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
        />
        <div className="grid-bg" />

        <div className="terminal-inner">
          {/* ── Arriba: header + boot de la sesión ── */}
          <div aria-hidden="true">
            {headerItems.map(({ text, thr }) => (
              <p
                key={text}
                className="term-line text-xs sm:text-sm leading-[1.9] text-[var(--bright)] tracking-[0.08em] font-semibold"
                data-thr={thr}
              >
                {text}
              </p>
            ))}
            <div className="pt-3">
              {bootItems.map(({ text, thr }) => (
                <p
                  key={text}
                  className="term-line text-xs sm:text-sm leading-[1.9] text-[var(--text-dim)] tracking-[0.06em]"
                  data-thr={thr}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>

          {/* ── Centro: headline gigante + specs ── */}
          <div className="terminal-block">
            <div className="term-fade" data-thr={HEADLINE_THR}>
              <ScrambleText
                key={run ? "run" : "idle"}
                as="h2"
                text={t("headline")}
                className="pixel-heading term-headline whitespace-pre-line"
                noise="glitch"
                trigger="mount"
                spread={30}
              />
            </div>

            <div>
              <p className="sr-only">{t("specsSr")}</p>
              <div aria-hidden="true">
                {specItems.map(({ text, thr }) => (
                  <p
                    key={text}
                    className="term-line term-spec leading-[2] text-[var(--text)]"
                    data-thr={thr}
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* ── Abajo: prompt final + botón en video inverso ── */}
          <div
            className="term-fade flex flex-col items-start gap-4"
            data-thr={PROMPT_THR}
          >
            <p
              className="font-mono text-sm text-[var(--bright)]"
              aria-hidden="true"
            >
              {t("pressReturn")}
            </p>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="term-btn"
            >
              {ctaLabel}
            </a>
            <p
              className="font-mono text-sm text-[var(--bright)]"
              aria-hidden="true"
            >
              <span className="cursor-blink">█</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
