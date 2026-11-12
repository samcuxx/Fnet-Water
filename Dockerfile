# 1. Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# 2. Dependencies
# Ensure devDependencies are ALWAYS installed regardless of any build-time NODE_ENV args
FROM base AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js static page optimization
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
ENV NEXTAUTH_SECRET="fnet-water-hub-super-secret-jwt-key-2026"
ENV NEXTAUTH_URL="https://fnetwater.samcux.com"
ENV NEXT_PUBLIC_APP_URL="https://fnetwater.samcux.com"
ENV PAYSTACK_SECRET_KEY="sk_test_placeholder"
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_placeholder"
ENV MNOTIFY_API_KEY="placeholder"

# Generate Prisma client for all target platforms
RUN npx prisma generate

# Build Next.js in standalone mode
RUN npm run build

# 4. Migration runner stage (target for database migration service)
FROM base AS migrate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY src ./src
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/create-admin.ts"]

# 5. Production Runner (default target)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
