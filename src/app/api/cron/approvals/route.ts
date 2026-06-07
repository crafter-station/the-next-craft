// Cron de aprobaciones (Vercel Cron, cada 15 min — ver vercel.json).
// Lee la columna `status` del Sheet; para cada código aprobado que sigue
// `pending` en la DB → envía el correo de confirmación y actualiza el estado.

import type { NextRequest } from "next/server";

import { markStatus, pendingByCodes } from "@/lib/registration/db";
import { sendApprovalEmail } from "@/lib/registration/email";
import { readStatuses } from "@/lib/registration/sheets";

export async function GET(request: NextRequest) {
  // Vercel envía Authorization: Bearer <CRON_SECRET> automáticamente.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const statuses = await readStatuses();
  const approvedCodes = statuses
    .filter((s) => s.status === "approved")
    .map((s) => s.code);
  const rejectedCodes = statuses
    .filter((s) => s.status === "rejected")
    .map((s) => s.code);

  const results = { approved: 0, rejected: 0, failed: [] as string[] };

  for (const reg of await pendingByCodes(approvedCodes)) {
    try {
      await sendApprovalEmail(reg);
      await markStatus(reg.code, "approved", true);
      results.approved++;
    } catch (err) {
      console.error("[approvals] email failed", reg.code, err);
      results.failed.push(reg.code);
    }
  }

  for (const reg of await pendingByCodes(rejectedCodes)) {
    // Sin email de rechazo en v1 — solo se refleja el estado en la DB.
    await markStatus(reg.code, "rejected", false);
    results.rejected++;
  }

  return Response.json(results);
}
