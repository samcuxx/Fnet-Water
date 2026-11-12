# 1. Base image (Debian Bookworm Slim for 100% glibc compatibility with Prisma, SWC, and Tailwind Oxide)
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 2. Dependencies
FROM base AS deps
WORKDIR /app
ARG NODE_ENV=development
ENV NODE_ENV=development
ENV npm_config_production=false
COPY package.json package-lock.json* ./
RUN npm ci --include=dev --production=false

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js static page optimization
# Hardcode placeholder DATABASE_URL to prevent network timeouts during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV IS_BUILD_TIME=true
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV DATABASE_URL="postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?schema=public"
ENV NEXTAUTH_SECRET="fnet-water-hub-super-secret-jwt-key-2026"
ENV NEXTAUTH_URL="https://fnetwater.samcux.com"
ENV NEXT_PUBLIC_APP_URL="https://fnetwater.samcux.com"
ENV PAYSTACK_SECRET_KEY="sk_test_placeholder"
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_placeholder"
ENV MNOTIFY_API_KEY="placeholder"

# Generate Prisma client for all target platforms
RUN npx prisma generate

# Build Next.js in standalone mode
RUN npx next build

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

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
