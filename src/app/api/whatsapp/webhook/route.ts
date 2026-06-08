// Webhook de WhatsApp Cloud API.
// GET  → handshake de verificación de Meta.
// POST → mensajes entrantes → engine → respuestas + persistencia.

import type { NextRequest } from "next/server";

import {
  clearSession,
  getRegistration,
  getSession,
  saveRegistration,
  saveSession,
  seenMessage,
} from "@/lib/registration/db";
import { advance } from "@/lib/registration/engine";
import { completionReplies } from "@/lib/registration/flow";
import { upsertRow } from "@/lib/registration/sheets";
import {
  parseWebhook,
  sendReplies,
  verifySignature,
  verifySubscription,
} from "@/lib/registration/whatsapp";

export async function GET(request: NextRequest) {
  const challenge = verifySubscription(request.nextUrl);
  if (challenge) return new Response(challenge, { status: 200 });
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const messages = parseWebhook(JSON.parse(rawBody));

  for (const msg of messages) {
    try {
      // Meta reintenta webhooks: ignorar mensajes ya procesados.
      if (await seenMessage(msg.messageId)) continue;

      const [session, registration] = await Promise.all([
        getSession(msg.phone),
        getRegistration(msg.phone),
      ]);

      const existing = registration
        ? {
            code: registration.code,
            status: registration.status,
            answers: {
              name: registration.name,
              email: registration.email,
              role: registration.role,
              teamStatus: (registration.team_status ?? undefined) as
                | "tengo"
                | "busco"
                | "solo"
                | undefined,
              teamName: registration.team_name ?? undefined,
              adult: registration.adult,
              github: registration.github ?? undefined,
              source: registration.source ?? undefined,
            },
          }
        : null;

      const result = advance(session, msg.input, msg.phone, existing);

      // Persistir estado de sesión
      if (result.session) {
        await saveSession(result.session);
      } else {
        await clearSession(msg.phone);
      }

      await sendReplies(msg.phone, result.replies);

      // Registro completado: guardar, espejar al Sheet, enviar boarding pass.
      if (result.effect.type === "save") {
        const reg = await saveRegistration(msg.phone, result.effect.answers);
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ??
          "https://thenextcraft.crafter.run";
        await sendReplies(
          msg.phone,
          completionReplies(
            reg.name,
            reg.code,
            `${siteUrl}/api/boarding-pass/${reg.code}`,
          ),
        );
        // El Sheet es espejo: si falla, el registro ya está seguro en Neon.
        try {
          await upsertRow(reg);
        } catch (err) {
          console.error("[whatsapp] sheet sync failed", reg.code, err);
        }
      }
    } catch (err) {
      // Nunca devolver 500 a Meta por un mensaje individual: reintentaría todo.
      console.error("[whatsapp] message handling failed", msg.messageId, err);
    }
  }

  return new Response("OK", { status: 200 });
}
