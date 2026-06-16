# syntax=docker/dockerfile:1.7

# Bun's NAPI compat layer can't load Next 16's Turbopack worker pool +
# next-intl/plugin native modules, so we build with Node end-to-end.
# bookworm-slim (glibc) gives prebuilts for sharp / unrs-resolver.

# ── deps ──────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --no-fund --no-audit --legacy-peer-deps

# ── builder ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Las NEXT_PUBLIC_* se inlinean en `next build` → deben existir en BUILD, no
# solo en runtime. docker-compose las pasa como build args.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=${NEXT_PUBLIC_WHATSAPP_NUMBER}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node ./node_modules/next/dist/bin/next build

# ── runner ────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 -g nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
