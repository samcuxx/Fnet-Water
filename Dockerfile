# F Net Water Hub — production image
# Multi-stage build producing Next.js standalone output, run as a non-root user.

# --- Stage 1: dependencies -------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Prisma's schema engine needs OpenSSL on Alpine.
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
# `npm ci` runs the postinstall script, which needs the schema and config
# because Prisma 7 no longer generates the client automatically.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# --- Stage 2: build --------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Regenerate against the full source tree, then build.
RUN npx prisma generate

# Next.js reads NEXT_PUBLIC_* at build time; server-only vars are read at runtime.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# --- Stage 3: runtime ------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# `standalone` output bundles only the server files actually needed.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Schema, migrations and the Prisma CLI, so migrations can be applied on deploy:
#   docker compose exec app npx prisma migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
