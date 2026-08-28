const DEFAULT_STAFF_DOMAINS = ["crafterstation.com"];

export function staffDomains() {
  const configured = process.env.STAFF_EMAIL_DOMAINS?.trim();
  if (!configured) return DEFAULT_STAFF_DOMAINS;
  return configured
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

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
