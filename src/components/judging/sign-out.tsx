"use client";

import { useTransition } from "react";

import { useTranslations } from "next-intl";

import { signOutPanelist } from "@/lib/judging/actions";

import { useRouter } from "@/i18n/navigation";

/**
 * Salir del panel.
 *
 * Importa más de lo que parece: en una sede es normal que dos mentores se
 * turnen en el mismo teléfono o en el portátil de la mesa de staff. Sin una
 * forma de salir, el segundo calificaría como el primero y sus notas irían al
 * panelista equivocado —y eso no se ve hasta que alguien revisa el tablero.
 */
export function SignOut() {
  const t = useTranslations("judging.shell");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutPanelist();
          router.refresh();
        })
      }
      className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] transition-colors hover:text-[var(--bright)] disabled:opacity-40"
    >
      {t("signOut")}
    </button>
  );
}
