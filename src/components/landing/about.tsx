import { useTranslations } from "next-intl";

import { ScrambleText } from "@/components/effects/scramble-text";

export function About() {
  const t = useTranslations("about");

  return (
    <section
      id="que-es"
      className="relative px-6 md:px-12 lg:px-24 py-24 lg:py-32 bg-[var(--void)] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 relative scroll-reveal">
        {/* Headline pixel PETSCII — decode binario→texto */}
        <ScrambleText
          as="h2"
          text={t("headline")}
          className="pixel-heading whitespace-pre-line"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        />

        {/* Body */}
        <div className="flex flex-col gap-5 max-w-2xl">
          <p
            className="font-sans text-[var(--text)] leading-[1.75]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            {t("paragraph1")}
          </p>
          <p
            className="font-sans text-[var(--text)] leading-[1.75]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            {t("paragraph2")}
          </p>
        </div>
      </div>
    </section>
  );
}
