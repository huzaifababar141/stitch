# 🗄️ DATABASE SETUP GUIDE & MASTER DB SPECIFICATION
## Stitch — Centralized Custom Tailoring & Delivery Platform
### Complete Step-by-Step Guide for Teammates & System Specification

> **Written for:** Stitch Engineering Team  
> **Source Documents:** `07_MASTER_EXECUTION_PLAN.md` · `prisma/schema.prisma` · `04_DATABASE_SCHEMA.sql`  
> **Database Stack:** PostgreSQL 16 · Prisma ORM 5 · Redis 7 (BullMQ & Cache)  
> **Environments:** Local (Docker) → Staging (Neon.tech) → Production (Neon.tech)

---

## TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Understanding the 3-Environment Strategy](#2-understanding-the-3-environment-strategy)
3. [Step 1 — Start Local Database with Docker](#3-step-1--start-local-database-with-docker)
4. [Step 2 — Configure Environment Variables](#4-step-2--configure-environment-variables)
5. [Step 3 — Install Backend Dependencies](#5-step-3--install-backend-dependencies)
6. [Step 4 — Prisma ORM Setup](#6-step-4--prisma-orm-setup)
7. [Step 5 — Run Database Migration](#7-step-5--run-database-migration)
8. [Step 6 — Seed the Database](#8-step-6--seed-the-database)
9. [Step 7 — Verify the Setup](#9-step-7--verify-the-setup)
10. [Complete Schema Reference — All 22 Models Explained](#10-complete-schema-reference--all-22-models-explained)
11. [All 14 Enums Reference](#11-all-14-enums-reference)
12. [Validation Rules per Module](#12-validation-rules-per-module)
13. [Database Indexes & Performance Strategy](#13-database-indexes--performance-strategy)
14. [Redis Setup & BullMQ Queues](#14-redis-setup--bullmq-queues)
15. [Seed Data Reference](#15-seed-data-reference)
16. [Reset & Re-seed (Development Only)](#16-reset--re-seed-development-only)
17. [Test Database Setup](#17-test-database-setup)
18. [Production Setup — Neon.tech](#18-production-setup--neontech)
19. [Migration Rules & Conventions](#19-migration-rules--conventions)
20. [Common Errors & Fixes](#20-common-errors--fixes)
21. [Quick Command Reference Cheat Sheet](#21-quick-command-reference-cheat-sheet)

---

## 1. Prerequisites

Before starting, make sure these tools are installed and configured on your machine:

### 1.1 Required Tools

| Tool | Recommended Version | Check Command | Download Link |
|------|--------------------|---------------|---------------|
| **Node.js** | v20 LTS | `node --version` | https://nodejs.org |
| **npm** | v10+ | `npm --version` | (Included with Node.js) |
| **Docker Desktop** | Latest | `docker --version` | https://docker.com |
| **Git** | Any recent | `git --version` | https://git-scm.com |

### 1.2 Verify Docker Daemon Status

```bash
# This command must execute successfully before moving to step 1
docker ps
```
*If you receive a connection error ("Cannot connect to Docker daemon"), start Docker Desktop on your machine and wait until the status indicator turns green.*

### 1.3 Clone & Switch to Active Development Branch

```bash
git clone https://github.com/YOUR_USERNAME/stitch.git
cd stitch
git checkout develop
```

---

## 2. Understanding the 3-Environment Strategy

The Stitch platform uses **three isolated database environments**. Never mix connection strings or run development migrations against staging or production.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ENVIRONMENT   │  DATABASE NAME      │  INFRASTRUCTURE                      │
├────────────────┼─────────────────────┼──────────────────────────────────────┤
│  LOCAL (dev)   │  tailoring_db       │  Local Docker Container (PostgreSQL) │
│  STAGING       │  tailoring_staging  │  Neon.tech (Cloud PostgreSQL)        │
│  PRODUCTION    │  tailoring_prod     │  Neon.tech (Cloud PostgreSQL)        │
└────────────────┴─────────────────────┴──────────────────────────────────────┘

GOLDEN RULE: Never run `npx prisma migrate dev` directly against STAGING or PRODUCTION.
             Staging and Production migrations are executed via CI/CD pipelines using `prisma migrate deploy`.
```

---

## 3. Step 1 — Start Local Database with Docker

The `docker-compose.yml` located at the root of the workspace provisions **PostgreSQL 16**, **Redis 7**, and **pgAdmin 4**.

### 3.1 Launch Containers

Run the following command at the **root** of the monorepo:

```bash
docker-compose up -d
```

**Expected terminal output:**
```text
[+] Running 3/3
 ✔ Container tailoring_postgres  Started
 ✔ Container tailoring_redis     Started
 ✔ Container tailoring_pgadmin   Started
```

### 3.2 Confirm Container Health

```bash
docker ps
```

Verify that `tailoring_postgres` and `tailoring_redis` show `(healthy)` status.

### 3.3 Database & Redis Credentials

| Service | Setting | Local Development Value |
|---------|---------|-------------------------|
| **PostgreSQL** | Host | `localhost` |
| | Port | `5432` |
| | Database | `tailoring_db` |
| | User | `tailoring_user` |
| | Password | `localdev_password_123` |
| | Connection URL | `postgresql://tailoring_user:localdev_password_123@localhost:5432/tailoring_db` |
| **Redis** | Host / Port | `localhost:6379` |
| | Connection URL | `redis://localhost:6379` |
| **pgAdmin 4** | URL | `http://localhost:5050` |
| | Login Email | `admin@tailoring.local` |
| | Master Password | `admin123` |

---

## 4. Step 2 — Configure Environment Variables

The backend relies on Zod-validated environment configuration.

### 4.1 Create `.env` File

Navigate to the `backend` directory and copy the environment template:

```bash
cd backend
cp .env.example .env
```

### 4.2 Local `.env` Configuration File

Ensure your `backend/.env` contains the following values:

```env
# === SERVER ===
NODE_ENV=development
PORT=4000

# === DATABASE (LOCAL DOCKER) ===
DATABASE_URL=postgresql://tailoring_user:localdev_password_123@localhost:5432/tailoring_db

# === REDIS (LOCAL DOCKER) ===
REDIS_URL=redis://localhost:6379

# === JWT SECRETS ===
# Generate secure 64-character hex strings:
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=e4a7b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4
JWT_REFRESH_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === SECURITY & RATELIMIT ===
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# === APP URLS ===
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3000/admin

# === EXTERNAL SERVICES (MOCK OR SANDBOX IN DEV) ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PADDLE_API_KEY=your_paddle_sandbox_api_key
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
PADDLE_ENVIRONMENT=sandbox

JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/

EASYPAISA_ACCOUNT_NUM=your_account_number
EASYPAISA_HASH_KEY=your_hash_key
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_API_URL=https://easypay.easypaisa.com.pk/tpg/

RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.pk

WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

OPENAI_API_KEY=sk-your_openai_key
TCS_API_KEY=your_tcs_api_key
TCS_API_URL=https://api.tcsexpress.com/v1
```

---

## 5. Step 3 — Install Backend Dependencies

Inside the `backend` folder, install npm packages:

```bash
cd backend
npm install
```

---

## 6. Step 4 — Prisma ORM Setup

Prisma bridges the Node.js TypeScript API with PostgreSQL.

### 6.1 Generate Prisma Client

Generate type definitions from `backend/prisma/schema.prisma`:

```bash
npm run prisma:generate
```

### 6.2 PostgreSQL Extensions

The schema utilizes three PostgreSQL extensions defined in `schema.prisma`:
- `uuid-ossp`: For generating UUID v4 primary keys (`uuid_generate_v4()`).
- `pgcrypto`: Cryptographic functions.
- `pg_trgm`: Trigram-based fuzzy search for products and orders.

---

## 7. Step 5 — Run Database Migration

Apply the complete schema to your local PostgreSQL instance:

```bash
npm run prisma:migrate
```
When prompted for a migration name, enter: `init_complete_schema`.

---

## 8. Step 6 — Seed the Database

Populate the database with initial users, tailors, inspection agents, and platform configuration:

```bash
npm run prisma:seed
```

---

## 9. Step 7 — Verify the Setup

1. **Launch Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```
   Open **http://localhost:5555** in your browser to inspect database tables visually.

2. **Start Backend Server:**
   ```bash
   npm run dev
   ```

3. **Verify Health Endpoint:**
   ```bash
   curl http://localhost:4000/health
   ```
   *Expected response:* `{"status":"ok", ... "checks":{"database":{"status":"ok"},"redis":{"status":"ok"}}}`

---

## 10. Complete Schema Reference — All 22 Models Explained

### 1. `User` (`users`)
Central user table supporting role-based access for customers, tailors, admins, QC inspectors, and delivery agents.
- `id` (UUID, PK)
- `phone` (VarChar(20), Unique, Indexed): Primary login identifier (`+923XXXXXXXXX`).
- `email` (VarChar(255), Unique, Optional).
- `role` (`UserRole` Enum, Default: `customer`).
- `passwordHash` (String, Optional): Bcrypt hash for password access.
- `firstName`, `lastName`, `gender`, `dateOfBirth`, `profileImageUrl`.
- `isActive`, `isBlocked`, `blockedAt`, `blockReason`, `blockedById`.
- `referralCode` (VarChar(20), Unique): Referral program code.

### 2. `AuthToken` (`auth_tokens`)
Cryptographic token family rotation store for session refresh tokens.
- `id` (UUID, PK)
- `userId` (UUID, FK → `users.id`)
- `tokenHash` (String, Unique): SHA-256 hash of refresh token.
- `family` (UUID, Indexed): Token family ID to detect reuse/compromise.
- `isRevoked` (Boolean), `expiresAt` (Timestamptz), `deviceInfo` (JsonB).

### 3. `OtpCode` (`otp_codes`)
Stores short-lived, hashed OTP codes for SMS/phone verification.
- `id` (UUID, PK)
- `phone` (VarChar(20)), `email` (VarChar(255)).
- `codeHash` (String): Bcrypt hash of 6-digit OTP.
- `purpose` (VarChar(50)): `register`, `login`, `reset_password`.
- `attempts` (Int, Max 3), `isUsed` (Boolean), `expiresAt` (Timestamptz, 5 min TTL).

### 4. `Address` (`addresses`)
Delivery addresses associated with customer profiles.
- `id` (UUID, PK), `userId` (UUID, FK → `users.id`).
- `fullName`, `phone`, `addressLine1`, `addressLine2`, `landmark`, `city`, `province`, `postalCode`, `country`.
- `isDefault` (Boolean): Managed via transaction to ensure 1 default per user.

### 5. `MeasurementProfile` (`measurement_profiles`)
Customer body measurements measured in centimeters.
- `id` (UUID, PK), `userId` (UUID, FK → `users.id`), `label` (VarChar(100)).
- **Upper Body (cm):** `chest`, `waist`, `hips`, `shoulderWidth`, `backLength`, `frontLength`, `sleeveLength`, `armhole`, `bicep`, `wrist`, `neckCircumference`.
- **Lower Body (cm):** `trouserLength`, `thigh`, `knee`, `calf`, `ankle`, `trouserWaist`, `seat`.
- **Garment Specs:** `kameezLength`, `galaDepth`.
- **AI Validation:** `aiValidationScore` (Decimal), `aiFlags` (JsonB), `aiValidatedAt`.
- **Media & Versioning:** `photoUrls` (JsonB), `version` (Int), `previousVersionId` (FK → `measurement_profiles.id`).

### 6. `StyleConfiguration` (`style_configurations`)
Stitching preferences and design customization.
- `id` (UUID, PK), `userId` (UUID, FK → `users.id`, Optional).
- `garmentType` (`GarmentType` Enum).
- `galaStyle`, `sleeveStyle`, `sleeveHemStyle`, `kameezHemStyle`, `sideCutStyle`, `backStyle`, `trouserStyle`, `trouserHemStyle`.
- `liningRequired` (Boolean), `liningColor`, `embroideryOnGala`, `embroideryOnSleeve`, `embroideryNotes`, `specialInstructions`.

### 7. `Product` (`products`)
Products fetched and parsed from online fashion brand URLs.
- `id` (UUID, PK), `sourceUrl`, `normalizedUrl` (Indexed), `name`, `brand`, `description`, `images` (JsonB).
- `fabricType` (`FabricType` Enum), `garmentType` (`GarmentType` Enum), `priceOriginal`, `currencyOriginal`.

### 8. `Order` (`orders`)
Primary transactional entity encapsulating stitching contracts, assignment, snapshots, and financials.
- `id` (UUID, PK), `orderNumber` (VarChar(30), Unique, Indexed).
- `customerId` (UUID, FK → `users.id`), `productId` (FK → `products.id`, Optional).
- `garmentType` (`GarmentType` Enum), `status` (`OrderStatus` Enum, Default: `pending_payment`).
- **Snapshots:** `measurementSnapshot` (JsonB), `styleSnapshot` (JsonB), `productSnapshot` (JsonB), `deliveryAddressSnapshot` (JsonB).
- **Assignments:** `assignedTailorId` (FK → `users.id`), `assignedAt`, `stitchingDeadline`, `qcInspectorId` (FK → `users.id`), `qcResult`, `qcRetryCount`.
- **Financials:** `stitchingFee`, `deliveryFee`, `addonFee`, `discountAmount`, `totalAmount`, `isCod` (Boolean), `codCollected` (Boolean).

### 9. `OrderStatusHistory` (`order_status_history`)
Audit trail tracking every order status transition.
- `id` (UUID, PK), `orderId` (FK → `orders.id`), `fromStatus`, `toStatus`, `changedById`, `triggerType` (`AuditTriggerType` Enum), `notes`.

### 10. `Coupon` (`coupons`)
Promotional discount codes.
- `id` (UUID, PK), `code` (VarChar(50), Unique), `discountType` (`CouponType` Enum), `discountValue`, `minOrderAmount`, `maxDiscountAmount`, `usageLimit`, `usedCount`, `perUserLimit`, `validFrom`, `validUntil`, `isActive`.

### 11. `CouponUsage` (`coupon_usage`)
Records customer coupon redemptions.
- `id` (UUID, PK), `couponId` (FK → `coupons.id`), `userId` (FK → `users.id`), `orderId` (FK → `orders.id`), `discountApplied`.

### 12. `Payment` (`payments`)
Payment attempt records for online gateways and COD.
- `id` (UUID, PK), `orderId` (FK → `orders.id`), `customerId` (FK → `users.id`), `method` (`PaymentMethod` Enum), `status` (`PaymentStatus` Enum).
- `amount`, `idempotencyKey` (Unique), `gatewayTransactionId`, `gatewayResponse` (JsonB), `gatewayWebhookData` (JsonB).

### 13. `TailorProfile` (`tailor_profiles`)
Tailor performance, capacity metrics, and workload tracking.
- `id` (UUID, PK), `userId` (UUID, Unique, FK → `users.id`), `employeeId`.
- `skillLevel` (`TailorSkillLevel` Enum), `maxDailyCapacity` (Int), `currentActiveOrders` (Int), `totalOrdersCompleted`, `totalOrdersRejectedQc`.
- `qualityScore` (Decimal(3,2)), `onTimeRate` (Decimal(5,4)), `isAvailable` (Boolean).

### 14. `Delivery` (`deliveries`)
Logistics and shipment tracking records.
- `id` (UUID, PK), `orderId` (UUID, Unique, FK → `orders.id`), `deliveryAgentId` (FK → `users.id`).
- `courierName` (Default: `TCS`), `trackingNumber` (Unique, Indexed), `status` (`DeliveryStatus` Enum).
- `podImageUrl`, `podSignatureUrl`, `podNotes`, `courierBookingId`.

### 15. `DeliveryStatusHistory` (`delivery_status_history`)
Courier event log history.
- `id` (UUID, PK), `deliveryId` (FK → `deliveries.id`), `status`, `locationName`, `locationCity`, `source`, `courierData` (JsonB).

### 16. `Notification` (`notifications`)
Multi-channel notification logs (WhatsApp, SMS, Email, Push, In-App).
- `id` (UUID, PK), `userId` (FK → `users.id`), `orderId` (FK → `orders.id`, Optional).
- `channel` (`NotificationChannel` Enum), `status` (`NotificationStatus` Enum), `templateKey`, `subject`, `body`, `scheduledAt`, `retryCount`.

### 17. `OrderFeedback` (`order_feedback`)
Post-delivery customer ratings and reviews.
- `id` (UUID, PK), `orderId` (UUID, Unique, FK → `orders.id`), `customerId`, `tailorId`.
- `overallRating`, `qualityRating`, `deliveryRating`, `fitRating`, `measurementRating`, `comment`, `images` (JsonB), `isPublic`.

### 18. `Referral` (`referrals`)
Referral reward distribution history.
- `id` (UUID, PK), `referrerId` (FK → `users.id`), `refereeId` (Unique, FK → `users.id`), `qualifyingOrderId` (Unique, FK → `orders.id`), `rewardAmount`, `rewardGiven`.

### 19. `AuditLog` (`audit_logs`)
System-wide security audit log.
- `id` (UUID, PK), `userId`, `action`, `entityType`, `entityId`, `oldData` (JsonB), `newData` (JsonB), `ipAddress`, `userAgent`.

### 20. `AiLog` (`ai_logs`)
OpenAI API interaction tracking.
- `id` (UUID, PK), `userId`, `orderId`, `feature`, `modelUsed`, `inputTokens`, `outputTokens`, `totalCostUsd`, `latencyMs`, `success`.

### 21. `SystemSetting` (`system_settings`)
Global dynamic configuration parameters.
- `key` (VarChar(200), PK), `value` (JsonB), `description`, `isPublic` (Boolean).

---

## 11. All 14 Enums Reference

1. **`UserRole`**: `customer`, `admin`, `tailor`, `qc_inspector`, `delivery_agent`, `super_admin`
2. **`OrderStatus`**: `pending_payment`, `payment_confirmed`, `assigned`, `in_stitching`, `stitching_complete`, `qc_pending`, `qc_approved`, `qc_rejected`, `dispatched`, `in_transit`, `out_for_delivery`, `delivered`, `return_requested`, `returned`, `cancelled`, `refunded`
3. **`PaymentStatus`**: `pending`, `processing`, `completed`, `failed`, `refunded`, `partially_refunded`, `disputed`
4. **`PaymentMethod`**: `paddle`, `jazzcash`, `easypaisa`, `bank_transfer`, `cod`
5. **`QcResult`**: `approved`, `rejected`, `needs_minor_fix`
6. **`DeliveryStatus`**: `pending`, `ready_for_pickup`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed_attempt`, `returned_to_sender`
7. **`NotificationChannel`**: `email`, `sms`, `whatsapp`, `push`, `in_app`
8. **`NotificationStatus`**: `pending`, `queued`, `sent`, `delivered`, `read`, `failed`
9. **`TailorSkillLevel`**: `junior`, `mid`, `senior`, `master`
10. **`GarmentType`**: `kameez`, `trouser`, `dupatta`, `kurta`, `shalwar`, `full_suit`, `kameez_only`, `trouser_only`, `other`
11. **`FabricType`**: `cotton`, `lawn`, `chiffon`, `silk`, `linen`, `khaddar`, `karandi`, `organza`, `georgette`, `other`
12. **`CouponType`**: `percentage`, `fixed_amount`, `free_delivery`
13. **`AuditTriggerType`**: `manual`, `system`, `webhook`, `ai`
14. **`Gender`**: `male`, `female`, `other`, `prefer_not_to_say`

---

## 12. Validation Rules per Module

Validation schemas are constructed using **Zod** (`src/modules/*/*.validator.ts`).

- **Phone Numbers:** Must match Pakistani format `^\+92[0-9]{10}$` (e.g. `+923001234567`).
- **OTP Codes:** Exact 6 digits `^[0-9]{6}$`.
- **Measurements:** Numeric inputs bounded between `10.0` cm and `200.0` cm.
- **Pricing:** Server-calculated only. Front-end pricing is ignored during order creation. Base fees: `full_suit`: 3500 PKR, `kameez`: 2200 PKR, `trouser`: 1500 PKR. Delivery: 250 PKR (metropolitan), 350 PKR (other).

---

## 13. Database Indexes & Performance Strategy

Key composite and single-column indexes:
- `users(phone)`, `users(email)`, `users(role)`
- `auth_tokens(token_hash)`, `auth_tokens(family)`
- `orders(customer_id)`, `orders(status)`, `orders(assigned_tailor_id)`, `orders(order_number)`
- `tailor_profiles(is_available, current_active_orders)`
- `deliveries(tracking_number)`

---

## 14. Redis Setup & BullMQ Queues

Five BullMQ queues are initialized in `src/jobs/queues.ts`:
1. `notification-queue`: Handles WhatsApp, SMS, and Email dispatch.
2. `order-assignment-queue`: Smart tailor matching algorithm execution.
3. `delivery-sync-queue`: TCS tracking status polling.
4. `deadline-monitor-queue`: Checks approaching stitching deadlines every 30 mins.
5. `analytics-queue`: Daily operational aggregate calculations.

---

## 15. Seed Data Reference

`prisma/seed.ts` creates default system credentials:

| Account Role | Phone / Email | Default Password |
|--------------|---------------|------------------|
| **Super Admin** | `+923001111111` / `admin@tailoring.local` | `Admin@123456` |
| **Operations Admin** | `+923001111112` / `ops@tailoring.local` | `Admin@123456` |
| **Senior Tailor (Ahmed Ali)** | `+923002222221` | `Admin@123456` |
| **Mid Tailor (Hassan Khan)** | `+923002222222` | `Admin@123456` |
| **QC Inspector (Fatima Malik)**| `+923003333333` | `Admin@123456` |
| **Delivery Agent (Usman Dar)** | `+923004444444` | `Admin@123456` |

---

## 16. Reset & Re-seed (Development Only)

To wipe development data and re-seed clean state:

```bash
npm run prisma:reset
```
*Note: This command checks `NODE_ENV` and will fail if executed in `production`.*

---

## 17. Test Database Setup

Integration tests use an isolated test database `tailoring_test_db`.

1. Create test DB:
   ```bash
   docker exec -it tailoring_postgres psql -U tailoring_user -d postgres -c "CREATE DATABASE tailoring_test_db;"
   ```
2. Run test migrations:
   ```bash
   DATABASE_URL=postgresql://tailoring_user:localdev_password_123@localhost:5432/tailoring_test_db npx prisma migrate deploy
   ```
3. Execute Test Suite:
   ```bash
   npm test
   ```

---

## 18. Production Setup — Neon.tech

1. Create a project on [Neon.tech](https://neon.tech) (PostgreSQL 16).
2. Create two database branches: `staging` and `main` (production).
3. Append `?sslmode=require` to your Neon connection strings.
4. Execute deployment migrations in CI/CD using `npx prisma migrate deploy`.

---

## 19. Migration Rules & Conventions

- Use descriptive snake_case migration names (e.g. `npx prisma migrate dev --name add_qc_notes_field`).
- Never edit existing migration files in `prisma/migrations/`.
- Never run `prisma migrate dev` against staging or production databases.

---

## 20. Common Errors & Fixes

- **`P1001: Can't reach database server`**: Ensure Docker container is running (`docker-compose up -d`).
- **`P3009: migrate found failed migrations`**: Resolve using `npx prisma migrate resolve --rolled-back <migration_name>`.
- **`JWT Secret Warning`**: Ensure `JWT_ACCESS_SECRET` is set in `.env`.

---

## 21. Quick Command Reference Cheat Sheet

```bash
# Docker Operations
docker-compose up -d             # Start DB, Redis, pgAdmin
docker-compose down              # Stop containers
docker-compose down -v           # WIPE containers and data volumes

# Database Operations (from /backend)
npm run prisma:generate         # Generate Prisma Client
npm run prisma:migrate          # Create and apply dev migration
npm run prisma:seed             # Populate seed data
npm run prisma:studio           # GUI Data Browser (http://localhost:5555)

# Development Server
npm run dev                     # Start Express API Server (http://localhost:4000)
```

---
*Document Version 1.0 · Centralized Custom Tailoring Platform (Stitch)*
