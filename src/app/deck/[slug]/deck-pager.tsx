"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  id: string;
  title: string;
  content: ReactNode;
};

const SWIPE_THRESHOLD = 56;
const SWIPE_VELOCITY = 0.35;
const WHEEL_THRESHOLD = 80;
const WHEEL_COOLDOWN_MS = 450;

function clampSlideIndex(index: number, slideCount: number) {
  return Math.max(0, Math.min(slideCount - 1, index));
}

function canScrollWithinSlide(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof HTMLElement) || deltaY === 0) return false;

  const scrollable = target.closest<HTMLElement>(".deck-slide-inner");
  if (!scrollable) return false;

  const canScrollDown =
    scrollable.scrollTop + scrollable.clientHeight <
    scrollable.scrollHeight - 1;
  const canScrollUp = scrollable.scrollTop > 0;

  return deltaY > 0 ? canScrollDown : canScrollUp;
}

export function DeckPager({
  slug,
  title,
  slides,
}: {
  slug: string;
  title: string;
  description?: string;
  slides: Slide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indexOpen, setIndexOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const wheelDelta = useRef(0);
  const lastWheelMoveAt = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(clampSlideIndex(index, slides.length));
    },
    [slides.length],
  );

  const prev = useCallback(() => {
    setActiveIndex((current) => clampSlideIndex(current - 1, slides.length));
  }, [slides.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => clampSlideIndex(current + 1, slides.length));
  }, [slides.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (indexOpen) {
        if (event.key === "Escape" || event.key === "g" || event.key === "G") {
          setIndexOpen(false);
          event.preventDefault();
        }
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          prev();
          event.preventDefault();
          break;
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          next();
          event.preventDefault();
          break;
        case "Home":
          goTo(0);
          event.preventDefault();
          break;
        case "End":
          goTo(slides.length - 1);
          event.preventDefault();
          break;
        case "g":
        case "G":
          setIndexOpen(true);
          event.preventDefault();
          break;
        case "Escape":
          setIndexOpen(false);
          event.preventDefault();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, next, prev, slides.length, indexOpen]);

  function onTouchStart(event: React.TouchEvent) {
    const t = event.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current;
    if (!start) return;
    const end = event.changedTouches[0];
    const dx = start.x - end.clientX;
    const dy = start.y - end.clientY;
    const dt = Date.now() - start.t;
    const velocity = Math.abs(dx) / Math.max(dt, 1);

    if (
      Math.abs(dx) > Math.abs(dy) &&
      (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY)
    ) {
      if (dx > 0) next();
      else prev();
    }
    touchStart.current = null;
  }

  function onWheel(event: React.WheelEvent) {
    if (indexOpen || canScrollWithinSlide(event.target, event.deltaY)) return;

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (dominantDelta === 0) return;

    wheelDelta.current += dominantDelta;

    const now = Date.now();
    if (
      Math.abs(wheelDelta.current) < WHEEL_THRESHOLD ||
      now - lastWheelMoveAt.current < WHEEL_COOLDOWN_MS
    ) {
      return;
    }

    if (wheelDelta.current > 0) next();
    else prev();

    wheelDelta.current = 0;
    lastWheelMoveAt.current = now;
    event.preventDefault();
  }

  return (
    <div
      ref={containerRef}
      className="deck-pager"
      data-mounted={mounted}
      data-index-open={indexOpen}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <a
        href={`/deck/${slug}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
      >
        Saltar controles — ir al inicio del deck
      </a>

      <header className="deck-chrome">
        <div className="deck-topbar">
          <span className="deck-deck-title font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-dim)] truncate">
            {title}
          </span>
          <button
            type="button"
            onClick={() => setIndexOpen((v) => !v)}
            aria-expanded={indexOpen}
            aria-controls="deck-index"
            className="keycap keycap-sm font-mono text-[10px] font-semibold tracking-[0.14em] uppercase px-3 py-1.5"
          >
            INDEX
          </button>
        </div>
      </header>

      <main className="deck-stage" aria-live="polite" aria-atomic="true">
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            className="deck-slide"
            data-active={index === activeIndex}
            aria-hidden={index !== activeIndex}
          >
            <div className="deck-slide-inner">
              <div className="deck-slide-content">{slide.content}</div>
            </div>
          </section>
        ))}
      </main>

      <div className="deck-controls">
        <div className="deck-keycaps">
          <button
            type="button"
            onClick={prev}
            disabled={activeIndex === 0}
            aria-label="Diapositiva anterior"
            className="keycap keycap-sm font-mono text-xs font-semibold tracking-[0.12em] uppercase px-3 py-2 disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            disabled={activeIndex === slides.length - 1}
            aria-label="Diapositiva siguiente"
            className="keycap keycap-sm font-mono text-xs font-semibold tracking-[0.12em] uppercase px-3 py-2 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      {indexOpen && (
        <div
          id="deck-index"
          className="deck-index"
          role="dialog"
          aria-modal="true"
          aria-label="Índice de diapositivas"
        >
          <div className="deck-index-backdrop" aria-hidden="true" />
          <div className="deck-index-panel">
            <div className="deck-index-header">
              <span className="section-label">INDEX</span>
              <button
                type="button"
                onClick={() => setIndexOpen(false)}
                aria-label="Cerrar índice"
                className="keycap-ghost keycap-sm font-mono text-[10px] font-semibold tracking-[0.14em] uppercase px-3 py-1.5"
              >
                ESC
              </button>
            </div>
            <ol className="deck-index-list">
              {slides.map((slide, index) => (
                <li key={slide.id} className="deck-index-item">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      setIndexOpen(false);
                    }}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className="deck-index-button"
                  >
                    <span className="deck-index-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="deck-index-title">{slide.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
