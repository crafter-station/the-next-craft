import Image from "next/image";

import { useTranslations } from "next-intl";

import { SectionHeader } from "./section-header";

const HEADLINE_SPONSORS = [
  {
    wordmark: "CRAFTER STATION",
    href: "https://crafterstation.com",
    logo: {
      src: "/organizadores/crafter-logotipo.svg",
      width: 707,
      height: 96,
    },
  },
] as const;

/* Co-organizadores — marcas blancas sobre transparente, derivadas de los
   originales a color con `scripts/generate-organizer-marks.py`. Ya vienen en
   blanco, así que no llevan filtro CSS: solo opacidad. */
const CO_ORGANIZERS = [
  {
    name: "AI Labs",
    src: "/organizadores/ai-labs.png",
    href: "https://ailabs.sv/",
  },
  {
    name: "Nucleo Labs",
    src: "/organizadores/nucleo-labs.png",
    href: "https://nucleo.la/",
  },
  {
    name: "Open2",
    src: "/organizadores/open2.png",
    href: "https://www.the502project.com/en",
  },
] as const;

export function Sponsors() {
  const t = useTranslations("sponsors");

  return (
    <section
      id="sponsors"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="60" name={t("label")} />

        {/* Tabla fusionada, bordes compartidos sin radius: Crafter ocupa la fila
            entera y los co-organizadores se reparten la de abajo en tres */}
        <ul
          className="grid grid-cols-3 list-none m-0 p-0 border-t border-l border-[var(--line)] bg-[var(--screen-dim)]"
          aria-label={t("headlineAria")}
        >
          {HEADLINE_SPONSORS.map(({ wordmark, href, logo }) => (
            <li key={wordmark} className="group col-span-3">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between gap-8 px-6 py-8 md:px-10 md:py-12 h-full
                           border-r border-b border-[var(--line)]
                           hover:bg-[var(--screen)] transition-colors duration-150 no-underline"
              >
                {/* Logotipo (imagen) o wordmark pixel según el sponsor */}
                {logo ? (
                  <Image
                    src={logo.src}
                    alt={wordmark}
                    width={logo.width}
                    height={logo.height}
                    className="h-9 md:h-11 w-auto self-start select-none"
                  />
                ) : (
                  <span
                    className="font-pixel font-bold uppercase leading-tight
                               text-[var(--text)] select-none break-words"
                    style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
                  >
                    {wordmark}
                  </span>
                )}

                {/* Role label */}
                <span className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                  {t("organizerRole")}
                </span>
              </a>
            </li>
          ))}

          {/* Co-organizadores — una celda cada uno, marca monocroma más chica */}
          {CO_ORGANIZERS.map(({ name, src, href }) => (
            <li key={name} className="group">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between gap-6 px-4 py-6 md:px-8 md:py-8 h-full
                           border-r border-b border-[var(--line)]
                           hover:bg-[var(--screen)] transition-colors duration-150 no-underline"
              >
                <Image
                  src={src}
                  alt={name}
                  width={120}
                  height={40}
                  className="h-9 md:h-11 w-auto self-start select-none
                             opacity-60 group-hover:opacity-100
                             transition-opacity duration-150"
                />

                <span className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-dim)] group-hover:text-[var(--bright)] transition-colors duration-150">
                  {name}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Sponsor CTA */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.5] text-[var(--text-dim)]">
          {t("ctaPrefix")}{" "}
          <a
            href="mailto:sponsors@crafterstation.com"
            className="text-[var(--bright)] hover:text-[var(--text)] underline underline-offset-2 transition-colors duration-150"
          >
            sponsors@crafterstation.com
          </a>
        </p>
      </div>
    </section>
  );
}
