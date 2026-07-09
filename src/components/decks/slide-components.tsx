import Image from "next/image";
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
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${TABLE}`}>
      {children}
    </div>
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
    <div className={`${CELL} px-4 py-3 md:px-5 md:py-4 flex flex-col gap-1`}>
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
    <div className="bg-[var(--screen-dim)] border border-[var(--line)] p-4 md:p-6 flex flex-col gap-2">
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
    <div className={`grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 ${TABLE}`}>
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
          className="flex items-center justify-center h-16 md:h-24 px-4 md:px-5 no-underline"
        >
          {inner}
        </a>
      ) : (
        <span className="flex items-center justify-center h-16 md:h-24 px-4 md:px-5">
          {inner}
        </span>
      )}
    </div>
  );
}

export function PhotoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {children}
    </div>
  );
}

export function PhotoCard({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="border border-[var(--line)] bg-[var(--screen-dim)] p-2">
      <div className="relative h-44 overflow-hidden border border-[var(--line)] bg-[var(--screen)] md:h-56">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover grayscale contrast-125 saturate-0"
        />
      </div>
      <figcaption className="pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
        {caption}
      </figcaption>
    </figure>
  );
}

type HackathonPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export function PhotoRail({ photos }: { photos: HackathonPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      {photos.map((photo) => (
        <DeckPhoto key={photo.src} photo={photo} className="h-28 md:h-36" />
      ))}
    </div>
  );
}

export function PhotoFeature({ photo }: { photo: HackathonPhoto }) {
  return <DeckPhoto photo={photo} className="h-44 md:h-64" prominent />;
}

export function PhotoMosaic({ photos }: { photos: HackathonPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
      {photos.map((photo, index) => (
        <DeckPhoto
          key={photo.src}
          photo={photo}
          className={cn(
            "h-28 md:h-36",
            index === 0 && "col-span-2 h-40 md:col-span-1 md:h-36",
          )}
        />
      ))}
    </div>
  );
}

function DeckPhoto({
  photo,
  className,
  prominent = false,
}: {
  photo: HackathonPhoto;
  className?: string;
  prominent?: boolean;
}) {
  return (
    <figure className="border border-[var(--line)] bg-[var(--screen-dim)] p-1.5">
      <div
        className={cn(
          "relative overflow-hidden border border-[var(--line)] bg-[var(--screen)]",
          className,
        )}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={
            prominent
              ? "(min-width: 768px) 70vw, 100vw"
              : "(min-width: 768px) 25vw, 50vw"
          }
          className="h-full w-full object-cover grayscale contrast-125 saturate-0"
        />
      </div>
      <figcaption className="pt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
        {photo.caption}
      </figcaption>
    </figure>
  );
}

export function BulletList({ children }: { children: ReactNode }) {
  return (
    <ul className="flex flex-col gap-2 list-none p-0 m-0 font-mono text-sm md:text-base text-[var(--text-dim)]">
      {children}
    </ul>
  );
}

export function ContrastGrid({
  leftTitle,
  rightTitle,
  leftItems,
  rightItems,
}: {
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]">
      <ContrastColumn title={leftTitle} items={leftItems} muted />
      <ContrastColumn title={rightTitle} items={rightItems} />
    </div>
  );
}

function ContrastColumn({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className={`${CELL} p-4 md:p-6 flex flex-col gap-4`}>
      <span
        className={cn(
          "font-mono text-[11px] font-semibold tracking-[0.14em] uppercase",
          muted ? "text-[var(--text-dim)]" : "text-[var(--bright)]",
        )}
      >
        {title}
      </span>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item}
            className={cn(
              "border border-[var(--line)] px-3 py-2 font-mono text-sm uppercase tracking-[0.06em]",
              muted
                ? "text-[var(--text-dim)] opacity-70"
                : "text-[var(--text)] bg-[var(--screen)]",
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlowMap({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {items.map((item, index) => (
        <div key={item.label} className="relative">
          <div className="border border-[var(--line)] bg-[var(--screen-dim)] p-4 md:p-6 min-h-36 flex flex-col justify-between">
            <span className="font-mono text-[11px] text-[var(--bright)] tabular-nums">
              0{index + 1}
            </span>
            <div className="flex flex-col gap-2">
              <span className="font-pixel font-bold text-xl md:text-2xl uppercase leading-tight text-[var(--text)]">
                {item.label}
              </span>
              <span className="font-mono text-sm text-[var(--text-dim)]">
                {item.value}
              </span>
            </div>
          </div>
          {index < items.length - 1 ? (
            <span className="hidden md:block absolute -right-3 top-1/2 z-10 -translate-y-1/2 font-mono text-[var(--bright)]">
              &gt;
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function BarStack({
  items,
}: {
  items: { label: string; value: string; percent: number }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-16 border border-[var(--line)] bg-[var(--screen-dim)] overflow-hidden">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center border-r border-[var(--line)] last:border-r-0 bg-[var(--screen)] font-pixel font-bold text-[var(--text)]"
            style={{ width: `${item.percent}%` }}
          >
            {item.value}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {items.map((item) => (
          <div key={item.label} className="font-mono text-sm">
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] pb-1">
              <span className="text-[var(--text)]">{item.label}</span>
              <span className="text-[var(--bright)] tabular-nums">
                {item.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChipGrid({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="border border-[var(--line)] bg-[var(--screen-dim)] px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--text)]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function PersonaGrid({
  items,
}: {
  items: { title: string; caption: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]">
      {items.map((item, index) => (
        <div
          key={item.title}
          className={`${CELL} p-4 md:p-5 flex flex-col gap-4`}
        >
          <span className="font-mono text-[11px] text-[var(--bright)] tabular-nums">
            P{index + 1}
          </span>
          <div className="flex flex-col gap-2">
            <span className="font-pixel font-bold text-lg uppercase leading-tight text-[var(--text)]">
              {item.title}
            </span>
            <span className="font-mono text-sm text-[var(--text-dim)]">
              {item.caption}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PhaseTimeline({
  items,
}: {
  items: { time: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]">
      {items.map((item) => (
        <div
          key={item.time}
          className={`${CELL} p-4 md:p-5 flex md:min-h-36 md:flex-col md:justify-between gap-3`}
        >
          <span className="font-mono text-[var(--bright)] tabular-nums text-sm">
            {item.time}
          </span>
          <span className="font-pixel font-bold text-lg md:text-xl uppercase leading-tight text-[var(--text)]">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BenefitGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${CELL} p-4 md:p-5 flex flex-col gap-3 min-h-32`}
        >
          <span className="font-pixel font-bold text-lg uppercase leading-tight text-[var(--text)]">
            {item.label}
          </span>
          <span className="font-mono text-sm text-[var(--text-dim)]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MiniMatrix({
  columns,
  rows,
}: {
  columns: string[];
  rows: { label: string; values: string[] }[];
}) {
  return (
    <div className={`${TABLE} overflow-x-auto`}>
      <table className="w-full border-collapse font-mono text-sm">
        <thead className="text-[11px] uppercase tracking-[0.12em] text-[var(--bright)]">
          <tr>
            <th className={`${CELL} px-3 py-2 text-left font-semibold`}>
              Tier
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className={`${CELL} px-3 py-2 text-center font-semibold`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--text-dim)]">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className={`${CELL} px-3 py-2 text-[var(--text)]`}>
                {row.label}
              </td>
              {row.values.map((value, index) => (
                <td
                  key={`${row.label}-${columns[index]}`}
                  className={`${CELL} px-3 py-2 text-center`}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className={`${CELL} p-4 md:p-6 flex flex-col gap-3 h-full`}>
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
    <div className={`${TABLE} overflow-x-auto`}>
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
