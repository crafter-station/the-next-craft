"use server";

import { revalidatePath } from "next/cache";

import { parsePerksCsv } from "@/lib/admin/parse-perks-csv";
import {
  existingCodesForPartner,
  findParticipantIdByEmail,
  insertPartnerCode,
  isKnownPartnerKey,
  listUnassignedConfirmedParticipantIds,
  participantsWithCodes,
} from "@/lib/admin/perks";
import { currentStaffEmail } from "@/lib/dashboard/staff";

export type UploadPerksResult =
  | {
      ok: true;
      assigned: number;
      skipped: number;
      errors: string[];
    }
  | { ok: false; error: "not-staff" | "empty" };

function refresh() {
  revalidatePath("/[locale]/admin/perks", "page");
  revalidatePath("/[locale]/dashboard/credits", "page");
}

export async function uploadPerkCodes(
  csvText: string,
): Promise<UploadPerksResult> {
  const staffEmail = await currentStaffEmail();
  if (!staffEmail) return { ok: false, error: "not-staff" };

  const rows = parsePerksCsv(csvText);
  if (rows.length === 0) return { ok: false, error: "empty" };

  let assigned = 0;
  let skipped = 0;
  const errors: string[] = [];

  const poolByPartner = new Map<string, string[]>();
  const directRows: { email: string; partnerKey: string; code: string }[] = [];

  for (const [index, row] of rows.entries()) {
    if (!isKnownPartnerKey(row.partnerKey)) {
      errors.push(`Fila ${index + 1}: partner desconocido «${row.partnerKey}»`);
      continue;
    }
    if (!row.code.trim()) {
      errors.push(`Fila ${index + 1}: código vacío`);
      continue;
    }

    if (row.email) {
      directRows.push({
        email: row.email,
        partnerKey: row.partnerKey,
        code: row.code,
      });
    } else {
      const pool = poolByPartner.get(row.partnerKey) ?? [];
      pool.push(row.code);
      poolByPartner.set(row.partnerKey, pool);
    }
  }

  for (const row of directRows) {
    const participantId = await findParticipantIdByEmail(row.email);
    if (!participantId) {
      errors.push(`Correo no encontrado: ${row.email} (${row.partnerKey})`);
      continue;
    }

    const knownCodes = await existingCodesForPartner(row.partnerKey);
    if (knownCodes.has(row.code)) {
      skipped += 1;
      continue;
    }

    const alreadyAssigned = await participantsWithCodes(row.partnerKey);
    if (alreadyAssigned.has(participantId)) {
      skipped += 1;
      continue;
    }

    try {
      await insertPartnerCode({
        participantId,
        partnerKey: row.partnerKey,
        code: row.code,
        assignedByEmail: staffEmail,
      });
      knownCodes.add(row.code);
      alreadyAssigned.add(participantId);
      assigned += 1;
    } catch {
      errors.push(
        `No se pudo asignar ${row.code} a ${row.email} (${row.partnerKey})`,
      );
    }
  }

  for (const [partnerKey, codes] of poolByPartner) {
    const knownCodes = await existingCodesForPartner(partnerKey);
    const alreadyAssigned = await participantsWithCodes(partnerKey);

    const freshCodes = codes.filter((code) => {
      if (knownCodes.has(code)) {
        skipped += 1;
        return false;
      }
      return true;
    });

    if (freshCodes.length === 0) continue;

    const participantIds = await listUnassignedConfirmedParticipantIds(
      partnerKey,
      freshCodes.length,
    );

    if (participantIds.length < freshCodes.length) {
      errors.push(
        `${partnerKey}: faltan participantes confirmados (${participantIds.length} libres, ${freshCodes.length} códigos)`,
      );
    }

    for (const [i, code] of freshCodes.entries()) {
      const participantId = participantIds[i];
      if (!participantId) break;

      try {
        await insertPartnerCode({
          participantId,
          partnerKey,
          code,
          assignedByEmail: staffEmail,
        });
        knownCodes.add(code);
        alreadyAssigned.add(participantId);
        assigned += 1;
      } catch {
        errors.push(`No se pudo asignar ${code} (${partnerKey})`);
      }
    }
  }

  refresh();
  return { ok: true, assigned, skipped, errors };
}
