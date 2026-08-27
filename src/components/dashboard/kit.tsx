import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Piezas del dashboard, sobre el sistema visual que ya vive en globals.css.
 * Reutiliza `.keycap`, `.pixel-heading`, `.scanlines` y `.cursor` en vez de
 * redefinirlos: la fuente de verdad sigue siendo DESIGN.md.
 */

/** Línea BASIC numerada: la apertura de cada sección del sistema. */
export function Basic({
  n,
  children,
  className,
}: {
  n: number;
  children: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] leading-none tracking-[0.14em] uppercase text-[var(--text-dim)]",
        className,
      )}
    >
      <span className="text-[var(--bright)]">{n} </span>PRINT &quot;
      {children.toUpperCase()}&quot;
    </p>
  );
}

export function Pixel({
  children,
  size = "md",
  className,
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "text-[11px]",
    md: "text-[15px]",
    lg: "text-[22px]",
    xl: "text-[30px] sm:text-[38px]",
  } as const;
  return (
    <span className={cn("pixel-heading block", sizes[size], className)}>
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  screen = false,
  as: As = "section",
}: {
  children: ReactNode;
  className?: string;
  /** Scanlines: solo en contenedores que «son» una pantalla. */
  screen?: boolean;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <As
      className={cn(
        "relative border border-[var(--line)] bg-[var(--screen-dim)]",
        screen && "scanlines",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function PanelHead({
  n,
  label,
  title,
  aside,
}: {
  n: number;
  label: string;
  title?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-3.5">
      <div className="min-w-0">
        <Basic n={n}>{label}</Basic>
        {title && (
          <Pixel size="md" className="mt-2.5 truncate">
            {title}
          </Pixel>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

/** Etiqueta cuadrada. El estado se comunica invirtiendo a marfil, no con color. */
export function Tag({
  children,
  strong = false,
  className,
}: {
  children: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.1em] uppercase",
        strong
          ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
          : "border-[var(--line)]/60 text-[var(--text-dim)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Contenedor tipo tabla: bordes 1px compartidos, sin gap, sin radius. */
export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-l border-[var(--line)]", className)}>
      {children}
    </div>
  );
}

export function Cell({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-r border-b border-[var(--line)] px-4 py-3.5",
        className,
      )}
    >
      {label && (
        <p className="mb-2 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

export function Stat({
  value,
  label,
  hint,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="border-r border-b border-[var(--line)] px-4 py-4">
      <Pixel size="lg">{value}</Pixel>
      <p className="mt-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
        {label}
      </p>
      {hint && (
        <p className="mt-1.5 font-mono text-[11px] text-[var(--text-dim)]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Row({
  children,
  marker = "▸",
  className,
}: {
  children: ReactNode;
  marker?: string;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0",
        className,
      )}
    >
      <span className="mt-0.5 font-mono text-[11px] text-[var(--bright)]">
        {marker}
      </span>
      <div className="min-w-0 flex-1 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
        {children}
      </div>
    </li>
  );
}

export function Kv({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-2.5 last:border-b-0">
      <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
        {k}
      </span>
      <span className="min-w-0 truncate text-right font-mono text-[13px] text-[var(--text)]">
        {children}
      </span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="font-mono text-[12px] text-[var(--text-dim)]">{children}</p>
    </div>
  );
}

/** Tecla marfil. Usa `.keycap` del sistema; el radius vive solo aquí. */
export const keyClass =
  "keycap inline-flex items-center justify-center gap-2 px-3.5 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase transition-transform disabled:cursor-not-allowed disabled:opacity-40";
export const keyGhostClass =
  "keycap-ghost inline-flex items-center justify-center gap-2 px-3.5 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase transition-transform disabled:cursor-not-allowed disabled:opacity-40";

export function PageHeader({
  n,
  label,
  title,
  lede,
  aside,
}: {
  n: number;
  label: string;
  title: string;
  lede?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Basic n={n}>{label}</Basic>
          <h1 className="mt-3">
            <Pixel size="xl">{title}</Pixel>
          </h1>
          {lede && (
            <p className="mt-4 max-w-xl font-mono text-[13px] leading-relaxed text-[var(--text)]">
              {lede}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </div>
  );
}
