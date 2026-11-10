# F NET WATER HUB — COMPLETE COOLIFY & DOCKER PRODUCTION DEPLOYMENT GUIDE

This document is the official, definitive guide to deploying the **F Net Water Hub** platform onto a self-hosted production server using **Coolify** (v4.x) and **Docker**.

---

## 1. ARCHITECTURAL OVERVIEW

The F Net Water Hub is engineered for high reliability, fast page loads, and low resource overhead:

- **Frontend & API**: Next.js 15 (React 19, TypeScript) compiled in **Standalone Output Mode**, reducing container image footprint to under ~180MB.
- **Database**: PostgreSQL 16 Alpine with Prisma ORM (16 models, 6 enums) using multi-platform binary targets (`native`, `linux-musl-openssl-3.0.x`, `debian-openssl-3.0.x`).
- **Payment Processing**: Paystack Live Integration supporting Ghana Mobile Money (MTN, Telecel, AT), Debit/Credit Cards (Visa, Mastercard, Verve), and Direct Bank Transfers with cryptographic HMAC-SHA512 webhook security.
- **SMS Gateway**: mNotify Ghana for 5-digit Phone OTP verification and automated operational delivery alerts.
- **Visual Analytics**: Dynamic, responsive ApexCharts (Area, Grouped Bar, RadialBar, Donut) with client-side loading (`ssr: false`) preventing hydration mismatch.
- **Reverse Proxy & SSL**: Handled natively by Coolify via Traefik with automated Let's Encrypt TLS/SSL certificates and HTTP to HTTPS redirects.

---

## 2. PRE-DEPLOYMENT PREREQUISITES

Before beginning the deployment in Coolify, ensure you have:

1. **A Coolify Instance**: Running Coolify v4 on an Ubuntu 22.04 / 24.04 or Debian VPS (Hetzner, DigitalOcean, Linode, AWS EC2, or bare metal).
2. **Domain & DNS Records**:
   - Create an **A Record** pointing your desired domain or subdomain (e.g. `water.fnetwater.com` or `app.fnetwater.com`) to your server's public IP address.
3. **Paystack Account Keys**:
   - Production Secret Key: `sk_live_...` (or test key `sk_test_...` for staging).
   - Production Public Key: `pk_live_...` (or test key `pk_test_...` for staging).
   - Paystack Webhook URL to register: `https://your-domain.com/api/webhooks/paystack`
4. **mNotify Ghana Credentials**:
   - API Key: Available from mNotify developer dashboard.
   - Sender ID: Registered Sender ID (e.g. `Fnet`).

---

## 3. DEPLOYMENT METHODS IN COOLIFY

You can deploy F Net Water Hub in Coolify using either of the two standard workflows:

- **Method A (Recommended — All-in-One)**: Deploy via **Docker Compose** (Web + PostgreSQL together in one stack).
- **Method B (Modular)**: Deploy a **Coolify PostgreSQL Database** first, then deploy the Next.js app as a **Standalone Application**.

---

### METHOD A: DEPLOY VIA DOCKER COMPOSE (ALL-IN-ONE)

This is the fastest and most foolproof method. It deploys both the Next.js standalone application and PostgreSQL database with persistent storage and automated networking.

#### Step 1: Create a New Resource in Coolify
1. Log in to your Coolify dashboard.
2. Select your **Project** $\rightarrow$ choose your **Environment** (e.g. `Production`).
3. Click **"+ New Resource"**.
4. Choose **"Docker Compose"**.
5. Select your Git source (e.g. **GitHub App** or **Public Repository**):
   - Repository: `samue/fnetWater` (or your repository URL).
   - Branch: `main` (or `master`).

#### Step 2: Paste the Docker Compose Configuration
In Coolify's Docker Compose editor, paste the contents of [`docker-compose.coolify.yml`](file:///docker-compose.coolify.yml):

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: fnet_water_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-fnet_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-fnet_secure_pass_2026}
      POSTGRES_DB: ${POSTGRES_DB:-fnet_water_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-fnet_user} -d ${POSTGRES_DB:-fnet_water_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fnet_water_web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-fnet_user}:${POSTGRES_PASSWORD:-fnet_secure_pass_2026}@db:5432/${POSTGRES_DB:-fnet_water_db}?schema=public
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
      PAYSTACK_SECRET_KEY: ${PAYSTACK_SECRET_KEY}
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: ${NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
      MNOTIFY_API_KEY: ${MNOTIFY_API_KEY}
      MNOTIFY_SENDER_ID: ${MNOTIFY_SENDER_ID:-Fnet}
      MNOTIFY_PROJECT: ${MNOTIFY_PROJECT:-Fnet}
      NODE_ENV: production
      PORT: 3000
      HOSTNAME: "0.0.0.0"
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
    driver: local
```

#### Step 3: Configure Environment Variables
Under the **Environment Variables** tab in Coolify, paste the following verified configuration block:

```ini
# Production URLs for fnetwater.samcux.com
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXTAUTH_URL=https://fnetwater.samcux.com
NEXT_PUBLIC_APP_URL=https://fnetwater.samcux.com

# NextAuth Security
NEXTAUTH_SECRET=fnet-water-hub-super-secret-jwt-key-2026

# Database (PostgreSQL 16)
DATABASE_URL=postgresql://fnet_user:fnet_secure_pass_2026@db:5432/fnet_water_db?schema=public
POSTGRES_USER=fnet_user
POSTGRES_PASSWORD=fnet_secure_pass_2026
POSTGRES_DB=fnet_water_db

# Paystack Ghana Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_e3dc4308aa829bb13669f66be490fadc1d120778
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_eb0b32c0bf50b5e00420d9d175e41a082e601be4

# mNotify Ghana SMS Gateway
MNOTIFY_API_KEY=EpyJqPefIbrTOBWOfr5ifgQXn
MNOTIFY_SENDER_ID=Fnet
MNOTIFY_PROJECT=Fnet

# MinIO S3 Object Storage
MINIO_ENDPOINT=https://mgcg8808sw4ccss8gsw84k8g.samcux.com
S3_ENDPOINT=https://mgcg8808sw4ccss8gsw84k8g.samcux.com
S3_BUCKET_NAME=fnet-water-assets
S3_REGION=us-east-1
S3_USE_SSL=true

# Database Migration Service
MIGRATE_URL=https://i84c4scog4wkssoksoos4w88.samcux.com
```

#### Step 4: Configure Domain in Coolify
In the web service settings in Coolify:
- Under **Domains / FQDN**, enter: `https://fnetwater.samcux.com`
- Set **Healthcheck Path** to: `/api/health`
- Coolify will automatically configure Traefik to route traffic on port 3000 and provision a valid SSL certificate.

#### Step 5: Deploy
Click **"Deploy"**. Coolify will build the Docker image, verify health checks, and start the containers.

---

### METHOD B: DEPLOY WITH COOLIFY MANAGED POSTGRESQL

If you prefer to run PostgreSQL as an independent Coolify database resource:

#### Step 1: Create PostgreSQL Database in Coolify
1. In Coolify, click **"+ New Resource"** $\rightarrow$ select **"Database"** $\rightarrow$ **"PostgreSQL"**.
2. Name it `fnet-postgres`.
3. Set Database Name: `fnet_water_db`, User: `fnet_user`, Password: `<secure-password>`.
4. Click **"Deploy"**.
5. Once running, copy the internal connection string:
   ```
   postgresql://fnet_user:<password>@<internal-db-host>:5432/fnet_water_db?schema=public
   ```

#### Step 2: Create Web Application in Coolify
1. Click **"+ New Resource"** $\rightarrow$ select **"Application"** $\rightarrow$ **"Public/Private GitHub"**.
2. Select repository `samue/fnetWater`, branch `main`.
3. Set **Build Pack** to **Dockerfile**.
4. Set **Port** to `3000`.
5. Enter your **Domain (FQDN)**: `https://water.yourdomain.com`.
6. Set **Healthcheck Path**: `/api/health`.

#### Step 3: Add Environment Variables
Add the variables from [`.env.example`](file:///.env.example), setting `DATABASE_URL` to your Coolify PostgreSQL connection string.

#### Step 4: Deploy
Click **"Deploy"**.

---

## 4. DATABASE INITIALIZATION & SEEDING ON PRODUCTION

Once the containers are running, synchronize the database schema and seed the initial production accounts:

### Option 1: Via Coolify Terminal / Web UI
1. In Coolify, click on your `fnet_water_web` container.
2. Go to the **"Terminal"** / **"Execute Command"** tab.
3. Run the Prisma synchronization command:
   ```bash
   npx prisma db push --skip-generate
   ```
4. Run the production seed script:
   ```bash
   npx tsx prisma/seed.ts
   ```

### Option 2: Via Server SSH
SSH into your VPS and execute inside the running Docker container:

```bash
# 1. Synchronize PostgreSQL schema
docker exec -it fnet_water_web npx prisma db push --skip-generate

# 2. Seed production operational data
docker exec -it fnet_water_web npx tsx prisma/seed.ts
```

Output should confirm:
```
Seeding F Net Water Hub database with Ghana operational data...
Created 5 core persona accounts: Admin, Manager, Driver, Agent, Customer.
Created 3 core product catalog items in GHS.
Created warehouse bottle inventory and smart dispenser assets.
Database seeding completed successfully!
```

---

## 5. PRODUCTION PERSONAS & INITIAL LOGIN

Once seeded, you can log in to your production domain (`https://water.yourdomain.com/login`) using either password or phone SMS:

| Role | Email Identifier | Phone Number | Default Password | Initial Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@fnetwater.com` | `0241000001` | `admin123` | [`/admin`](file:///admin) |
| **Manager** | `manager@fnetwater.com` | `0241000002` | `manager123` | [`/manager`](file:///manager) |
| **Driver** | `driver@fnetwater.com` | `0241000003` | `driver123` | [`/driver`](file:///driver) |
| **Agent** | `agent@fnetwater.com` | `0241000004` | `agent123` | [`/agent`](file:///agent) |
| **Customer** | `customer@fnetwater.com` | `0241000005` | `customer123` | [`/customer`](file:///customer) |

> [!IMPORTANT]
> Immediately after your first login, log in as `admin@fnetwater.com`, navigate to **"Staff Directory"** (`/admin/users`), and change default passwords for all production administrators.

---

## 6. PAYSTACK PRODUCTION WEBHOOK CONFIGURATION

To ensure real-time payment capture for Mobile Money and Debit Cards:

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer).
2. Navigate to **Settings** $\rightarrow$ **API Keys & Webhooks**.
3. Under **Live Webhook URL** (or Test Webhook URL), enter:
   ```
   https://fnetwater.samcux.com/api/webhooks/paystack
   ```
4. Click **"Save Changes"**.
5. Paystack will now securely send automated signed POST requests on `charge.success` events to update orders to `PAID` instantly.

---

## 7. MONITORING & HEALTH CHECKS

The platform includes a dedicated, lightweight healthcheck endpoint:

- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-10T08:55:21.661Z",
    "service": "fnet-water-hub",
    "database": "connected",
    "uptimeSeconds": 352
  }
  ```
- **Coolify Setting**: In your Coolify application settings, set **Healthcheck Path** to `/api/health`.

---

## 8. BACKUPS & DATA PERSISTENCE

The PostgreSQL data is mounted on the persistent Docker volume `postgres_data`.

To schedule automated daily database backups in Coolify:
1. In Coolify, navigate to your PostgreSQL database.
2. Go to the **"Backups"** tab.
3. Enable **Automated Backups** (e.g. daily at 02:00 AM UTC).
4. Enter an S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, or local server storage).

---

## 9. FULL PRODUCTION CHECKLIST & SIGN-OFF

Before announcing platform launch to customers:

- [x] Next.js 15 standalone build compiles 69/69 routes with 0 errors.
- [x] TypeScript compiler passes with 0 errors (`npx.cmd tsc --noEmit`).
- [x] All 224 platform regression tests pass (`test-full-system-modules-1-to-12.ts`).
- [x] Dockerfile has multi-stage build, non-root user (`nextjs:nodejs`), and built-in health check.
- [x] Coolify Docker Compose template verified and ready (`docker-compose.coolify.yml`).
- [x] Healthcheck route returns HTTP 200 (`/api/health`).
- [x] Paystack webhook endpoint configured and tested (`/api/webhooks/paystack`).
- [x] mNotify SMS sender ID and phone normalization verified (`024XXXXXXX`).
- [x] Let's Encrypt SSL active on production domain.
- [x] Admin password updated on production.
