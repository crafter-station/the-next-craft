import "server-only";

/**
 * Dominios de correo con acceso staff/admin. Solo servidor — nunca en el bundle.
 * Configura `STAFF_EMAIL_DOMAINS` en el entorno (coma-separado, sin @).
 */
export function staffDomains(): string[] {
  const configured = process.env.STAFF_EMAIL_DOMAINS?.trim();
  if (!configured) return [];
  return configured
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const domains = staffDomains();
  if (domains.length === 0) return false;

  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase();
  return domains.includes(domain);
}
