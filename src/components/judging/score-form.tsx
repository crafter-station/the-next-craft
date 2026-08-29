"use client";

import { useMemo, useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { saveScore } from "@/lib/judging/actions";
import {
  CRITERIA,
  type CriterionKey,
  SCORE_LEVELS,
  weightedTotal,
} from "@/lib/judging/rubric";
import { cn } from "@/lib/utils";

import {
  keyClass,
  keyGhostClass,
  Panel,
  Pixel,
} from "@/components/dashboard/kit";

import { useRouter } from "@/i18n/navigation";

/** Etiqueta corta del botón: 3, 3.5, 4… sin decimal inútil en los enteros. */
function label(level: number): string {
  return Number.isInteger(level) ? String(level) : level.toFixed(1);
}

/** Clave de traducción de un nivel entero. Los medios se describen aparte. */
function levelKey(level: number): string {
  return String(level);
}

export type ScoreFormProps = {
  teamId: string;
  initialScores: Partial<Record<CriterionKey, number>>;
  initialEvidence: Record<string, string>;
  /** Ya enviada: se muestra en solo lectura. */
  locked: boolean;
};

/**
 * El formulario de calificación.
 *
 * Dos decisiones que no son de estilo:
 *
 * 1. La descripción del nivel elegido aparece DEBAJO del teclado, no en una
 *    leyenda aparte. Un criterio etiquetado solo con un rango numérico son en
 *    realidad tantas rúbricas como panelistas; anclar cada nivel con palabras
 *    en el momento de elegirlo es lo que hace que el 4 de uno se parezca al 4
 *    del otro. Ninguna normalización posterior arregla eso.
 *
 * 2. El total ponderado se ve mientras se califica, pero NO se ve nada del
 *    resto del panel ni el acumulado del propio panelista sobre otros equipos.
 *    Ver el total del grupo en vivo dispara el ajuste hacia el resultado que
 *    uno quiere, que es la forma más rápida de romper la independencia entre
 *    panelistas —y con ella el supuesto del que vive todo el cálculo.
 */
export function ScoreForm({
  teamId,
  initialScores,
  initialEvidence,
  locked,
}: ScoreFormProps) {
  const t = useTranslations("judging");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [scores, setScores] =
    useState<Partial<Record<CriterionKey, number>>>(initialScores);
  const [evidence, setEvidence] =
    useState<Record<string, string>>(initialEvidence);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const complete = CRITERIA.every((c) => typeof scores[c.key] === "number");

  const total = useMemo(() => {
    if (!complete) return null;
    return weightedTotal(scores as Record<CriterionKey, number>);
  }, [scores, complete]);

  function run(submit: boolean) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveScore({ teamId, scores, evidence, submit });
      if (result.ok) {
        setSaved(true);
        router.refresh();
        if (submit) router.push("/judge");
        return;
      }
      setError(t(`errors.${result.error}`));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {CRITERIA.map((criterion) => {
        const value = scores[criterion.key];
        const selected = typeof value === "number";
        return (
          <Panel key={criterion.key}>
            <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-3.5">
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text)]">
                  {t(`criteria.${criterion.key}.name`)}
                </p>
                <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
                  {t(`criteria.${criterion.key}.desc`)}
                </p>
              </div>
              <Pixel size="md" className="shrink-0 tabular-nums">
                {Math.round(criterion.weight * 100)}%
              </Pixel>
            </header>

            <div className="px-4 py-4">
              {/* Radios de verdad y no botones con `role`: así el teclado
                  recorre los seis niveles con las flechas sin que tengamos que
                  reimplementarlo, que es justo el tipo de cosa que se
                  reimplementa mal. */}
              <fieldset className="border-0 p-0">
                <legend className="sr-only">
                  {t(`criteria.${criterion.key}.name`)}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {SCORE_LEVELS.map((level) => (
                    <label
                      key={level}
                      className={cn(
                        "relative flex h-11 w-11 cursor-pointer items-center justify-center border font-mono tabular-nums transition-colors",
                        // Los medios puntos se ven secundarios a propósito: la
                        // decisión principal es el nivel anclado, y el medio es
                        // el matiz entre dos.
                        Number.isInteger(level) ? "text-[15px]" : "text-[12px]",
                        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--bright)]",
                        value === level
                          ? "border-[var(--bone)] bg-[var(--bone)] font-semibold text-[var(--void)]"
                          : Number.isInteger(level)
                            ? "border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--bright)]"
                            : "border-[var(--line)]/50 text-[var(--line-strong)] hover:border-[var(--line-strong)] hover:text-[var(--bright)]",
                        (locked || pending) && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${criterion.key}-${teamId}`}
                        value={level}
                        checked={value === level}
                        disabled={locked || pending}
                        onChange={() =>
                          setScores((prev) => ({
                            ...prev,
                            [criterion.key]: level,
                          }))
                        }
                        className="absolute inset-0 cursor-[inherit] opacity-0"
                      />
                      {label(level)}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* El ancla verbal del nivel elegido. Vacío hasta elegir: una
                  leyenda con los seis a la vez se deja de leer al tercer
                  equipo. */}
              <p className="mt-3 min-h-[2.4em] font-mono text-[12px] leading-relaxed text-[var(--text)]">
                {!selected
                  ? t("form.pickLevel")
                  : Number.isInteger(value)
                    ? t(`criteria.${criterion.key}.levels.${levelKey(value)}`)
                    : t("form.between", {
                        lower: t(`scale.${Math.floor(value)}`),
                        upper: t(`scale.${Math.ceil(value)}`),
                      })}
              </p>

              <label className="mt-4 block">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
                  {criterion.evidenceRequired
                    ? t("form.evidenceRequired")
                    : t("form.evidenceOptional")}
                </span>
                <textarea
                  value={evidence[criterion.key] ?? ""}
                  disabled={locked || pending}
                  maxLength={600}
                  rows={2}
                  placeholder={t("form.evidencePlaceholder")}
                  onChange={(event) =>
                    setEvidence((prev) => ({
                      ...prev,
                      [criterion.key]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-y border border-[var(--line)] bg-[var(--void)] px-3 py-2 font-mono text-[13px] leading-relaxed text-[var(--text)] placeholder:text-[var(--line-strong)] focus:border-[var(--line-strong)] focus:outline-none disabled:opacity-60"
                />
              </label>
            </div>
          </Panel>
        );
      })}

      <Panel className="sticky bottom-0 z-10 bg-[var(--screen-dim)]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
              {t("form.total")}
            </p>
            <Pixel size="lg" className="mt-1.5 tabular-nums">
              {total === null ? "—" : total.toFixed(2)}
            </Pixel>
          </div>
          {!locked && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(false)}
                className={keyGhostClass}
              >
                {t("form.saveDraft")}
              </button>
              <button
                type="button"
                disabled={pending || !complete}
                onClick={() => run(true)}
                className={keyClass}
              >
                {t("form.submit")}
              </button>
            </div>
          )}
        </div>
        {(error || saved || locked) && (
          <p
            role="status"
            className={cn(
              "border-t border-[var(--line)] px-4 py-2.5 font-mono text-[12px]",
              error ? "text-[var(--destructive)]" : "text-[var(--text-dim)]",
            )}
          >
            {error ?? (locked ? t("form.lockedNote") : t("form.savedNote"))}
          </p>
        )}
        {!locked && (
          <p className="border-t border-[var(--line)] px-4 py-2.5 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
            {t("form.submitWarning")}
          </p>
        )}
      </Panel>
    </div>
  );
}
