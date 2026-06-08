# Registro por WhatsApp — The First User Challenge

Bot de WhatsApp que reemplaza el form externo como **único canal de registro**.
La gente postula conversando con un bot scripted (botones nativos), los
organizadores aprueban desde un Google Sheet, y la confirmación llega por correo.

## Decisiones de diseño (resueltas en grill session, 7 jun 2026)

| Rama | Decisión |
|---|---|
| Mecanismo | Bot de WhatsApp. CLI `npx` descartado (audiencia incluye designers/PMs/marketers). |
| Infra | WhatsApp Cloud API oficial. Conversaciones iniciadas por el usuario son gratis. |
| Conversación | Scripted con botones/listas nativas. Sin LLM en v1. |
| Campos | nombre → correo (eco + confirmación) → rol → equipo → +18 → github (skippable) → cómo te enteraste → resumen |
| Backend | API routes en este repo + Neon Postgres + sync a Google Sheet |
| Cupo | Aplicación con `status: pending`. Aprobación en lote desde el Sheet (columna `status`). Sin corte duro en el bot. |
| Notificación | **Solo correo** (Resend) al aprobar. Sin templates de WhatsApp. |
| Boarding pass | Imagen estilo blueprint enviada por WhatsApp al completar el registro (dentro de ventana 24 h → gratis). |
| Entry point | CTA de la landing → `wa.me/<número>?text=...`. El form de forms.crafterstation.com muere. |
| Re-contacto | Re-registro completo que sobreescribe (conserva el código de aspirante). |
| Edge cases | Input inválido → re-prompt (a los 3 intentos, deriva a correo de contacto). `cancelar` siempre disponible. Sesión abandonada → retoma donde quedó. |

## Arquitectura

```
WhatsApp ──webhook──▶ POST /api/whatsapp/webhook
                          │  engine.advance(session, input)   (máquina de estados pura)
                          │
                          ├─ wa_sessions (Neon)      estado de la conversación por teléfono
                          ├─ registrations (Neon)    registro final, status pending/approved/rejected
                          ├─ Google Sheet            upsert por código — UI de aprobación del equipo
                          └─ respuesta → Cloud API   (texto / botones / lista / boarding pass)

Vercel Cron (15 min) ──▶ GET /api/cron/approvals
                          │  lee columna status del Sheet
                          ├─ approved → email Resend + status en DB
                          └─ rejected → status en DB (sin email en v1)

GET /api/boarding-pass/[code]  →  ImageResponse blueprint (next/og)
```

### Código fuente

- `src/lib/registration/flow.ts` — pasos, copy en español, validaciones (correo con detección de typos de dominio), constructores de mensajes.
- `src/lib/registration/engine.ts` — `advance()`: función pura `(sesión, input) → (sesión', respuestas, efecto)`. Testeable sin red ni DB.
- `src/lib/registration/db.ts` — Neon: sesiones + registros. Código de aspirante `CRAFTER-NNN` derivado del id secuencial.
- `src/lib/registration/whatsapp.ts` — cliente Cloud API (texto, botones, listas, imagen), parseo del webhook, verificación de firma `X-Hub-Signature-256`.
- `src/lib/registration/sheets.ts` — auth de service account (JWT RS256 con `node:crypto`, cero dependencias) + upsert/lectura del Sheet.
- `src/lib/registration/email.ts` — correo de aprobación vía Resend (fetch directo, sin SDK).
- `src/lib/registration/boarding-pass.tsx` — tarjeta compartible estilo blueprint.
- `scripts/simulate.ts` — simulador de la conversación en terminal (`bun run simulate`). No necesita WhatsApp ni DB.
- `scripts/schema.sql` — schema de Neon.

## Flujo de conversación

```
(primer mensaje)        → bienvenida + ¿nombre?
name                    → texto ≥ 2 chars
email                   → regex + typos comunes (gmial.com…) → eco + botones Sí/No
role                    → lista: Builder / Designer / PM / Marketer
team                    → botones: Tengo equipo / Busco equipo / Voy solo
team_name               → (solo si "Tengo equipo")
adult                   → botones: Sí / No  (los menores quedan flagged, deciden organizadores)
github                  → texto o botón "No tengo"
source                  → lista: X / Instagram·TikTok / Amigos·comunidad / Universidad / Otro
summary                 → resumen + botones Confirmar / Empezar de nuevo
done                    → guarda como pending, asigna CRAFTER-NNN,
                          envía boarding pass + "resultado por correo"
(ya registrado, vuelve) → menú: Ver mi registro / Actualizar datos
```

`cancelar` en cualquier punto borra la sesión.

## Operación

1. **Aprobar:** abrir el Sheet, cambiar la columna `status` de `pending` a
   `approved` (o `rejected`). El cron hace el resto en ≤ 15 min.
2. **El Sheet es espejo, no fuente:** la fuente de verdad es Neon. No editar
   otras columnas del Sheet (se sobreescriben en re-registros).

## Setup pendiente (camino crítico — humano)

1. **Meta Business** (días, empezar ya): cuenta verificada + app en
   developers.facebook.com tipo Business + producto WhatsApp.
2. **Número dedicado** que no esté registrado en WhatsApp personal.
3. Configurar webhook: URL `https://thenextcraft.crafter.run/api/whatsapp/webhook`,
   verify token = `WHATSAPP_VERIFY_TOKEN`, suscribirse al campo `messages`.
4. **Neon**: crear DB (marketplace de Vercel), correr `scripts/schema.sql`.
5. **Google Sheet**: crear, compartir con el service account (editor),
   fila 1 = headers (ver `sheets.ts` → `HEADERS`).
6. **Resend**: API key + dominio verificado para `EMAIL_FROM`.
7. Cargar todas las env vars de `.env.example` en Vercel y redeploy.
8. Poner el número real en `NEXT_PUBLIC_WHATSAPP_NUMBER` (CTA de la landing).

## Probar en local

```bash
bun run simulate          # conversación completa en terminal, sin red
```
