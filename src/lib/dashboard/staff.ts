import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isStaffEmail } from "@/lib/staff/domains.server";

export { isStaffEmail };
export { staffDomains } from "@/lib/staff/domains.server";

/**
 * Staff = quien inicia sesión con un correo del dominio de la organización.
 *
 * El correo sale de la sesión de better-auth, que se verificó por OTP: no es
 * un dato que el navegador pueda inventar. El dominio permitido vive solo en
 * `STAFF_EMAIL_DOMAINS` del servidor.
 */

/** Devuelve el correo del staff en sesión, o null si no lo es. */
export async function currentStaffEmail() {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user.email ?? null;
  return isStaffEmail(email) ? (email as string) : null;
}
