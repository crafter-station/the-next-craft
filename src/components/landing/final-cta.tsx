"use client";

import { useEffect, useRef, useState } from "react";

import { ScrambleText } from "@/components/effects/scramble-text";

/*
  FinalCta — la sección entera es una terminal C64 que ocupa TODA la
  pantalla: header de boot arriba, headline gigante + specs al centro y
  prompt + botón de WhatsApp abajo. Al entrar en viewport la sesión se
  "tipea" sola. El scroll sigue normal hacia el footer (sin pin).

  Robustez: el contenido completo se renderiza de entrada (SSR / sin JS /
  reduced-motion = todo visible). Solo cuando JS monta y el usuario acepta
  motion se arma la secuencia (data-armed) y el observer la dispara
  (data-run) — los delays viven en --d por elemento.
*/

// Registro por WhatsApp — único canal (ver docs/whatsapp-registration.md)
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hola, quiero postular a The Next Craft",
)}`;

const HEADER_LINES = [
  { text: "**** THE NEXT CRAFT BASIC V2 ****", d: 0 },
  { text: "64K RAM SYSTEM · 38911 BASIC BYTES FREE", d: 260 },
] as const;

const BOOT_LINES = [
  { text: 'LOAD "POSTULAR",8,1', d: 520 },
  { text: "SEARCHING FOR POSTULAR", d: 820 },
  { text: "LOADING ... OK", d: 1100 },
  { text: "READY.", d: 1340 },
  { text: "RUN POSTULAR", d: 1560 },
] as const;

const SPEC_LINES = [
  { text: "DEADLINE ........ 10 JUL 2026 · 23:59 GMT-5", d: 2600 },
  { text: "CUPOS ........... 120 · ADMISIÓN SELECTIVA", d: 2800 },
  { text: "COSTO ........... GRATIS", d: 3000 },
  { text: "FORMULARIO ...... 7 PREGUNTAS · 90 SEGUNDOS", d: 3200 },
] as const;

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;
    setArmed(true);

    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="postular"
      className="terminal-cta"
      data-armed={armed ? "true" : "false"}
      data-run={run ? "true" : "false"}
    >
      <div
        className="scanlines absolute inset-0 pointer-events-none z-10"
        aria-hidden="true"
      />
      <div className="grid-bg" />

      <div className="terminal-inner">
        {/* ── Arriba: header + boot de la sesión ── */}
        <div aria-hidden="true">
          {HEADER_LINES.map(({ text, d }) => (
            <p
              key={text}
              className="term-line text-xs sm:text-sm leading-[1.9] text-[var(--bright)] tracking-[0.08em] font-semibold"
              style={{ "--d": `${d}ms` } as React.CSSProperties}
            >
              {text}
            </p>
          ))}
          <div className="pt-3">
            {BOOT_LINES.map(({ text, d }) => (
              <p
                key={text}
                className="term-line text-xs sm:text-sm leading-[1.9] text-[var(--text-dim)] tracking-[0.06em]"
                style={{ "--d": `${d}ms` } as React.CSSProperties}
              >
                {text}
              </p>
            ))}
          </div>
        </div>

        {/* ── Centro: headline gigante + specs ── */}
        <div className="terminal-block">
          <div
            className="term-fade"
            style={{ "--d": "1700ms" } as React.CSSProperties}
          >
            <ScrambleText
              as="h2"
              text={"¿CONSTRUYES?\nPOSTULA."}
              className="pixel-heading term-headline whitespace-pre-line"
              noise="glitch"
              delay={1700}
              spread={30}
            />
          </div>

          <div>
            <p className="sr-only">
              Deadline: 10 de julio de 2026, 23:59 GMT-5. 120 cupos, admisión
              selectiva. Gratis. El formulario son 7 preguntas, 90 segundos.
            </p>
            <div aria-hidden="true">
              {SPEC_LINES.map(({ text, d }) => (
                <p
                  key={text}
                  className="term-line term-spec leading-[2] text-[var(--text)]"
                  style={{ "--d": `${d}ms` } as React.CSSProperties}
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
          style={{ "--d": "3600ms" } as React.CSSProperties}
        >
          <p
            className="font-mono text-sm text-[var(--bright)]"
            aria-hidden="true"
          >
            PRESS RETURN ↵
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
            className="term-btn"
          >
            [ POSTULAR POR WHATSAPP → ]
          </a>
          <p
            className="font-mono text-sm text-[var(--bright)]"
            aria-hidden="true"
          >
            <span className="cursor-blink">█</span>
          </p>
        </div>
      </div>
    </section>
  );
}
