"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/*
  Toggle ES/EN — segmented control con un thumb que desliza entre las
  dos posiciones (como un switch), en vez de solo cambiar de color.
  Cambia el locale preservando el pathname via next-intl router.replace;
  el contenido de la página hace crossfade (ver ViewTransition en
  app/[locale]/layout.tsx) en vez de refrescar de golpe.
*/
export function LanguageToggle() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const activeIndex = routing.locales.findIndex((l) => l === locale);

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <fieldset className="relative flex items-stretch gap-0.5 rounded-md border border-[var(--line)]/50 bg-[var(--screen-dim)] p-0.5">
      <legend className="sr-only">{t("languageLabel")}</legend>
      <span
        aria-hidden="true"
        className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-[3px] bg-[var(--bone)] shadow-[0_2px_0_var(--key-shadow)] transition-[left] duration-200 ease-out ${
          activeIndex === 0 ? "left-0.5" : "left-[calc(50%+2px)]"
        }`}
      />
      {routing.locales.map((code) => {
        const isActive = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={isActive}
            aria-label={
              code === "es" ? t("switchToSpanish") : t("switchToEnglish")
            }
            className={
              isActive
                ? "relative z-10 flex items-center font-mono text-[10px] font-bold tracking-[0.18em] uppercase px-3 rounded-[3px] text-[var(--void)] cursor-default"
                : "relative z-10 flex items-center font-mono text-[10px] font-semibold tracking-[0.18em] uppercase px-3 rounded-[3px] text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150"
            }
          >
            {code}
          </button>
        );
      })}
    </fieldset>
  );
}
