"use server";

import { revalidatePath } from "next/cache";

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { dashboardCheckins } from "@/lib/db/schema";

import { currentStaffEmail } from "./staff";

type Result = { ok: true } | { ok: false; error: "not-staff" };

function refresh() {
  revalidatePath("/[locale]/dashboard/staff", "page");
}

/** Marca o desmarca la llegada. Guarda quién lo hizo. */
export async function setArrival(
  participantId: string,
  arrived: boolean,
): Promise<Result> {
  const staffEmail = await currentStaffEmail();
  if (!staffEmail) return { ok: false, error: "not-staff" };

  const arrivedAt = arrived ? new Date() : null;
  await db
    .insert(dashboardCheckins)
    .values({
      participantId,
      arrivedAt,
      arrivedByEmail: arrived ? staffEmail : null,
    })
    .onConflictDoUpdate({
      target: dashboardCheckins.participantId,
      set: {
        arrivedAt,
        arrivedByEmail: arrived ? staffEmail : null,
        updatedAt: new Date(),
      },
    });

  refresh();
  return { ok: true };
}

/** Marca o desmarca la entrega del merch. */
export async function setMerch(
  participantId: string,
  delivered: boolean,
): Promise<Result> {
  const staffEmail = await currentStaffEmail();
  if (!staffEmail) return { ok: false, error: "not-staff" };

  const merchDeliveredAt = delivered ? new Date() : null;
  await db
    .insert(dashboardCheckins)
    .values({
      participantId,
      merchDeliveredAt,
      merchByEmail: delivered ? staffEmail : null,
      // Entregar merch implica que la persona está en la puerta.
      arrivedAt: delivered ? new Date() : null,
      arrivedByEmail: delivered ? staffEmail : null,
    })
    .onConflictDoUpdate({
      target: dashboardCheckins.participantId,
      set: {
        merchDeliveredAt,
        merchByEmail: delivered ? staffEmail : null,
        updatedAt: new Date(),
      },
    });

  // Si la fila ya existía sin llegada marcada, la completamos: en plena cola
  // nadie debería tener merch entregado y llegada en blanco.
  if (delivered) {
    await db
      .update(dashboardCheckins)
      .set({ arrivedAt: sql`now()`, arrivedByEmail: staffEmail })
      .where(
        and(
          eq(dashboardCheckins.participantId, participantId),
          isNull(dashboardCheckins.arrivedAt),
        ),
      );
  }

  refresh();
  return { ok: true };
}
