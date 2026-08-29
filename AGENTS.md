<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repo runs **Next.js 16.2.7** with breaking API and convention changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code, and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

Landing + WhatsApp registration bot for The Next Craft hackathon. Single Next.js app, no monorepo.

## Runtime & package manager

- **Dev**: `bun` (Bun runtime).
- **Docker build**: `node:22-bookworm-slim`, not Bun. Bun's NAPI compat layer can't load Next 16's Turbopack worker pool + next-intl native modules.
- `package.json` has `ignoreScripts`/`trustedDependencies` for `sharp` and `unrs-resolver`.

## Daily commands

```bash
bun install
bun dev          # localhost:3000
bun build        # production build (standalone output)

bun lint         # biome check .
bun format       # biome format --write .

bun simulate     # terminal simulator for the WhatsApp registration flow
```

There is **no test runner** configured. Use `bun simulate` to manually exercise the registration state machine.

## i18n

- `next-intl` with `src/i18n/request.ts`, `src/i18n/routing.ts`.
- Locales: `es` (default), `en`.
- `localePrefix: "always"` and `localeDetection: true`.
- All routes live under `src/app/[locale]/`. `setRequestLocale(locale)` is called in layouts/pages.
- Translations in `src/messages/{es,en}.json`.

## Styling & components

- Tailwind CSS v4 with `@tailwindcss/postcss`.
- shadcn/ui configured as `style: "base-nova"` in `components.json`.
- Global styles and custom design tokens in `src/app/globals.css` (C64/B&W vintage palette, custom easings, scroll-driven animations).
- `cn()` helper lives in `src/lib/utils.ts`.

## Static assets (`public/`)

Deck assets are **self-contained** under `public/deck/**` so slide decks own
their own files and don't share ambiguous top-level folders with the rest of
the site:

- `public/deck/brand-assets/<partner>/**` — per-deck logos, favicons, og-images
  (referenced by `src/content/decks/**/*.mdx` and `deck.json`).
- `public/deck/photos/**` — event photos used in decks.

Decks reference assets as URL strings in MDX (`<Logo src="/deck/...">`,
`"icon": "/deck/..."` in `deck.json`), so they **must** live in `public/`;
they can't be co-located under `src/content/`. When adding a deck asset, put it
under `public/deck/**` and reference it with the `/deck/...` prefix.

## Linting / formatting

- Biome (`biome.json`):
  - Linter disabled for `src/components/ui/**`.
  - Import organization is enabled with explicit groups (Node/Bun, React/Next, packages, `@/lib`, `@/components`, `@/hooks`).
  - `noUnknownAtRules` is off because of Tailwind v4 at-rules.

## Build & deploy

- `next.config.ts` uses `output: "standalone"`.
- Dockerfile is multi-stage (deps → builder → runner). `NEXT_PUBLIC_*` vars must be available at **build time** (passed as build args in `docker-compose.yaml`).
- Vercel cron configured in `vercel.json`: `POST /api/cron/approvals` every 15 minutes.

## Registration backend

Implemented under `src/lib/registration/`:

- `flow.ts` — step definitions, copy, validation rules, reply types.
- `engine.ts` — pure state machine; testable without network or DB.
- `db.ts` — Neon Postgres persistence.
- `sheets.ts` — Google Sheets mirror.
- `whatsapp.ts` — WhatsApp Cloud API send/parse/verify.
- `email.ts` — Resend notifications.

Entry points:

- Webhook: `src/app/api/whatsapp/webhook/route.ts`.
- Boarding pass image: `src/app/api/boarding-pass/[code]/route.ts`.
- Approval cron: `src/app/api/cron/approvals/route.ts`.

Registration schema: `scripts/schema.sql`. Better Auth and badge generator schema: `src/lib/db/schema.ts`, migrated through checked-in Drizzle migrations with `bun run db:generate` and `bun run db:migrate` (never `push`).

## Calificación del jurado

Dos capas, y la distinción es de cálculo, no de nombre:

- **Fase 1 (`sede`)** — los **mentores** de cada sede califican, en persona, a
  los equipos de esa sede. De ahí salen los finalistas.
- **Fase 2 (`final`)** — los **jurados** califican en línea a los finalistas de
  las cinco sedes a la vez.

Los puntajes de dos sedes **no se comparan entre sí**: no comparten mentores ni
equipos, así que no hay nada que los ponga en la misma escala. Por eso la fase 2
es un panel único sobre todos los finalistas —al ver todos a todos, la
comparación vuelve a ser válida— y `panelResults()` se llama una vez por panel,
nunca sobre las cinco sedes juntas.

Rúbrica cerrada y publicada: 5 criterios de 0 a 5 **en pasos de medio punto**,
con pesos 30/25/20/15/10, iguales en las dos fases y los tres tracks. El medio
punto viene de la hoja de evaluación oficial (`decimal between 0 and 5`, formato
`0.0`), no de un capricho: un jurado que venga de la hoja tiene que poder
transcribir su 4.5. Por eso las columnas de nota son `real` y no `integer`. **Se pondera sobre la nota cruda y se
normaliza el compuesto** — normalizar criterio por criterio dejaría cada uno con
varianza 1 y el peso efectivo pasaría a ser 1/σ, borrando los pesos publicados.

Code map:

- `src/lib/judging/rubric.ts` — criterios, pesos, desempate. Fuente de verdad.
- `src/lib/judging/normalize.ts` — la matemática, pura y sin red: total
  ponderado → μ/σ por panelista con la desviación encogida hacia el panel → z →
  promedio. Además detecta si el panel es completo y si el reparto está
  **conectado** (union-find sobre equipos que comparten panelista); un panel
  desconectado no se puede publicar.
- `src/lib/judging/state.ts` — sesión del panelista, alcance por rol, resultados.
- `src/lib/judging/access.ts` — el código de acceso y la sesión firmada.
- `src/lib/judging/actions.ts` — server actions.
- `src/app/[locale]/judge/**` — el área del panelista, con su propia puerta.
  Fuera de `/dashboard` a propósito: aquel shell es del hacker y exige ser
  participante acreditado en Luma, y un mentor no lo es.
- `src/lib/judging/projects.ts` — la lista de lo que se califica, escribible por
  el staff. Normalmente los equipos salen de `/dashboard/team`, pero el sistema
  se usa como herramienta de consignación: el staff tiene que poder escribir la
  fila del equipo que se formó en la sala y nunca abrió la app.
- `src/app/[locale]/admin/judging` — el tablero del comité: proyectos, ranking
  normalizado, banderas de cobertura y el interruptor de finalista.

**El panel no entra por correo.** Cada panelista tiene un `access_code` de ocho
caracteres que el staff le dicta, y con eso entra: sin OTP, sin contraseña y
sin Better Auth. El OTP se descartó porque fallaba en silencio —solo se envía a
direcciones dadas de alta, así que quien tecleaba otra no recibía nada ni sabía
por qué—, y un mentor de pie en una sala con ruido no tiene margen para eso.

El código es una credencial al portador y se guarda **en claro**: el staff
necesita releérselo a quien pierda el papel, que es lo que de verdad pasa. Se
sostiene porque vive un día y solo abre la calificación. La sesión es una
cookie firmada con HMAC sobre `BETTER_AUTH_SECRET`, sin tabla de sesiones. La
fila se relee en cada petición para que una baja surta efecto en el momento y
no cuando caduque la cookie.

`access_code` lleva un `DEFAULT` en la base que no es el camino normal —la app
siempre escribe el suyo— sino una red: las migraciones se aplican **a mano y
por separado del despliegue** (`CMD ["node", "server.js"]` no las corre), así
que existe una ventana en la que el código viejo puede insertar una fila sin
saber de la columna.

El ranking del tablero es del panel (la sede), pero además muestra la posición
**dentro de cada track**, que es donde se reparten los premios — igual que la
columna «Rank track» de la hoja. Y junto al índice normalizado enseña el
`/100` (crudo × 20), que es la escala que el jurado ya conoce de la hoja.

Un proyecto sin sede o sin track **no lo ve ningún panelista**: la sede decide
qué mentores lo alcanzan y el track en qué compite. El tablero los marca en
rojo en vez de esconderlos, porque el momento de descubrir el hueco es antes de
que el mentor no encuentre al equipo.

Nada de esto depende de un sistema externo. Los equipos entregan en Vibe Apps,
pero traer esos datos por API se descartó (hace falta un key de admin de su
grupo que no tenemos): el enlace de la demo se escribe a mano o lo pone el
capitán en `/dashboard/team`.

## Environment variables

No `.env` file is committed. Required variables include:

- `DATABASE_URL` (Neon)
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY_B64` (base64 one-line), `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `CRON_SECRET`
- `STAFF_EMAIL_DOMAINS` — dominios de correo con acceso staff/admin (coma-separado, sin `@`; solo servidor)
- Badge generator: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BADGE_PII_ENCRYPTION_KEY`, `LUMA_API_KEY`, `AI_GATEWAY_API_KEY`, `TRIGGER_SECRET_KEY`
- Team repos (see below): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_TOKEN`, `GITHUB_TEMPLATE_REPO`, optional `GITHUB_TEAM_REPO_OWNER`, `GITHUB_TEAM_REPO_PREFIX`
- Build-time public vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`

`GOOGLE_PRIVATE_KEY_B64` must be base64-encoded on a single line — the newline-escaped version breaks Dokploy's `.env` parser.

## Team repos on GitHub

Each team gets its own repository in the org, generated from a **template
repo** (`POST /repos/{owner}/{repo}/generate`) — not a fork: GitHub won't let
one account hold many forks of the same repo, and a generated repo starts with
clean history. Mentors find them by org + topics (`tnc26`, `tnc26-<city>`,
`tnc26-<track>`), and staff sees the full list at `/dashboard/staff`.

Code map:

- `src/lib/github/api.ts` — hand-rolled REST client (no Octokit).
- `src/lib/dashboard/github.ts` — identity sync, provisioning, invites. Every
  effect is idempotent; provisioning is locked through
  `dashboard_teams.github_repo_status`.
- `src/lib/dashboard/github-actions.ts` — server actions (session + permissions).
- `src/components/dashboard/github-panel.tsx` — the panel in `/dashboard/team`.

Flow: the hacker links GitHub with Better Auth account linking (OAuth is
**linking only** — `disableSignUp: true` keeps the Luma-approved OTP as the
single door in), the captain presses «Crear el repo», and everyone with a
linked account gets a collaborator invite (captain as `admin`, the rest as
`push`). Whoever joins later is invited on join; whoever leaves is revoked.

Setup checklist for a new edition:

1. Create the starter repo in the org and tick **Template repository** in its
   settings.
2. Create an OAuth App (`Settings → Developer settings`) with callback
   `${BETTER_AUTH_URL}/api/auth/callback/github` → `GITHUB_CLIENT_ID` /
   `GITHUB_CLIENT_SECRET`.
3. Issue a PAT for a machine account that can create repos in the org →
   `GITHUB_TOKEN`. Set `GITHUB_TEMPLATE_REPO=<org>/<starter>`.
4. Without these vars the panel simply doesn't render: local dev keeps working.

<!-- TRIGGER.DEV SKILLS START -->
## Trigger.dev agent skills

This project has Trigger.dev agent skills installed in `.agents/skills/`. Before writing or changing Trigger.dev code (background tasks, scheduled tasks, realtime, or chat.agent AI agents), load the most relevant skill: `trigger-realtime-and-frontend`, `trigger-cost-savings`, `trigger-getting-started`.
<!-- TRIGGER.DEV SKILLS END -->
