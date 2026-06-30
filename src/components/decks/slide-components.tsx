import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ── Tabla fusionada: contenedor con borde superior/izquierdo; cada celda
      aporta el derecho/inferior → retícula de 1px compartido, sin radius ── */
const TABLE = "border-t border-l border-[var(--line)] bg-[var(--screen-dim)]";
const CELL = "border-r border-b border-[var(--line)]";

export function SlideTitle({
  line,
  children,
}: {
  line: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="section-label">
        <span className="text-[var(--text-dim)]">{line} </span>PRINT &quot;
        {typeof children === "string" ? children : "SLIDE"}&quot;
      </p>
      <h1
        className="pixel-heading"
        style={{ fontSize: "clamp(1.75rem, 5.5vw, 3.25rem)" }}
      >
        {children}
      </h1>
    </div>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-mono font-medium leading-snug text-[var(--text)]"
      style={{ fontSize: "clamp(1.1rem, 3vw, 1.65rem)" }}
    >
      {children}
    </div>
  );
}

export function DataGrid({ children }: { children: ReactNode }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 ${TABLE}`}>{children}</div>
  );
}

export function DataCell({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className={`${CELL} px-5 py-4 flex flex-col gap-1`}>
      <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-dim)]">
        {label}
      </span>
      <span className="font-mono text-sm text-[var(--text)]">{value}</span>
    </div>
  );
}

export function TrackCard({
  number,
  title,
  tagline,
}: {
  number: string;
  title: string;
  tagline: string;
}) {
  return (
    <div className="bg-[var(--screen-dim)] border border-[var(--line)] p-5 md:p-6 flex flex-col gap-2">
      <span className="font-mono text-[11px] text-[var(--text-dim)]">
        TRACK {number}
      </span>
      <h3 className="font-pixel font-bold text-[var(--text)] text-lg md:text-xl uppercase leading-tight">
        {title}
      </h3>
      <p className="font-mono text-sm text-[var(--text-dim)]">{tagline}</p>
    </div>
  );
}

export function Timeline({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col list-none p-0 m-0">{children}</ul>;
}

export function TimelineRow({
  time,
  children,
}: {
  time: string;
  children: ReactNode;
}) {
  return (
    <li className="relative flex items-baseline gap-3 md:gap-4 py-3 border-b border-[var(--border)] pl-4 font-mono text-sm">
      <span
        className="absolute left-0 top-[1.1rem] w-1.5 h-1.5 bg-[var(--bright)]"
        aria-hidden="true"
      />
      <span className="flex-shrink-0 w-12 md:w-14 text-[var(--bright)] tabular-nums text-xs md:text-sm">
        {time}
      </span>
      <span className="text-[var(--text)]">{children}</span>
    </li>
  );
}

export function Stat({
  value,
  label,
  size = "md",
}: {
  value: ReactNode;
  label: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-pixel font-bold text-[var(--text)] leading-none whitespace-nowrap"
        style={{
          fontSize:
            size === "lg"
              ? "clamp(3.5rem, 12vw, 7rem)"
              : "clamp(2.5rem, 9vw, 5rem)",
        }}
      >
        {value}
      </span>
      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
        {label}
      </span>
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-6 md:gap-x-16">
      {children}
    </div>
  );
}

export function LogoWall({ children }: { children: ReactNode }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 ${TABLE}`}>
      {children}
    </div>
  );
}

export function Logo({
  name,
  src,
  href,
}: {
  name: string;
  src: string;
  href?: string;
}) {
  const inner = (
    // biome-ignore lint/performance/noImgElement: external sponsor logos from many domains, not worth next/image remotePatterns config
    <img
      src={src}
      alt={name}
      title={name}
      loading="lazy"
      className="max-h-9 md:max-h-10 max-w-full w-auto object-contain opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-150"
    />
  );

  return (
    <div className={`${CELL} group`}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-20 md:h-24 px-5 no-underline"
        >
          {inner}
        </a>
      ) : (
        <span className="flex items-center justify-center h-20 md:h-24 px-5">
          {inner}
        </span>
      )}
    </div>
  );
}

export function BulletList({ children }: { children: ReactNode }) {
  return (
    <ul className="flex flex-col gap-2 list-none p-0 m-0 font-mono text-sm md:text-base text-[var(--text-dim)]">
      {children}
    </ul>
  );
}

export function Keycap({ children }: { children: ReactNode }) {
  return (
    <span className="keycap inline-block font-mono text-xs font-semibold tracking-[0.12em] uppercase px-3 py-1.5">
      {children}
    </span>
  );
}

export function Ready() {
  return (
    <p className="font-mono text-[var(--bright)] text-lg md:text-xl">
      READY.<span className="cursor-blink">█</span>
    </p>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-script text-[var(--bright)] leading-none pt-2 inline-block ${className}`}
      style={{ fontSize: "clamp(2rem, 7vw, 4rem)" }}
    >
      the next craft
    </span>
  );
}

export function SponsorTier({
  name,
  price,
  slots,
  available,
  availableLabel = "disponible",
  covers,
}: {
  name: string;
  price: string;
  slots: string;
  available?: string;
  availableLabel?: string;
  covers: string[];
}) {
  return (
    <div className={`${CELL} p-5 md:p-6 flex flex-col gap-3 h-full`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-pixel font-bold text-[var(--text)] text-lg uppercase">
          {name}
        </span>
        <span className="font-mono text-xs text-[var(--text-dim)]">
          ×{slots}
          {available
            ? ` · ${available} ${availableLabel}${available === "1" ? "" : "s"}`
            : ""}
        </span>
      </div>
      <span className="font-mono text-2xl md:text-3xl font-semibold text-[var(--bright)]">
        {price}
      </span>
      <ul className="flex flex-col gap-1.5 list-none p-0 m-0 font-mono text-sm text-[var(--text-dim)]">
        {covers.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

/* ── Markdown element styling (closed vocabulary for base MDX) ─────────── */

export function MdxH1({ children }: { children?: ReactNode }) {
  return (
    <h1
      className="pixel-heading"
      style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.75rem)" }}
    >
      {children}
    </h1>
  );
}

export function MdxH2({ children }: { children?: ReactNode }) {
  return (
    <h2 className="font-mono text-base md:text-lg font-semibold uppercase tracking-[0.12em] text-[var(--bright)]">
      {children}
    </h2>
  );
}

export function MdxH3({ children }: { children?: ReactNode }) {
  return (
    <h3 className="font-mono text-sm md:text-base font-semibold uppercase tracking-[0.1em] text-[var(--text)]">
      {children}
    </h3>
  );
}

export function MdxP({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-sm md:text-base text-[var(--text-dim)] leading-relaxed",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MdxUl({ children }: { children?: ReactNode }) {
  return (
    <ul className="flex flex-col gap-1.5 list-none p-0 m-0 font-mono text-sm md:text-base text-[var(--text-dim)]">
      {children}
    </ul>
  );
}

export function MdxOl({ children }: { children?: ReactNode }) {
  return (
    <ol className="flex flex-col gap-1.5 list-decimal pl-5 m-0 font-mono text-sm md:text-base text-[var(--text-dim)]">
      {children}
    </ol>
  );
}

export function MdxLi({ children }: { children?: ReactNode }) {
  return <li>{children}</li>;
}

export function MdxStrong({ children }: { children?: ReactNode }) {
  return (
    <strong className="font-semibold text-[var(--text)]">{children}</strong>
  );
}

export function MdxA({
  href,
  children,
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="nav-link font-mono text-[var(--bright)] underline-offset-2"
    >
      {children}
    </a>
  );
}

export function MdxHr() {
  return <hr className="border-[var(--line)] my-4" />;
}

export function MdxBlockquote({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-[var(--bright)] pl-4 py-1 my-4">
      {children}
    </blockquote>
  );
}

export function MdxTable({ children }: { children?: ReactNode }) {
  return (
    <div className={TABLE}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function MdxThead({ children }: { children?: ReactNode }) {
  return (
    <thead className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--bright)]">
      {children}
    </thead>
  );
}

export function MdxTbody({ children }: { children?: ReactNode }) {
  return (
    <tbody className="font-mono text-sm text-[var(--text-dim)]">
      {children}
    </tbody>
  );
}

export function MdxTr({ children }: { children?: ReactNode }) {
  return <tr>{children}</tr>;
}

export function MdxTh({ children }: { children?: ReactNode }) {
  return (
    <th className={`${CELL} px-3 py-2 text-left font-semibold`}>{children}</th>
  );
}

export function MdxTd({ children }: { children?: ReactNode }) {
  return <td className={`${CELL} px-3 py-2`}>{children}</td>;
}
