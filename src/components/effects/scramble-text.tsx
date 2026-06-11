"use client";

import {
  type CSSProperties,
  createElement,
  type ElementType,
  useEffect,
  useRef,
  useState,
} from "react";

/*
  ScrambleText — efecto "decode" binario→texto (firma de wodniack.dev),
  pero en clave C64: cada slot titila como 0/1 y se resuelve de izquierda
  a derecha hasta revelar el texto real.

  - SSR-safe: renderiza el texto final de entrada (sin layout shift, sin
    mismatch de hidratación). El scramble corre solo en cliente.
  - Accesible: termina SIEMPRE en el texto real; respeta prefers-reduced-motion
    (muestra el texto fijo, sin animar).
  - Performance: muta el textContent de UN nodo por frame (sin recalc de
    CSS vars en hijos). Cadencia por "steps" para sabor computery.
  - Soporta saltos de línea con "\n" (usar whitespace-pre-line en className).
*/

const BINARY = "01";
const GLITCH = "01░▒█/<>*+=#";

type ScrambleTextProps = {
  text: string;
  /** Etiqueta del elemento contenedor. Default: "span". */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Cuándo arranca: al montar o al entrar en viewport (una vez). */
  trigger?: "mount" | "view";
  /** Delay antes de arrancar (ms). */
  delay?: number;
  /** Frames que tarda en "barrer" todos los slots. Más alto = más lento. */
  spread?: number;
  /** Cada cuántos frames se actualiza (cadencia). 2 = computery. */
  step?: number;
  /** Charset del ruido. Default binario; "glitch" añade bloques PETSCII. */
  noise?: "binary" | "glitch";
};

export function ScrambleText({
  text,
  as,
  className,
  style,
  trigger = "view",
  delay = 0,
  spread = 28,
  step = 2,
  noise = "binary",
}: ScrambleTextProps) {
  const Tag = (as ?? "span") as ElementType;
  const ref = useRef<HTMLElement>(null);
  // Estado inicial = texto real (SSR + sin-JS + reduced-motion).
  const [, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // texto ya está fijo; no animamos

    const chars = noise === "glitch" ? GLITCH : BINARY;
    const final = text;
    const n = final.length;

    // Cada slot revela en un frame objetivo, de izq→der + jitter.
    const reveals = Array.from({ length: n }, (_, i) => {
      const base = (i / Math.max(1, n - 1)) * spread;
      return Math.round(base + Math.random() * spread * 0.5);
    });
    const lastFrame = Math.max(...reveals, spread) + 4;

    let raf = 0;
    let frame = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const rand = (s: string) => s[Math.floor(Math.random() * s.length)];

    const render = () => {
      let out = "";
      for (let i = 0; i < n; i++) {
        const ch = final[i];
        if (ch === " " || ch === "\n") {
          out += ch;
        } else if (frame >= reveals[i]) {
          out += ch;
        } else {
          out += rand(chars);
        }
      }
      el.textContent = out;
    };

    const tick = () => {
      if (frame % step === 0) render();
      frame++;
      if (frame <= lastFrame) {
        raf = requestAnimationFrame(tick);
      } else {
        el.textContent = final; // garantiza estado final exacto
      }
    };

    const start = () => {
      setStarted(true);
      raf = requestAnimationFrame(tick);
    };

    let observer: IntersectionObserver | undefined;
    if (trigger === "mount") {
      timeoutId = setTimeout(start, delay);
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            observer?.disconnect();
            timeoutId = setTimeout(start, delay);
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [text, trigger, delay, spread, step, noise]);

  return createElement(
    Tag,
    { ref, className, style, "data-scramble": "" },
    text,
  );
}
