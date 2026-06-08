// Boarding pass PNG por código de aspirante. URL pública de baja sensibilidad:
// expone nombre y rol (no correo ni teléfono) — es una pieza para compartir.

import { boardingPassImage } from "@/lib/registration/boarding-pass";
import { getRegistrationByCode } from "@/lib/registration/db";

const CODE_RE = /^CRAFTER-\d{3,}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const normalized = code.toUpperCase();
  if (!CODE_RE.test(normalized))
    return new Response("Not found", { status: 404 });

  const reg = await getRegistrationByCode(normalized);
  if (!reg) return new Response("Not found", { status: 404 });

  return boardingPassImage({ code: reg.code, name: reg.name, role: reg.role });
}
