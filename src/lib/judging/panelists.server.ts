import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { dashboardPanelists } from "@/lib/db/schema";

/**
 * ¿Este correo está en la lista blanca del panel?
 *
 * Vive en su propio módulo y no en `state.ts` a propósito: lo consume
 * `lib/auth.ts` para decidir si manda el OTP, y `state.ts` importa `auth` para
 * leer la sesión. Juntarlos cerraría el ciclo.
 */
export async function isPanelistEmail(
  email: string | null | undefined,
): Promise<boolean> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  const [row] = await db
    .select({ id: dashboardPanelists.id })
    .from(dashboardPanelists)
    .where(
      and(
        eq(dashboardPanelists.email, normalized),
        isNull(dashboardPanelists.revokedAt),
      ),
    )
    .limit(1);

  return Boolean(row);
}
