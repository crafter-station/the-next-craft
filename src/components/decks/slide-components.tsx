import Image from "next/image";
import { Children, type ReactNode } from "react";

import CursorMark from "@lobehub/icons/es/Cursor/components/Mono";
import CursorWordmark from "@lobehub/icons/es/Cursor/components/Text";
import ElevenLabsLogo from "@lobehub/icons/es/ElevenLabs/components/Combine";
import LovableMark from "@lobehub/icons/es/Lovable/components/Mono";
import LovableWordmark from "@lobehub/icons/es/Lovable/components/Text";
import N8nLogo from "@lobehub/icons/es/N8n/components/Combine";
import N8nMark from "@lobehub/icons/es/N8n/components/Mono";
import N8nWordmark from "@lobehub/icons/es/N8n/components/Text";
import ReplitMark from "@lobehub/icons/es/Replit/components/Mono";
import ReplitWordmark from "@lobehub/icons/es/Replit/components/Text";
import V0Logo from "@lobehub/icons/es/V0/components/Mono";

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
        <span className="slide-title-line text-[var(--text-dim)]">{line}</span>
        <span className="slide-title-context">
          {" "}
          PRINT &quot;
          {typeof children === "string" ? children : "SLIDE"}&quot;
        </span>
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
  const count = Children.count(children);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2",
        count === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
        TABLE,
      )}
    >
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
      {renderDataCellValue(value)}
    </div>
  );
}

export function PrizePodium({
  prizes,
  total,
  totalLabel,
}: {
  prizes: { rank: string; place: string; amount: string }[];
  total: string;
  totalLabel: string;
}) {
  const orderedPrizes = [prizes[1], prizes[0], prizes[2]];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid min-h-56 grid-cols-3 items-end gap-2 md:min-h-64 md:gap-3">
        {orderedPrizes.map((prize) => {
          const isWinner = prize.rank === "01";
          const height =
            prize.rank === "01"
              ? "min-h-56 md:min-h-64"
              : prize.rank === "02"
                ? "min-h-44 md:min-h-52"
                : "min-h-36 md:min-h-44";

          return (
            <div
              key={prize.rank}
              className={cn(
                "flex flex-col justify-between p-4 md:p-5",
                height,
                isWinner
                  ? "bg-[var(--bone)] text-[var(--void)]"
                  : "bg-[var(--ib-surface-strong)] text-[var(--text)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                    isWinner
                      ? "text-[rgb(26_26_23_/_0.6)]"
                      : "text-[var(--text-dim)]",
                  )}
                >
                  {prize.place}
                </span>
                <span className="ib-marker text-xs">{prize.rank}</span>
              </div>
              <span className="font-mono text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-none tracking-[-0.07em]">
                {prize.amount}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-baseline justify-between gap-4 bg-[var(--ib-surface)] px-4 py-3 font-mono md:px-5">
        <span className="ib-label">{totalLabel}</span>
        <span className="text-xl font-semibold tracking-[-0.05em] text-[var(--text)]">
          {total}
        </span>
      </div>
    </div>
  );
}

function renderDataCellValue(value: ReactNode) {
  if (typeof value !== "string") {
    return (
      <span className="font-mono text-sm text-[var(--text)]">{value}</span>
    );
  }

  // Los miles van con coma ("$1,000"), así que la coma es parte del precio:
  // sin ella el match cortaba en "$1" y dejaba ",000" como texto suelto.
  const priceMatch = value.match(/^(\$[\d.,]+K?)(.*)$/);

  if (!priceMatch) {
    return (
      <span className="font-mono text-sm text-[var(--text)]">{value}</span>
    );
  }

  const [, price, rest] = priceMatch;
  const detail = rest.trim();

  return (
    <span className="flex flex-col gap-1 font-mono text-[var(--text)]">
      <span className="text-2xl font-semibold leading-none tracking-[-0.04em] text-[var(--bright)] md:text-3xl">
        {price}
      </span>
      {detail ? <span className="text-sm leading-snug">{detail}</span> : null}
    </span>
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

export function CollaboratorLogoWall() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <BrandLogo name="Supabase">
        <svg viewBox="0 0 109 113" aria-hidden="true" className="h-8 w-8">
          <path
            d="M63.7 110.3c-2.8 3.6-8.6 1.6-8.7-3l-1-39.8h44.2c8 0 12.5 9.2 7.6 15.4l-42.1 27.4Z"
            fill="currentColor"
          />
          <path
            d="M45.3 2.7c2.8-3.6 8.6-1.6 8.7 3l.4 39.8H10.8c-8 0-12.5-9.2-7.6-15.4L45.3 2.7Z"
            fill="currentColor"
            opacity="0.55"
          />
        </svg>
        <span>supabase</span>
      </BrandLogo>
      <BrandLogo name="Lovable">
        <span className="flex items-center gap-2">
          <LovableMark size={24} />
          <LovableWordmark size={21} />
        </span>
      </BrandLogo>
      <BrandLogo name="v0">
        <V0Logo size={50} />
      </BrandLogo>
      <BrandLogo name="n8n">
        <N8nLogo size={30} type="mono" />
      </BrandLogo>
      <BrandLogo name="ElevenLabs">
        <ElevenLabsLogo size={27} />
      </BrandLogo>
      <BrandLogo name="Cursor">
        <span className="flex items-center gap-2">
          <CursorMark size={24} />
          <CursorWordmark size={20} />
        </span>
      </BrandLogo>
      <BrandLogo name="Firecrawl">
        <Image
          src="/deck/brand-assets/firecrawl/logo-white.svg"
          alt=""
          aria-hidden="true"
          width={200}
          height={284}
          className="h-8 w-auto"
        />
        <span>firecrawl</span>
      </BrandLogo>
      <BrandLogo name="Plenti">
        <Image
          src="/deck/brand-assets/plenti/logo-wordmark-grayscale.svg"
          alt=""
          aria-hidden="true"
          width={200}
          height={71}
          className="h-8 w-auto"
        />
      </BrandLogo>
    </div>
  );
}

function BrandLogo({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div
      role="img"
      aria-label={name}
      className="flex min-h-24 items-center justify-center gap-2 bg-[var(--ib-surface)] px-3 font-mono text-lg font-semibold tracking-[-0.04em] text-[var(--text)] opacity-75 md:px-4"
    >
      {children}
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
    <div className="deck-contrast-grid grid grid-cols-1 md:grid-cols-2 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]">
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
    <div
      className={`deck-contrast-column ${CELL} p-4 md:p-6 flex flex-col gap-4`}
    >
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
              "deck-contrast-item",
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
          <div className="flex h-full min-h-36 flex-col justify-between border border-[var(--line)] bg-[var(--screen-dim)] p-4 md:p-6">
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
    <div className="deck-chip-grid flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="deck-chip border border-[var(--line)] bg-[var(--screen-dim)] px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--text)]"
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
    <div className="deck-benefit-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]">
      {items.map((item) => (
        <div
          key={item.label}
          className={`deck-benefit-item ${CELL} p-4 md:p-5 flex flex-col gap-3 min-h-32`}
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

export function Wordmark({
  className = "",
  size = "clamp(2rem, 7vw, 4rem)",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={`font-script text-[var(--bright)] leading-none pt-2 inline-block ${className}`}
      style={{ fontSize: size }}
    >
      the next craft
    </span>
  );
}

export function LimaSponsorWall() {
  const smallLogos = [
    ["Tavily", "/deck/brand-assets/lima-kickoff/tavily.svg"],
    ["ElevenLabs", "/deck/brand-assets/lima-kickoff/elevenlabs.svg"],
    ["3DevLabs", "/deck/brand-assets/lima-kickoff/3DevLabs.svg"],
    ["Exa", "/deck/brand-assets/lima-kickoff/exa.svg"],
    ["Vapi", "/deck/brand-assets/lima-kickoff/vapi.svg"],
    ["Apify", "/deck/brand-assets/lima-kickoff/apify.svg"],
    ["INNICIA UCSM", "/deck/brand-assets/lima-kickoff/innicia-ucsm.png"],
    [
      "Universidad Católica de Santa María",
      "/deck/brand-assets/lima-kickoff/ucsm.png",
    ],
    [
      "Universidad Peruana Cayetano Heredia",
      "/deck/brand-assets/lima-kickoff/upch.svg",
    ],
  ] as const;

  return (
    <div className="flex flex-col items-center gap-8 md:gap-10">
      <Image
        src="/deck/brand-assets/lima-kickoff/convex.svg"
        alt="Convex"
        width={382}
        height={146}
        className="-my-10 h-auto w-full max-w-[18rem] grayscale opacity-80 md:-my-14 md:max-w-[24rem]"
      />

      <Image
        src="/deck/brand-assets/lima-kickoff/yalo.svg"
        alt="Yalo"
        width={76}
        height={36}
        className="h-auto w-full max-w-20 grayscale opacity-80 md:max-w-28"
      />

      <div className="flex w-full items-center justify-center gap-14 md:gap-24">
        <Image
          src="/deck/brand-assets/lima-kickoff/clerk.svg"
          alt="Clerk"
          width={441}
          height={128}
          className="h-auto w-full max-w-28 grayscale opacity-80 md:max-w-36"
        />
        <Image
          src="/deck/brand-assets/lima-kickoff/cloudforge.svg"
          alt="CloudForge AI"
          width={120}
          height={32}
          className="h-auto w-full max-w-32 grayscale brightness-0 invert opacity-80 md:max-w-44"
        />
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-10">
        {smallLogos.map(([name, src]) => (
          <Image
            key={name}
            src={src}
            alt={name}
            width={160}
            height={48}
            className="max-h-5 w-auto max-w-24 object-contain grayscale opacity-70 md:max-h-7 md:max-w-28"
          />
        ))}
        <span className="inline-flex items-center gap-2 text-[var(--text)] opacity-70">
          <Image
            src="/deck/brand-assets/lima-kickoff/visagente.svg"
            alt=""
            aria-hidden="true"
            width={79}
            height={32}
            className="h-5 w-auto grayscale"
          />
          <span className="font-sans text-base font-bold leading-none tracking-tight">
            visagente
          </span>
        </span>
        <span className="inline-flex items-center gap-2 text-[var(--text)] opacity-70">
          <CursorMark size={20} />
          <CursorWordmark size={17} />
        </span>
        <span className="inline-flex items-center gap-2 text-[var(--text)] opacity-70">
          <ReplitMark size={20} />
          <ReplitWordmark size={17} />
        </span>
        <span className="inline-flex items-center gap-2 text-[var(--text)] opacity-70">
          <N8nMark size={20} />
          <N8nWordmark size={17} />
        </span>
      </div>
    </div>
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
