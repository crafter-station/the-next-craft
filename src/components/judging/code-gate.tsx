"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { enterWithCode } from "@/lib/judging/actions";
import { cn } from "@/lib/utils";

import { Basic, keyClass, Panel, Pixel } from "@/components/dashboard/kit";

import { useRouter } from "@/i18n/navigation";

/**
 * La puerta del panel: un campo y un botón.
 *
 * Es el mismo código para todo el panel: el staff lo dice una vez a la sala en
 * vez de repartir veinte papeles. Acertarlo no identifica a nadie —eso pasa en
 * la pantalla siguiente—, solo abre la puerta.
 *
 * El código se escribe en mayúsculas y con el guion puesto mientras se teclea,
 * porque así es como está escrito en la pizarra. Lo que se manda al servidor va
 * normalizado, de modo que el guion, los espacios y las minúsculas dan igual —
 * el alfabeto no tiene O ni 0 ni I ni 1, así que no hay carácter ambiguo que
 * corregir.
 */
export function CodeGate() {
  const t = useTranslations("judging.gate");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onChange(raw: string) {
    const clean = raw
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    setCode(
      clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean,
    );
    setError(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await enterWithCode(code);
      if (result.ok) {
        router.refresh();
        return;
      }
      setError(t(`errors.${result.error}`));
    });
  }

  const ready = code.replace(/-/g, "").length === 8;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[560px] px-4 py-16 sm:px-6"
    >
      <Panel className="scanlines px-6 py-8">
        <Basic n={10}>ACCESO</Basic>
        <Pixel size="lg" className="mt-3">
          {t("title")}
        </Pixel>
        <p className="mt-4 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
          {t("body")}
        </p>

        <form
          className="mt-7"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) submit();
          }}
        >
          <label
            htmlFor="panel-code"
            className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
          >
            {t("label")}
          </label>
          <input
            id="panel-code"
            value={code}
            onChange={(event) => onChange(event.target.value)}
            disabled={pending}
            // El teclado del móvil abre en mayúsculas y sin autocorrector: el
            // corrector convierte un código en una palabra con una sola letra.
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="one-time-code"
            inputMode="text"
            placeholder="ABCD-EFGH"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "panel-code-error" : undefined}
            className={cn(
              "mt-2.5 w-full border bg-[var(--void)] px-4 py-3.5 text-center font-mono text-[22px] tracking-[0.3em] text-[var(--text)] uppercase",
              "placeholder:tracking-[0.3em] placeholder:text-[var(--line-strong)] focus:outline-none",
              error
                ? "border-[var(--destructive)]"
                : "border-[var(--line-strong)] focus:border-[var(--bright)]",
            )}
          />

          {error && (
            <p
              id="panel-code-error"
              role="alert"
              className="mt-3 font-mono text-[12px] leading-relaxed text-[var(--destructive)]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !ready}
            className={cn(keyClass, "mt-6 w-full")}
          >
            {pending ? t("checking") : t("cta")}
          </button>
        </form>

        <p className="mt-6 border-t border-[var(--line)] pt-4 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
          {t("help")}
        </p>
      </Panel>
    </main>
  );
}
