// Google Sheets como espejo de los registros y UI de aprobación.
// Auth de service account con JWT RS256 firmado con node:crypto — cero deps.

import { createSign } from "node:crypto";

import type { Registration } from "./db";

const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";

export const HEADERS = [
  "code",
  "name",
  "email",
  "phone",
  "role",
  "team_status",
  "team_name",
  "adult",
  "github",
  "source",
  "status", // ← columna que editan los organizadores: pending → approved/rejected
  "created_at",
] as const;

const STATUS_COL = HEADERS.indexOf("status"); // 0-based

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// ── Auth ────────────────────────────────────────────────────────────────────

let cachedToken: { token: string; exp: number } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.token;

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: env("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  // La key llega con \n escapados desde la env var
  const privateKey = env("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${claims}`)
    .sign(privateKey, "base64url");
  const jwt = `${header}.${claims}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok)
    throw new Error(`Google token failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

async function api(path: string, init?: RequestInit): Promise<unknown> {
  const token = await accessToken();
  const res = await fetch(`${SHEETS}/${env("GOOGLE_SHEET_ID")}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok)
    throw new Error(`Sheets API failed (${res.status}): ${await res.text()}`);
  return res.json();
}

function sheetName(): string {
  return process.env.GOOGLE_SHEET_NAME ?? "Registros";
}

// ── Operaciones ─────────────────────────────────────────────────────────────

function toRow(r: Registration): (string | boolean)[] {
  return [
    r.code,
    r.name,
    r.email,
    r.phone,
    r.role,
    r.team_status ?? "",
    r.team_name ?? "",
    r.adult ? "sí" : "NO (menor)",
    r.github ?? "",
    r.source ?? "",
    r.status,
    r.notified_at ?? new Date().toISOString(),
  ];
}

/** Upsert de una fila por código. Crea la fila o la sobreescribe (re-registro). */
export async function upsertRow(reg: Registration): Promise<void> {
  const data = (await api(`/values/${sheetName()}!A:A`)) as {
    values?: string[][];
  };
  const codes = (data.values ?? []).map((row) => row[0]);
  const rowIndex = codes.indexOf(reg.code); // 0-based, fila 1 = headers

  const values = [toRow(reg)];
  if (rowIndex === -1) {
    await api(`/values/${sheetName()}!A:L:append?valueInputOption=RAW`, {
      method: "POST",
      body: JSON.stringify({ values }),
    });
  } else {
    const rowNum = rowIndex + 1; // a notación 1-based de A1
    await api(
      `/values/${sheetName()}!A${rowNum}:L${rowNum}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values }),
      },
    );
  }
}

/** Lee (código, status) de todas las filas — para el cron de aprobaciones. */
export async function readStatuses(): Promise<
  { code: string; status: string }[]
> {
  const data = (await api(`/values/${sheetName()}!A:L`)) as {
    values?: string[][];
  };
  const rows = data.values ?? [];
  return rows
    .slice(1) // saltar headers
    .filter((row) => row[0]?.startsWith("CRAFTER-"))
    .map((row) => ({
      code: row[0],
      status: (row[STATUS_COL] ?? "").trim().toLowerCase(),
    }));
}
