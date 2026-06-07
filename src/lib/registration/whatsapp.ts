// Cliente de WhatsApp Cloud API + parseo/verificación del webhook.
// Sin SDK: solo fetch contra graph.facebook.com.

import { createHmac, timingSafeEqual } from "node:crypto";

import type { Input, Reply } from "./flow";

const GRAPH = "https://graph.facebook.com/v23.0";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// ── Verificación del webhook ────────────────────────────────────────────────

/** GET de verificación inicial de Meta. Devuelve el challenge o null. */
export function verifySubscription(url: URL): string | null {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (
    mode === "subscribe" &&
    token === env("WHATSAPP_VERIFY_TOKEN") &&
    challenge
  ) {
    return challenge;
  }
  return null;
}

/** Verifica X-Hub-Signature-256 (HMAC-SHA256 del raw body con el app secret). */
export function verifySignature(
  rawBody: string,
  header: string | null,
): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", env("WHATSAPP_APP_SECRET"))
    .update(rawBody)
    .digest("hex");
  const got = header.slice("sha256=".length);
  if (got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(expected, "hex"));
}

// ── Parseo de mensajes entrantes ────────────────────────────────────────────

export interface IncomingMessage {
  messageId: string;
  phone: string; // wa_id del remitente, ej. "51987654321"
  input: Input;
}

/** Extrae los mensajes de usuario de un payload de webhook (ignora statuses). */
export function parseWebhook(payload: unknown): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  // biome-ignore lint/suspicious/noExplicitAny: payload externo de Meta
  const body = payload as any;
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      for (const msg of change?.value?.messages ?? []) {
        const phone: string | undefined = msg?.from;
        const messageId: string | undefined = msg?.id;
        if (!phone || !messageId) continue;

        let input: Input | null = null;
        if (msg.type === "text" && msg.text?.body) {
          input = { text: msg.text.body };
        } else if (msg.type === "interactive") {
          const i = msg.interactive;
          if (i?.type === "button_reply" && i.button_reply?.id) {
            input = { buttonId: i.button_reply.id, text: i.button_reply.title };
          } else if (i?.type === "list_reply" && i.list_reply?.id) {
            input = { buttonId: i.list_reply.id, text: i.list_reply.title };
          }
        } else if (msg.type === "button" && msg.button?.text) {
          input = { text: msg.button.text };
        }
        // Audio, stickers, imágenes, etc. → input vacío: el engine re-promptea.
        out.push({ messageId, phone, input: input ?? {} });
      }
    }
  }
  return out;
}

// ── Envío ───────────────────────────────────────────────────────────────────

async function post(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(
    `${GRAPH}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        ...payload,
      }),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
  }
}

export async function sendReply(phone: string, reply: Reply): Promise<void> {
  switch (reply.kind) {
    case "text":
      return post({ to: phone, type: "text", text: { body: reply.body } });
    case "buttons":
      return post({
        to: phone,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: reply.body },
          action: {
            buttons: reply.buttons.map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      });
    case "list":
      return post({
        to: phone,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: reply.body },
          action: {
            button: reply.button,
            sections: [{ title: "Opciones", rows: reply.rows }],
          },
        },
      });
    case "image":
      return post({
        to: phone,
        type: "image",
        image: { link: reply.url, caption: reply.caption },
      });
  }
}

export async function sendReplies(
  phone: string,
  replies: Reply[],
): Promise<void> {
  // Secuencial a propósito: el orden de los mensajes importa.
  for (const r of replies) {
    await sendReply(phone, r);
  }
}
