"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/*
  Toggle ES/EN — keycap-style segmented control. Two pill keys side by
  side; the inactive one is "ghost" (apenas hundido). Cambia el locale
  preservando el pathname y los anchors via next-intl router.replace.
*/
export function LanguageToggle() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <fieldset className="flex items-center gap-0.5 rounded-md border border-[var(--line)]/50 bg-[var(--screen-dim)] p-0.5">
      <legend className="sr-only">{t("languageLabel")}</legend>
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
                ? "font-mono text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-1 rounded-[3px] bg-[var(--bone)] text-[var(--void)] shadow-[0_2px_0_var(--key-shadow)] cursor-default"
                : "font-mono text-[10px] font-semibold tracking-[0.18em] uppercase px-2 py-1 rounded-[3px] text-[var(--text-dim)] hover:text-[var(--bright)] transition-colors duration-150"
            }
          >
            {code}
          </button>
        );
      })}
    </fieldset>
  );
}
