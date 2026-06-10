"use client";

import { type RefObject, useEffect } from "react";

/*
  useScrollSkew — inclina (skewX) un elemento según la VELOCIDAD del scroll.
  Es la firma cinética de wodniack: cuando haces scroll rápido, la tipografía
  gigante se "arrastra".

  Un único listener de scroll + un único rAF para TODOS los elementos
  registrados (sin importar cuántos dividers haya). Escribe skewX en el
  transform del elemento, lerp suave + decay. Off bajo reduced-motion.
*/

const MAX_SKEW = 16; // grados
const els = new Set<HTMLElement>();
let started = false;
let velocity = 0;
let lastY = 0;
let current = 0;
let raf = 0;

function ensureRunning() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    velocity = y - lastY;
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const loop = () => {
    velocity *= 0.86; // decay
    const target = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, velocity * 0.5));
    current += (target - current) * 0.12;
    const skew = current.toFixed(2);
    for (const el of els) {
      el.style.transform = `skewX(${skew}deg)`;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

export function useScrollSkew(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = ref.current;
    if (reduced || !el) return;

    ensureRunning();
    els.add(el);

    return () => {
      els.delete(el);
      el.style.transform = "";
      if (els.size === 0 && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        started = false;
      }
    };
  }, [ref]);
}
