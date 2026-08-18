import Image from "next/image";

import CodexIcon from "@lobehub/icons/es/Codex/components/Mono";
import CodexText from "@lobehub/icons/es/Codex/components/Text";
import CursorIcon from "@lobehub/icons/es/Cursor/components/Mono";
import CursorText from "@lobehub/icons/es/Cursor/components/Text";
import N8nIcon from "@lobehub/icons/es/N8n/components/Mono";
import N8nText from "@lobehub/icons/es/N8n/components/Text";
import ReplitIcon from "@lobehub/icons/es/Replit/components/Mono";
import ReplitText from "@lobehub/icons/es/Replit/components/Text";
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
    className: "h-8 md:h-12",
  },
  {
    name: "CloudForge AI",
    src: "/sponsors/cloudforge/imagotipo_cloudforge.svg",
    href: "https://www.cloud-forge-ai.com/",
    width: 120,
    height: 32,
    className: "h-12 grayscale brightness-0 invert md:h-[4.5rem]",
  },
] as const;

const IMG_LOGOS = [
  {
    name: "Tavily",
    src: "/sponsors/tavily.svg",
    href: "https://tavily.com",
    width: 186,
    height: 56,
    className: "h-5 md:h-6",
  },
  {
    name: "ElevenLabs",
    src: "/sponsors/elevenlabs.svg",
    href: "https://elevenlabs.io",
    width: 694,
    height: 90,
    className: "h-3 md:h-5",
  },
  {
    name: "3DevLabs",
    src: "/sponsors/3DevLabs.svg",
    href: "https://3devlabs.app",
    width: 1295,
    height: 1251,
    className: "h-6 md:h-8",
  },
  {
    name: "Exa",
    src: "/sponsors/exa.svg",
    href: "https://exa.ai",
    width: 278,
    height: 100,
    className: "h-5 md:h-6",
  },
  {
    name: "Vapi",
    src: "/sponsors/vapi.svg",
    href: "https://vapi.ai",
    width: 101,
    height: 33,
    className: "h-4 md:h-5",
  },
  {
    name: "Apify",
    src: "/sponsors/apify.svg",
    href: "https://apify.com",
    width: 512,
    height: 141,
    className: "h-4 md:h-5",
  },
  {
    name: "INNICIA UCSM",
    src: "/sponsors/innicia-ucsm.png",
    href: "https://investigacion.ucsm.edu.pe/innicia-vri/",
    width: 1008,
    height: 321,
    className: "h-4 md:h-5",
  },
  {
    name: "Universidad Católica de Santa María",
    src: "/sponsors/ucsm.png",
    href: "https://ucsm.edu.pe/",
    width: 4082,
    height: 943,
    className: "h-4 md:h-5",
  },
  {
    name: "Universidad Peruana Cayetano Heredia",
    src: "/sponsors/upch.svg",
    href: "https://www.cayetano.edu.pe/",
    width: 207,
    height: 63,
    className: "h-4 grayscale md:h-5",
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
          className="-my-6 block w-full max-w-xl opacity-80 transition-opacity duration-200 hover:opacity-100 md:-my-10"
        >
          <Image
            src="/sponsors/convex.svg"
            alt="Convex"
            width={382}
            height={146}
            className="h-auto w-full select-none grayscale"
          />
        </a>

        <a
          href="https://www.yalo.ai/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Yalo"
          className={`${LINK_BASE} block w-24 md:w-36`}
        >
          <Image
            src="/sponsors/yalo.svg"
            alt="Yalo"
            width={76}
            height={36}
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
            <a
              href="https://www.visagente.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visagente"
              className={`${LINK_BASE} inline-flex items-center gap-2`}
            >
              <Image
                src="/sponsors/visagente.svg"
                alt=""
                width={79}
                height={32}
                className="h-4 w-auto md:h-5"
              />
              <span className="font-sans text-base font-bold leading-none tracking-tight text-white md:text-xl">
                visagente
              </span>
            </a>
          </li>

          <li>
            <a
              href="https://cursor.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cursor"
              className={`${LINK_BASE} inline-flex items-center gap-2`}
            >
              <CursorIcon size={21} />
              <CursorText size={17} />
            </a>
          </li>

          <li>
            <a
              href="https://replit.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Replit"
              className={`${LINK_BASE} inline-flex items-center gap-2`}
            >
              <ReplitIcon size={21} />
              <ReplitText size={17} />
            </a>
          </li>

          <li>
            <a
              href="https://n8n.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="n8n"
              className={`${LINK_BASE} inline-flex items-center gap-2`}
            >
              <N8nIcon size={21} />
              <N8nText size={17} />
            </a>
          </li>

          <li>
            {/*
              Los Combine de lobehub dependen del Flexbox CSS-in-JS de
              @lobehub/ui (que no se inyecta aquí) y terminan apilando ícono
              sobre texto. Componemos los lockups en flex propios.
            */}
            <a
              href="https://openai.com/codex"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Codex"
              className={`${LINK_BASE} inline-flex items-center gap-2`}
            >
              <CodexIcon size={21} />
              <CodexText size={17} />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
