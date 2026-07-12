# 🗺️ MASTER EXECUTION PLAN
## Centralized Custom Tailoring & Delivery Platform
### Professional Dev Environment → Staging → Production
### Version: 1.0 | Timeline: 14 Weeks

---

## WHAT WE HAVE ALREADY (Completed Blueprint)

| # | Document | Status |
|---|----------|--------|
| 01 | Market Analysis (Pakistani Psychology + GTM) | ✅ Done |
| 02 | Complete System Architecture Blueprint | ✅ Done |
| 03 | Universal Startup Template (reusable) | ✅ Done |
| 04 | Full Database Schema (SQL) | ✅ Done |
| 05 | Security Checklist & Implementation Guide | ✅ Done |
| 06 | Prisma Schema (complete, production-ready) | ✅ Done |

---

## BRANCH & ENVIRONMENT STRATEGY

```
BRANCHES (3 permanent branches, never deleted):

  main      → Production (live users, real data)
              Auto-deploys to: Railway (backend) + Vercel (frontend)
              Database: Neon.tech PRODUCTION database
              Protected: No direct push. Only merge from staging via PR.

  staging   → Client preview + QA (shows client latest work)
              Auto-deploys to: Railway staging + Vercel staging
              Database: Neon.tech STAGING database (clone of prod schema)
              Protected: Merge from develop via PR after testing.

  develop   → Active development (where all feature work happens)
              No auto-deploy (runs locally)
              Database: LOCAL PostgreSQL (Docker)
              Feature branches → PR to develop → review → merge

FLOW:
  feature/xxx → develop → staging (PR) → main (PR)

DATABASES (3 environments):
  LOCAL     → Docker PostgreSQL on your machine (full freedom to test/reset)
  STAGING   → Neon.tech (branch: staging) — free tier
  PRODUCTION → Neon.tech (branch: main) — free tier → upgrade when needed

RULE: Never run migrations directly on STAGING or PRODUCTION.
      Migrations run via CI/CD only after PR merge.
```

---

## PHASE OVERVIEW (14 Weeks)

```
PHASE 0 — Environment Setup         Week 1        (Tasks 001–008)
PHASE 1 — Backend Foundation        Weeks 2–3     (Tasks 009–020)
PHASE 2 — Auth & Users              Weeks 3–4     (Tasks 021–030)
PHASE 3 — Core Order Flow           Weeks 4–6     (Tasks 031–045)
PHASE 4 — Admin + Tailor Panels     Weeks 6–8     (Tasks 046–058)
PHASE 5 — QC + Delivery             Weeks 8–9     (Tasks 059–067)
PHASE 6 — Payments                  Weeks 9–10    (Tasks 068–075)
PHASE 7 — AI Integration            Weeks 10–11   (Tasks 076–082)
PHASE 8 — Notifications             Week 11       (Tasks 083–088)
PHASE 9 — Frontend (Web)            Weeks 8–12    (Tasks 089–110)
PHASE 10 — Testing & Hardening      Weeks 12–13   (Tasks 111–118)
PHASE 11 — Launch Prep              Week 14       (Tasks 119–125)
```

---

## ═══════════════════════════════════════════
## PHASE 0 — ENVIRONMENT SETUP
## ═══════════════════════════════════════════
### Goal: Professional repo, all three environments live, CI/CD running, zero-cost infra ready.

---

### TASK-001 — Git Repository & Branch Setup
```
WHAT TO DO:
You have already cloned the repo. Now run these commands:

1. Create the three permanent branches:
   git checkout -b develop
   git push origin develop

   git checkout -b staging
   git push origin staging

   git checkout main
   git push origin main

2. Set branch protection rules on GitHub:
   Go to: GitHub Repo → Settings → Branches → Add rule

   For "main":
   ✅ Require a pull request before merging
   ✅ Require 1 approving review
   ✅ Require status checks to pass (CI tests)
   ✅ Do not allow bypassing the above settings
   ✅ Restrict who can push: only you

   For "staging":
   ✅ Require a pull request before merging
   ✅ Require status checks to pass

3. Set default branch to "develop":
   GitHub → Settings → General → Default Branch → develop

RESULT:
- main, staging, develop branches created and pushed
- Branch protection rules active
- develop is default (all new PRs target develop)
```

---

### TASK-002 — Repo Folder Structure Setup
```
WHAT TO DO:
In your local repo (on develop branch), create this exact structure:

tailoring-platform/          ← root of your repo
├── backend/                 ← Node.js Express API
├── frontend/                ← Next.js web app
├── mobile/                  ← React Native (Expo) — scaffold later
├── .github/
│   └── workflows/
│       ├── ci-develop.yml   ← runs on develop push
│       ├── ci-staging.yml   ← runs on staging push (tests + deploy)
│       └── ci-main.yml      ← runs on main push (tests + deploy prod)
├── docker-compose.yml       ← Local dev: PostgreSQL + Redis
├── .gitignore               ← root gitignore
└── README.md                ← Project overview

COMMANDS:
mkdir -p backend frontend mobile .github/workflows
touch .github/workflows/ci-develop.yml
touch .github/workflows/ci-staging.yml
touch .github/workflows/ci-main.yml
touch docker-compose.yml
touch README.md

git add .
git commit -m "chore: initialize monorepo structure"
git push origin develop
```

---

### TASK-003 — Docker Compose (Local Dev Database)
```
PASTE THIS TASK TO AI:

"Create a complete docker-compose.yml for local development of a Node.js + Next.js
project. Include:
- PostgreSQL 16 with these settings:
    container_name: tailoring_postgres
    database: tailoring_db
    username: tailoring_user
    password: localdev_password_123
    port: 5432
    volume: postgres_data (persistent)
    health check every 5 seconds
- Redis 7 (Alpine) with:
    container_name: tailoring_redis
    port: 6379
    volume: redis_data (persistent)
    health check
- pgAdmin 4 for local DB browser:
    container_name: tailoring_pgadmin
    port: 5050
    email: admin@tailoring.local
    password: admin123
    depends on postgres
- All services on a shared network called tailoring_network
- Named volumes section at bottom
- Include comments explaining each service

Also create a Makefile with these shortcuts:
  make up         → docker-compose up -d
  make down       → docker-compose down
  make reset-db   → docker-compose down -v && docker-compose up -d
  make logs       → docker-compose logs -f
  make psql       → connects to postgres container shell
  make redis-cli  → connects to redis container shell

File location: /docker-compose.yml (repo root)"
```

---

### TASK-004 — Backend Project Init (Node.js + TypeScript)
```
PASTE THIS TASK TO AI:

"Initialize a production-ready Node.js + TypeScript backend project in the /backend folder.

Requirements:
1. package.json with these exact dependencies:
   PRODUCTION:
   - express @4.18.x
   - @prisma/client (latest)
   - zod @3.x
   - jsonwebtoken
   - bcryptjs
   - cookie-parser
   - cors
   - helmet
   - express-rate-limit
   - rate-limit-redis
   - ioredis
   - bullmq
   - socket.io
   - multer
   - sharp
   - cloudinary
   - @paddle/paddle-node-sdk
   - resend
   - axios
   - date-fns
   - uuid
   - winston (logging)
   - morgan (HTTP logging)
   - dotenv

   DEV DEPENDENCIES:
   - typescript
   - @types/express @types/node @types/jsonwebtoken @types/bcryptjs
     @types/cookie-parser @types/cors @types/multer @types/morgan @types/uuid
   - prisma (CLI)
   - ts-node
   - ts-node-dev (nodemon alternative for TS)
   - jest @types/jest ts-jest
   - supertest @types/supertest
   - eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   - prettier eslint-config-prettier
   - @commitlint/cli @commitlint/config-conventional
   - husky lint-staged

2. tsconfig.json with:
   - target: ES2022
   - module: commonjs
   - strict: true
   - outDir: ./dist
   - rootDir: ./src
   - baseUrl: ./src
   - paths: { '@/*': ['./*'] }
   - sourceMap: true
   - esModuleInterop: true
   - resolveJsonModule: true
   - experimentalDecorators: true

3. Scripts in package.json:
   dev          → ts-node-dev --respawn --transpile-only src/server.ts
   build        → tsc
   start        → node dist/server.js
   lint         → eslint src --ext .ts
   format       → prettier --write src
   test         → jest --runInBand
   test:watch   → jest --watch
   test:routes  → jest --testPathPattern=route-validator
   test:security → jest --testPathPattern=security
   migrate:dev  → prisma migrate dev
   migrate:deploy → prisma migrate deploy
   db:seed      → ts-node src/testing/seed.ts
   db:studio    → prisma studio

4. .eslintrc.json with TypeScript rules + no-console warning
5. .prettierrc with: semi: true, singleQuote: true, tabWidth: 2, trailingComma: 'es5'
6. .gitignore for Node.js (node_modules, dist, .env, *.log, coverage)
7. jest.config.ts configured for TypeScript with ts-jest
8. commitlint.config.js for conventional commits
9. .husky/pre-commit hook running lint-staged
10. lint-staged config: run eslint + prettier on staged .ts files

Create all files. Show the complete content of each file."
```

---

### TASK-005 — Backend Folder Structure & Base Files
```
PASTE THIS TASK TO AI:

"Create the complete folder structure and all base/boilerplate files for the backend
of a Node.js Express TypeScript project. Root is /backend/src/.

Create these files with complete working content (not placeholders):

1. src/server.ts
   - Creates HTTP server
   - Connects to database (Prisma)
   - Connects to Redis
   - Starts Socket.io
   - Graceful shutdown (SIGTERM, SIGINT)
   - Logs port on start

2. src/app.ts
   - Creates Express app
   - Applies all global middleware in correct order:
     * trust proxy (for Railway/Vercel)
     * helmet (security headers)
     * cors (from config)
     * morgan (HTTP logging, skip health endpoint)
     * cookie-parser
     * express.json (limit: 10kb)
     * express.urlencoded
     * rawBody middleware (for webhook signature verification)
     * global rate limiter
     * request ID middleware (uuid per request, attach to req)
     * /health endpoint (returns {status:'ok', timestamp, version})
     * all API routers mounted at /api/v1
     * 404 handler
     * global error handler

3. src/config/index.ts
   - Reads and validates ALL env variables with Zod
   - Throws on startup if required vars missing
   - Exports typed config object
   - Variables needed:
     NODE_ENV, PORT, DATABASE_URL, REDIS_URL,
     JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
     JWT_ACCESS_EXPIRES_IN (default: '15m'),
     JWT_REFRESH_EXPIRES_IN (default: '7d'),
     CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
     PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET,
     RESEND_API_KEY, RESEND_FROM_EMAIL,
     WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
     OPENAI_API_KEY,
     TCS_API_KEY, TCS_API_URL,
     FRONTEND_URL, ADMIN_URL,
     BCRYPT_ROUNDS (default: 12),
     RATE_LIMIT_WINDOW_MS (default: 60000),
     RATE_LIMIT_MAX (default: 100)

4. src/config/database.ts
   - Prisma client singleton with logging in dev
   - Exported as 'db'

5. src/config/redis.ts
   - ioredis client with Upstash TLS support
   - Reconnect strategy (max 10 retries)
   - Exported as 'redis'

6. src/shared/utils/response.utils.ts
   - success(data, meta?) → standard success response
   - error(code, message, details?) → standard error response
   - paginate(data, total, page, limit) → paginated response
   All return the ApiResponse<T> interface shape.

7. src/shared/utils/crypto.utils.ts
   - generateSecureToken(bytes: number): string → uses crypto.randomBytes
   - hashToken(token: string): Promise<string> → bcrypt hash
   - verifyToken(token, hash): Promise<boolean> → bcrypt compare
   - generateOTP(): string → 6-digit cryptographically secure
   - hashOTP(otp: string): Promise<string>
   - verifyOTP(otp, hash): Promise<boolean>
   - sanitizeInput(input: string): string → strips HTML/scripts

8. src/shared/utils/token.utils.ts
   - generateAccessToken(payload): string → JWT sign
   - generateRefreshToken(): string → secure random token
   - verifyAccessToken(token): TokenPayload | null
   - All using config values for secrets and expiry

9. src/shared/errors/AppError.ts
   - AppError class extending Error
   - Properties: statusCode, code, isOperational
   - Static factory methods:
     * badRequest(message, details?)  → 400
     * unauthorized(message?)         → 401
     * forbidden(message?)            → 403
     * notFound(resource?)            → 404
     * conflict(message?)             → 409
     * unprocessable(message, details?) → 422
     * tooManyRequests(message?)      → 429
     * internal(message?)             → 500

10. src/middleware/errorHandler.middleware.ts
    - Catches AppError → returns formatted error response
    - Catches Prisma errors → maps to AppError (P2002=conflict, P2025=notFound)
    - Catches Zod errors → maps to 422 validation error
    - Catches JWT errors → maps to 401
    - Unknown errors → logs full error, returns 500 (no internal details to client)
    - In development: includes stack trace in response
    - In production: never exposes stack traces

11. src/middleware/auth.middleware.ts
    - authenticate: reads JWT from Authorization header (Bearer token)
    - Verifies signature and expiry
    - Fetches user from DB (checks is_active, is_blocked, deleted_at)
    - Attaches req.user = { id, role, email, phone }
    - Throws 401 on any failure

12. src/middleware/rbac.middleware.ts
    - requireRole(...roles: UserRole[]): middleware
    - Checks req.user.role against allowed roles
    - Throws 403 with audit log entry if unauthorized

13. src/middleware/validate.middleware.ts
    - validate(schema: ZodSchema): middleware
    - Validates req.body, req.query, req.params
    - Attaches req.validated with typed, parsed data
    - Returns 422 with field-level errors on failure

14. src/middleware/rateLimit.middleware.ts
    - createLimiter(windowMs, max, message): RateLimitMiddleware
    - Uses Redis store (rate-limit-redis)
    - Key: IP + userId (if authenticated)
    - Pre-configured limiters exported:
      * authLimiter (5 req / 10min)
      * otpLimiter (3 req / 10min)
      * apiLimiter (100 req / 1min)
      * adminLimiter (200 req / 1min)
      * webhookLimiter (50 req / 1min)

15. src/middleware/requestLogger.middleware.ts
    - Attaches unique requestId (UUID) to every request
    - Sets X-Request-ID response header
    - Logs: method, path, statusCode, responseTime, requestId, userId

Create ALL files with complete, working TypeScript code. No TODOs, no placeholders."
```

---

### TASK-006 — Frontend Project Init (Next.js 14)
```
PASTE THIS TASK TO AI:

"Initialize a production-ready Next.js 14 (App Router) project in /frontend folder.

Setup:
1. Create Next.js 14 app with:
   - TypeScript: yes
   - Tailwind CSS: yes
   - App Router: yes
   - src/ directory: yes
   - Import alias: @/* → ./src/*

2. Install additional dependencies:
   - zustand (state management)
   - @tanstack/react-query @tanstack/react-query-devtools
   - axios
   - react-hook-form
   - @hookform/resolvers
   - zod
   - framer-motion
   - socket.io-client
   - date-fns
   - clsx tailwind-merge
   - lucide-react
   - @radix-ui/react-dialog @radix-ui/react-dropdown-menu
     @radix-ui/react-toast @radix-ui/react-select
     @radix-ui/react-tabs @radix-ui/react-progress
   - class-variance-authority

3. Create src/lib/api.ts:
   - Axios instance with baseURL from env
   - Request interceptor: attach JWT access token from memory
   - Response interceptor:
     * On 401: attempt refresh token call
     * On refresh success: retry original request
     * On refresh fail: clear auth state, redirect to /login
   - All requests include X-Request-ID header
   - Timeout: 15 seconds

4. Create src/lib/queryClient.ts:
   - TanStack Query client with:
     * staleTime: 1 minute
     * retry: 1
     * refetchOnWindowFocus: false in dev
     * global onError: show toast for API errors

5. Create src/stores/authStore.ts (Zustand):
   - State: { user, accessToken, isAuthenticated, isLoading }
   - Actions: setAuth, clearAuth, refreshToken
   - Access token stored in MEMORY only (never localStorage)
   - Persist: nothing sensitive (user display info only via zustand/persist)

6. Create src/middleware.ts (Next.js middleware):
   - Protected routes: redirect to /login if no auth cookie present
   - Role-based route protection:
     /admin/* → requires admin/super_admin role
     /tailor/* → requires tailor role
     /qc/* → requires qc_inspector role
     /(customer)/* → requires customer role
   - Public routes: /login, /register, /verify-otp, /track/:id

7. Create src/app/layout.tsx:
   - Root layout with Providers wrapper
   - Inter font from next/font/google
   - Metadata: title, description, viewport

8. Create src/components/providers.tsx:
   - QueryClientProvider
   - Toaster (for notifications)

9. Create complete tailwind.config.ts with:
   - Custom colors matching brand (deep navy + gold palette):
     primary: #1B2B5E (deep navy)
     secondary: #C9A84C (gold)
     accent: #F5F0E8 (cream)
     success: #2D7A4F
     warning: #D97706
     danger: #DC2626
   - Custom font family (Inter)
   - Custom border radius scale
   - Animation utilities

10. Create src/lib/utils.ts:
    - cn() function using clsx + tailwind-merge
    - formatPKR(amount): string → formats as PKR 1,234
    - formatDate(date): string → 'Jul 8, 2026'
    - formatPhone(phone): string → masks middle digits
    - getOrderStatusLabel(status): string → human readable
    - getOrderStatusColor(status): string → tailwind color class
    - truncate(str, length): string

11. Create .env.local.example with all required frontend vars:
    NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
    NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token

Show complete file content for every file."
```

---

### TASK-007 — Environment Files Setup
```
PASTE THIS TASK TO AI:

"Create all environment configuration files for a Node.js backend project.

1. /backend/.env.example — complete example with ALL variables, dummy values:
   Include sections with comments:
   # === SERVER ===
   NODE_ENV=development
   PORT=4000

   # === DATABASE ===
   DATABASE_URL=postgresql://tailoring_user:localdev_password_123@localhost:5432/tailoring_db

   # === REDIS ===
   REDIS_URL=redis://localhost:6379

   # === JWT ===
   JWT_ACCESS_SECRET=your-super-secret-access-key-minimum-64-characters-long-replace-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-64-characters-long-replace-this
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # === CLOUDINARY ===
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # === PADDLE (Payment) ===
   PADDLE_API_KEY=your_paddle_api_key
   PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
   PADDLE_ENVIRONMENT=sandbox

   # === JAZZCASH ===
   JAZZCASH_MERCHANT_ID=your_merchant_id
   JAZZCASH_PASSWORD=your_password
   JAZZCASH_INTEGRITY_SALT=your_integrity_salt
   JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/

   # === EASYPAISA ===
   EASYPAISA_ACCOUNT_NUM=your_account_number
   EASYPAISA_HASH_KEY=your_hash_key
   EASYPAISA_STORE_ID=your_store_id
   EASYPAISA_API_URL=https://easypay.easypaisa.com.pk/tpg/

   # === RESEND (Email) ===
   RESEND_API_KEY=re_your_resend_key
   RESEND_FROM_EMAIL=noreply@yourdomain.pk

   # === WHATSAPP (Meta Cloud API) ===
   WHATSAPP_API_TOKEN=your_whatsapp_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

   # === OPENAI ===
   OPENAI_API_KEY=sk-your_openai_key

   # === TCS ===
   TCS_API_KEY=your_tcs_api_key
   TCS_API_URL=https://api.tcsexpress.com/v1

   # === URLS ===
   FRONTEND_URL=http://localhost:3000
   ADMIN_URL=http://localhost:3000/admin

   # === SECURITY ===
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=100
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001

2. /backend/.env.test — for test environment:
   Same structure but:
   DATABASE_URL=postgresql://tailoring_user:localdev_password_123@localhost:5432/tailoring_test_db
   NODE_ENV=test
   JWT_ACCESS_SECRET=test-access-secret-for-testing-only-not-for-production
   JWT_REFRESH_SECRET=test-refresh-secret-for-testing-only-not-for-production
   BCRYPT_ROUNDS=4 (low rounds for fast tests)

3. /backend/.env — copy of .env.example (tell user this is gitignored)

4. Root /.gitignore:
   # Environment
   .env
   .env.local
   .env.production
   *.env

   # Dependencies
   node_modules/
   .pnp
   .pnp.js

   # Build
   dist/
   .next/
   out/
   build/

   # Database
   *.db
   *.sqlite

   # Logs
   logs/
   *.log
   npm-debug.log*

   # OS
   .DS_Store
   Thumbs.db

   # IDE
   .vscode/settings.json
   .idea/
   *.swp

   # Test
   coverage/
   .nyc_output

   # Docker
   # (do NOT ignore docker-compose.yml — it has no secrets)

   # Prisma
   prisma/*.db

Show complete content for every file."
```

---

### TASK-008 — CI/CD GitHub Actions Pipelines
```
PASTE THIS TASK TO AI:

"Create three complete GitHub Actions workflow files for a Node.js + Next.js monorepo
with backend/ and frontend/ folders.

PROJECT CONTEXT:
- Backend: Node.js + TypeScript + Express in /backend
- Frontend: Next.js 14 in /frontend
- DB: PostgreSQL (test uses local service container)
- Deploy: Railway (backend), Vercel (frontend)
- Branches: develop (dev), staging (client preview), main (production)

1. /.github/workflows/ci-develop.yml
   Trigger: push and PR to develop branch
   Jobs:
   A. lint-and-type-check:
      - Checkout code
      - Setup Node 20
      - Cache node_modules (backend + frontend separately)
      - Install backend deps
      - Run: npm run lint
      - Run: npx tsc --noEmit
      - Install frontend deps
      - Run: npm run lint
      - Run: npx tsc --noEmit

   B. test-backend (needs: lint-and-type-check):
      - Services: postgres:16 (port 5432, health check), redis:7 (port 6379)
      - Env vars: DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
                  BCRYPT_ROUNDS=4, NODE_ENV=test
      - Steps: checkout, node setup, cache, install, prisma generate,
               prisma migrate deploy, run jest tests
      - Upload coverage report as artifact

   C. security-scan (parallel with test):
      - Run npm audit --audit-level=high on both backend and frontend
      - Run: npx gitleaks detect --source . --no-git (check for secrets in code)

   No deployment on develop.

2. /.github/workflows/ci-staging.yml
   Trigger: push to staging branch (only after PR merged from develop)
   Jobs:
   A. Same lint + type check + tests as above
   B. deploy-backend-staging (needs: tests pass):
      - Install Railway CLI
      - Deploy to Railway staging service
      - Uses secret: RAILWAY_TOKEN_STAGING, RAILWAY_SERVICE_ID_STAGING
      - Run: railway run --service $SERVICE_ID npx prisma migrate deploy
      - Health check: curl staging backend /health endpoint
   C. deploy-frontend-staging (needs: tests pass, parallel with B):
      - Install Vercel CLI
      - Deploy to Vercel preview (staging)
      - Uses secret: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
   D. notify-on-success:
      - Comment on the PR with staging URLs

3. /.github/workflows/ci-main.yml
   Trigger: push to main branch (only after PR from staging)
   Jobs:
   A. Same lint + type check + tests
   B. deploy-backend-production (needs: all tests pass):
      - Railway deploy to production service
      - Uses secret: RAILWAY_TOKEN_PROD, RAILWAY_SERVICE_ID_PROD
      - Run migrations
      - Health check (retry 3 times)
      - On health check failure: trigger Railway rollback
   C. deploy-frontend-production (parallel with B):
      - Vercel deploy to production
      - Uses secret: VERCEL_TOKEN_PROD
   D. create-release:
      - Auto-create GitHub Release with changelog from commit messages
   E. notify-team:
      - Send Slack/WhatsApp message on successful production deploy

Include all environment variables as GitHub Secrets references (uses: secrets.VAR_NAME).
Add comments explaining each step. Make YAML valid and complete."
```

---

## ═══════════════════════════════════════════
## PHASE 1 — BACKEND FOUNDATION
## ═══════════════════════════════════════════
### Goal: Running backend with Prisma connected, health checks, route validator skeleton, logging.

---

### TASK-009 — Prisma Setup & First Migration
```
PASTE THIS TASK TO AI:

"Set up Prisma in a Node.js TypeScript project located in /backend.

Steps to implement:

1. The Prisma schema is already created at /backend/prisma/schema.prisma
   (it's the complete schema with all models: User, Order, Payment, etc.)

2. Create /backend/prisma/migrations/ folder structure.

3. Create /backend/prisma/seed.ts:
   A complete database seeder that creates:
   - 1 super_admin user:
     phone: +923001111111, email: admin@tailoring.local,
     password: Admin@123456 (hashed), first_name: Super, last_name: Admin
   - 1 admin user:
     phone: +923001111112, email: ops@tailoring.local,
     password: Admin@123456, first_name: Operations, last_name: Admin
   - 3 tailors with tailor_profiles:
     Tailor 1: Ahmed Ali, skill: senior, specializations: [full_suit, kameez]
     Tailor 2: Hassan Khan, skill: mid, specializations: [trouser, kameez]
     Tailor 3: Bilal Raza, skill: junior, specializations: [trouser]
   - 1 qc_inspector: Fatima Malik
   - 1 delivery_agent: Usman Dar
   - 2 test customers:
     Customer 1: Sara Aslam, phone: +923009999991
     Customer 2: Nadia Khan, phone: +923009999992
   - System settings (INSERT if not exists):
     stitching_base_fee: {pkr: 800}
     delivery_fee_local: {pkr: 150}
     delivery_fee_national: {pkr: 300}
     max_cod_amount: {pkr: 10000}

4. Create /backend/prisma/reset.ts:
   - Drops all data (DELETE FROM in correct FK order)
   - Re-runs seed
   - Only works when NODE_ENV=development or NODE_ENV=test

5. Update package.json scripts:
   'prisma:generate': 'prisma generate',
   'prisma:migrate': 'prisma migrate dev',
   'prisma:migrate:prod': 'prisma migrate deploy',
   'prisma:seed': 'ts-node prisma/seed.ts',
   'prisma:reset': 'ts-node prisma/reset.ts',
   'prisma:studio': 'prisma studio'

6. Show the exact terminal commands to run to:
   a. Start Docker containers (PostgreSQL + Redis)
   b. Generate Prisma client
   c. Run first migration (name it: init_complete_schema)
   d. Run the seeder
   e. Open Prisma Studio to verify data

Use the existing Prisma schema. Do not rewrite the schema."
```

---

### TASK-010 — Winston Logger Setup
```
PASTE THIS TASK TO AI:

"Create a production-grade Winston logger for a Node.js TypeScript Express app.
Location: /backend/src/config/logger.ts

Requirements:
1. Log levels: error, warn, info, http, debug
2. In development:
   - Console transport with colorized output
   - Format: [timestamp] LEVEL: message {metadata}
   - Pretty-print JSON metadata
3. In production:
   - Console transport with JSON format (for Railway log collection)
   - Include: timestamp, level, message, requestId, userId, metadata
   - No colors in production
4. Always:
   - Include hostname
   - Include process PID
   - Redact sensitive fields: password, token, authorization, cookie, card_number
     (replace with '***REDACTED***')
5. HTTP request logger middleware using morgan:
   - Custom format including requestId
   - Skip logging for /health endpoint
   - Skip logging for static assets
6. Child logger factory: logger.child({ requestId, userId }) for per-request logging

Also create /backend/src/middleware/requestLogger.middleware.ts:
- Generates UUID requestId for each request
- Attaches to req.requestId
- Sets X-Request-ID response header
- Creates child logger attached to req.logger
- Logs request start and response completion with timing

Show complete code for both files."
```

---

### TASK-011 — Health Check & Route Inventory System
```
PASTE THIS TASK TO AI:

"Create a health check system and automated route inventory for a Node.js
TypeScript Express application. Location: /backend/src/

1. Create src/modules/health/health.routes.ts and health.controller.ts:
   GET /health:
   - Returns 200 if all systems operational
   - Checks: database connection (Prisma $queryRaw SELECT 1),
             Redis connection (redis.ping()), memory usage
   - Response: {
       status: 'ok' | 'degraded' | 'down',
       timestamp: ISO string,
       version: package.json version,
       uptime: process.uptime(),
       checks: {
         database: { status, latencyMs },
         redis: { status, latencyMs },
         memory: { heapUsedMB, heapTotalMB, rssMB }
       }
     }
   - Returns 503 if database or redis is down
   - Returns 200 with status: 'degraded' if memory > 80%

   GET /health/ready — Kubernetes/Railway readiness probe (just db check)
   GET /health/live  — Kubernetes/Railway liveness probe (just process alive)

2. Create src/testing/route-inventory.ts:
   - Automatically discovers ALL registered routes from the Express app
   - Reads the Express router stack recursively
   - Returns array of: { method, path, middleware[] }
   - This powers the auto-testing system

3. Create src/testing/route-validator.ts:
   - Imports the Express app
   - Uses supertest to test every route
   - Test manifest defines expected behavior per route
   - Tests run in sequence (not parallel to avoid conflicts)
   - Generates a report:
     {
       total: number,
       passed: number,
       failed: number,
       skipped: number,
       results: [{ method, path, expectedStatus, actualStatus, passed, durationMs }]
     }
   - Exits with code 1 if any test fails
   - Can be run as: npm run test:routes

Include 15 example route tests covering:
- Public route returns 200
- Protected route returns 401 without token
- Protected route returns 403 with wrong role token
- Validation error returns 422
- Rate limiting returns 429 after limit

Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 2 — AUTH & USERS MODULE
## ═══════════════════════════════════════════

---

### TASK-012 — Auth Module (Complete)
```
PASTE THIS TASK TO AI:

"Build the complete authentication module for a Node.js TypeScript Express app
using Prisma ORM and PostgreSQL. Location: /backend/src/modules/auth/

The module handles: OTP-based phone auth, JWT access + refresh tokens,
login, logout, token refresh, and current user.

Create these files with COMPLETE working code:

1. auth.validator.ts — Zod schemas:
   - sendOtpSchema: { phone: Pakistani format +92XXXXXXXXXX }
   - verifyOtpSchema: { phone, otp: 6 digits, purpose }
   - loginSchema: { phone, otp } OR { email, password }
   - refreshSchema: (reads from cookie, no body needed)

2. auth.service.ts — Business logic:
   sendOtp(phone, purpose):
   - Validate phone
   - Find or create user (if purpose=register)
   - Check rate limit: max 3 OTPs per phone per 10 minutes
   - Invalidate previous unused OTPs for same phone+purpose
   - Generate 6-digit OTP using crypto.randomInt
   - Hash OTP with bcrypt (rounds: 10 — lower for OTPs)
   - Store in otp_codes table with 5-minute expiry
   - Send via SMS (Twilio/console.log in dev)
   - Return { success: true, expiresIn: 300 }

   verifyOtp(phone, otp, purpose):
   - Find latest unused OTP for phone+purpose
   - Check not expired
   - Check attempts < max_attempts, increment attempt count
   - Verify OTP hash
   - Mark OTP as used
   - Mark phone_verified on user
   - Return user

   generateTokenPair(userId, deviceInfo, ipAddress):
   - Generate access token (JWT, 15min)
   - Generate refresh token (crypto.randomBytes(48).toString('hex'))
   - Store HASH of refresh token in auth_tokens table
   - Return { accessToken, refreshToken }

   refreshTokens(refreshToken, ipAddress):
   - Hash the incoming token
   - Find in auth_tokens where hash matches and not revoked and not expired
   - If token already revoked → SECURITY ALERT: revoke entire family
   - Issue new token pair
   - Revoke old refresh token (rotation)
   - Return new { accessToken, refreshToken }

   logout(refreshToken):
   - Find and revoke the refresh token

   logoutAll(userId):
   - Revoke ALL refresh tokens for user

   getCurrentUser(userId):
   - Return user with profile, excluding sensitive fields

3. auth.controller.ts — Thin controllers calling service:
   POST /auth/send-otp → sendOtp
   POST /auth/verify-otp → verifyOtp → on success set refresh token cookie + return access token
   POST /auth/login → same as verify-otp (OTP is the login method)
   POST /auth/refresh → refreshTokens (reads cookie)
   POST /auth/logout → logout (reads cookie, clears cookie)
   POST /auth/logout-all → logoutAll
   GET  /auth/me → getCurrentUser

   Cookie settings for refresh token:
   httpOnly: true, secure: NODE_ENV=production, sameSite: 'strict',
   path: '/api/v1/auth', maxAge: 7 days

4. auth.routes.ts:
   - Apply otpLimiter to /send-otp
   - Apply authLimiter to /verify-otp and /login
   - Apply authenticate middleware to /me, /logout, /logout-all, /refresh

5. auth.test.ts — Jest + Supertest tests:
   ✅ POST /send-otp with valid phone → 200
   ✅ POST /send-otp with invalid phone → 422
   ✅ POST /send-otp rate limited after 3 requests → 429
   ✅ POST /verify-otp with valid OTP → 200 + access token + cookie
   ✅ POST /verify-otp with wrong OTP → 401
   ✅ POST /verify-otp with expired OTP → 401
   ✅ POST /refresh with valid cookie → 200 + new access token
   ✅ POST /refresh with invalid cookie → 401
   ✅ GET /me with valid token → 200 + user data
   ✅ GET /me without token → 401
   ✅ POST /logout clears cookie → 200

Use the Prisma schema already defined. Show complete code for all files."
```

---

### TASK-013 — Users Module (Profile & Addresses)
```
PASTE THIS TASK TO AI:

"Build the complete Users module for a Node.js TypeScript Express app.
Location: /backend/src/modules/users/

Handles: user profile management, address CRUD, measurement profile basics.

1. users.validator.ts:
   - updateProfileSchema: { firstName, lastName, gender, dateOfBirth }
   - createAddressSchema: { label, fullName, phone, addressLine1, addressLine2,
     landmark, city, province, postalCode, country, isDefault }
   - updateAddressSchema: same but all optional

2. users.service.ts:
   getProfile(userId): returns user with default address
   updateProfile(userId, data): updates first_name, last_name, gender, date_of_birth
   uploadProfileImage(userId, fileBuffer, mimeType):
     - Upload to Cloudinary in 'profile-images' folder
     - Resize to 400x400, convert to webp
     - Update profile_image_url in DB
     - Return new URL
   listAddresses(userId): all non-deleted addresses, default first
   createAddress(userId, data):
     - If isDefault=true, unset previous default first (in a transaction)
     - Create new address
   updateAddress(userId, addressId, data):
     - Verify address belongs to user
     - If isDefault=true, unset previous default first
     - Update
   deleteAddress(userId, addressId):
     - Verify belongs to user
     - Soft delete (set deleted_at)
     - If was default, set next available as default
   setDefaultAddress(userId, addressId):
     - Transaction: unset all defaults, set this one

3. users.controller.ts: thin controllers
4. users.routes.ts: all routes require authenticate middleware
5. users.test.ts: 8 key tests

Show complete code for all files."
```

---

## ═══════════════════════════════════════════
## PHASE 3 — CORE ORDER FLOW
## ═══════════════════════════════════════════

---

### TASK-014 — Measurements Module
```
PASTE THIS TASK TO AI:

"Build the complete Measurements module for a Node.js TypeScript Express app.
Location: /backend/src/modules/measurements/

This is a CRITICAL module — it handles customer body measurements that drive
all tailoring. Must be robust and well-validated.

1. measurements.validator.ts:
   - createMeasurementSchema with ALL measurement fields from Prisma schema
   - Each field: optional decimal, min 10 max 200 cm with custom error messages
   - label: required string
   - notes: optional string
   - photoUrls: optional array of URLs

2. measurements.service.ts:
   list(userId): all non-deleted profiles, default first
   getById(userId, profileId): verify ownership
   create(userId, data):
     - If isDefault=true or first profile: set as default
     - Transaction: unset previous default if needed
     - Create profile
     - Trigger AI validation async (don't block response)
   update(userId, profileId, data):
     - Verify ownership
     - Increment version number
     - Store current as previous_version_id (for history)
     - Update
   delete(userId, profileId):
     - Verify ownership
     - Soft delete
     - If was default, set next as default
   setDefault(userId, profileId): transaction to swap defaults
   validateWithAI(profileId):
     - Call OpenAI with measurement values
     - Parse response for anomalies
     - Update ai_validation_score and ai_flags on profile
     - Return validation result

3. Controller, routes, tests (10 tests).

Show complete code."
```

---

### TASK-015 — Product Link Parser
```
PASTE THIS TASK TO AI:

"Build a Product Link Parser service for a Node.js TypeScript Express app.
Location: /backend/src/modules/products/

This feature lets customers paste a product URL from Pakistani fashion sites
(Khaadi, Gul Ahmed, AlKaram, Limelight, Sapphire) and the system auto-fetches
product name, images, fabric info.

1. link-parser.service.ts:
   ALLOWED_DOMAINS = ['khaadi.com','gul-ahmed.com','alkaram.com',
                       'limelight.pk','sapphireonline.pk','sanasamia.com',
                       'generation.com.pk','elan.com.pk']

   validateUrl(url):
   - Must be HTTPS
   - Hostname must be in ALLOWED_DOMAINS
   - Must not be an IP address (SSRF prevention)
   - Must not contain path traversal

   parseProductLink(url, userId):
   - Log attempt to product_parse_logs table
   - Fetch URL with:
     * timeout: 5000ms
     * max size: 1MB
     * User-Agent: Mozilla/5.0 compatible
   - Parse HTML with cheerio:
     * Extract: title (og:title → page title), images (og:image → first product img),
       description (og:description → meta description),
       price (look for common price selectors)
   - Site-specific parsers:
     * khaadi.com: specific CSS selectors for their product page
     * gul-ahmed.com: specific selectors
     * generic fallback: OpenGraph meta tags
   - Check if URL already parsed (normalizedUrl match) → return cached product
   - Save to products table
   - Update parse log with result
   - Return product data

2. products.routes.ts:
   POST /products/parse-link → validate URL, parse, return product
   GET  /products/:id → get stored product

3. Validator, controller, 6 tests including SSRF prevention tests.

Show complete code."
```

---

### TASK-016 — Orders Module (Core)
```
PASTE THIS TASK TO AI:

"Build the complete Orders module — the heart of the platform.
Location: /backend/src/modules/orders/

This module manages the full order lifecycle from creation to delivery.

1. orders.validator.ts:
   createOrderSchema: {
     productId: UUID (optional),
     garmentType: enum,
     measurementProfileId: UUID,
     styleConfigId: UUID (optional),
     styleOverrides: partial style object (optional),
     deliveryAddressId: UUID,
     couponCode: string (optional),
     paymentMethod: enum,
     specialInstructions: string (optional)
   }

2. orders.service.ts:

   calculateTotal(garmentType, deliveryCity, couponCode):
   - Fetch base stitching fee from system_settings
   - Determine delivery fee: local (same city) vs national
   - Add addon fees if applicable
   - Validate and apply coupon if provided
   - Return { stitchingFee, deliveryFee, addonFee, discountAmount, totalAmount }

   createOrder(customerId, data):
   - Validate customer exists and is active
   - Validate measurement profile belongs to customer
   - Validate delivery address belongs to customer
   - Snapshot measurement profile (deep copy)
   - Snapshot style config (deep copy)
   - Snapshot delivery address (deep copy)
   - Snapshot product (if provided)
   - Calculate total (server-side, never trust client)
   - Create order with status: pending_payment
   - Create status history entry
   - If COD: immediately move to payment_confirmed
   - Emit order:created event
   - Return created order

   getCustomerOrders(customerId, filters, pagination):
   - Filter by status, date range
   - Include delivery status
   - Paginated

   getOrderById(orderId, requesterId, requesterRole):
   - Customers can only see their own
   - Admins/tailors see all
   - Include full status history, payment, delivery info

   cancelOrder(orderId, customerId, reason):
   - Only if status in [pending_payment, payment_confirmed, assigned]
   - Cannot cancel if in_stitching or later
   - Update status → cancelled
   - Trigger refund if payment was made
   - Notify customer

   submitFeedback(orderId, customerId, feedbackData):
   - Only if status = delivered
   - One feedback per order
   - Update tailor quality_score (rolling average)

3. orders.events.ts:
   EventEmitter for order lifecycle:
   - order:created → send confirmation notification
   - order:payment_confirmed → trigger tailor assignment job
   - order:assigned → notify tailor, notify customer
   - order:in_stitching → notify customer
   - order:qc_pending → notify QC inspector
   - order:dispatched → notify customer with tracking number
   - order:delivered → trigger feedback request notification

4. Controller, routes, 12 tests.

Show complete code."
```

---

### TASK-017 — BullMQ Jobs Setup
```
PASTE THIS TASK TO AI:

"Set up BullMQ background job queues for a Node.js TypeScript app.
Location: /backend/src/jobs/

QUEUES NEEDED:
1. notification-queue → sends WhatsApp, SMS, email
2. order-assignment-queue → auto-assigns tailors to orders
3. delivery-sync-queue → polls TCS API for tracking updates
4. deadline-monitor-queue → checks approaching stitching deadlines
5. analytics-queue → computes daily analytics aggregates

CREATE:

1. src/jobs/queues.ts:
   - Initialize all 5 Bull queues with Redis connection
   - Default job options: attempts: 3, backoff: exponential (2000ms base),
     removeOnComplete: 100 (keep last 100), removeOnFail: 500
   - Export each queue
   - Export a function to close all queues gracefully

2. src/jobs/workers.ts:
   - Initialize all workers (one per queue)
   - Each worker processes jobs and handles errors
   - Log job start, completion, and failure
   - Import all job processors

3. src/jobs/processors/order-assignment.processor.ts:
   processOrderAssignment(job):
   - Receives: { orderId }
   - Fetch order with garment type, stitching deadline, priority
   - Query available tailors:
     * is_available = true
     * current_active_orders < max_daily_capacity
     * skill matches garment requirements
   - Score each tailor:
     * Workload score: (1 - current/max) * 40 points
     * Quality score: quality_score * 30 points
     * Specialization match: exact match = 20 pts, partial = 10 pts
     * Seniority bonus: master=10, senior=7, mid=4, junior=0
   - Assign top-scoring tailor
   - Update order: assigned_tailor_id, assigned_at, status=assigned
   - Increment tailor current_active_orders
   - Add to order_status_history
   - Queue notification job

4. src/jobs/processors/notification.processor.ts:
   processNotification(job):
   - Receives: { notificationId }
   - Fetch notification from DB
   - Route to correct channel: whatsapp, sms, email, push
   - Send via appropriate service
   - Update notification status (sent/failed)
   - Retry on failure (max 3 attempts, exponential backoff)

5. src/jobs/processors/deadline-monitor.processor.ts:
   - Runs on cron: every 30 minutes
   - Finds orders in status=in_stitching where stitching_deadline < NOW() + 3 hours
   - Sends WhatsApp alert to tailor
   - Sends admin dashboard notification
   - Sets priority_level=2 (urgent) if deadline < 1 hour

6. src/jobs/schedulers.ts:
   - Sets up recurring cron jobs:
     * deadline-monitor: every 30 minutes ('*/30 * * * *')
     * delivery-sync: every 15 minutes ('*/15 * * * *')
     * analytics: daily at 1am ('0 1 * * *')

Show complete code for all files."
```

---

## ═══════════════════════════════════════════
## PHASE 4 — ADMIN + TAILOR PANELS
## ═══════════════════════════════════════════

---

### TASK-018 — Admin Module
```
PASTE THIS TASK TO AI:

"Build the complete Admin module for a Node.js TypeScript Express app.
Location: /backend/src/modules/admin/

Handles: order management, tailor management, analytics dashboard.
All routes require authenticate + requireRole('admin','super_admin').

1. admin-orders.service.ts:
   listOrders(filters, pagination):
   - Filters: status, tailorId, dateFrom, dateTo, search (order number/customer phone)
   - Pagination: page, limit (default 20, max 100)
   - Include: customer name/phone, tailor name, delivery status
   - Sort: by created_at desc, or priority desc + created_at asc

   assignTailor(orderId, tailorId, adminId):
   - Validate tailor exists and is a tailor role
   - Validate tailor is available and has capacity
   - Update order, create status history
   - Notify tailor and customer
   - Increment tailor current_active_orders

   updateOrderPriority(orderId, priorityLevel, adminId): 0, 1, or 2
   addAdminNote(orderId, note, adminId): appends to admin_notes
   overrideOrderStatus(orderId, newStatus, reason, adminId):
   - Only super_admin can do this
   - Creates status history with trigger_type='manual'
   - Logs to audit_logs

2. admin-tailors.service.ts:
   listTailors(filters): with workload stats
   createTailor(userData): creates user with role=tailor + tailor_profile
   updateTailorProfile(tailorId, data): skill, capacity, availability
   toggleAvailability(tailorId): flip is_available
   getTailorOrders(tailorId, filters): all orders assigned to tailor

3. analytics.service.ts:
   getDashboardStats():
   - ordersToday, ordersThisWeek, ordersThisMonth
   - revenueToday, revenueThisMonth
   - pendingAssignment count, inStitching count, pendingQC count
   - averageFulfillmentHours (payment_confirmed → delivered)
   - qcRejectionRate (this week)
   - tailorUtilizationRate (avg current/max across all tailors)
   - topPerformingTailor (by quality_score)

   getOrdersByStatus(): count per status (for pie chart)
   getRevenueByDay(days: 7|30|90): daily revenue aggregation
   getTailorPerformance(): per-tailor stats

4. Routes, controller, 8 tests.

Show complete code."
```

---

### TASK-019 — Tailor Panel Module
```
PASTE THIS TASK TO AI:

"Build the Tailor Panel module for a Node.js TypeScript Express app.
Location: /backend/src/modules/tailors/

All routes: authenticate + requireRole('tailor','admin','super_admin')

1. tailors.service.ts:
   getMyDashboard(tailorId):
   - Active orders with deadlines
   - Completed today count
   - Upcoming deadline warnings (< 24hrs)
   - Quality score and trend

   getMyOrders(tailorId, filters):
   - Filter by status: assigned, in_stitching, stitching_complete
   - Include measurement snapshot, style snapshot, product images
   - Sort by deadline (closest first)

   getOrderDetail(tailorId, orderId):
   - Full order with measurements, style instructions, customer notes
   - Verify order is assigned to this tailor

   updateWorkStatus(tailorId, orderId, newStatus, notes):
   - Allowed transitions for tailor:
     assigned → in_stitching
     in_stitching → stitching_complete
   - Cannot jump status (must follow sequence)
   - On stitching_complete: decrement tailor current_active_orders
   - Notify admin (QC team to pick up)
   - Create status history entry

2. Routes, controller, 6 tests.
Show complete code."
```

---

### TASK-020 — QC Module
```
PASTE THIS TASK TO AI:

"Build the Quality Control (QC) module for a Node.js TypeScript Express app.
Location: /backend/src/modules/qc/

All routes: authenticate + requireRole('qc_inspector','admin','super_admin')

1. qc.service.ts:
   getPendingInspections(inspectorId):
   - Orders with status = stitching_complete (sorted by deadline)
   - Can be filtered by garment_type

   getInspectionDetail(orderId):
   - Full order, measurement snapshot, style snapshot
   - Tailor notes, customer instructions
   - Previous QC notes (if retry)

   submitInspection(inspectorId, orderId, data):
   data: { result: 'approved'|'rejected'|'needs_minor_fix',
           notes: string, images: string[] }

   If approved:
   - Update order: qc_result=approved, qc_inspector_id, qc_inspected_at
   - Change status → qc_approved
   - Trigger: create delivery record, notify admin for dispatch

   If rejected:
   - Update order: qc_result=rejected, qc_notes, qc_images
   - Increment qc_retry_count
   - Change status → qc_rejected
   - Re-assign back to same tailor with priority boost
   - Change status → assigned
   - Notify tailor with rejection reason and images
   - Increment tailor total_orders_rejected_qc

   If needs_minor_fix:
   - Same as rejected but with different notification text
   - qc_retry_count incremented

   getQCHistory(filters, pagination):
   - All completed QC inspections
   - Filter by result, date, inspector, garment type

2. Routes, controller, 8 tests.
Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 5 — PAYMENTS MODULE
## ═══════════════════════════════════════════

---

### TASK-021 — Payments Module (Paddle + COD + Local Gateways)
```
PASTE THIS TASK TO AI:

"Build the complete Payments module for a Node.js TypeScript Express app.
Location: /backend/src/modules/payments/

Supports: Paddle (cards/international), JazzCash, EasyPaisa, COD.

1. paddle.service.ts:
   createCheckoutSession(orderId, customerId, amount):
   - Use @paddle/paddle-node-sdk
   - Create Paddle transaction/checkout
   - Return checkoutId and checkoutUrl
   - Store paddle_checkout_id in payments table

   handleWebhook(rawBody, signature):
   - Verify webhook signature: paddle.webhooks.isSignatureValid()
   - On transaction.completed:
     * Find payment by paddle transaction ID
     * Update payment status → completed
     * Update order status → payment_confirmed
     * Queue tailor assignment job
   - On transaction.payment_failed:
     * Update payment → failed
     * Notify customer

2. jazzcash.service.ts:
   createPaymentRequest(orderId, amount, returnUrl):
   - Build JazzCash POST request with HMAC-SHA256 signature
   - Fields: pp_MerchantID, pp_Password, pp_TxnRefNo, pp_Amount,
             pp_TxnDateTime, pp_BillReference, pp_Description,
             pp_SecureHash (HMAC)
   - Return form data for frontend redirect

   verifyReturn(returnData):
   - Recompute HMAC and verify
   - Update payment status based on pp_ResponseCode
   - ResponseCode '000' = success

3. easypaisa.service.ts:
   Similar pattern to JazzCash with their API spec.

4. payments.service.ts (orchestrator):
   initiatePayment(orderId, method, customerId):
   - Validate order exists and belongs to customer
   - Validate order is in pending_payment status
   - Check for existing pending payment (idempotency)
   - Calculate total (server-side verification)
   - Create payment record
   - Route to correct gateway service
   - Return gateway-specific response

   confirmCOD(orderId, agentId):
   - Verify delivery agent is assigned to this order
   - Update payment: cod_collected=true, cod_collected_at
   - Update order: cod_collected=true

   getPaymentStatus(orderId):
   - Return current payment status and details

5. payments.routes.ts:
   POST /payments/initiate        → authenticated customer
   POST /payments/paddle/webhook  → RAW BODY, no auth, IP from Paddle allowlist
   POST /payments/jazzcash/return → redirect return URL handler
   POST /payments/cod/confirm     → delivery agent auth
   GET  /payments/:orderId        → authenticated (owner or admin)

   CRITICAL: Webhook endpoint must use express.raw() middleware, not express.json()

6. 10 tests including webhook signature verification tests.
Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 6 — DELIVERY MODULE
## ═══════════════════════════════════════════

---

### TASK-022 — Delivery Module (TCS Integration)
```
PASTE THIS TASK TO AI:

"Build the Delivery module with TCS Express API integration.
Location: /backend/src/modules/delivery/

1. tcs.service.ts:
   Note: TCS API details vary — build with adapter pattern so any courier can be swapped.

   bookShipment(orderData):
   - POST to TCS API to create booking
   - Required fields: sender details (our warehouse), receiver (customer address snapshot),
     weight, declared value, reference number (order_number)
   - Returns: tracking_number, courier_booking_id
   - Store in deliveries table

   getTrackingStatus(trackingNumber):
   - GET from TCS API
   - Returns: current status, location, timestamp, events array
   - Map TCS status codes to our DeliveryStatus enum

   cancelShipment(trackingNumber):
   - Cancel booking before pickup

   NOTE: In development, mock TCS responses (TCS sandbox may not be available).
   Create a MockTCSService that returns realistic fake data.
   Use environment variable TCS_MOCK=true to switch between real and mock.

2. delivery.service.ts:
   dispatchOrder(orderId, adminId):
   - Order must be in qc_approved status
   - Call tcs.service.bookShipment()
   - Create deliveries record with tracking_number
   - Update order status → dispatched
   - Send WhatsApp to customer with tracking link
   - Schedule delivery-sync job

   updateDeliveryStatus(deliveryId, status, notes, agentId):
   - Create delivery_status_history entry
   - If status = delivered:
     * Update delivery.delivered_at
     * Update order status → delivered
     * Decrement tailor current_active_orders (if not already)
     * Queue feedback request notification (24hr delay)

   uploadProofOfDelivery(deliveryId, imageBuffer, notes, agentId):
   - Upload image to Cloudinary
   - Update delivery: pod_image_url, pod_notes

   syncTrackingFromCourier(trackingNumber):
   - Called by delivery-sync background job
   - Fetch status from TCS
   - If changed: update delivery + create history entry

   getDeliveryDetail(orderId): full delivery with history

3. Routes, controller, 8 tests (mock TCS). Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 7 — NOTIFICATIONS MODULE
## ═══════════════════════════════════════════

---

### TASK-023 — Notifications Module (WhatsApp + Email + SMS)
```
PASTE THIS TASK TO AI:

"Build the complete Notifications module for a Node.js TypeScript Express app.
Location: /backend/src/modules/notifications/

This is a critical module — Pakistani users primarily use WhatsApp.

1. notification-templates.ts:
   Define ALL notification templates as constants:
   Template structure: { key, channel, subject?, bodyTemplate }
   Templates needed:
   - ORDER_PLACED: WhatsApp + Email
   - ORDER_PAYMENT_CONFIRMED: WhatsApp
   - ORDER_ASSIGNED_TO_TAILOR: WhatsApp
   - ORDER_IN_STITCHING: WhatsApp
   - ORDER_QC_APPROVED: WhatsApp
   - ORDER_DISPATCHED: WhatsApp + Email (with tracking number)
   - ORDER_DELIVERED: WhatsApp
   - FEEDBACK_REQUEST: WhatsApp (24hr after delivery)
   - TAILOR_NEW_ORDER: WhatsApp + In-App
   - TAILOR_REJECTION_FEEDBACK: WhatsApp (when QC rejects)
   - QC_ORDER_READY: In-App + WhatsApp
   - DEADLINE_WARNING: WhatsApp (to tailor)
   - OTP_VERIFICATION: SMS

   Each template has variables in {{variable}} format:
   e.g., 'Aapka order {{orderNumber}} receive ho gaya! 🎉'
   (Mix of Urdu and English as Pakistani users prefer)

2. whatsapp.service.ts:
   Using Meta WhatsApp Cloud API (free tier):

   sendTextMessage(to, body):
   - POST to https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
   - Headers: Authorization: Bearer {WHATSAPP_API_TOKEN}
   - Body: { messaging_product: 'whatsapp', to, type: 'text', text: { body } }
   - Rate limit: 1000 messages/day on free tier
   - Return message ID

   sendTemplateMessage(to, templateName, parameters):
   - For pre-approved WhatsApp Business templates
   - Used for order status updates (must be approved by Meta)
   - Fallback to text message if template fails

   verifyWebhook(mode, token, challenge):
   - For Meta webhook verification: return challenge if token matches

3. email.service.ts:
   Using Resend (3000 free emails/month):

   sendEmail(to, templateKey, variables):
   - Map template key to HTML template
   - Use Resend SDK to send
   - Simple HTML templates (branded, mobile-responsive)
   - Log to notifications table

4. sms.service.ts:
   Using Twilio (or mock in dev):
   sendSMS(to, body):
   - Send SMS for OTP and critical alerts
   - Pakistani numbers (+92 prefix)

5. notifications.service.ts (orchestrator):
   sendNotification(userId, templateKey, variables, orderId?):
   - Fetch user's phone and email
   - Determine channels from template
   - Create notification record in DB with status=pending
   - Queue notification job (BullMQ) — don't send synchronously
   - Return notification ID

   processNotification(notificationId):
   - Called by BullMQ worker
   - Send via correct channel
   - Update status to sent/failed
   - Retry on failure

   getUnreadCount(userId): count of unread in_app notifications
   markAsRead(userId, notificationIds[]): mark as read

6. Webhook handler for WhatsApp incoming messages (for chatbot).
7. 8 tests (mock WhatsApp and Resend). Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 8 — AI MODULE
## ═══════════════════════════════════════════

---

### TASK-024 — AI Module (Measurement Validation + Smart Assignment + Chatbot)
```
PASTE THIS TASK TO AI:

"Build the AI integration module for a Node.js TypeScript Express app.
Location: /backend/src/modules/ai/
Uses: OpenAI API (gpt-4o-mini for cost efficiency)

ALL AI calls must:
- Have 10-second timeout
- Have graceful fallback (system works without AI)
- Log to ai_logs table (model, tokens, cost, latency, success)
- Never block critical path (run async where possible)

1. ai-client.ts:
   - OpenAI client setup
   - Wrapper function that times calls and handles errors gracefully
   - Cost tracker: estimate cost per call based on token usage

2. measurement-validator.service.ts:
   validateMeasurements(profileId, measurements, garmentType):

   System prompt:
   'You are an expert tailor assistant for Pakistani clothing (shalwar kameez).
   Analyze the provided body measurements and identify any values that seem
   anatomically incorrect, inconsistent with each other, or likely data entry errors.
   Be specific about which measurements are suspicious and why.
   Common Pakistani women sizes: chest 85-115cm, waist 65-100cm, hips 90-120cm.
   Respond ONLY in JSON.'

   User prompt: measurements JSON

   Expected response:
   {
     confidence: 0.0-1.0,
     isValid: boolean,
     flags: [{ field, issue, suggestedRange, severity: 'warning'|'error' }],
     overallAssessment: string
   }

   - Update measurement_profile with ai_validation_score and ai_flags
   - Return validation result

3. style-recommender.service.ts:
   recommendStyles(garmentType, occasion, fabricType, customerHistory):
   - Generate top 3 style recommendations
   - Include reasoning based on fabric and occasion
   - Return structured JSON with style options

4. chatbot.service.ts:
   handleMessage(userId, message, conversationHistory):

   Tools available to AI (function calling):
   - getOrderStatus(orderNumber) → fetch from DB
   - getTrackingInfo(orderNumber) → fetch delivery status
   - getMeasurementHelp(bodyPart) → return measurement guide

   System prompt includes: platform context, user's recent orders,
   instructions to be helpful, warm, and mix Urdu/English like Pakistanis do.

   Escalation logic:
   - If message contains: 'refund', 'complaint', 'angry', 'manager' →
     set needsHumanEscalation=true, notify admin
   - Max 3 turns without resolution → escalate

5. src/modules/ai/ai.routes.ts:
   POST /ai/validate-measurements → calls measurement validator
   POST /ai/recommend-style → style recommendations
   POST /ai/chat → chatbot endpoint

6. 6 tests (mock OpenAI responses). Show complete code."
```

---

## ═══════════════════════════════════════════
## PHASE 9 — FRONTEND (NEXT.JS)
## ═══════════════════════════════════════════

---

### TASK-025 — Auth Pages (Login / Register / OTP)
```
PASTE THIS TASK TO AI:

"Build the authentication pages for a Next.js 14 App Router application.
Location: /frontend/src/app/(auth)/

Design: Clean, minimal, mobile-first. Brand colors: navy #1B2B5E, gold #C9A84C.
Pakistani-friendly: phone number as primary identifier, OTP-based login.

Pages needed:

1. /app/(auth)/layout.tsx:
   - Split-screen on desktop: left side brand image/logo, right side form
   - Full screen form on mobile
   - Brand logo at top
   - 'Powered by StitchLy' footer

2. /app/(auth)/login/page.tsx:
   - Page title: 'Welcome Back'
   - Phone number input with +92 prefix auto-added
   - 'Send OTP' button
   - After OTP sent: transition to OTP entry (6-digit input boxes)
   - Resend OTP after 60 seconds (countdown timer)
   - Loading states on buttons
   - Error messages below inputs
   - Link to register if new user

3. /app/(auth)/register/page.tsx:
   - Step 1: Phone number → send OTP
   - Step 2: OTP verification
   - Step 3: Basic profile (first name, last name, gender)
   - Progress indicator (Step 1 of 3)
   - On completion: redirect to /new-order

4. Shared components:
   - PhoneInput: input with +92 prefix, format as: 0300-0000000
   - OTPInput: 6 individual digit boxes, auto-advance on input,
               paste support, backspace to go back
   - CountdownTimer: shows MM:SS, triggers resend action on zero

5. Hooks:
   /hooks/useAuth.ts:
   - sendOTP(phone): calls API, handles errors
   - verifyOTP(phone, otp): calls API, on success stores access token in memory
   - register(phone, otp, profileData): complete registration flow
   - logout(): clears all auth state and cookies

All components use React Hook Form + Zod validation.
All API calls use the axios instance from src/lib/api.ts.
Show complete code for all files."
```

---

### TASK-026 — Guided Measurement Studio (Core Feature)
```
PASTE THIS TASK TO AI:

"Build the Guided Measurement Studio — the most important feature of the platform.
Location: /frontend/src/components/measurement-studio/
and: /frontend/src/app/(customer)/new-order/measurement/page.tsx

This is a STEP-BY-STEP guided flow where customers enter their body measurements
one body part at a time. Each step has: a short video, visual diagram,
do's and don'ts, and an input field.

MEASUREMENT STEPS (in this order):
1. Kameez Length (kamiz ki lambai)
2. Chest (seena)
3. Waist (kamar)
4. Hips (koolhe)
5. Shoulder Width (kandha)
6. Sleeve Length (bazu ki lambai)
7. Trouser Length (trouser ki lambai)
8. Seat/Hip for Trouser (niche ka koolha)

1. MeasurementStudio.tsx (main orchestrator):
   - Manages current step, all measurement values
   - Shows progress bar (Step X of 8)
   - Previous / Next navigation
   - On final step: Submit button
   - On submit: calls API, shows AI validation feedback
   - Auto-saves to localStorage on each step (so user doesn't lose data)

2. BodyPartStep.tsx (per-step component):
   Props: { step, value, onChange, onNext, onPrev }
   Layout:
   - Top: Step name in English + Urdu (e.g., 'Chest / سینہ')
   - Video section: embedded tutorial video (placeholder src for now)
   - Diagram: SVG body diagram with current body part highlighted
   - Instructions: 2-3 bullet points (how to measure)
   - Do's (green checkmarks): 3 tips
   - Don'ts (red X): 2 warnings
   - Input: numeric field (cm), large touch-friendly
   - Unit toggle: cm / inches (auto-convert)

3. MeasurementInput.tsx:
   - Large number input (min-h-16, text-3xl for easy mobile entry)
   - Unit switcher (CM / INCHES) with auto-conversion
   - +/- buttons for fine adjustment
   - Range indicator: 'Typical range: 85–115 cm'
   - Turns red if value is outside typical range
   - AI validation indicator (shows after submit)

4. BodyDiagram.tsx:
   - SVG of female body outline
   - Highlights different parts per step using CSS classes
   - Animated highlight (pulse) on active body part

5. ValidationFeedback.tsx:
   - Shows after AI validation completes
   - Green: 'Measurements look great!'
   - Yellow warning: 'Your [body_part] measurement seems high. Please re-measure.'
   - Each flag shown with specific guidance

6. useMeasurementStudio.ts (custom hook):
   - Manages all state: currentStep, values, isSubmitting, validationResult
   - loadSavedProgress(): from localStorage
   - saveProgress(): to localStorage
   - submitMeasurements(): POST to /api/v1/measurements
   - Unit conversion utilities

Use Framer Motion for step transition animations.
All text includes both English and Roman Urdu labels.
Show complete code for all files."
```

---

### TASK-027 — Order Tracking Page (Customer-Facing)
```
PASTE THIS TASK TO AI:

"Build the Order Tracking page — real-time order status for customers.
Location: /frontend/src/app/(customer)/orders/[id]/page.tsx

This is a critical trust-building page. Pakistani customers are anxious about
their orders — this page must be clear, reassuring, and informative.

1. Order Tracking Page (/orders/[id]):
   Timeline component showing all stages:
   ✅ Order Placed
   ✅ Payment Confirmed
   🔄 Assigned to Tailor (show tailor first name only, not last name)
   ⏳ In Stitching (shows stitching deadline countdown)
   ⏳ Quality Check
   ⏳ Dispatched (shows TCS tracking number + link)
   ⏳ Delivered

   Each stage shows:
   - Checkmark (completed), spinner (active), circle (pending)
   - Timestamp if completed
   - Stage-specific message (e.g., 'Ahmed is stitching your suit')

2. OrderStatusBadge.tsx:
   - Color-coded badges per status
   - Animated pulse on active status

3. OrderTimeline.tsx:
   - Vertical stepper component
   - Smooth animations between state changes
   - Mobile-optimized (full width on mobile)

4. TrackingDetails.tsx:
   - Shows TCS tracking number with copy button
   - 'Track on TCS' external link
   - Estimated delivery date
   - Delivery address summary

5. OrderSummary.tsx (sidebar/bottom panel):
   - Product image (from product_snapshot)
   - Garment type, key style choices
   - Total amount paid / COD pending
   - Action buttons: Cancel (if eligible), Download Receipt, Submit Feedback

6. Real-time updates using Socket.io:
   useOrderTracking(orderId) hook:
   - Joins room: order:{orderId}
   - Listens for 'order:status_updated' event
   - Updates UI without page refresh
   - Shows toast notification on status change
   - Graceful fallback: poll every 30 seconds if socket disconnects

7. FeedbackModal.tsx (shown after delivery):
   - 5-star rating for: Overall, Quality, Fit, Delivery
   - Comment text area
   - Photo upload (optional)
   - Submit button

Show complete code for all files."
```

---

### TASK-028 — Admin Dashboard (Command Center)
```
PASTE THIS TASK TO AI:

"Build the Admin Command Center dashboard for a Next.js 14 App Router app.
Location: /frontend/src/app/(admin)/

This is used by the business operations team. Needs to be data-dense, fast,
and actionable. Think: Shopify admin meets a tailoring factory floor.

1. /app/(admin)/layout.tsx:
   - Sidebar navigation (desktop) / bottom navigation (mobile)
   - Sidebar items: Dashboard, Orders, Tailors, QC Queue, Deliveries, Analytics, Settings
   - Header: search bar, notification bell, user menu
   - Active route highlighting
   - Role-based nav items (some hidden for non-super-admin)

2. /app/(admin)/dashboard/page.tsx:
   KPI Cards row:
   - Orders Today (with trend arrow vs yesterday)
   - Revenue Today (PKR)
   - Pending Assignment (action needed — highlighted if > 5)
   - In Stitching
   - Pending QC
   - Dispatched Today

   Charts section:
   - Orders by Status: Donut chart
   - Revenue Last 7 Days: Bar chart
   - Tailor Utilization: Progress bars per tailor

   Recent Orders table:
   - Columns: Order#, Customer, Status, Tailor, Deadline, Actions
   - Quick actions: Assign, View, Change Priority
   - Color-coded rows (red if deadline < 2hrs, yellow if < 24hrs)

3. /app/(admin)/orders/page.tsx:
   - Filterable, sortable orders table
   - Filters: status (multi-select), date range, tailor, search
   - Bulk actions: assign selected to tailor
   - Infinite scroll or pagination
   - Click row → order detail drawer (not new page)

4. OrderDetailDrawer.tsx:
   - Slides in from right
   - Full order info: measurements, style, product
   - Status timeline
   - Assign Tailor dropdown
   - Add notes
   - Override status (super_admin only)

5. /app/(admin)/tailors/page.tsx:
   - Tailor cards with: name, skill level, current load bar, quality score
   - Toggle availability
   - View assigned orders
   - Add new tailor form

Use recharts for all charts.
Use shadcn/ui Table, Badge, Sheet (for drawer), Select components.
Show complete code for all main files."
```

---

## ═══════════════════════════════════════════
## PHASE 10 — TESTING & HARDENING
## ═══════════════════════════════════════════

---

### TASK-029 — Complete Auto-Testing System
```
PASTE THIS TASK TO AI:

"Build the complete automated route testing system for a Node.js TypeScript
Express application. Location: /backend/src/testing/

This system validates EVERY API endpoint with one command: npm run test:routes

1. src/testing/test-fixtures.ts:
   - Creates test data for each test run:
     * testCustomer: { id, phone, accessToken }
     * testTailor: { id, accessToken }
     * testAdmin: { id, accessToken }
     * testOrder: { id, orderNumber }
     * testMeasurementProfile: { id }
   - setup(): runs before test suite
   - teardown(): cleans test data after suite

2. src/testing/route-validator.ts:
   Complete test manifest with 60+ route tests:

   Structure:
   interface RouteTest {
     id: string;
     method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
     path: string;              // e.g., '/api/v1/auth/send-otp'
     auth?: 'customer'|'admin'|'tailor'|'qc'|'delivery'|null;
     body?: Record<string, unknown>;
     params?: Record<string, string>;  // :id replacements
     query?: Record<string, string>;
     expectedStatus: number;
     validateResponse?: (body: unknown) => boolean;
     description: string;
     tags: string[];            // ['auth','security','happy-path','error-path']
   }

   Tests covering every module:
   AUTH (10 tests):
     - Send OTP: valid, invalid phone, rate limit
     - Verify OTP: valid, wrong, expired
     - Refresh: valid cookie, no cookie, expired
     - Logout: valid, unauthorized
     - GET /me: authenticated, unauthenticated

   USERS (6 tests):
     - Get profile: authenticated, unauthenticated
     - Update profile: valid, invalid data
     - Addresses: create, list, delete

   MEASUREMENTS (8 tests):
     - Create: valid measurements, missing required fields
     - List, Get by ID, Update, Delete
     - Set default, AI validate

   ORDERS (8 tests):
     - Create: valid, missing measurement, wrong address
     - List: as customer, as admin
     - Get by ID: owner, non-owner (403), admin
     - Cancel: eligible, non-eligible (409)

   ADMIN (10 tests):
     - Access without admin role: 403
     - List orders with filters
     - Assign tailor
     - Analytics endpoints

   QC (6 tests):
     - Pending list: as QC, as customer (403)
     - Submit inspection: approved, rejected
     - History

   PAYMENTS (6 tests):
     - Initiate: valid order, already paid
     - Paddle webhook: valid signature, invalid signature
     - COD confirm: as delivery agent, as customer (403)

   SECURITY (8 tests):
     - SQL injection attempt in order search → 422
     - XSS payload in name field → 422 or sanitized
     - JWT with wrong signature → 401
     - Expired JWT → 401
     - Admin route with customer token → 403
     - Order of another customer → 403
     - Webhook without signature → 401
     - Rate limit after burst → 429

3. src/testing/test-runner.ts:
   - Imports all tests
   - Runs in sequence with colored output:
     ✅ [AUTH-01] POST /auth/send-otp → 200 (45ms)
     ❌ [AUTH-02] POST /auth/send-otp invalid → Expected 422, got 200
   - Final report:
     '=== ROUTE VALIDATION REPORT ==='
     'Total: 62 | Passed: 61 | Failed: 1 | Skipped: 0'
     'Duration: 3.2s'
     'Failed tests: [AUTH-02] ...'
   - Exit code 1 if any failure

4. package.json script:
   'test:routes': 'ts-node src/testing/test-runner.ts'
   'test:security': 'ts-node src/testing/test-runner.ts --tags security'
   'test:smoke': 'ts-node src/testing/test-runner.ts --tags smoke'

Show complete code for all files."
```

---

### TASK-030 — Socket.io Real-Time Setup
```
PASTE THIS TASK TO AI:

"Set up Socket.io for real-time order tracking updates in a Node.js TypeScript app.
Location: /backend/src/realtime/

1. src/realtime/socket.ts:
   - Initialize Socket.io with CORS config (allow frontend URL)
   - Authentication middleware:
     * Read JWT from handshake.auth.token
     * Verify token, attach user to socket
     * Reject connection on invalid token
   - On connection:
     * Customers join room: 'user:{userId}'
     * Admins join room: 'admin:dashboard'
     * Tailors join room: 'tailor:{tailorId}'
   - On order status change: emit to correct rooms

2. src/realtime/events.ts:
   Define all socket events as typed constants:
   - ORDER_STATUS_UPDATED: { orderId, orderNumber, newStatus, updatedAt }
   - NEW_ORDER_ALERT: (for admin dashboard) { orderId, orderNumber, garmentType }
   - TAILOR_ASSIGNMENT: (for tailor) { orderId, deadline, garmentType }
   - QC_READY: (for QC inspector) { orderId, tailorName }
   - DELIVERY_UPDATE: (for customer) { orderId, status, trackingInfo }
   - NOTIFICATION: (for anyone) { title, message, type }

3. src/realtime/emitters.ts:
   Helper functions called by services when state changes:
   - emitOrderStatusUpdate(io, orderId, customerId, newStatus)
   - emitNewOrderToAdmin(io, orderData)
   - emitTailorAssignment(io, tailorId, orderData)
   - emitQCReady(io, inspectorId, orderData)
   - emitDeliveryUpdate(io, customerId, deliveryData)

4. Frontend hook (frontend/src/hooks/useSocket.ts):
   - Connects to Socket.io server with access token
   - Manages connection state (connected/disconnected/reconnecting)
   - Auto-reconnect with exponential backoff
   - useOrderTracking(orderId): subscribes to order room events
   - Disconnects on component unmount

Show complete code for all files."
```

---

## ═══════════════════════════════════════════
## PHASE 11 — LAUNCH PREP
## ═══════════════════════════════════════════

---

### TASK-031 — Free Tier Service Setup Guide
```
PASTE THIS TASK TO AI:

"Create a step-by-step setup guide document (SETUP_GUIDE.md) for deploying
the tailoring platform on completely free services for initial launch.

Include exact steps (not general instructions) for:

1. NEON.TECH (PostgreSQL):
   - Create account at neon.tech
   - Create project: 'tailoring-platform'
   - Create TWO databases:
     * tailoring_prod (main branch)
     * tailoring_staging (staging branch — Neon supports branching!)
   - Get connection strings for both
   - Where to add in Railway environment variables

2. UPSTASH (Redis):
   - Create account at upstash.com
   - Create TWO Redis databases:
     * tailoring-prod
     * tailoring-staging
   - Get REST URLs and tokens
   - Note: Upstash uses REST API, not regular Redis — show the connection string format

3. RAILWAY (Backend hosting):
   - Create account at railway.app
   - Create new project
   - Create TWO services from GitHub repo:
     * tailoring-backend-prod (deploys from main branch)
     * tailoring-backend-staging (deploys from staging branch)
   - Set root directory: /backend
   - Build command: npm run build
   - Start command: npm run start
   - Add all environment variables
   - Set custom domains (or use Railway-provided URLs)

4. VERCEL (Frontend hosting):
   - Import GitHub repo
   - Framework: Next.js
   - Root directory: /frontend
   - Create TWO deployments:
     * Production (from main branch)
     * Preview (from staging branch — Vercel does this automatically)
   - Environment variables for frontend

5. CLOUDINARY (Media storage):
   - Create free account
   - Create upload presets for: profile-images, measurement-photos, qc-images, pod-images
   - Signed upload setup

6. RESEND (Email):
   - Create account, verify domain (or use their sandbox domain for now)
   - Get API key

7. META WHATSAPP CLOUD API (Free):
   - Create Meta Developer account
   - Create WhatsApp Business app
   - Get phone number ID and API token
   - Set up webhook URL (pointing to Railway)
   - Verify webhook

8. GitHub Secrets:
   - List ALL secrets that need to be added to GitHub repo
   - Which secrets go to which environment (staging vs production)

Format as a clear numbered checklist. Include screenshots descriptions
where important. Total setup time estimate per service."
```

---

## SUMMARY: TASK EXECUTION ORDER

```
WEEK 1 (Environment):
  Day 1: TASK-001 (Git branches) + TASK-002 (Folder structure)
  Day 2: TASK-003 (Docker Compose) + TASK-007 (Env files)
  Day 3: TASK-004 (Backend init) + TASK-005 (Backend base files)
  Day 4: TASK-006 (Frontend init)
  Day 5: TASK-008 (CI/CD pipelines)

WEEK 2–3 (Backend Foundation):
  TASK-009 → TASK-010 → TASK-011 → TASK-012 → TASK-013

WEEK 3–4 (Core Modules):
  TASK-014 → TASK-015 → TASK-016 → TASK-017

WEEK 5–6 (Admin + Operations):
  TASK-018 → TASK-019 → TASK-020

WEEK 7 (Payments):
  TASK-021

WEEK 8 (Delivery + Notifications):
  TASK-022 → TASK-023

WEEK 9 (AI):
  TASK-024

WEEK 10–12 (Frontend):
  TASK-025 → TASK-026 → TASK-027 → TASK-028

WEEK 13 (Testing):
  TASK-029 → TASK-030

WEEK 14 (Launch):
  TASK-031 → Deploy → Test → Go Live
```

---

## HOW TO USE THESE TASKS

```
1. Open Cursor / Claude Code / GitHub Copilot Chat
2. Copy the TASK-XXX block exactly as written
3. Paste into AI chat
4. AI produces the code
5. Review, test, commit to develop branch
6. Move to next task

COMMIT CONVENTION:
  feat(auth): add OTP-based phone login
  feat(orders): implement order creation with measurements snapshot
  fix(payments): correct paddle webhook signature verification
  chore(ci): add staging deployment workflow
  test(auth): add route validation tests for auth module

PR CONVENTION:
  develop → staging: 'Staging: Sprint X features ready for client review'
  staging → main: 'Release: vX.X.X — [feature summary]'
```

---

*Master Plan Version: 1.0 | Tasks: 31 | Timeline: 14 Weeks | Team: 2 developers*
