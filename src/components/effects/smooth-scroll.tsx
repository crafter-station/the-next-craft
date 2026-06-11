"use client";

import { useEffect } from "react";

import Lenis from "lenis";

/*
  SmoothScroll — interpolación de scroll de rueda estilo awwwards (Lenis).
  - Solo se inicializa si el usuario NO pide reduced-motion (si lo pide,
    queda el scroll nativo del navegador).
  - Toca nativo: se deja el scroll del SO (syncTouch off) — se siente mejor
    en móvil y evita conflictos con drag del C64 3D.
  - Intercepta clicks en anchors de la misma página para hacer scrollTo
    suave respetando el nav sticky (offset).
*/

const NAV_OFFSET = -72; // alto del header sticky + aire

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - (1 - t) ** 3, // ease-out cúbico
      smoothWheel: true,
      syncTouch: false,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, {
        offset: NAV_OFFSET,
        // A11y: al terminar el scroll suave, mueve el foco al destino
        // (sin saltar el scroll) para no romper teclado ni el skip-link.
        onComplete: () => {
          const dest = el as HTMLElement;
          if (!dest.hasAttribute("tabindex")) dest.tabIndex = -1;
          dest.focus({ preventScroll: true });
        },
      });
    };

    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
