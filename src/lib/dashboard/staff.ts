import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isStaffEmail, staffDomains } from "@/lib/staff-domains";

export { isStaffEmail, staffDomains };

/**
 * Staff = quien inicia sesión con un correo del dominio de la organización.
 *
 * El correo sale de la sesión de better-auth, que se verificó por OTP: no es
 * un dato que el navegador pueda inventar. Aun así, el dominio es una señal
 * gruesa — cualquiera con correo de la casa entra al panel de staff.
 */

/** Devuelve el correo del staff en sesión, o null si no lo es. */
export async function currentStaffEmail() {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user.email ?? null;
  return isStaffEmail(email) ? (email as string) : null;
}
