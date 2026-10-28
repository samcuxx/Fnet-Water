# F Net Water Hub — Production Self-Hosting on Coolify

A complete, production-grade guide to deploying and self-hosting **F Net Water Hub** using [Coolify](https://coolify.io).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Server Sizing](#2-prerequisites--server-sizing)
3. [Domain & DNS Configuration](#3-domain--dns-configuration)
4. [Deployment Strategy](#4-deployment-strategy)
   - [Method A: Full-Stack Docker Compose (Recommended)](#method-a-full-stack-docker-compose-stack-recommended)
   - [Method B: Decoupled Services (Managed Postgres + S3)](#method-b-decoupled-services-advanced)
5. [Environment Variables Matrix](#5-environment-variables-matrix)
6. [Automatic Database Migrations](#6-automatic-database-migrations)
7. [SSL / TLS & Reverse Proxy Setup](#7-ssl--tls--reverse-proxy-setup)
8. [Automated Backups & Disaster Recovery](#8-automated-backups--disaster-recovery)
9. [Post-Deployment Verification & Seeding Policy](#9-post-deployment-verification--seeding-policy)
10. [Day-2 Operations & Troubleshooting](#10-day-2-operations--troubleshooting)

---

## 1. Architecture Overview

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                     Coolify Host                       │
                                    │                                                        │
 Internet ──── HTTPS (443) ────────>│  Traefik / Caddy Reverse Proxy (Auto Let's Encrypt SSL)│
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
                                                               ▼ (Internal Bridge Network)
                                      ┌────────────────────────────────────────────────┐
                                      │  App Container (Next.js 16 Standalone)         │
                                      │  Port: 3000                                    │
                                      │  Healthcheck: /api/health                      │
                                      │  Entrypoint: npx prisma migrate deploy         │
                                      └─────────────┬────────────────────┬─────────────┘
                                                    │                    │
                          Internal Network          ▼                    ▼  Internal Network
                                  ┌───────────────────────┐    ┌───────────────────────┐
                                  │ PostgreSQL 16 DB      │    │ S3 Object Storage     │
                                  │ Port: 5432            │    │ (MinIO / Silo)        │
                                  │ Volume: postgres-data │    │ Port: 9000            │
                                  │                       │    │ Volume: minio-data    │
                                  └───────────────────────┘    └───────────────────────┘
```

The production bundle leverages **Next.js Standalone mode**, creating a minimal Alpine Linux container image (~150MB) run by an unprivileged `nextjs` user.

- **Frontend & API**: Next.js App Router with server-side RBAC and signed HTTP-only cookies.
- **Relational Data**: PostgreSQL 16/17 with Prisma ORM via native `@prisma/adapter-pg`.
- **Object Storage**: S3-compatible storage (Silo/MinIO or Cloudflare R2 / AWS S3) for dispenser documents and payment proof uploads.
- **Edge Routing**: Handled seamlessly by Coolify's built-in Traefik/Caddy proxy with automated certificate renewal.

---

## 2. Prerequisites & Server Sizing

### Server Specifications
- **Operating System**: Ubuntu 22.04 LTS / 24.04 LTS or Debian 12 (64-bit x86 or ARM64).
- **Minimum Requirements**:
  - 2 vCPUs
  - 2 GB RAM (4 GB recommended if building images directly on the VPS)
  - 25 GB SSD/NVMe storage
- **Docker**: Docker Engine 24+ and Docker Compose v2.
- **Coolify Installed**: Installed via standard script:
  ```bash
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
  ```

---

## 3. Domain & DNS Configuration

Before deploying, create DNS records with your DNS provider (e.g., Cloudflare, Route53, Namecheap):

| Record Type | Name / Host | Target / Value | Description |
| --- | --- | --- | --- |
| `A` | `hub.yourdomain.com` | `YOUR_SERVER_IP` | Main Web Application |
| `A` (Optional) | `s3.yourdomain.com` | `YOUR_SERVER_IP` | MinIO / Silo S3 API (if public direct uploads are used) |
| `A` (Optional) | `storage-console.yourdomain.com` | `YOUR_SERVER_IP` | MinIO Web Console |

> [!TIP]
> If using Cloudflare DNS, set the Proxy status to **DNS Only (Grey Cloud)** during the initial certificate provisioning so Let's Encrypt HTTP-01 challenges complete without issue. You can enable Cloudflare proxying afterwards if desired.

---

## 4. Deployment Strategy

### Method A: Full-Stack Docker Compose Stack (Recommended)

This is the fastest, cleanest approach. It deploys the application, PostgreSQL, and private S3 object storage within a dedicated, isolated internal Docker network.

1. **Log in to Coolify UI** (`http://YOUR_SERVER_IP:8000`).
2. Navigate to **Projects** → Select or create a **Project** → Select or create an **Environment** (e.g. `production`).
3. Click **+ New Resource** → Select **Docker Compose**.
4. Choose **Git Repository (Empty / Based on Git)** or paste the `docker-compose.coolify.yml` content directly:
   - Point to your repository: `https://github.com/<your-org>/Fnet-Water`
   - Branch: `main`
   - Compose File Location: `docker-compose.coolify.yml`
5. In Coolify's **General Settings**:
   - In the `app` service configuration, assign your domain: `https://hub.yourdomain.com`.
   - Set the port to `3000`.
6. Add the production environment variables (see [Section 5](#5-environment-variables-matrix)).
7. Click **Deploy**.

---

### Method B: Decoupled Services (Advanced)

For larger deployments requiring independent scaling, separate database backups, or third-party S3:

1. **PostgreSQL Database**:
   - In Coolify, click **+ New Resource** → **Databases** → **PostgreSQL**.
   - Configure a strong password, e.g. `POSTGRES_PASSWORD`.
   - Enable Coolify's **Automated Backups** (supports scheduled daily backups to S3/Cloudflare R2).
   - Note the internal database URL: `postgresql://postgres:<password>@<db-container-id>:5432/fnet_water_hub`.

2. **Object Storage**:
   - Option 1: Coolify 1-click **MinIO** service.
   - Option 2: **Cloudflare R2** / **AWS S3** / **Backblaze B2** (Zero server storage footprint, unlimited scale, free egress on R2).

3. **Web Application**:
   - In Coolify, click **+ New Resource** → **Application** → **Public/Private Repository**.
   - Build Pack: **Dockerfile**.
   - Dockerfile path: `./Dockerfile`.
   - Set Domain: `https://hub.yourdomain.com`.
   - Add environment variables pointing `DATABASE_URL` and `MINIO_*` to the respective services.
   - Click **Deploy**.

---

## 5. Environment Variables Matrix

Generate cryptographic secrets before deploying. On your terminal or server:

```bash
# 1. Generate 32-byte session signing secret (AUTH_SECRET):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 2. Generate strong DB password:
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"

# 3. Generate strong S3 root password:
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Configure these in the **Environment Variables** tab in Coolify:

| Variable | Recommended Production Value | Description |
| --- | --- | --- |
| `NODE_ENV` | `production` | Enables Next.js runtime optimizations & secure cookies |
| `APP_URL` | `https://hub.yourdomain.com` | Canonical public URL used in customer links & emails |
| `APP_NAME` | `F Net Water Hub` | Display brand name |
| `AUTH_SECRET` | *(Generated 32+ character key)* | Cryptographic HMAC secret for user sessions |
| `SESSION_MAX_AGE_DAYS` | `7` | Duration before session expiration |
| `DATABASE_URL` | `postgresql://fnet:<DB_PASS>@postgres:5432/fnet_water_hub?schema=public` | Connection string to PostgreSQL |
| `POSTGRES_USER` | `fnet` | Database username |
| `POSTGRES_PASSWORD` | *(Generated DB password)* | Database password |
| `POSTGRES_DB` | `fnet_water_hub` | Database name |
| `MINIO_ENDPOINT` | `minio` (or your R2/S3 endpoint) | Object storage host |
| `MINIO_PORT` | `9000` (or `443` for external S3) | Object storage port |
| `MINIO_USE_SSL` | `false` (set `true` if external S3) | TLS toggle for S3 connection |
| `MINIO_ROOT_USER` | `fnet_admin` | Storage admin / Access Key ID |
| `MINIO_ROOT_PASSWORD` | *(Generated storage secret)* | Storage secret / Secret Access Key |
| `MINIO_BUCKET` | `fnet-water-hub` | Target bucket name |
| `PAYMENT_PROVIDER` | `manual` (or `paystack`/`stripe`) | Payment processing driver |
| `NOTIFICATIONS_SMS_ENABLED` | `false` | Enable only if SMS gateway configured |
| `NOTIFICATIONS_EMAIL_ENABLED` | `false` | Enable only if SMTP / transactional email configured |
| `NOTIFICATIONS_WHATSAPP_ENABLED`| `false` | WhatsApp gateway toggle |

---

## 6. Automatic Database Migrations

In production, zero-downtime deployment requires schema migrations to run safely before the new container serves traffic.

This repository includes a production `docker-entrypoint.sh`:
```sh
#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "==> Running Prisma database migrations (deploy)..."
  npx prisma migrate deploy || {
    echo "==> Migration failed or database not ready yet."
    exit 1
  }
fi

echo "==> Starting application server..."
exec "$@"
```

### How it behaves in Coolify:
1. When Coolify deploys a new commit, it builds the standalone runner container.
2. The container starts and executes `npx prisma migrate deploy`.
3. If migrations succeed, `node server.js` boots on port 3000.
4. Coolify pings `/api/health`. Once healthy, the reverse proxy switches live traffic to the new container and disposes of the old one.
5. If a migration fails, the container exits with code `1`, Coolify halts the deployment, and the previous version remains online without downtime.

---

## 7. SSL / TLS & Reverse Proxy Setup

Coolify automatically generates and renews Let's Encrypt SSL certificates for domains assigned to containers.

### Recommended Settings in Coolify:
1. **Domains**: Set `https://hub.yourdomain.com` (Ensure the `https://` scheme is included).
2. **Ports Exposes**: `3000`.
3. **Healthcheck Path**: `/api/health`.
4. **HSTS**: Enable in Coolify proxy settings for A+ SSL rating.
5. **Reverse Proxy Headers**: Coolify's Traefik automatically forwards:
   - `X-Forwarded-For`: Required for audit logs (`lib/auth/dal.ts` and `AuditLog` table).
   - `X-Forwarded-Proto`: Ensures Next.js knows the connection is HTTPS for cookie flags (`secure=true`).

---

## 8. Automated Backups & Disaster Recovery

### PostgreSQL Database Backups
The database contains the financial ledgers, bottle accounts, inventory movements, and user records.

**Setting up automated backups in Coolify:**
1. Under your database resource in Coolify, open the **Backups** tab.
2. Enable **Scheduled Backups**.
3. Frequency: `0 2 * * *` (Daily at 2:00 AM UTC).
4. Storage Target: Select an S3-compatible bucket (e.g., Cloudflare R2 / AWS S3).
5. Retention: Retain daily backups for 30 days, monthly backups for 12 months.

### Object Storage Backups
MinIO/Silo persists files in the Docker named volume `fnet-water-hub_minio-data`.
- For enterprise disaster recovery, either replicate the volume using Coolify volume backups or use Cloudflare R2 / AWS S3 directly as the backend storage.

---

## 9. Post-Deployment Verification & Seeding Policy

> [!CAUTION]
> **NEVER run `npm run db:seed` in production.**
> The development seed command (`prisma/seed.ts`) executes `TRUNCATE` operations on all tables and creates dummy demo accounts with predictable passwords (`Fnet@2026`).

### 1. Verify Application Health
```bash
curl -I https://hub.yourdomain.com/api/health
# Expected: HTTP/2 200 OK
# Response: {"status":"ok"}
```

### 2. Create the Initial Administrator Account
Since you will not seed the database in production, create your real administrator account directly via the registration flow or via a one-time secure script:

1. Visit `https://hub.yourdomain.com/register` and register your administrative email and password.
2. Open the Coolify terminal for the `postgres` container or run via host:
   ```bash
   docker exec -it fnet-postgres psql -U fnet -d fnet_water_hub -c \
     "UPDATE \"User\" SET role = 'Administrator', status = 'Active' WHERE email = 'your-admin@yourdomain.com';"
   ```
3. Log in at `https://hub.yourdomain.com/login`. You will be directed to `/admin` with full system access.

---

## 10. Day-2 Operations & Troubleshooting

### Viewing Real-Time Logs
In Coolify:
- Click the **Logs** tab on the application service to inspect live access and error logs.
- Search for correlation IDs: When a user encounters an error, the system outputs a safe correlation ID (e.g., `err_1a2b3c4d`). Search that ID in the Coolify logs to inspect the full trace.

### Inspecting Database with Prisma Studio
To inspect data securely through an administrative GUI without exposing database ports:
```bash
docker exec -it fnet-app npx prisma studio --port 5555
```
Use an SSH tunnel to view it locally:
```bash
ssh -L 5555:localhost:5555 user@YOUR_SERVER_IP
```
Then browse to `http://localhost:5555`.

### Rolling Back a Release
If a code deployment causes issues:
1. In Coolify, open your application and navigate to the **Deployments** tab.
2. Select the previous stable deployment commit.
3. Click **Redeploy**.

---

*F Net Water Hub — Built with Next.js 16, TypeScript, PostgreSQL 16/17, Prisma 7, and Tailwind CSS.*
