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

## Environment variables

No `.env` file is committed. Required variables include:

- `DATABASE_URL` (Neon)
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY_B64` (base64 one-line), `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `CRON_SECRET`
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
