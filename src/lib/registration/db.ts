// Persistencia en Neon Postgres: sesiones de conversación + registros.
// Schema en scripts/schema.sql.

import { neon } from "@neondatabase/serverless";

import type { Answers, Session } from "./flow";

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface Registration {
  id: number;
  code: string;
  phone: string;
  name: string;
  email: string;
  role: string;
  team_status: string | null;
  team_name: string | null;
  adult: boolean;
  github: string | null;
  source: string | null;
  status: string;
  notified_at: string | null;
}

// ── Sesiones ────────────────────────────────────────────────────────────────

export async function getSession(phone: string): Promise<Session | null> {
  const rows = await sql()`
    SELECT step, answers, tries FROM wa_sessions WHERE phone = ${phone}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return { phone, step: r.step, answers: r.answers, tries: r.tries };
}

export async function saveSession(s: Session): Promise<void> {
  await sql()`
    INSERT INTO wa_sessions (phone, step, answers, tries, updated_at)
    VALUES (${s.phone}, ${s.step}, ${JSON.stringify(s.answers)}, ${s.tries}, now())
    ON CONFLICT (phone) DO UPDATE
      SET step = EXCLUDED.step, answers = EXCLUDED.answers,
          tries = EXCLUDED.tries, updated_at = now()
  `;
}

export async function clearSession(phone: string): Promise<void> {
  await sql()`DELETE FROM wa_sessions WHERE phone = ${phone}`;
}

/** Dedup de reintentos del webhook: true si el mensaje ya fue procesado. */
export async function seenMessage(messageId: string): Promise<boolean> {
  const rows = await sql()`
    INSERT INTO wa_messages (id) VALUES (${messageId})
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  return rows.length === 0;
}

// ── Registros ───────────────────────────────────────────────────────────────

export async function getRegistration(
  phone: string,
): Promise<Registration | null> {
  const rows = await sql()`SELECT * FROM registrations WHERE phone = ${phone}`;
  return (rows[0] as Registration | undefined) ?? null;
}

export async function getRegistrationByCode(
  code: string,
): Promise<Registration | null> {
  const rows = await sql()`SELECT * FROM registrations WHERE code = ${code}`;
  return (rows[0] as Registration | undefined) ?? null;
}

/**
 * Upsert por teléfono. Un re-registro sobreescribe los datos pero conserva
 * id, código y created_at; el status vuelve a 'pending' para re-revisión.
 */
export async function saveRegistration(
  phone: string,
  a: Answers & { name: string; email: string; role: string },
): Promise<Registration> {
  const rows = await sql()`
    INSERT INTO registrations
      (phone, name, email, role, team_status, team_name, adult, github, source)
    VALUES
      (${phone}, ${a.name}, ${a.email}, ${a.role}, ${a.teamStatus ?? null},
       ${a.teamName ?? null}, ${a.adult ?? false}, ${a.github ?? null}, ${a.source ?? null})
    ON CONFLICT (phone) DO UPDATE SET
      name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role,
      team_status = EXCLUDED.team_status, team_name = EXCLUDED.team_name,
      adult = EXCLUDED.adult, github = EXCLUDED.github, source = EXCLUDED.source,
      status = 'pending', notified_at = NULL, updated_at = now()
    RETURNING *
  `;
  let reg = rows[0] as Registration;
  if (!reg.code) {
    // Código secuencial derivado del id: CRAFTER-001, CRAFTER-002…
    const updated = await sql()`
      UPDATE registrations
      SET code = 'CRAFTER-' || lpad(id::text, 3, '0')
      WHERE id = ${reg.id}
      RETURNING *
    `;
    reg = updated[0] as Registration;
  }
  return reg;
}

export async function markStatus(
  code: string,
  status: "approved" | "rejected",
  notified: boolean,
): Promise<void> {
  if (notified) {
    await sql()`
      UPDATE registrations
      SET status = ${status}, notified_at = now(), updated_at = now()
      WHERE code = ${code}
    `;
  } else {
    await sql()`
      UPDATE registrations
      SET status = ${status}, updated_at = now()
      WHERE code = ${code}
    `;
  }
}

export async function pendingByCodes(codes: string[]): Promise<Registration[]> {
  if (codes.length === 0) return [];
  const rows = await sql()`
    SELECT * FROM registrations
    WHERE code = ANY(${codes}) AND status = 'pending'
  `;
  return rows as Registration[];
}
