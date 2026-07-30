# 🗺️ MASTER EXECUTION PLAN — v2.0
## Centralized Custom Tailoring & Delivery Platform
## Stack: Next.js 14 (Full-Stack) + Supabase
### Converted from: Node.js/Express + Railway + Neon + Redis
### Timeline: 14 Weeks | One Repo | One Platform

---

## WHAT IS DONE (Blueprints — All Still Valid)

| # | Document | Status | Still Used? |
|---|----------|--------|-------------|
| 01 | Market Analysis (Pakistani Psychology + GTM) | ✅ Done | ✅ 100% |
| 02 | Complete System Architecture Blueprint | ✅ Done | ✅ Reference only |
| 03 | Universal Startup Template | ✅ Done | ✅ 100% |
| 04 | Full Database Schema (SQL) | ✅ Done | ✅ Run directly in Supabase |
| 05 | Security Checklist | ✅ Done | ✅ 100% |
| 06 | Prisma Schema | ✅ Done | ✅ Still used with Supabase |

---

## WHY WE SWITCHED — HONEST COMPARISON

```
OLD STACK (Tasks 001–017 were built on this):
  Next.js (Vercel) + Express API (Railway) + PostgreSQL (Neon) + Redis (Upstash)
  ❌ 4 platforms to manage
  ❌ Separate backend repo/folder
  ❌ Custom JWT + auth code = 300+ lines written from scratch
  ❌ Socket.io = separate Redis pub/sub setup
  ❌ Railway free tier is limited and expires

NEW STACK:
  Next.js 14 Full-Stack (Vercel) + Supabase
  ✅ 2 platforms only (Vercel + Supabase)
  ✅ ONE repo, API routes inside Next.js
  ✅ Supabase Auth = zero auth code to write
  ✅ Supabase Realtime = zero Socket.io setup
  ✅ Supabase Storage = replaces Cloudinary for most things
  ✅ Same PostgreSQL database (same schema, nothing changes)
  ✅ Supabase Edge Functions = replaces BullMQ/Redis for background jobs
  ✅ Free tier is more generous and doesn't expire
```

---

## NEW ARCHITECTURE (Simple Version)

```
┌─────────────────────────────────────────────────────────┐
│                    ONE NEXT.JS APP                       │
│                                                          │
│  /app              → All frontend pages (React)          │
│  /app/api          → All backend API routes              │
│  /lib/supabase     → Database client                     │
│  /lib/validations  → Zod schemas (shared)                │
│                                                          │
│  Deployed on: VERCEL (free tier)                         │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ Supabase Client / Server SDK
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      SUPABASE                            │
│                                                          │
│  PostgreSQL      → Same schema, same Prisma models       │
│  Auth            → OTP phone login, session management   │
│  Realtime        → Live order status updates             │
│  Storage         → Images, measurement photos, QC pics   │
│  Edge Functions  → Background jobs (tailor assignment,   │
│                    delivery sync, deadline monitor)       │
│                                                          │
│  Free Tier: 500MB DB, 1GB storage, 200 realtime conns   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  EXTERNAL SERVICES                        │
│                                                          │
│  Paddle          → Payments (cards/international)        │
│  JazzCash        → Local Pakistani payments              │
│  EasyPaisa       → Local Pakistani payments              │
│  WhatsApp API    → Customer notifications (free tier)    │
│  Resend          → Email notifications (free tier)       │
│  TCS API         → Courier & delivery tracking           │
│  OpenAI API      → Measurement validation + chatbot      │
│  Upstash Redis   → Rate limiting ONLY (tiny free tier)   │
└─────────────────────────────────────────────────────────┘
```

---

## NEW FOLDER STRUCTURE (ONE REPO)

```
tailoring-platform/               ← root (one repo, no backend/ folder)
├── app/
│   ├── (auth)/                   ← Login, Register, OTP
│   ├── (customer)/               ← Customer dashboard, orders, measurements
│   ├── (admin)/                  ← Admin command center
│   ├── (tailor)/                 ← Tailor panel
│   ├── (qc)/                     ← QC inspector panel
│   ├── (delivery)/               ← Delivery agent panel
│   └── api/                      ← ALL backend logic lives here
│       ├── auth/                 ← (mostly handled by Supabase)
│       ├── users/
│       ├── measurements/
│       ├── orders/
│       ├── payments/
│       ├── admin/
│       ├── tailors/
│       ├── qc/
│       ├── delivery/
│       ├── ai/
│       ├── notifications/
│       └── webhooks/             ← Paddle, JazzCash, TCS, WhatsApp
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← Browser client
│   │   ├── server.ts             ← Server client (API routes)
│   │   └── admin.ts              ← Admin client (service role)
│   ├── validations/              ← All Zod schemas (shared frontend+backend)
│   ├── utils/
│   └── types/                    ← All TypeScript types
├── components/
│   ├── ui/                       ← shadcn/ui components
│   ├── measurement-studio/
│   ├── order-tracking/
│   └── admin/
├── hooks/                        ← React hooks
├── stores/                       ← Zustand stores
├── supabase/
│   ├── migrations/               ← SQL migration files
│   ├── functions/                ← Edge Functions (background jobs)
│   │   ├── assign-tailor/
│   │   ├── sync-delivery/
│   │   ├── monitor-deadlines/
│   │   └── send-notifications/
│   └── seed.sql                  ← Seed data
├── .github/
│   └── workflows/
│       ├── ci-develop.yml
│       ├── ci-staging.yml
│       └── ci-main.yml
├── middleware.ts                  ← Next.js middleware (auth protection)
├── .env.local.example
└── package.json
```

---

## BRANCH & ENVIRONMENT STRATEGY (Same as Before)

```
BRANCHES — unchanged, same rules:

  main      → Production (live users, real data)
              Deploys to: Vercel (production)
              Database: Supabase PRODUCTION project
              Protected: No direct push. PR from staging only.

  staging   → Client preview + QA
              Deploys to: Vercel (preview URL)
              Database: Supabase STAGING project (separate project)
              Protected: PR from develop only.

  develop   → Active development
              Runs locally with: Supabase local CLI
              Database: LOCAL Supabase (Docker-based, built into Supabase CLI)
              All feature branches target develop.

FLOW (unchanged):
  feature/xxx → develop → staging (PR) → main (PR)

DATABASES — Now Supabase instead of Neon:
  LOCAL     → Supabase CLI local instance (replaces Docker PostgreSQL)
  STAGING   → Supabase project: tailoring-staging
  PRODUCTION → Supabase project: tailoring-prod

KEY CHANGE from old plan:
  ❌ No more docker-compose.yml for PostgreSQL
  ❌ No more Upstash Redis for BullMQ (just for rate limiting)
  ✅ Supabase CLI runs local DB: `supabase start`
  ✅ Supabase migrations replace Prisma migrations for DB structure
  ✅ Prisma still used for type-safe queries in API routes
```

---

## NEW TECH STACK (Complete)

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 14** (App Router) | Full-stack, SSR, API routes, one deployment |
| Database | **Supabase** (PostgreSQL) | Free, Auth built-in, Realtime built-in |
| Auth | **Supabase Auth** | OTP phone login, sessions, zero custom code |
| ORM | **Prisma** (with Supabase) | Same schema, type-safe queries in API routes |
| Realtime | **Supabase Realtime** | Live order tracking, no Socket.io needed |
| File Storage | **Supabase Storage** | Images, photos, POD uploads |
| Background Jobs | **Supabase Edge Functions** | Replaces BullMQ + Redis |
| State Management | **Zustand** | Lightweight, perfect for Next.js |
| Data Fetching | **TanStack Query v5** | Cache, background refetch |
| Forms | **React Hook Form + Zod** | Type-safe, validated |
| UI Components | **shadcn/ui + Tailwind CSS** | Fully customizable |
| Animations | **Framer Motion** | Measurement studio flow |
| Payments | **Paddle + JazzCash + EasyPaisa** | International + local |
| Email | **Resend** | 3000 free emails/month |
| WhatsApp | **Meta WhatsApp Cloud API** | Primary notification channel |
| Courier | **TCS Express API** | Delivery tracking |
| AI | **OpenAI GPT-4o-mini** | Measurement validation, chatbot |
| Rate Limiting | **Upstash Redis** | Only thing Redis is used for now |
| Deployment | **Vercel** | Only platform needed |
| Monitoring | **Vercel Analytics + Better Stack** | Free tier |

---

## SUPABASE FREE TIER (What We Get)

| Feature | Free Limit | Our Usage |
|---------|-----------|-----------|
| PostgreSQL | 500MB storage | Enough for 50K+ orders |
| Auth users | Unlimited | ✅ |
| Realtime connections | 200 concurrent | ✅ for launch |
| Storage | 1GB | ✅ for launch |
| Edge Functions | 500K invocations/month | ✅ |
| API requests | Unlimited | ✅ |
| Supabase projects | 2 (free tier) | ✅ staging + prod |

---

## PHASE OVERVIEW (14 Weeks)

```
PHASE C — Convert Old Work     Week 1–2    (Tasks C01–C17)
           (Tasks 001-017 → Supabase/Next.js equivalents)

PHASE 0 — Environment Setup    Week 1      (Tasks 001–005)
           INSIDE Phase C — runs parallel

PHASE 1 — Foundation           Week 2      (Tasks 006–008)
PHASE 2 — Auth & Users         Week 3      (Tasks 009–011)
PHASE 3 — Core Order Flow      Weeks 3–5   (Tasks 012–016)
PHASE 4 — Admin + Operations   Weeks 5–7   (Tasks 017–021)
PHASE 5 — Payments             Week 7–8    (Tasks 022–024)
PHASE 6 — Delivery             Week 8      (Tasks 025–026)
PHASE 7 — Notifications        Week 9      (Tasks 027–028)
PHASE 8 — AI Integration       Week 9–10   (Tasks 029–030)
PHASE 9 — Frontend Pages       Weeks 7–12  (Tasks 031–040)
PHASE 10 — Testing             Week 13     (Tasks 041–043)
PHASE 11 — Launch Prep         Week 14     (Tasks 044–046)
```

---

## ═══════════════════════════════════════════════════
## PHASE C — CONVERSION (Tasks 001–017 → New Stack)
## ═══════════════════════════════════════════════════
### Goal: Remove old backend/ folder, old docker-compose, old CI/CD.
### Rebuild everything equivalent using Next.js API routes + Supabase.
### The LOGIC from old tasks stays — only the technology layer changes.

---

### TASK-C01 — Clean Up Old Structure & Re-Init Repo
```
WHAT YOU (THE DEVELOPER) DO MANUALLY:

You currently have (from old Tasks 001-002):
  tailoring-platform/
  ├── backend/      ← DELETE THIS ENTIRE FOLDER
  ├── frontend/     ← DELETE THIS ENTIRE FOLDER
  ├── mobile/       ← KEEP (will use later)
  ├── docker-compose.yml  ← DELETE
  ├── Makefile            ← DELETE
  └── .github/workflows/  ← KEEP (will rewrite)

STEPS:
1. Make sure you are on develop branch:
   git checkout develop

2. Delete old folders:
   rm -rf backend/
   rm -rf frontend/
   rm -f docker-compose.yml
   rm -f Makefile

3. Create new root structure:
   mkdir -p app lib components hooks stores supabase/.github/workflows

4. Commit the cleanup:
   git add -A
   git commit -m "chore: remove Express backend, convert to Next.js + Supabase monolith"
   git push origin develop

RESULT:
  Clean repo, ready for Next.js full-stack project at root level.
```

---

### TASK-C02 — Next.js 14 Full-Stack Project Init (Replaces TASK-004 + TASK-006)
```
PASTE THIS TASK TO AI:

"Initialize a production-ready Next.js 14 full-stack application at the ROOT of
the repository (not in a subfolder). This replaces a separate Express backend
and Next.js frontend — everything is in one Next.js project.

CONTEXT: This is a custom tailoring platform for Pakistan. Stack is
Next.js 14 + Supabase + Prisma + Tailwind + shadcn/ui.

1. Run at repo root:
   npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'
   (the '.' means current directory)

2. Install ALL dependencies:

   CORE:
   npm install @supabase/supabase-js @supabase/ssr
   npm install @prisma/client prisma
   npm install zod react-hook-form @hookform/resolvers
   npm install zustand
   npm install @tanstack/react-query @tanstack/react-query-devtools
   npm install axios
   npm install framer-motion
   npm install date-fns
   npm install clsx tailwind-merge class-variance-authority
   npm install lucide-react
   npm install @paddle/paddle-js
   npm install resend
   npm install winston
   npm install ioredis (Upstash Redis for rate limiting only)
   npm install @upstash/ratelimit @upstash/redis

   SHADCN UI — run these:
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input label card badge
   npx shadcn-ui@latest add dialog sheet dropdown-menu
   npx shadcn-ui@latest add toast toaster select tabs
   npx shadcn-ui@latest add progress avatar separator
   npx shadcn-ui@latest add table form textarea

   DEV:
   npm install -D @types/node typescript jest @types/jest ts-jest
   npm install -D eslint-config-next @typescript-eslint/eslint-plugin
   npm install -D prettier eslint-config-prettier
   npm install -D @commitlint/cli @commitlint/config-conventional
   npm install -D husky lint-staged
   npm install -D supabase (Supabase CLI)

3. Create tsconfig.json with:
   {
     'compilerOptions': {
       'target': 'ES2022',
       'lib': ['dom', 'dom.iterable', 'esnext'],
       'allowJs': true,
       'skipLibCheck': true,
       'strict': true,
       'noEmit': true,
       'esModuleInterop': true,
       'module': 'esnext',
       'moduleResolution': 'bundler',
       'resolveJsonModule': true,
       'isolatedModules': true,
       'jsx': 'preserve',
       'incremental': true,
       'plugins': [{ 'name': 'next' }],
       'paths': { '@/*': ['./src/*'] }
     }
   }

4. Create package.json scripts:
   'dev': 'next dev',
   'build': 'next build',
   'start': 'next start',
   'lint': 'next lint',
   'format': 'prettier --write .',
   'type-check': 'tsc --noEmit',
   'test': 'jest --runInBand',
   'test:watch': 'jest --watch',
   'test:routes': 'jest --testPathPattern=route-validator',
   'test:security': 'jest --testPathPattern=security',
   'db:generate': 'prisma generate',
   'db:push': 'prisma db push',
   'db:studio': 'prisma studio',
   'supabase:start': 'supabase start',
   'supabase:stop': 'supabase stop',
   'supabase:reset': 'supabase db reset',
   'supabase:migrate': 'supabase db push',
   'supabase:functions:serve': 'supabase functions serve'

5. Create tailwind.config.ts with brand colors:
   primary: '#1B2B5E'     (deep navy)
   secondary: '#C9A84C'   (gold)
   accent: '#F5F0E8'      (cream)
   success: '#2D7A4F'
   warning: '#D97706'
   danger: '#DC2626'
   background: '#FAFAF8'

6. Create .prettierrc:
   { 'semi': true, 'singleQuote': true, 'tabWidth': 2, 'trailingComma': 'es5' }

7. Create .eslintrc.json with Next.js + TypeScript rules

8. Create commitlint.config.js for conventional commits

9. Set up husky pre-commit: lint-staged running eslint + prettier

10. Create root .gitignore:
    node_modules/, .next/, .env*.local, .env,
    dist/, coverage/, *.log, .DS_Store,
    supabase/.branches/, supabase/.temp/

Show all complete file contents."
```

---

### TASK-C03 — Supabase Project Setup & Local Dev (Replaces TASK-003 Docker)
```
PASTE THIS TASK TO AI:

"Set up Supabase for a Next.js 14 project. This replaces the old docker-compose.yml
approach. Supabase CLI runs a local Supabase instance (PostgreSQL + Auth + Storage
+ Realtime) in Docker automatically.

1. Initialize Supabase at project root:
   npx supabase init
   This creates: supabase/config.toml

2. Create supabase/config.toml with these settings:
   project_id = 'tailoring-platform'

   [api]
   port = 54321
   schemas = ['public', 'storage', 'auth']

   [db]
   port = 54322
   major_version = 15

   [studio]
   port = 54323        ← Supabase Studio (visual DB browser, like pgAdmin)

   [inbucket]
   port = 54324        ← Local email testing

   [auth]
   site_url = 'http://localhost:3000'
   additional_redirect_urls = ['http://localhost:3000']
   jwt_expiry = 900    ← 15 minutes (same as our old access token)
   enable_phone_signup = true
   enable_phone_autoconfirm = false    ← We send OTP ourselves

   [auth.sms.twilio]
   enabled = false     ← We use WhatsApp, not SMS for now

3. Create three Supabase client files:

   src/lib/supabase/client.ts:
   'use client'
   import { createBrowserClient } from '@supabase/ssr'
   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }

   src/lib/supabase/server.ts:
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   export function createClient() {
     const cookieStore = cookies()
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       { cookies: { get(name) { return cookieStore.get(name)?.value } } }
     )
   }

   src/lib/supabase/admin.ts:
   ← Uses SERVICE_ROLE_KEY (never expose to client)
   ← Used only in API routes for privileged operations
   import { createClient } from '@supabase/supabase-js'
   export const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     { auth: { autoRefreshToken: false, persistSession: false } }
   )

4. Create src/lib/prisma.ts:
   ← Prisma still used for type-safe DB queries in API routes
   import { PrismaClient } from '@prisma/client'
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
   export const prisma = globalForPrisma.prisma ?? new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
   })
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ← Singleton pattern prevents too many connections in Next.js dev mode

5. Create .env.local.example with ALL required variables:

   # === SUPABASE ===
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key-from-supabase-start
   SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key-from-supabase-start
   SUPABASE_JWT_SECRET=your-local-jwt-secret-from-supabase-start

   # === DATABASE (Prisma connects to Supabase PostgreSQL) ===
   DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

   # === UPSTASH REDIS (rate limiting only) ===
   UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token

   # === PADDLE ===
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-paddle-client-token
   PADDLE_API_KEY=your-paddle-api-key
   PADDLE_WEBHOOK_SECRET=your-webhook-secret
   PADDLE_ENVIRONMENT=sandbox

   # === JAZZCASH ===
   JAZZCASH_MERCHANT_ID=your-merchant-id
   JAZZCASH_PASSWORD=your-password
   JAZZCASH_INTEGRITY_SALT=your-salt
   JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/

   # === EASYPAISA ===
   EASYPAISA_ACCOUNT_NUM=your-account
   EASYPAISA_HASH_KEY=your-key
   EASYPAISA_STORE_ID=your-store-id

   # === RESEND ===
   RESEND_API_KEY=re_your-key
   RESEND_FROM_EMAIL=noreply@yourdomain.pk

   # === WHATSAPP ===
   WHATSAPP_API_TOKEN=your-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-id
   WHATSAPP_VERIFY_TOKEN=your-verify-token

   # === OPENAI ===
   OPENAI_API_KEY=sk-your-key

   # === TCS ===
   TCS_API_KEY=your-tcs-key
   TCS_API_URL=https://api.tcsexpress.com/v1
   TCS_MOCK=true

   # === APP ===
   NEXT_PUBLIC_APP_URL=http://localhost:3000

6. Show exact commands to start local development:
   npx supabase start   ← starts local Supabase (PostgreSQL + Studio + Auth)
   npm run dev          ← starts Next.js

   After supabase start, it prints the local keys — copy them to .env.local

Show complete file content for all files."
```

---

### TASK-C04 — Database Migration: SQL Schema into Supabase (Replaces TASK-009)
```
PASTE THIS TASK TO AI:

"We have a complete PostgreSQL schema already written (in 04_DATABASE_SCHEMA.sql).
We need to convert it into Supabase migrations and also update the Prisma schema
to connect to Supabase PostgreSQL.

CONTEXT:
- Our complete SQL schema is already defined with all tables, enums, indexes,
  triggers, and functions.
- Supabase uses PostgreSQL so the schema works as-is.
- We need to organize it as Supabase migration files.
- Prisma schema (06_prisma_schema.prisma) is already complete.

DO THIS:

1. Create supabase/migrations/20250101000000_init_complete_schema.sql:
   Copy the ENTIRE content of our 04_DATABASE_SCHEMA.sql into this file.
   This is the single initial migration.
   Note: Remove any 'CREATE DATABASE' statements — Supabase handles that.

2. Create supabase/migrations/20250101000001_rls_policies.sql:
   Add Row Level Security (RLS) policies for Supabase:

   ← Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
   ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;

   ← Customers can only see their own data
   CREATE POLICY 'users_own_data' ON users
     FOR ALL USING (auth.uid()::text = id::text);

   CREATE POLICY 'customers_own_orders' ON orders
     FOR SELECT USING (auth.uid()::text = customer_id::text);

   CREATE POLICY 'customers_create_orders' ON orders
     FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

   CREATE POLICY 'customers_own_measurements' ON measurement_profiles
     FOR ALL USING (auth.uid()::text = user_id::text);

   CREATE POLICY 'customers_own_addresses' ON addresses
     FOR ALL USING (auth.uid()::text = user_id::text);

   ← Admins can see everything (uses service role key, bypasses RLS)
   ← API routes using supabaseAdmin bypass RLS entirely

3. Create supabase/seed.sql:
   INSERT seed data for local development:
   - Same users as old TASK-009 seed (admin, tailors, QC, delivery agent, test customers)
   - System settings
   - Use raw SQL INSERTs (not Prisma, to work with Supabase CLI)

4. Update prisma/schema.prisma:
   Change datasource db to point to Supabase PostgreSQL:
   datasource db {
     provider  = 'postgresql'
     url       = env('DATABASE_URL')
     directUrl = env('DIRECT_URL')   ← needed for Supabase connection pooling
   }
   Add DIRECT_URL to .env.local.example:
   DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres

5. Show the exact commands to:
   a. Start local Supabase: supabase start
   b. Apply migrations: supabase db reset (applies all migrations + seed)
   c. Generate Prisma client: npx prisma generate
   d. Open Supabase Studio: http://localhost:54323 (browser)
   e. Verify tables exist in Studio

Show complete file content for migration and seed files."
```

---

### TASK-C05 — Global Middleware, Error Handling & Utilities (Replaces TASK-005 + TASK-010)
```
PASTE THIS TASK TO AI:

"Create all shared utilities, error handling, and middleware for a Next.js 14
App Router project using Supabase. These replace the old Express middleware files.

In Next.js App Router:
- There is NO Express middleware (no helmet, no morgan, no cors setup)
- Security headers are set in next.config.js
- Rate limiting happens in Next.js middleware.ts
- Error handling happens in error.tsx and try/catch in API routes

CREATE THESE FILES:

1. next.config.js with security headers:
   Add headers() function with:
   Content-Security-Policy (appropriate for Next.js + Supabase)
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=()
   Strict-Transport-Security: max-age=31536000; includeSubDomains

2. src/middleware.ts (Next.js middleware — runs on EVERY request):
   - Import createServerClient from @supabase/ssr
   - Refresh Supabase session (so auth tokens stay fresh)
   - Protect routes by role:
     /admin/* → requires admin or super_admin role
     /tailor/* → requires tailor role
     /qc/* → requires qc_inspector role
     /delivery/* → requires delivery_agent role
     /dashboard, /orders, /measurements, /new-order → requires any authenticated user
   - Public routes (no auth): /, /login, /register, /track/[id], /api/webhooks/*
   - On unauthorized: redirect to /login with ?redirect= param
   - On wrong role: redirect to their correct dashboard

3. src/lib/utils/response.ts:
   Standard API response helpers for Next.js API routes (Response object based):
   - apiSuccess(data, status = 200): NextResponse
   - apiError(code, message, status, details?): NextResponse
   - apiPaginated(data, total, page, limit): NextResponse
   All return NextResponse.json() with our standard shape:
   { success, data?, error?: { code, message, details? }, meta?, timestamp }

4. src/lib/utils/errors.ts:
   AppError class same as before but for Next.js:
   - Same static factory methods: badRequest, unauthorized, forbidden,
     notFound, conflict, unprocessable, tooManyRequests, internal
   - handleApiError(error, request): NextResponse
     Catches AppError, Prisma errors, Zod errors, maps to correct response
     Never exposes stack traces in production

5. src/lib/utils/validation.ts:
   - validateBody<T>(request, schema: ZodSchema<T>): Promise<T>
     Reads request.json(), validates with Zod, throws AppError on failure
   - validateParams(params, schema): validated params
   - validateQuery(searchParams, schema): validated query

6. src/lib/utils/auth.ts:
   Server-side auth helpers for API routes:
   - getAuthUser(request): gets current user from Supabase session
   - requireAuth(request): same but throws 401 if not authenticated
   - requireRole(request, ...roles): throws 403 if wrong role
   - getFullUser(userId): fetches user with profile from DB using Prisma

7. src/lib/utils/rate-limit.ts:
   Rate limiting using @upstash/ratelimit:
   - createRateLimiter(requests, window): Ratelimit instance
   - checkRateLimit(identifier, limiter): { success, limit, remaining, reset }
   - Pre-built limiters:
     otpLimiter: 3 requests per 10 minutes per IP
     authLimiter: 10 requests per 15 minutes per IP
     apiLimiter: 100 requests per minute per user
     webhookLimiter: IP-based only

8. src/lib/utils/crypto.ts:
   Same functions as old crypto.utils.ts but as plain functions:
   - generateSecureToken(bytes): string
   - generateOTP(): string (6-digit, cryptographically secure)
   - hashValue(value): Promise<string> (bcrypt)
   - verifyHash(value, hash): Promise<boolean>
   - sanitizeInput(input): string

9. src/lib/utils/logger.ts:
   Simple logger for Next.js (Winston-based):
   - In development: pretty console output
   - In production: JSON format (for Vercel log drain)
   - Redacts: password, token, authorization, card_number

10. src/lib/types/index.ts:
    All shared TypeScript types:
    - ApiResponse<T>
    - PaginatedResponse<T>
    - UserRole enum
    - OrderStatus enum (all statuses)
    - All other enums from Prisma schema
    - AuthUser type (from Supabase session)
    - FullUser type (with profile data)

Show complete code for all files."
```

---

### TASK-C06 — CI/CD Pipelines (Replaces TASK-008 — Now Vercel Only)
```
PASTE THIS TASK TO AI:

"Create three GitHub Actions workflow files for a Next.js 14 + Supabase monorepo.

CONTEXT CHANGE from old plan:
- OLD: Deployed Next.js to Vercel AND Express to Railway
- NEW: Deploy ONLY to Vercel (Next.js handles everything)
- OLD: Ran tests against local PostgreSQL in CI
- NEW: Tests run against Supabase local CLI in CI
- Supabase migrations run via Supabase CLI, not Prisma migrate deploy

1. /.github/workflows/ci-develop.yml
   Trigger: push and PR to develop branch
   Jobs:
   A. quality-check:
      - Checkout code
      - Setup Node 20
      - Cache node_modules
      - npm install
      - Run: npm run lint
      - Run: npm run type-check (tsc --noEmit)
      - Run: npm run format -- --check

   B. test (needs: quality-check):
      - Setup Supabase CLI
      - Start local Supabase: supabase start
      - Copy env: use test env variables
      - Run: npx prisma generate
      - Run: supabase db reset (applies migrations + seed)
      - Run: npm test
      - Stop Supabase: supabase stop

   C. security-scan (parallel with test):
      - npm audit --audit-level=high
      - npx gitleaks detect (no secrets in code)

   No deployment on develop push.

2. /.github/workflows/ci-staging.yml
   Trigger: push to staging branch
   Jobs:
   A. Same quality + test jobs
   B. migrate-staging (needs: tests pass):
      - Install Supabase CLI
      - Link to staging project: supabase link --project-ref $STAGING_PROJECT_REF
      - Push migrations: supabase db push
      - Uses secret: SUPABASE_ACCESS_TOKEN, SUPABASE_STAGING_PROJECT_REF
   C. deploy-staging (needs: migrate-staging):
      - Vercel auto-deploys staging branch (no action needed if Vercel is connected)
      - OR: Install Vercel CLI, deploy with --env staging vars
      - Uses secret: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
      - After deploy: curl staging URL /api/health for health check
   D. comment-pr: post staging URL as PR comment

3. /.github/workflows/ci-main.yml
   Trigger: push to main branch
   Jobs:
   A. Same quality + test jobs
   B. migrate-production (needs: tests pass):
      - supabase link --project-ref $PROD_PROJECT_REF
      - supabase db push
      - Uses secret: SUPABASE_PROD_PROJECT_REF
   C. deploy-production (needs: migrate-production):
      - Vercel auto-deploys main branch to production
      - Health check: curl production URL /api/health
      - On failure: notify team (Slack/WhatsApp webhook)
   D. create-github-release:
      - Auto-create Release from conventional commit messages

List all required GitHub Secrets for each workflow.
Show complete, valid YAML for all three files."
```

---

### TASK-C07 — Auth Module (Replaces TASK-012 — Now Supabase Auth)
```
PASTE THIS TASK TO AI:

"Build the complete authentication module using Supabase Auth for Next.js 14.
This REPLACES the old custom JWT + OTP system from TASK-012.

WHAT SUPABASE AUTH GIVES US FOR FREE:
- OTP-based phone login (built in)
- Session management (tokens, refresh, expiry)
- Row Level Security integration
- No auth_tokens table needed (Supabase manages this)
- No otp_codes table needed (Supabase manages this)

WHAT WE STILL NEED:
- Custom user profile data (role, name, etc.) in our users table
- Sync Supabase auth user to our users table on first login
- Role-based access control on top of Supabase auth

CREATE THESE FILES:

1. src/app/api/auth/send-otp/route.ts:
   POST handler:
   - Validate phone (Pakistani +92 format) with Zod
   - Rate limit: 3 OTPs per 10 minutes per IP (Upstash)
   - Call Supabase auth signInWithOtp({ phone }):
     supabase.auth.signInWithOtp({ phone: formattedPhone })
   - Supabase sends OTP via SMS (or we can intercept and send via WhatsApp)
   - Return { success: true, expiresIn: 300 }
   - Note: For WhatsApp OTP (our preference), see NOTE below

   NOTE ON WHATSAPP OTP:
   Since Pakistani users prefer WhatsApp over SMS, we do this:
   - Disable Supabase's built-in SMS
   - Generate our own 6-digit OTP using crypto.randomInt
   - Store in our otp_codes table (keep this table)
   - Send via WhatsApp Business API
   - On verify: check our otp_codes table, then call
     supabase.auth.signInWithOtp({ phone }) to create the session

2. src/app/api/auth/verify-otp/route.ts:
   POST handler:
   - Validate: { phone, token (6-digit OTP) }
   - Rate limit: 5 attempts per OTP
   - If using Supabase SMS: supabase.auth.verifyOtp({ phone, token, type: 'sms' })
   - If using WhatsApp OTP (our approach):
     * Verify against our otp_codes table
     * On success: use supabase.auth.admin.createSession or signInWithPassword
     * Or: use magic link flow adapted for phone
   - On first login: check if user exists in our users table
     * If not: create user record with role=customer
     * Sync: { id: supabase_user.id, phone, phone_verified: true }
   - Return user data (role, name) — session cookie set by Supabase automatically

3. src/app/api/auth/me/route.ts:
   GET handler:
   - Get session: const { data: { user } } = await supabase.auth.getUser()
   - If no user: return 401
   - Fetch from our users table: prisma.user.findUnique({ where: { id: user.id } })
   - Return user profile (no sensitive fields)

4. src/app/api/auth/logout/route.ts:
   POST handler:
   - supabase.auth.signOut()
   - Clears Supabase session cookie
   - Return { success: true }

5. src/app/(auth)/login/page.tsx:
   Client component:
   - Phone input with +92 prefix
   - 'Send OTP' button → calls /api/auth/send-otp
   - After OTP sent: show 6-box OTP input
   - 'Verify' → calls /api/auth/verify-otp
   - On success: router.push to correct dashboard based on role
   - Resend OTP after 60-second countdown

6. src/app/(auth)/register/page.tsx:
   - Step 1: Phone → send OTP
   - Step 2: OTP verification
   - Step 3: Profile completion (name, gender)
   - On step 3 submit: PATCH /api/users/profile to save name

7. src/hooks/useAuth.ts:
   Custom hook using Supabase client:
   - user: current Supabase user + our profile data
   - isLoading: boolean
   - signOut(): calls logout API
   - Uses supabase.auth.onAuthStateChange() for real-time auth updates

8. Auth tests: 8 tests covering OTP flow, session, logout

Show complete code for all files."
```

---

### TASK-C08 — Users Module (Replaces TASK-013 — Next.js API Routes)
```
PASTE THIS TASK TO AI:

"Build the Users module as Next.js 14 API routes using Supabase + Prisma.
Location: src/app/api/users/

This replaces the old Express /backend/src/modules/users/ module.
The LOGIC is identical — only the framework changes from Express to Next.js Route Handlers.

PATTERN FOR ALL API ROUTES IN THIS PROJECT:
  export async function GET(request: Request) {
    try {
      const user = await requireAuth(request)   ← from src/lib/utils/auth.ts
      // ... business logic using prisma
      return apiSuccess(data)
    } catch (error) {
      return handleApiError(error, request)
    }
  }

CREATE:

1. src/app/api/users/profile/route.ts:
   GET: getProfile
   - requireAuth(request)
   - prisma.user.findUnique({ where: { id: user.id }, include: { addresses: { where: { isDefault: true } } } })
   - Return user without sensitive fields

   PATCH: updateProfile
   - requireAuth(request)
   - validateBody(request, updateProfileSchema)
   - prisma.user.update({ where: { id: user.id }, data: validated })
   - Return updated user

2. src/app/api/users/profile/image/route.ts:
   POST: uploadProfileImage
   - requireAuth(request)
   - Parse formData, get file
   - Validate: image only, max 5MB
   - Upload to Supabase Storage bucket 'profile-images':
     supabaseAdmin.storage.from('profile-images').upload(path, buffer)
   - Get public URL
   - Update user.profile_image_url in DB
   - Return new URL

3. src/app/api/users/addresses/route.ts:
   GET: listAddresses — all non-deleted, default first
   POST: createAddress — if isDefault, transaction to unset previous default

4. src/app/api/users/addresses/[id]/route.ts:
   GET: getAddress (verify ownership)
   PATCH: updateAddress (verify ownership, handle default swap)
   DELETE: deleteAddress (soft delete, handle default reassignment)

5. src/app/api/users/addresses/[id]/default/route.ts:
   PATCH: setDefaultAddress — transaction: unset all, set this one

6. src/lib/validations/users.ts:
   Zod schemas:
   - updateProfileSchema: { firstName, lastName, gender, dateOfBirth }
   - createAddressSchema: all address fields
   - updateAddressSchema: all optional

7. tests/api/users.test.ts: 8 tests

Show complete code. Note: no Express, no controllers — just Next.js Route Handlers."
```

---

### TASK-C09 — Measurements Module (Replaces TASK-014)
```
PASTE THIS TASK TO AI:

"Build the Measurements module as Next.js 14 API routes.
Location: src/app/api/measurements/

Converts old /backend/src/modules/measurements/ to Next.js Route Handlers.
All logic stays identical. Uses Prisma for DB queries, Supabase for auth.

CREATE:

1. src/app/api/measurements/route.ts:
   GET: list all measurement profiles for authenticated user
   - requireAuth, query prisma.measurementProfile where userId + not deleted
   - Order: default first, then by createdAt desc

   POST: create new measurement profile
   - requireAuth, validateBody with measurementSchema
   - If first profile or isDefault: handle default swap in transaction
   - Create profile
   - After response: trigger AI validation async (don't block)
     Use: setTimeout(() => validateMeasurementsWithAI(newProfile.id), 0)
   - Return created profile

2. src/app/api/measurements/[id]/route.ts:
   GET: get specific profile (verify userId ownership)
   PUT: update profile (verify ownership, increment version, store previousVersionId)
   DELETE: soft delete (verify ownership, reassign default if needed)

3. src/app/api/measurements/[id]/default/route.ts:
   PATCH: set as default (transaction: unset all, set this)

4. src/app/api/measurements/[id]/validate/route.ts:
   POST: trigger AI validation manually
   - Fetch profile, call OpenAI, update ai_validation_score + ai_flags
   - Return validation result

5. src/lib/validations/measurements.ts:
   createMeasurementSchema with ALL fields from Prisma schema
   Each measurement field: z.number().positive().min(10).max(200).optional()
   with custom error messages in Urdu/English

6. tests/api/measurements.test.ts: 10 tests

Show complete code."
```

---

### TASK-C10 — Product Link Parser (Replaces TASK-015)
```
PASTE THIS TASK TO AI:

"Build the Product Link Parser as a Next.js API route.
Location: src/app/api/products/

Converts old /backend/src/modules/products/ to Next.js Route Handler.
Logic is identical (SSRF protection, cheerio parsing, allowed domains).

CREATE:

1. src/lib/services/link-parser.service.ts:
   Pure TypeScript service (no Express dependency):

   ALLOWED_DOMAINS = same list as before
   validateUrl(url): same SSRF checks
   parseProductLink(url, userId):
   - Same logic: fetch, cheerio parse, site-specific parsers, cache check
   - Uses prisma to save/retrieve products and log parse attempts
   - Use node-fetch or native fetch (Next.js has fetch built in)

2. src/app/api/products/parse/route.ts:
   POST handler:
   - requireAuth
   - validateBody: { url: z.string().url() }
   - Call link-parser.service.ts
   - Return product data

3. src/app/api/products/[id]/route.ts:
   GET: get stored product by ID

4. tests/api/products.test.ts: 6 tests including SSRF tests

Show complete code."
```

---

### TASK-C11 — Orders Module (Replaces TASK-016)
```
PASTE THIS TASK TO AI:

"Build the Orders module as Next.js 14 API routes.
Location: src/app/api/orders/

Converts old /backend/src/modules/orders/ to Next.js Route Handlers.
ALL business logic stays identical — same order state machine, same snapshots,
same total calculation, same events. Only framework changes.

IMPORTANT: In Next.js, instead of EventEmitter for order events, we use:
- Direct function calls after order state changes
- Supabase Realtime for pushing updates to frontend
- Supabase Edge Functions for async background tasks (instead of BullMQ)

CREATE:

1. src/lib/services/orders.service.ts:
   Pure TypeScript service (all business logic, no HTTP concern):

   calculateTotal(garmentType, deliveryCity, couponCode):
   - Same logic as before
   - Reads from system_settings via prisma

   createOrder(customerId, data):
   - Same validation, snapshots, total calculation
   - Create order in DB via prisma
   - After creation: trigger tailor assignment (Supabase Edge Function call)
   - Emit Supabase Realtime event for admin dashboard

   getCustomerOrders(customerId, filters, pagination): same logic
   getOrderById(orderId, requesterId, requesterRole): same ownership check
   cancelOrder(orderId, customerId, reason): same state machine check
   submitFeedback(orderId, customerId, feedbackData): same logic

   emitOrderEvent(orderId, eventType, data):
   - Uses supabaseAdmin.from('orders').update() which triggers Realtime
   - Realtime subscription on frontend picks this up automatically

2. src/app/api/orders/route.ts:
   POST: createOrder (requireAuth, customer role)
   GET: listOrders (requireAuth, own orders only for customers)

3. src/app/api/orders/[id]/route.ts:
   GET: getOrderById (ownership check)

4. src/app/api/orders/[id]/cancel/route.ts:
   POST: cancelOrder

5. src/app/api/orders/[id]/feedback/route.ts:
   POST: submitFeedback (only if delivered)

6. src/lib/validations/orders.ts: createOrderSchema (same as before)

7. tests/api/orders.test.ts: 12 tests

Show complete code."
```

---

### TASK-C12 — Supabase Edge Functions (Replaces TASK-017 BullMQ Jobs)
```
PASTE THIS TASK TO AI:

"Create Supabase Edge Functions to replace BullMQ background jobs.
Location: supabase/functions/

CONTEXT: BullMQ required Redis. We replaced Redis with Supabase Edge Functions
which run on Deno runtime and can be triggered via HTTP or scheduled via pg_cron.

EDGE FUNCTIONS NEEDED (same jobs as before, different technology):

1. supabase/functions/assign-tailor/index.ts:
   Same logic as old order-assignment.processor.ts:
   - Receives: { orderId } via HTTP POST
   - Fetch order with garment type, priority
   - Query available tailors with scoring algorithm (SAME scoring as before)
   - Assign top tailor, update order, create status history
   - Call notify-customer function

   Note: Uses Supabase client (not Prisma — Edge Functions use Deno, not Node.js)
   Use: import { createClient } from '@supabase/supabase-js'

2. supabase/functions/send-notification/index.ts:
   Same logic as notification processor:
   - Receives: { userId, templateKey, variables, channel, orderId? }
   - Routes to WhatsApp, email, or in-app based on channel
   - Calls WhatsApp API or Resend
   - Updates notification record in DB

3. supabase/functions/sync-delivery/index.ts:
   Same as delivery-sync processor:
   - Receives: { trackingNumber, deliveryId }
   - Calls TCS API (or mock)
   - Updates delivery status
   - If changed: triggers customer notification

4. supabase/functions/monitor-deadlines/index.ts:
   Scheduled (cron): every 30 minutes
   - Same logic as deadline-monitor processor
   - Query orders in_stitching with deadline < NOW() + 3 hours
   - Trigger alerts

5. supabase/functions/_shared/supabase-client.ts:
   Shared Supabase admin client for all edge functions:
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   export const supabase = createClient(
     Deno.env.get('SUPABASE_URL')!,
     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
   )

6. How to trigger edge functions from Next.js API routes:
   In orders.service.ts, after order created:
   await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/assign-tailor`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ orderId })
   })

7. Set up scheduled functions using pg_cron (Supabase built-in):
   Create migration: supabase/migrations/20250101000002_scheduled_jobs.sql:
   SELECT cron.schedule('monitor-deadlines', '*/30 * * * *',
     \$\$ SELECT net.http_post(
       url := current_setting('app.supabase_url') || '/functions/v1/monitor-deadlines',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
     ) \$\$
   );

Show complete Deno TypeScript code for all edge functions."
```

---

### TASK-C13 — Realtime Setup (Replaces TASK-030 Socket.io)
```
PASTE THIS TASK TO AI:

"Set up Supabase Realtime for live order tracking. This replaces Socket.io from TASK-030.

SUPABASE REALTIME is simpler than Socket.io:
- No separate server needed
- Listens to database changes automatically (Postgres changes)
- Or broadcast custom events
- Built into Supabase client

CREATE:

1. src/hooks/useOrderRealtime.ts:
   Custom React hook using Supabase Realtime:

   export function useOrderRealtime(orderId: string) {
     const supabase = createClient()
     const [orderStatus, setOrderStatus] = useState(null)

     useEffect(() => {
       const channel = supabase
         .channel(`order-${orderId}`)
         .on('postgres_changes', {
           event: 'UPDATE',
           schema: 'public',
           table: 'orders',
           filter: `id=eq.${orderId}`
         }, (payload) => {
           setOrderStatus(payload.new.status)
           toast.success(`Order status: ${getOrderStatusLabel(payload.new.status)}`)
         })
         .subscribe()

       return () => { supabase.removeChannel(channel) }
     }, [orderId])

     return { orderStatus }
   }

2. src/hooks/useAdminRealtime.ts:
   For admin dashboard — listen to ALL new orders:
   .on('postgres_changes', { event: 'INSERT', table: 'orders' }, ...)
   .on('postgres_changes', { event: 'UPDATE', table: 'orders', filter: 'status=eq.stitching_complete' }, ...)
   Shows toast + plays notification sound on admin screen

3. src/hooks/useTailorRealtime.ts:
   For tailor panel — listen to orders assigned to this tailor:
   filter: `assigned_tailor_id=eq.${tailorId}`
   Shows notification when new order assigned

4. How to enable Realtime on tables in Supabase:
   Add to migration file:
   ALTER PUBLICATION supabase_realtime ADD TABLE orders;
   ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

5. src/components/realtime-provider.tsx:
   Context provider that initializes Supabase Realtime connection
   Wraps the entire app layout

Show complete code for all hooks and provider."
```

---

### TASK-C14 — Admin Module (Replaces TASK-018)
```
PASTE THIS TASK TO AI:

"Build the Admin module as Next.js 14 API routes.
Location: src/app/api/admin/

Converts old /backend/src/modules/admin/ to Next.js Route Handlers.
All logic stays identical. Uses requireRole('admin','super_admin') guard.

CREATE:

1. src/lib/services/admin.service.ts:
   Pure TypeScript service with all admin business logic:
   - listOrders(filters, pagination): same as before, with Prisma
   - assignTailor(orderId, tailorId, adminId): same validation + notification trigger
   - updateOrderPriority, addAdminNote, overrideOrderStatus: same logic
   - listTailors(filters), createTailor, updateTailorProfile, toggleAvailability
   - getDashboardStats(): all KPIs same as before
   - getOrdersByStatus(), getRevenueByDay(), getTailorPerformance()

2. src/app/api/admin/orders/route.ts: GET list, filters, pagination
3. src/app/api/admin/orders/[id]/route.ts: GET detail
4. src/app/api/admin/orders/[id]/assign/route.ts: PATCH assign tailor
5. src/app/api/admin/orders/[id]/priority/route.ts: PATCH priority
6. src/app/api/admin/orders/[id]/notes/route.ts: PATCH add note
7. src/app/api/admin/orders/[id]/status/route.ts: PATCH override (super_admin only)
8. src/app/api/admin/tailors/route.ts: GET list, POST create
9. src/app/api/admin/tailors/[id]/route.ts: GET, PATCH update
10. src/app/api/admin/tailors/[id]/availability/route.ts: PATCH toggle
11. src/app/api/admin/analytics/route.ts: GET dashboard stats
12. src/app/api/admin/analytics/revenue/route.ts: GET revenue by day
13. src/app/api/admin/analytics/tailors/route.ts: GET tailor performance

tests/api/admin.test.ts: 8 tests

Show complete code."
```

---

### TASK-C15 — Tailor Panel (Replaces TASK-019)
```
PASTE THIS TASK TO AI:

"Build the Tailor Panel as Next.js 14 API routes.
Location: src/app/api/tailor/

Converts old /backend/src/modules/tailors/ to Next.js Route Handlers.

1. src/lib/services/tailor.service.ts:
   Same logic as before:
   - getMyDashboard(tailorId): active orders, deadlines, quality score
   - getMyOrders(tailorId, filters): with measurement + style snapshots
   - getOrderDetail(tailorId, orderId): full order + verify ownership
   - updateWorkStatus(tailorId, orderId, newStatus):
     * Same state machine: assigned→in_stitching, in_stitching→stitching_complete
     * Triggers Supabase Edge Function for notification
     * Updates tailor current_active_orders

2. src/app/api/tailor/dashboard/route.ts: GET
3. src/app/api/tailor/orders/route.ts: GET list
4. src/app/api/tailor/orders/[id]/route.ts: GET detail
5. src/app/api/tailor/orders/[id]/status/route.ts: PATCH update status

tests: 6 tests
Show complete code."
```

---

### TASK-C16 — QC Module (Replaces TASK-020)
```
PASTE THIS TASK TO AI:

"Build the QC module as Next.js 14 API routes.
Location: src/app/api/qc/

Converts old /backend/src/modules/qc/ to Next.js Route Handlers.
All business logic identical.

1. src/lib/services/qc.service.ts:
   Same logic:
   - getPendingInspections(inspectorId)
   - getInspectionDetail(orderId)
   - submitInspection(inspectorId, orderId, data):
     approved: update order, create delivery record, notify admin
     rejected: increment retry, reassign to tailor, notify tailor with images
     needs_minor_fix: same as rejected with different notification

   For image uploads in QC:
   - QC inspector uploads garment photos to Supabase Storage bucket 'qc-images'
   - URL stored in order.qc_images JSON array

2. src/app/api/qc/pending/route.ts: GET
3. src/app/api/qc/[orderId]/route.ts: GET detail
4. src/app/api/qc/[orderId]/inspect/route.ts: POST submit inspection
5. src/app/api/qc/history/route.ts: GET history

tests: 8 tests
Show complete code."
```

---

### TASK-C17 — Health Check & Route Validator (Replaces TASK-011)
```
PASTE THIS TASK TO AI:

"Build the health check endpoint and automated route testing system for Next.js 14.

1. src/app/api/health/route.ts:
   GET handler:
   - Check Supabase DB: supabase.from('system_settings').select().limit(1)
   - Check Upstash Redis: redis.ping()
   - Return:
     {
       status: 'ok' | 'degraded' | 'down',
       timestamp: ISO string,
       version: from package.json,
       checks: {
         database: { status, latencyMs },
         redis: { status, latencyMs }
       }
     }
   - Returns 503 if database is down

2. src/app/api/health/ready/route.ts: Simple GET → 200 OK
3. src/app/api/health/live/route.ts: Simple GET → 200 OK

4. tests/route-validator.test.ts:
   Automated test that hits every API route:

   Tests for ALL routes:
   AUTH (6 tests): send-otp valid/invalid, verify-otp, me, logout
   USERS (6 tests): profile get/update, addresses CRUD
   MEASUREMENTS (8 tests): CRUD + validation + default
   ORDERS (8 tests): create, list, get, cancel, feedback
   ADMIN (8 tests): all admin routes + 403 for non-admin
   TAILOR (6 tests): dashboard, orders, status update + 403 for customer
   QC (6 tests): pending, inspect, history + 403 for customer
   PAYMENTS (6 tests): initiate, webhooks, COD
   SECURITY (8 tests): JWT invalid, role wrong, injection attempt, rate limit

   Use Next.js testEnvironment with jest:
   Each test makes real HTTP call to localhost:3000
   Or use next-test-api-route-handler for unit testing routes

5. package.json scripts already include:
   'test:routes': 'jest --testPathPattern=route-validator'
   'test:security': 'jest --testPathPattern=security'

Show complete code."
```

---

## ═══════════════════════════════════════════════════
## PHASE 1 — FOUNDATION (After Conversion Complete)
## ═══════════════════════════════════════════════════

---

### TASK-001 — Payments Module (Paddle + JazzCash + EasyPaisa + COD)
```
PASTE THIS TASK TO AI:

"Build the complete Payments module as Next.js 14 API routes.
Location: src/app/api/payments/ and src/app/api/webhooks/

Same business logic as old TASK-021. Payment services are pure TypeScript,
no Express dependency.

1. src/lib/services/paddle.service.ts: same logic
2. src/lib/services/jazzcash.service.ts: same HMAC logic
3. src/lib/services/easypaisa.service.ts: same logic
4. src/lib/services/payments.service.ts: same orchestrator

5. src/app/api/payments/initiate/route.ts: POST
6. src/app/api/payments/status/[orderId]/route.ts: GET
7. src/app/api/payments/cod/confirm/route.ts: POST

8. src/app/api/webhooks/paddle/route.ts:
   CRITICAL: Must read raw body for signature verification
   In Next.js: const rawBody = await request.text() ← reads raw string
   Then: verifyPaddleWebhook(rawBody, request.headers)
   Do NOT use request.json() before verification

9. src/app/api/webhooks/jazzcash/route.ts: return handler
10. src/app/api/webhooks/tcs/route.ts: TCS delivery status webhooks

tests/api/payments.test.ts: 10 tests
Show complete code."
```

---

### TASK-002 — Delivery Module (Replaces TASK-022)
```
PASTE THIS TASK TO AI:

"Build the Delivery module as Next.js 14 API routes.
Location: src/app/api/delivery/

Same business logic as TASK-022. TCS service and mock are same.
POD images upload to Supabase Storage bucket 'pod-images' instead of Cloudinary.

1. src/lib/services/tcs.service.ts: same with TCS_MOCK env variable
2. src/lib/services/delivery.service.ts: same logic
   For POD image: supabaseAdmin.storage.from('pod-images').upload(path, buffer)

3. src/app/api/delivery/dispatch/[orderId]/route.ts: POST (admin only)
4. src/app/api/delivery/[orderId]/route.ts: GET detail
5. src/app/api/delivery/[orderId]/status/route.ts: PATCH (delivery agent)
6. src/app/api/delivery/[orderId]/pod/route.ts: POST upload proof

tests/api/delivery.test.ts: 8 tests
Show complete code."
```

---

### TASK-003 — Notifications Module (Replaces TASK-023)
```
PASTE THIS TASK TO AI:

"Build the Notifications module as a mix of Next.js API routes and Supabase Edge Functions.
Location: src/app/api/notifications/ + supabase/functions/send-notification/

Same templates and logic as TASK-023.

ARCHITECTURE CHANGE:
- Sending notifications is done by Supabase Edge Function (async, non-blocking)
- API routes just read notification history and mark as read
- WhatsApp + email sending happens inside Edge Function

1. Notification templates: src/lib/notifications/templates.ts (same as before)

2. src/lib/services/notifications.service.ts:
   queueNotification(userId, templateKey, variables, orderId?):
   - Create notification record in DB with status=pending
   - Trigger send-notification Edge Function asynchronously
   Return immediately (non-blocking)

   markAsRead(userId, notificationIds[]): update DB
   getUnreadCount(userId): count query

3. src/app/api/notifications/route.ts: GET list
4. src/app/api/notifications/read/route.ts: POST mark as read
5. src/app/api/notifications/unread-count/route.ts: GET count

6. WhatsApp webhook handler:
   src/app/api/webhooks/whatsapp/route.ts:
   - GET: verify webhook (Meta verification)
   - POST: receive incoming messages for chatbot

tests: 8 tests
Show complete code."
```

---

### TASK-004 — AI Module (Replaces TASK-024)
```
PASTE THIS TASK TO AI:

"Build the AI module as Next.js 14 API routes and shared services.
Location: src/app/api/ai/ and src/lib/services/ai/

Same AI features as TASK-024. OpenAI calls are pure TypeScript, same logic.

1. src/lib/services/ai/client.ts: OpenAI client + cost tracker + timeout wrapper
2. src/lib/services/ai/measurement-validator.ts: same validation logic
3. src/lib/services/ai/style-recommender.ts: same recommendation logic
4. src/lib/services/ai/chatbot.ts: same chatbot with function calling
   Note: Chatbot is triggered from WhatsApp webhook, not a separate endpoint

5. src/app/api/ai/validate-measurements/route.ts: POST
6. src/app/api/ai/recommend-style/route.ts: POST
7. src/app/api/ai/chat/route.ts: POST (for web chat widget)

All AI calls:
- 10 second timeout
- Graceful fallback
- Log to ai_logs table via prisma
- Never block critical user path

tests: 6 tests (mocked OpenAI)
Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 9 — FRONTEND PAGES
## ═══════════════════════════════════════════

---

### TASK-005 — Auth Pages (Replaces TASK-025)
```
PASTE THIS TASK TO AI:

"Build auth pages for Next.js 14 using Supabase Auth.
Location: src/app/(auth)/

Same UI as TASK-025. The difference: use Supabase client for auth state,
not a custom axios auth store.

Pages: login/page.tsx, register/page.tsx
Components: PhoneInput, OTPInput (6-box), CountdownTimer
Hook: src/hooks/useAuth.ts using supabase.auth.onAuthStateChange()

Same design: navy #1B2B5E, gold #C9A84C, mobile-first, Pakistani UX.
Same flow: phone → OTP → profile completion.

After successful OTP: Supabase sets session cookie automatically.
Role check: fetch from our users table, redirect to correct dashboard.

Show complete code for all files."
```

---

### TASK-006 — Guided Measurement Studio (Same as TASK-026)
```
PASTE THIS TASK TO AI:

"Build the Guided Measurement Studio for Next.js 14.
Location: src/components/measurement-studio/
and src/app/(customer)/new-order/measurement/page.tsx

This is 100% the same as TASK-026. No changes needed for Supabase stack.
The measurement studio is a pure frontend component that calls /api/measurements.

Copy the exact same spec from TASK-026:
- MeasurementStudio.tsx (8 steps, progress bar, auto-save to localStorage)
- BodyPartStep.tsx (video, diagram, instructions, input)
- MeasurementInput.tsx (large touch-friendly, CM/inches toggle)
- BodyDiagram.tsx (SVG, highlighted body parts)
- ValidationFeedback.tsx (AI validation results)
- useMeasurementStudio.ts custom hook

Framer Motion transitions, English + Roman Urdu labels.
Show complete code."
```

---

### TASK-007 — Order Tracking Page (Same as TASK-027 + Supabase Realtime)
```
PASTE THIS TASK TO AI:

"Build the Order Tracking page for Next.js 14 with Supabase Realtime.
Location: src/app/(customer)/orders/[id]/page.tsx

Same as TASK-027 but use Supabase Realtime instead of Socket.io:
- Use useOrderRealtime(orderId) hook (from TASK-C13)
- Same UI: OrderTimeline, StatusBadge, TrackingDetails, OrderSummary, FeedbackModal
- Same trust-building design for Pakistani customers
- Real-time updates via Supabase postgres_changes listener

No Socket.io, no separate WebSocket connection.
Show complete code."
```

---

### TASK-008 — Admin Dashboard (Same as TASK-028 + Supabase Realtime)
```
PASTE THIS TASK TO AI:

"Build the Admin Command Center for Next.js 14.
Location: src/app/(admin)/

Same as TASK-028 but:
- Use useAdminRealtime() hook (from TASK-C13) for live order notifications
- All API calls go to /api/admin/* routes (not Express)
- No separate API URL needed (same Next.js app)
- Use fetch('/api/admin/orders') instead of axios to external API

Same UI: sidebar, KPI cards, recharts, orders table, OrderDetailDrawer.
Show complete code."
```

---

### TASK-009 — Tailor Panel Frontend
```
PASTE THIS TASK TO AI:

"Build the Tailor Panel frontend for Next.js 14.
Location: src/app/(tailor)/

Pages:
1. src/app/(tailor)/dashboard/page.tsx:
   - Active orders list with deadline countdowns
   - Color-coded: red if < 2hrs, yellow if < 24hrs
   - Quality score display
   - useTailorRealtime() for live new assignment notifications

2. src/app/(tailor)/orders/[id]/page.tsx:
   - Full order detail for tailor
   - Measurement snapshot displayed as formatted table
   - Style instructions with visual references
   - Status update button: 'Start Stitching' | 'Mark Complete'
   - Confirmation dialog before status change

All data from /api/tailor/* endpoints.
Mobile-optimized (tailors use phones, not desktop).
Show complete code."
```

---

### TASK-010 — QC Inspector Frontend
```
PASTE THIS TASK TO AI:

"Build the QC Inspector panel frontend for Next.js 14.
Location: src/app/(qc)/

Pages:
1. src/app/(qc)/dashboard/page.tsx:
   - List of garments pending QC (from /api/qc/pending)
   - Sorted by deadline
   - useAdminRealtime() to get notified when new garment ready

2. src/app/(qc)/inspect/[orderId]/page.tsx:
   - Full order info, measurement snapshot, style snapshot
   - Tailor name and notes
   - Image upload section (upload to Supabase Storage)
   - Inspection result: Approved | Rejected | Minor Fix
   - Notes text area
   - Submit button with confirmation dialog

Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 10 — TESTING
## ═══════════════════════════════════════════

---

### TASK-011 — Complete Auto-Testing System (Replaces TASK-029)
```
PASTE THIS TASK TO AI:

"Build the complete automated route testing system for Next.js 14 API routes.
Location: tests/

Use: next-test-api-route-handler (npm package) for testing Next.js Route Handlers
without starting a full server.

1. tests/fixtures/index.ts: same test data as TASK-029
2. tests/route-validator.test.ts: 60+ tests covering all routes
   Same test categories as TASK-029:
   AUTH, USERS, MEASUREMENTS, ORDERS, ADMIN, TAILOR, QC, PAYMENTS, SECURITY

   Pattern for each test:
   import { testApiHandler } from 'next-test-api-route-handler'
   import * as handler from '@/app/api/auth/send-otp/route'

   it('returns 200 for valid phone', async () => {
     await testApiHandler({
       appHandler: handler,
       test: async ({ fetch }) => {
         const res = await fetch({ method: 'POST', body: JSON.stringify({ phone: '+923001234567' }) })
         expect(res.status).toBe(200)
       }
     })
   })

3. tests/security.test.ts: 8 security-specific tests
4. Run command: npm run test:routes

Show complete code for all test files."
```

---

## ═══════════════════════════════════════════
## PHASE 11 — LAUNCH PREP
## ═══════════════════════════════════════════

---

### TASK-012 — Supabase Production Setup Guide
```
PASTE THIS TASK TO AI:

"Create a complete SUPABASE_SETUP_GUIDE.md for deploying the platform.

Include step-by-step for:

1. SUPABASE PROJECTS:
   - Create account at supabase.com
   - Create project: tailoring-prod (production)
   - Create project: tailoring-staging (staging)
   - Note: Free tier allows 2 projects
   - Get connection strings, anon keys, service role keys for both
   - Enable Phone Auth in Supabase Dashboard → Auth → Providers → Phone

2. SUPABASE STORAGE BUCKETS:
   Create these buckets in both projects:
   - profile-images (public)
   - measurement-photos (private — only owner can view)
   - qc-images (private — only admin/qc can view)
   - pod-images (private — only admin/delivery can view)
   Set up RLS policies for each bucket.

3. SUPABASE REALTIME:
   Enable for tables: orders, deliveries, notifications

4. SUPABASE EDGE FUNCTIONS DEPLOYMENT:
   supabase functions deploy assign-tailor --project-ref YOUR_PROJECT_REF
   supabase functions deploy send-notification --project-ref YOUR_PROJECT_REF
   supabase functions deploy sync-delivery --project-ref YOUR_PROJECT_REF
   supabase functions deploy monitor-deadlines --project-ref YOUR_PROJECT_REF
   Set Edge Function secrets: same as env vars

5. VERCEL DEPLOYMENT:
   - Import GitHub repo at vercel.com
   - Framework: Next.js (auto-detected)
   - Root directory: . (root)
   - Set ALL environment variables (from .env.local.example)
   - Production branch: main
   - Preview branches: all others (staging auto-gets preview URL)
   - Custom domain: connect your .pk domain

6. SUPABASE MIGRATIONS ON PRODUCTION:
   supabase link --project-ref YOUR_PROD_PROJECT_REF
   supabase db push
   (CI/CD does this automatically via GitHub Actions)

7. GITHUB SECRETS NEEDED:
   List every secret required for CI/CD workflows

8. POST-DEPLOY CHECKLIST:
   - Test auth flow (send OTP, verify, get profile)
   - Create test order end-to-end
   - Verify Paddle webhook receives test event
   - Verify WhatsApp message received
   - Check Supabase Realtime in browser console

Format as numbered checklist with time estimates."
```

---

### TASK-013 — Upstash Redis Setup (Rate Limiting Only)
```
PASTE THIS TASK TO AI:

"Set up Upstash Redis for rate limiting only in a Next.js 14 app.

1. Create account at upstash.com
2. Create ONE Redis database (free tier is enough for rate limiting)
3. Install: npm install @upstash/ratelimit @upstash/redis

4. src/lib/utils/rate-limit.ts (update from TASK-C05):
   import { Ratelimit } from '@upstash/ratelimit'
   import { Redis } from '@upstash/redis'

   const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL!,
     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
   })

   export const rateLimiters = {
     otp: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '10m') }),
     auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '15m') }),
     api: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1m') }),
     admin: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(200, '1m') }),
   }

   export async function checkRateLimit(identifier: string, limiter: Ratelimit) {
     const { success, limit, remaining, reset } = await limiter.limit(identifier)
     return { success, limit, remaining, reset }
   }

5. Apply in API routes:
   In src/app/api/auth/send-otp/route.ts:
   const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
   const { success } = await checkRateLimit(ip, rateLimiters.otp)
   if (!success) return apiError('RATE_LIMITED', 'Too many OTP requests', 429)

Show complete setup guide and updated rate-limit.ts."
```

---

### TASK-014 — README & Developer Onboarding
```
PASTE THIS TASK TO AI:

"Create a complete README.md for the tailoring platform project.

This README is for developers joining the project. Include:

1. Project Overview (2 paragraphs)
2. Tech Stack table (Next.js, Supabase, Prisma, etc.)
3. Prerequisites: Node.js 20+, npm, Supabase CLI, Git
4. Local Setup (exact commands):
   git clone [repo]
   npm install
   cp .env.local.example .env.local
   npx supabase start       ← starts local DB
   npx prisma generate
   supabase db reset        ← applies migrations + seed
   npm run dev              ← starts Next.js at localhost:3000

5. Access local services:
   App: http://localhost:3000
   Supabase Studio: http://localhost:54323
   Email testing: http://localhost:54324

6. Test accounts (from seed):
   Super Admin: +923001111111 / OTP: check Supabase Studio → Auth → Users
   Customer: +923009999991

7. Branch strategy (develop → staging → main)
8. Commit conventions (feat, fix, chore, etc.)
9. Running tests: npm test, npm run test:routes
10. Folder structure overview
11. Environment variables reference (link to .env.local.example)
12. Deployment: Vercel (auto) + Supabase migrations (auto via CI/CD)
13. Common issues & solutions

Show complete README.md content."
```

---

## TASK EXECUTION ORDER (SUMMARY)

```
WEEK 1 (Conversion — Tasks C01 to C06):
  Day 1: TASK-C01 (clean repo) → TASK-C02 (Next.js init)
  Day 2: TASK-C03 (Supabase setup + clients)
  Day 3: TASK-C04 (DB migrations + Prisma)
  Day 4: TASK-C05 (middleware, utils, errors)
  Day 5: TASK-C06 (CI/CD pipelines)

WEEK 2 (Conversion — Tasks C07 to C17):
  Day 1-2: TASK-C07 (Auth with Supabase)
  Day 3:   TASK-C08 (Users module)
  Day 4:   TASK-C09 (Measurements module)
  Day 5:   TASK-C10 (Product link parser)

WEEK 3 (Conversion continues):
  Day 1-2: TASK-C11 (Orders module)
  Day 3:   TASK-C12 (Edge Functions)
  Day 4:   TASK-C13 (Realtime)
  Day 5:   TASK-C14 (Admin module)

WEEK 4:
  Day 1: TASK-C15 (Tailor panel API)
  Day 2: TASK-C16 (QC module API)
  Day 3: TASK-C17 (Health + route validator)
  Day 4-5: Review + commit everything to develop, PR to staging

WEEK 5-6 (New features):
  TASK-001 (Payments)
  TASK-002 (Delivery)
  TASK-003 (Notifications)
  TASK-004 (AI)

WEEK 7-11 (Frontend):
  TASK-005 (Auth pages)
  TASK-006 (Measurement Studio)
  TASK-007 (Order Tracking)
  TASK-008 (Admin Dashboard)
  TASK-009 (Tailor Panel UI)
  TASK-010 (QC Inspector UI)

WEEK 12-13 (Testing):
  TASK-011 (Auto-testing system)

WEEK 14 (Launch):
  TASK-012 (Supabase production setup)
  TASK-013 (Upstash setup)
  TASK-014 (README)
  → Deploy to production
  → End-to-end test
  → Go live
```

---

## COMPLETE TASK LIST (46 Total)

```
CONVERSION (17 tasks — replaces old Tasks 001-017):
  C01  Clean repo structure
  C02  Next.js 14 full-stack init
  C03  Supabase setup + local dev
  C04  DB migrations into Supabase
  C05  Global middleware, utils, errors
  C06  CI/CD pipelines (Vercel + Supabase)
  C07  Auth module (Supabase Auth)
  C08  Users module
  C09  Measurements module
  C10  Product link parser
  C11  Orders module
  C12  Edge Functions (replaces BullMQ)
  C13  Realtime (replaces Socket.io)
  C14  Admin module
  C15  Tailor panel API
  C16  QC module API
  C17  Health check + route validator

NEW FEATURES (4 tasks):
  001  Payments (Paddle + JazzCash + EasyPaisa + COD)
  002  Delivery (TCS integration)
  003  Notifications (WhatsApp + Email)
  004  AI module (validation + chatbot)

FRONTEND (10 tasks):
  005  Auth pages (login, register, OTP)
  006  Guided Measurement Studio
  007  Order tracking page (Realtime)
  008  Admin dashboard
  009  Tailor panel UI
  010  QC inspector UI

TESTING & LAUNCH (6 tasks):
  011  Auto-testing system
  012  Supabase production setup guide
  013  Upstash Redis setup
  014  README + developer onboarding
```

---

## OLD TASKS THAT ARE NOW DELETED

```
These tasks from the old plan are fully replaced. Do not execute them:

TASK-003 (Docker Compose)         → Replaced by TASK-C03 (Supabase CLI)
TASK-004 (Express backend init)   → Replaced by TASK-C02 (Next.js init)
TASK-005 (Express base files)     → Replaced by TASK-C05 (Next.js utils)
TASK-008 (Railway CI/CD)          → Replaced by TASK-C06 (Vercel + Supabase CI/CD)
TASK-009 (Prisma migrate setup)   → Replaced by TASK-C04 (Supabase migrations)
TASK-010 (Winston for Express)    → Replaced by TASK-C05 (logger.ts)
TASK-011 (Express health check)   → Replaced by TASK-C17 (Next.js route)
TASK-012 (Express auth module)    → Replaced by TASK-C07 (Supabase auth)
TASK-013 (Express users module)   → Replaced by TASK-C08 (API routes)
TASK-014 (Express measurements)   → Replaced by TASK-C09 (API routes)
TASK-015 (Express link parser)    → Replaced by TASK-C10 (API route)
TASK-016 (Express orders module)  → Replaced by TASK-C11 (API routes)
TASK-017 (BullMQ + Redis jobs)    → Replaced by TASK-C12 (Edge Functions)
TASK-018 (Express admin module)   → Replaced by TASK-C14 (API routes)
TASK-019 (Express tailor module)  → Replaced by TASK-C15 (API routes)
TASK-020 (Express QC module)      → Replaced by TASK-C16 (API routes)
TASK-030 (Socket.io)              → Replaced by TASK-C13 (Supabase Realtime)
```

---

## COMMIT CONVENTION (Unchanged)

```
feat(auth):         add Supabase OTP phone login
feat(orders):       implement order creation with measurement snapshot
feat(admin):        add tailor assignment with scoring algorithm
fix(payments):      correct Paddle webhook raw body parsing
chore(ci):          add Vercel + Supabase migration workflow
test(auth):         add route validator tests for auth module
refactor(orders):   convert Express service to Next.js API route
```

---

## HOW TO USE EACH TASK

```
1. Open Cursor / Claude Code / Copilot Chat
2. Copy the TASK-XXX block exactly
3. Paste into AI
4. AI produces the files
5. Review output
6. Run: npm run type-check (should pass)
7. Run: npm test (should pass)
8. git add + git commit with convention
9. Push to develop

PR CONVENTION (unchanged):
  develop → staging: 'Staging: Phase C conversion complete'
  staging → main:    'Release: v1.0.0 — initial launch'
```

---

*Master Plan Version: 2.0 | Stack: Next.js 14 + Supabase | Tasks: 46 | Timeline: 14 Weeks*
*Converted from: Node.js Express + Railway + Neon + Redis + BullMQ + Socket.io*
*Team: 2 developers | Deployment: Vercel only | Database: Supabase (free tier)*
