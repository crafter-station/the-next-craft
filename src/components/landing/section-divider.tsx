"use client";

import { useRef } from "react";

import { useScrollSkew } from "@/components/effects/use-scroll-skew";

/*
  SectionDivider — banda de transición con tipografía PETSCII GIGANTE que se
  desplaza (marquee) + parallax al scroll (CSS view-timeline) + skew por
  velocidad de scroll (JS). La firma cinética de los landings de awwwards,
  pero en B&N C64: palabras alternando relleno / contorno.

  Decorativo: aria-hidden. Sin movimiento bajo reduced-motion (CSS).
*/

type SectionDividerProps = {
  word: string;
  /** Marquee en sentido inverso. */
  reverse?: boolean;
  /** Cuántas veces repetir la palabra por mitad del track. */
  repeat?: number;
  /** Mostrar la cuadrícula blueprint de fondo. */
  grid?: boolean;
};

export function SectionDivider({
  word,
  reverse = false,
  repeat = 5,
  grid = true,
}: SectionDividerProps) {
  const skewRef = useRef<HTMLDivElement>(null);
  useScrollSkew(skewRef);

  const set = Array.from({ length: repeat }, (_, i) => i);

  return (
    <div className="section-divider" aria-hidden="true">
      {grid && <div className="grid-bg" />}
      <div className="divider-parallax">
        <div ref={skewRef} className="divider-skew">
          <div
            className={`divider-track${reverse ? " divider-track--reverse" : ""}`}
          >
            {[...set, ...set].map((_, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: ticker decorativo estático
                key={i}
                className={`divider-word${
                  i % 2 === 1 ? " divider-word--outline" : ""
                }`}
              >
                {word}
                <span className="divider-sep">/</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
