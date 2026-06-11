"use client";

import { useRef } from "react";

import { ScrambleText } from "@/components/effects/scramble-text";
import { useScrollSkew } from "@/components/effects/use-scroll-skew";

/*
  SectionTitle — apertura de capítulo a pantalla: un titular PETSCII GIGANTE
  que se "decodea" (scramble) y se revela al entrar, con la línea BASIC como
  subtítulo y un skew sutil según la velocidad de scroll. Reemplaza los
  banners marquee como forma de pasar de una sección a otra.

  Lleva el heading real (h2) de la sección — por eso las secciones que usan
  SectionTitle ya no repiten su SectionHeader.
*/

type SectionTitleProps = {
  /** Número de línea BASIC: "10", "20", … */
  line: string;
  /** Nombre/capítulo, ej: "MANIFIESTO". También es el texto gigante. */
  name: string;
  /** id de anclaje opcional. */
  id?: string;
};

export function SectionTitle({ line, name, id }: SectionTitleProps) {
  const skewRef = useRef<HTMLDivElement>(null);
  useScrollSkew(skewRef);

  return (
    <div className="section-title-block" id={id}>
      <div className="grid-bg" />
      <div className="section-title-inner">
        <p className="section-label">
          <span className="text-[var(--text-dim)]">{line} </span>
          PRINT &quot;{name}&quot;
        </p>
        {/* Decorativo: cada sección conserva su propio heading real */}
        <div ref={skewRef} className="section-title-skew" aria-hidden="true">
          <ScrambleText
            as="span"
            text={name}
            className="section-title-giant heading-reveal"
            noise="glitch"
            spread={30}
          />
        </div>
      </div>
    </div>
  );
}
