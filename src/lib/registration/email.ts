// Correo de aprobación vía Resend (fetch directo, sin SDK).
// Único canal de confirmación de admisión — decisión de diseño.

import type { Registration } from "./db";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function sendApprovalEmail(reg: Registration): Promise<void> {
  const firstName = reg.name.split(/\s+/)[0];
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextcraft.crafter.run";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env("EMAIL_FROM"), // ej. "The Next Craft <hola@crafterstation.com>"
      to: [reg.email],
      subject: `${reg.code} — Estás dentro de THE NEXT CRAFT ✓`,
      html: `
<div style="font-family: ui-monospace, 'SF Mono', Menlo, monospace; max-width: 560px; margin: 0 auto; color: #0A1633;">
  <div style="border: 2px solid #002FA7; padding: 32px;">
    <p style="color: #002FA7; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 24px;">
      the-next-craft$ application --status approved
    </p>
    <h1 style="font-family: -apple-system, system-ui, sans-serif; font-weight: 800; font-size: 32px; letter-spacing: -0.03em; color: #002FA7; margin: 0 0 16px;">
      ${firstName}, estás dentro.
    </h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      Tu postulación <strong>${reg.code}</strong> a <strong>The First User Challenge</strong> fue aprobada.
      Eres parte de los 150.
    </p>
    <table style="font-size: 13px; line-height: 1.8; border-collapse: collapse;">
      <tr><td style="color: #5B6478; padding-right: 16px;">FECHA</td><td>25 JUL 2026</td></tr>
      <tr><td style="color: #5B6478; padding-right: 16px;">LUGAR</td><td>Lima, Perú</td></tr>
      <tr><td style="color: #5B6478; padding-right: 16px;">FORMATO</td><td>12 horas</td></tr>
      <tr><td style="color: #5B6478; padding-right: 16px;">CÓDIGO</td><td><strong>${reg.code}</strong> (guárdalo para el check-in)</td></tr>
    </table>
    <p style="margin: 24px 0 0;">
      <a href="${siteUrl}" style="display: inline-block; background: #002FA7; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase;">
        Ver detalles del evento →
      </a>
    </p>
  </div>
  <p style="font-size: 11px; color: #5B6478; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; margin-top: 16px;">
    Crafter Station × Next · Lima, Perú
  </p>
</div>`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend failed (${res.status}): ${await res.text()}`);
  }
}
