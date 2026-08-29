"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { setFinalist } from "@/lib/judging/actions";
import { cn } from "@/lib/utils";

import { useRouter } from "@/i18n/navigation";

/**
 * Marcar a un equipo como finalista.
 *
 * Es un interruptor y no un umbral automático: cuántos finalistas salen de una
 * sede depende de cuántos equipos hubo allí, y eso cambia entre las cinco. El
 * ranking normalizado informa la decisión; la toma el comité.
 */
export function FinalistToggle({
  teamId,
  finalist,
}: {
  teamId: string;
  finalist: boolean;
}) {
  const t = useTranslations("admin.judging");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [on, setOn] = useState(finalist);

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={on}
      onClick={() =>
        startTransition(async () => {
          const next = !on;
          const result = await setFinalist(teamId, next);
          if (result.ok) {
            setOn(next);
            router.refresh();
          }
        })
      }
      className={cn(
        "border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bright)]",
        on
          ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
          : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
        pending && "opacity-50",
      )}
    >
      {on ? t("finalistYes") : t("finalistNo")}
    </button>
  );
}
