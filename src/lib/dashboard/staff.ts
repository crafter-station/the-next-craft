import { headers } from "next/headers";

import { auth } from "@/lib/auth";

/**
 * Staff = quien inicia sesión con un correo del dominio de la organización.
 *
 * El correo sale de la sesión de better-auth, que se verificó por OTP: no es
 * un dato que el navegador pueda inventar. Aun así, el dominio es una señal
 * gruesa — cualquiera con correo de la casa entra al panel de staff.
 */
const DEFAULT_STAFF_DOMAINS = ["crafterstation.com"];

export function staffDomains() {
  const configured = process.env.STAFF_EMAIL_DOMAINS?.trim();
  if (!configured) return DEFAULT_STAFF_DOMAINS;
  return configured
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

/**
 * Compara el dominio completo tras la última arroba. Comparar por sufijo
 * dejaría entrar a `alguien@nocrafterstation.com`.
 */
export function isStaffEmail(email: string | null | undefined) {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase();
  return staffDomains().includes(domain);
}

/** Devuelve el correo del staff en sesión, o null si no lo es. */
export async function currentStaffEmail() {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user.email ?? null;
  return isStaffEmail(email) ? (email as string) : null;
}
