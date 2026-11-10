# F Net Water Hub

> Ghana's premier automated water delivery, smart dispenser leasing, and fleet logistics management platform.

---

## Overview

**F Net Water Hub** is a full-stack, enterprise-grade water distribution platform engineered specifically for Ghanaian homes, corporate offices, and logistics teams. It streamlines pure water delivery, empty bottle return accounting, rent-to-own dispenser contracts with IoT telemetry, agent client onboarding, and automated Mobile Money payments.

---

## Key Capabilities

- **Refill Ordering & Checkout**: Seamless pure water refills (18.9L bottles and bottled packs) with Ghana Digital Address GPS resolution and Paystack checkout (MTN MoMo, Telecel Cash, AT Money, Debit/Credit Card, Bank).
- **Logistics & Dispatch**: Automated driver assignment, route sequencing, turn-by-turn customer stops, and point-of-delivery bottle return reconciliation.
- **Smart Dispenser Rent-to-Own**: 6, 12, and 24-month installment leasing plans with simulated IoT telemetry (water level %, filter life, tamper detection).
- **Referral & Agent Engine**: Client referral rewards (5 orders = 1 free refill credit) and dedicated field sales agent portal with automatic commission ledgers.
- **Notification Center & SMS Alerts**: Real-time in-app notification center and automated mNotify SMS dispatch for OTPs, order updates, and delivery confirmations.
- **Executive Analytics**: Interactive ApexCharts reporting on gross revenue, driver delivery efficiency, bottle circulation %, product sales mix, and RFC-4180 CSV exports.

---

## Tech Stack

- **Framework**: Next.js 15 (React 19, TypeScript, App Router) in Standalone Mode
- **Styling**: Tailwind CSS v4 with custom `#0057B8` brand theme & dark mode support
- **Database**: PostgreSQL 16 Alpine with Prisma ORM
- **Visualizations**: Dynamic ApexCharts (`react-apexcharts`)
- **Payments**: Paystack API (Mobile Money & Card) with HMAC-SHA512 webhook security
- **SMS**: mNotify Ghana SMS Gateway
- **Deployment**: Docker, Docker Compose & Coolify PaaS

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- Docker Desktop (or local PostgreSQL 16)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/samue/fnetWater.git
cd fnetWater

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database schema push and seed (if local PostgreSQL is active)
npx prisma db push
npx tsx prisma/seed.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment with Coolify

The repository is fully configured for automated self-hosted deployment on **Coolify** using Docker.

For the complete, step-by-step production runbook, see:
👉 [**COOLIFY_PRODUCTION_GUIDE.md**](./COOLIFY_PRODUCTION_GUIDE.md)

Quick deploy via Docker Compose:
```bash
docker compose -f docker-compose.coolify.yml up -d --build
```

---

## Automated Verification & Testing

The platform includes a comprehensive regression test suite covering all 12 modules:

```bash
# TypeScript compiler verification (0 errors)
npx tsc --noEmit

# Run full platform regression suite (224/224 tests passing)
npx tsx test-full-system-modules-1-to-12.ts

# Production Next.js build verification
npm run build
```

---

## Default Personas (For Review & Testing)

| Role | Email Identifier | Phone | Password | Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@fnetwater.com` | `0241000001` | `admin123` | `/admin` |
| **Manager** | `manager@fnetwater.com` | `0241000002` | `manager123` | `/manager` |
| **Driver** | `driver@fnetwater.com` | `0241000003` | `driver123` | `/driver` |
| **Agent** | `agent@fnetwater.com` | `0241000004` | `agent123` | `/agent` |
| **Customer** | `customer@fnetwater.com` | `0241000005` | `customer123` | `/customer` |

---

## Documentation Links

- [**Coolify Production Deployment Guide**](./COOLIFY_PRODUCTION_GUIDE.md)
- [**User Review Guide & Walkthroughs**](./USER_REVIEW_GUIDE.md)
- [**Master Development To-Do List**](./TODO_LIST.md)
