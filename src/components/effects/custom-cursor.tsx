"use client";

import { useEffect, useRef } from "react";

/*
  CustomCursor — cursor C64: un punto marfil que sigue el puntero con un
  anillo que lo persigue con lag (lerp). Sobre elementos interactivos el
  anillo crece; sobre [data-magnetic] (keycaps) tira del elemento hacia el
  cursor (magnetic button awwwards).

  - Solo en punteros finos con hover real y sin reduced-motion.
  - Performance: un único rAF, muta transform de 2 nodos (translate3d) — sin
    recalcular layout. Oculta el cursor nativo vía clase en <html>.
  - El cursor lleva aria-hidden; es decorativo.
*/

const RING_LERP = 0.18;
const DOT_LERP = 0.35;
const MAGNET_STRENGTH = 0.32;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let magnetEl: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest(
        'a, button, [data-cursor], [role="button"], summary, label[for]',
      ) as HTMLElement | null;
      ring.classList.toggle("is-hover", Boolean(interactive));
      const magnet = t?.closest("[data-magnetic]") as HTMLElement | null;
      if (magnet !== magnetEl) {
        if (magnetEl) magnetEl.style.translate = "";
        magnetEl = magnet;
      }
    };

    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onLeave = () => ring.classList.add("is-out");
    const onEnter = () => ring.classList.remove("is-out");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    let raf = 0;
    const loop = () => {
      ringX += (mouseX - ringX) * RING_LERP;
      ringY += (mouseY - ringY) * RING_LERP;
      dotX += (mouseX - dotX) * DOT_LERP;
      dotY += (mouseY - dotY) * DOT_LERP;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

      // Magnetic pull del elemento hacia el cursor
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (mouseX - cx) * MAGNET_STRENGTH;
        const dy = (mouseY - cy) * MAGNET_STRENGTH;
        // Usamos la propiedad CSS `translate` (independiente de `transform`)
        // para no pisar el :active translateY de los keycaps.
        magnetEl.style.translate = `${dx}px ${dy}px`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      if (magnetEl) magnetEl.style.translate = "";
      root.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
