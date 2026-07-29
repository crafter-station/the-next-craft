import Image from "next/image";

import CodexIcon from "@lobehub/icons/es/Codex/components/Mono";
import CodexText from "@lobehub/icons/es/Codex/components/Text";
import { useTranslations } from "next-intl";

/*
  Partners — banda que remata el hero antes del manifiesto. Muestra los
  logos de los sponsors tecnológicos en grande, en blanco sobre el void,
  con un dim vintage que se aclara al hover. Los wordmarks son SVGs
  locales; Codex viene del set de @lobehub/icons (mono → currentColor,
  por eso hereda el color bone del enlace).
*/

const FEATURED_LOGOS = [
  {
    name: "Clerk",
    src: "/sponsors/clerk.svg",
    href: "https://clerk.com",
    width: 441,
    height: 128,
    className: "h-9 md:h-16",
  },
  {
    name: "CloudForge AI",
    src: "/sponsors/cloudforge/imagotipo_cloudforge.svg",
    href: "https://www.cloud-forge-ai.com/",
    width: 120,
    height: 32,
    className: "h-11 md:h-20 grayscale brightness-0 invert",
  },
] as const;

const IMG_LOGOS = [
  {
    name: "Exa",
    src: "/sponsors/exa.svg",
    href: "https://exa.ai",
    width: 278,
    height: 100,
    className: "h-6 md:h-8",
  },
  {
    name: "ElevenLabs",
    src: "/sponsors/elevenlabs.svg",
    href: "https://elevenlabs.io",
    width: 694,
    height: 90,
    className: "h-4 md:h-6",
  },
  {
    name: "Tavily",
    src: "/sponsors/tavily.svg",
    href: "https://tavily.com",
    width: 186,
    height: 56,
    className: "h-6 md:h-8",
  },
] as const;

const LINK_BASE =
  "text-[var(--bright)] opacity-80 hover:opacity-100 transition-opacity duration-200";

export function Partners() {
  const t = useTranslations("partners");

  return (
    <section
      id="partners"
      className="relative bg-[var(--void)] px-6 md:px-12 py-14 md:py-20 border-t border-[var(--line)]/25"
    >
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-8 md:gap-10 scroll-reveal">
        <p className="font-mono text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--text-dim)]">
          {t("label")}
        </p>

        <a
          href="https://www.convex.dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Convex"
          className="block w-full max-w-xl border border-[var(--line)] bg-[var(--bone)] opacity-90 transition-opacity duration-200 hover:opacity-100"
        >
          <Image
            src="/sponsors/convex.svg"
            alt="Convex"
            width={382}
            height={146}
            className="h-auto w-full select-none"
          />
        </a>

        <ul className="flex items-center justify-center gap-x-6 md:gap-x-24 list-none m-0 p-0">
          {FEATURED_LOGOS.map(
            ({ name, src, href, width, height, className }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className={`${LINK_BASE} block`}
                >
                  <Image
                    src={src}
                    alt={name}
                    width={width}
                    height={height}
                    className={`${className} w-auto`}
                  />
                </a>
              </li>
            ),
          )}
        </ul>

        <ul
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-7 md:gap-x-14 list-none m-0 p-0"
          aria-label={t("ariaLabel")}
        >
          {IMG_LOGOS.map(({ name, src, href, width, height, className }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className={`${LINK_BASE} block`}
              >
                <Image
                  src={src}
                  alt={name}
                  width={width}
                  height={height}
                  className={`${className} w-auto`}
                />
              </a>
            </li>
          ))}

          <li>
            {/*
              Lockup horizontal armado a mano: el Codex.Combine de lobehub
              depende del Flexbox CSS-in-JS de @lobehub/ui (que no se inyecta
              aquí) y termina apilando ícono sobre texto. Componemos el ícono
              (viewBox 24×24) + wordmark (Codex.Text) en un flex propio.
            */}
            <a
              href="https://openai.com/codex"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Codex"
              className={`${LINK_BASE} inline-flex items-center gap-2`}
            >
              <CodexIcon size={26} />
              <CodexText size={21} />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
