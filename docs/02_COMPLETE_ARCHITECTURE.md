# 🏗️ Complete System Architecture Blueprint
## Centralized Custom Tailoring & Delivery Platform
### From Zero to 500K Clients — Production-Ready Design

---

## TABLE OF CONTENTS
1. Architecture Overview
2. System Architecture Diagram
3. Technology Stack (Justified)
4. Database Schema (Complete)
5. Backend Structure
6. Frontend Structure
7. API Design & Endpoint Map
8. Security Architecture
9. AI Integration Points
10. Payment Integration (Paddle)
11. Testing Strategy & Automation
12. Deployment Strategy (Free → Paid)
13. Scaling Plan (500K clients)
14. Monitoring & Observability
15. CI/CD Pipeline

---

## 1. ARCHITECTURE OVERVIEW

### Design Philosophy
- **Security by Design** — Not bolted on, built in from Day 1
- **Scalability by Default** — Every decision made with 500K users in mind
- **Testability First** — Every route auto-testable, no manual QA for regressions
- **AI-Augmented** — AI embedded in measurement, assignment, QC, and support
- **Mobile-Native** — Pakistani market is 85%+ mobile

### Architecture Pattern
```
Microservices-Ready Modular Monolith
```
Why: A full microservices architecture is overkill for initial launch and adds operational complexity. A **modular monolith** with clear domain boundaries allows:
- Fast development velocity now
- Clean extraction into microservices when scaling to 500K users
- Shared database (initially), separated when needed

---

## 2. SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Web App     │  │  Mobile App  │  │  Admin Dashboard     │  │
│  │  (Next.js)   │  │(React Native)│  │  (Next.js)           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼──────────────────────┼─────────────┘
          │                 │                        │
          └────────────────►│◄───────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│           Cloudflare (CDN + DDoS + WAF + Rate Limiting)         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      BACKEND LAYER                               │
│                   Node.js / Express.js                           │
│  ┌────────────┐ ┌──────────────┐ ┌───────────┐ ┌────────────┐  │
│  │Auth Module │ │Order Module  │ │Tailor Mod.│ │Payment Mod.│  │
│  └────────────┘ └──────────────┘ └───────────┘ └────────────┘  │
│  ┌────────────┐ ┌──────────────┐ ┌───────────┐ ┌────────────┐  │
│  │Measurement │ │QC Module     │ │Delivery   │ │AI Module   │  │
│  │Module      │ │              │ │Module     │ │            │  │
│  └────────────┘ └──────────────┘ └───────────┘ └────────────┘  │
│  ┌────────────┐ ┌──────────────┐ ┌───────────┐                 │
│  │Notif. Mod. │ │Analytics Mod.│ │Admin Mod. │                 │
│  └────────────┘ └──────────────┘ └───────────┘                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PostgreSQL   │  │    Redis      │  │  Cloudinary   │
│  (Primary DB) │  │  (Cache/Queue)│  │  (Media Store)│
└───────────────┘  └───────────────┘  └───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                     │
│  TCS API | Paddle | JazzCash | EasyPaisa |            │
│  WhatsApp Business API | Twilio | OpenAI API          │
└───────────────────────────────────────────────────────┘
```

---

## 3. TECHNOLOGY STACK (JUSTIFIED)

### Frontend
| Tech | Choice | Reason |
|------|--------|--------|
| Framework | **Next.js 14** (App Router) | SSR for SEO, ISR for catalog pages, RSC for performance |
| Mobile | **React Native + Expo** | Code sharing with web, faster development |
| State | **Zustand** | Lightweight, no boilerplate, scales cleanly |
| Data Fetching | **TanStack Query v5** | Cache, background refetch, optimistic updates |
| UI Components | **shadcn/ui + Tailwind CSS** | Unstyled by default, fully customizable for brand |
| Forms | **React Hook Form + Zod** | Type-safe, performant, validation consistent with backend |
| Animation | **Framer Motion** | For Measurement Studio guided flow animations |
| Video | **Video.js / native HTML5** | Measurement tutorial videos |

### Backend
| Tech | Choice | Reason |
|------|--------|--------|
| Runtime | **Node.js 20 LTS** | JS throughout, large ecosystem, async I/O perfect for this |
| Framework | **Express.js + tRPC** | REST for public APIs, tRPC for internal type-safe calls |
| Validation | **Zod** | Shared schemas with frontend, runtime type safety |
| ORM | **Prisma** | Type-safe DB access, migrations, excellent PostgreSQL support |
| Auth | **Custom JWT + Refresh Tokens** | Full control over security implementation |
| Queue | **BullMQ (Redis-backed)** | Order processing, email/WhatsApp queues, tailor assignment |
| Real-time | **Socket.io** | Live order status updates |
| File Processing | **Multer + Sharp** | Image uploads, compression, format conversion |

### Database
| Tech | Choice | Reason |
|------|--------|--------|
| Primary | **PostgreSQL 16** | ACID compliance, JSON support, excellent for relational data |
| Cache | **Redis 7** | Session storage, rate limiting, job queues, real-time pub/sub |
| Search | **PostgreSQL Full-Text Search** (initially) → Elasticsearch at scale | |
| File Storage | **Cloudinary** | Free tier generous, image transformation built-in, CDN |

### Why PostgreSQL over MongoDB?
This project has **highly relational data**: Orders link to Users, Measurements, Tailors, QC Records, Deliveries, Payments, and Feedback. MongoDB's flexibility would hurt here — we need ACID guarantees, foreign key constraints, and complex JOIN queries for the admin dashboard. PostgreSQL with JSONB columns gives us the best of both worlds.

### Infrastructure (Free Tier → Paid)
| Service | Free Tier | Paid Alternative |
|---------|-----------|-----------------|
| Backend Hosting | **Railway.app** (free tier, $5 credit) | Railway Pro / AWS ECS |
| Frontend Hosting | **Vercel** (free tier) | Vercel Pro |
| Database | **Neon.tech** (PostgreSQL, free tier) | Neon Pro / AWS RDS |
| Redis | **Upstash Redis** (free tier) | Upstash Pro / ElastiCache |
| Media | **Cloudinary** (free 25GB) | Cloudinary Growth |
| Email | **Resend** (free 3000/month) | Resend Pro |
| WhatsApp | **WhatsApp Cloud API** (free tier) | Meta Business |
| Monitoring | **Better Stack** (free) | Better Stack Pro |

**Total Free Tier Cost: $0/month** (with usage limits suitable for launch/beta)

---

## 4. DATABASE SCHEMA (COMPLETE)

### 4.1 Core Design Principles
- **UUIDs** for all primary keys (not auto-increment integers) — prevents enumeration attacks
- **Soft deletes** everywhere (`deleted_at` nullable timestamp)
- **Audit trails** on all critical tables (`created_at`, `updated_at`, `created_by`)
- **Row-level security** ready for multi-tenancy
- **Indexes** pre-planned for all common query patterns
- **JSONB** for flexible metadata without sacrificing relational integrity

### 4.2 Complete Schema

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'tailor', 'qc_inspector', 'delivery_agent', 'super_admin');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'payment_confirmed',
  'assigned',
  'in_stitching',
  'stitching_complete',
  'qc_pending',
  'qc_approved',
  'qc_rejected',
  'dispatched',
  'in_transit',
  'delivered',
  'return_requested',
  'returned',
  'cancelled',
  'refunded'
);
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_method AS ENUM ('paddle', 'jazzcash', 'easypaisa', 'bank_transfer', 'cod');
CREATE TYPE qc_result AS ENUM ('approved', 'rejected', 'needs_minor_fix');
CREATE TYPE delivery_status AS ENUM ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'returned');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE tailor_skill_level AS ENUM ('junior', 'mid', 'senior', 'master');
CREATE TYPE garment_type AS ENUM ('kameez', 'trouser', 'dupatta', 'kurta', 'shalwar', 'full_suit', 'other');
CREATE TYPE fabric_type AS ENUM ('cotton', 'lawn', 'chiffon', 'silk', 'linen', 'khaddar', 'karandi', 'other');

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             VARCHAR(255) UNIQUE,
  phone             VARCHAR(20) UNIQUE NOT NULL,
  phone_verified    BOOLEAN DEFAULT FALSE,
  email_verified    BOOLEAN DEFAULT FALSE,
  password_hash     TEXT,
  role              user_role NOT NULL DEFAULT 'customer',
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100),
  gender            gender,
  date_of_birth     DATE,
  profile_image_url TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  is_blocked        BOOLEAN DEFAULT FALSE,
  block_reason      TEXT,
  last_login_at     TIMESTAMPTZ,
  last_login_ip     INET,
  failed_login_count INTEGER DEFAULT 0,
  locked_until      TIMESTAMPTZ,
  referral_code     VARCHAR(20) UNIQUE,
  referred_by       UUID REFERENCES users(id),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- ============================================================
-- AUTH TOKENS (Refresh Tokens)
-- ============================================================
CREATE TABLE auth_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE, -- Store hash, not raw token
  device_info   JSONB DEFAULT '{}',   -- {browser, os, device_type}
  ip_address    INET,
  is_revoked    BOOLEAN DEFAULT FALSE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_hash ON auth_tokens(token_hash);

-- ============================================================
-- OTP TABLE
-- ============================================================
CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  phone       VARCHAR(20),
  email       VARCHAR(255),
  code_hash   TEXT NOT NULL, -- Store hash of OTP
  purpose     VARCHAR(50) NOT NULL, -- 'phone_verify', 'login', 'reset_password'
  attempts    INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  is_used     BOOLEAN DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_codes(phone, purpose) WHERE is_used = FALSE;

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label         VARCHAR(50),            -- 'Home', 'Office', 'Parents'
  full_name     VARCHAR(200) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          VARCHAR(100) NOT NULL,
  province      VARCHAR(100) NOT NULL,
  postal_code   VARCHAR(20),
  country       VARCHAR(100) DEFAULT 'Pakistan',
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- MEASUREMENT PROFILES
-- ============================================================
CREATE TABLE measurement_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label               VARCHAR(100) DEFAULT 'My Measurements',
  is_default          BOOLEAN DEFAULT FALSE,

  -- Upper body (in centimeters, stored as DECIMAL for precision)
  chest               DECIMAL(5,2),
  waist               DECIMAL(5,2),
  hips                DECIMAL(5,2),
  shoulder_width      DECIMAL(5,2),
  back_length         DECIMAL(5,2),
  front_length        DECIMAL(5,2),
  sleeve_length       DECIMAL(5,2),
  armhole             DECIMAL(5,2),
  bicep               DECIMAL(5,2),
  wrist               DECIMAL(5,2),
  neck                DECIMAL(5,2),

  -- Lower body
  trouser_length      DECIMAL(5,2),
  thigh               DECIMAL(5,2),
  knee                DECIMAL(5,2),
  calf                DECIMAL(5,2),
  ankle               DECIMAL(5,2),
  trouser_waist       DECIMAL(5,2),
  seat                DECIMAL(5,2),

  -- Kameez specific
  kameez_length       DECIMAL(5,2),
  gala_style          VARCHAR(50),      -- neckline style preference
  sleeve_style        VARCHAR(50),
  
  -- Validation metadata
  ai_validation_score DECIMAL(3,2),    -- 0.00 - 1.00 confidence
  ai_flags            JSONB DEFAULT '[]', -- array of flagged anomalies
  photo_urls          JSONB DEFAULT '[]', -- optional reference photos
  
  -- Version control for measurements
  version             INTEGER DEFAULT 1,
  notes               TEXT,
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_measurements_user_id ON measurement_profiles(user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- PRODUCTS (Unstitched Suits / Items)
-- ============================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url      TEXT,               -- Original product link pasted by customer
  name            VARCHAR(500),
  brand           VARCHAR(200),
  description     TEXT,
  images          JSONB DEFAULT '[]', -- array of image URLs
  fabric_type     fabric_type,
  garment_type    garment_type DEFAULT 'full_suit',
  color_tags      TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  parsed_at       TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STYLE CONFIGURATIONS (Stitching Preferences)
-- ============================================================
CREATE TABLE style_configurations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES users(id),
  label                 VARCHAR(100),
  garment_type          garment_type NOT NULL,
  gala_style            VARCHAR(100),     -- e.g., 'round', 'v-neck', 'boat', 'tulip'
  gala_depth_cm         DECIMAL(4,2),
  sleeve_style          VARCHAR(100),     -- e.g., 'straight', 'bell', 'puff'
  sleeve_hem_style      VARCHAR(100),
  kameez_hem_style      VARCHAR(100),
  side_cut_style        VARCHAR(100),     -- e.g., 'straight', 'angrakha', 'high-low'
  trouser_style         VARCHAR(100),     -- e.g., 'straight', 'patiala', 'tulip', 'wide-leg'
  pocket_preference     VARCHAR(50),
  lining_required       BOOLEAN DEFAULT FALSE,
  embroidery_notes      TEXT,
  special_instructions  TEXT,
  reference_images      JSONB DEFAULT '[]',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS (Core Table)
-- ============================================================
CREATE TABLE orders (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number            VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'STL-2025-00001'
  customer_id             UUID NOT NULL REFERENCES users(id),
  
  -- Product info
  product_id              UUID REFERENCES products(id),
  garment_type            garment_type NOT NULL,
  
  -- Measurement snapshot (denormalized for immutability)
  measurement_profile_id  UUID REFERENCES measurement_profiles(id),
  measurement_snapshot    JSONB NOT NULL, -- Copy of measurements at time of order
  
  -- Style configuration snapshot
  style_config_id         UUID REFERENCES style_configurations(id),
  style_snapshot          JSONB NOT NULL,
  
  -- Tailor assignment
  assigned_tailor_id      UUID REFERENCES users(id),
  assigned_at             TIMESTAMPTZ,
  
  -- QC
  qc_inspector_id         UUID REFERENCES users(id),
  qc_result               qc_result,
  qc_inspected_at         TIMESTAMPTZ,
  qc_notes                TEXT,
  qc_images               JSONB DEFAULT '[]',
  
  -- Delivery
  delivery_address_id     UUID REFERENCES addresses(id),
  delivery_address_snapshot JSONB NOT NULL,
  courier_id              VARCHAR(100),   -- TCS or other
  tracking_number         VARCHAR(200),
  estimated_delivery_date DATE,
  
  -- Deadlines
  stitching_deadline      TIMESTAMPTZ,
  
  -- Status
  status                  order_status DEFAULT 'pending_payment',
  
  -- Financial
  stitching_fee           DECIMAL(10,2) NOT NULL,
  delivery_fee            DECIMAL(10,2) DEFAULT 0,
  addon_fee               DECIMAL(10,2) DEFAULT 0,
  discount_amount         DECIMAL(10,2) DEFAULT 0,
  total_amount            DECIMAL(10,2) NOT NULL,
  currency                VARCHAR(3) DEFAULT 'PKR',
  
  -- COD
  is_cod                  BOOLEAN DEFAULT FALSE,
  cod_collected           BOOLEAN DEFAULT FALSE,
  cod_collected_at        TIMESTAMPTZ,
  
  -- Admin
  admin_notes             TEXT,
  priority_level          INTEGER DEFAULT 0, -- 0=normal, 1=high, 2=urgent
  
  -- Cancellation
  cancelled_at            TIMESTAMPTZ,
  cancellation_reason     TEXT,
  cancelled_by            UUID REFERENCES users(id),
  
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_tailor_id ON orders(assigned_tailor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);

-- Auto-generate order numbers
CREATE SEQUENCE order_number_seq START 1;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'STL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- ORDER STATUS HISTORY (Audit Trail)
-- ============================================================
CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  UUID REFERENCES users(id),
  notes       TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id),
  customer_id         UUID NOT NULL REFERENCES users(id),
  
  -- Payment details
  method              payment_method NOT NULL,
  status              payment_status DEFAULT 'pending',
  amount              DECIMAL(10,2) NOT NULL,
  currency            VARCHAR(3) DEFAULT 'PKR',
  
  -- Gateway reference
  gateway_transaction_id  VARCHAR(500),  -- Paddle/JazzCash/EasyPaisa txn ID
  gateway_response    JSONB DEFAULT '{}', -- Full gateway response
  gateway_webhook_data JSONB DEFAULT '{}',
  
  -- Paddle specific
  paddle_subscription_id  VARCHAR(200),
  paddle_customer_id      VARCHAR(200),
  
  -- Refund
  refund_amount       DECIMAL(10,2) DEFAULT 0,
  refunded_at         TIMESTAMPTZ,
  refund_reason       TEXT,
  
  paid_at             TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  failure_reason      TEXT,
  
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_gateway_txn ON payments(gateway_transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TAILORS (Extended Profile for tailor role users)
-- ============================================================
CREATE TABLE tailor_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id           VARCHAR(50) UNIQUE,
  skill_level           tailor_skill_level DEFAULT 'junior',
  specializations       TEXT[],           -- ['kameez', 'trouser', 'embroidery', 'patiala']
  max_daily_capacity    INTEGER DEFAULT 3, -- max orders per day
  current_load          INTEGER DEFAULT 0, -- current active orders
  total_orders_completed INTEGER DEFAULT 0,
  avg_completion_time_hours DECIMAL(5,2),
  quality_score         DECIMAL(3,2) DEFAULT 0.00, -- 0.00-5.00
  is_available          BOOLEAN DEFAULT TRUE,
  availability_notes    TEXT,
  joined_at             DATE,
  metadata              JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tailor_profiles_user_id ON tailor_profiles(user_id);
CREATE INDEX idx_tailor_profiles_available ON tailor_profiles(is_available, current_load);

-- ============================================================
-- DELIVERY RECORDS
-- ============================================================
CREATE TABLE deliveries (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID UNIQUE NOT NULL REFERENCES orders(id),
  delivery_agent_id     UUID REFERENCES users(id),
  courier_name          VARCHAR(100) DEFAULT 'TCS',
  tracking_number       VARCHAR(200),
  tracking_url          TEXT,
  status                delivery_status DEFAULT 'pending',
  
  -- Timeline
  picked_up_at          TIMESTAMPTZ,
  estimated_delivery    TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  
  -- Proof of delivery
  pod_image_url         TEXT,
  pod_signature_url     TEXT,
  pod_notes             TEXT,
  
  -- Delivery attempts
  attempt_count         INTEGER DEFAULT 0,
  last_attempt_at       TIMESTAMPTZ,
  failed_reason         TEXT,
  
  -- TCS specific fields
  courier_response      JSONB DEFAULT '{}',
  
  metadata              JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_tracking ON deliveries(tracking_number);
CREATE INDEX idx_deliveries_agent ON deliveries(delivery_agent_id);

-- ============================================================
-- DELIVERY STATUS HISTORY
-- ============================================================
CREATE TABLE delivery_status_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id     UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status          delivery_status NOT NULL,
  location        TEXT,
  notes           TEXT,
  recorded_by     UUID REFERENCES users(id),
  courier_data    JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id),
  channel         notification_channel NOT NULL,
  status          notification_status DEFAULT 'pending',
  template_key    VARCHAR(100),           -- e.g., 'order_assigned', 'qc_approved'
  subject         TEXT,
  body            TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}',     -- recipient phone/email, provider response
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  failure_reason  TEXT,
  retry_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status, scheduled_at);
CREATE INDEX idx_notifications_order_id ON notifications(order_id);

-- ============================================================
-- RATINGS & FEEDBACK
-- ============================================================
CREATE TABLE order_feedback (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID UNIQUE NOT NULL REFERENCES orders(id),
  customer_id         UUID NOT NULL REFERENCES users(id),
  tailor_id           UUID REFERENCES users(id),
  
  -- Ratings (1-5)
  overall_rating      SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating      SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
  delivery_rating     SMALLINT CHECK (delivery_rating BETWEEN 1 AND 5),
  fit_rating          SMALLINT CHECK (fit_rating BETWEEN 1 AND 5),
  
  comment             TEXT,
  images              JSONB DEFAULT '[]',
  is_public           BOOLEAN DEFAULT TRUE,
  
  admin_response      TEXT,
  admin_responded_at  TIMESTAMPTZ,
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_order_id ON order_feedback(order_id);
CREATE INDEX idx_feedback_tailor_id ON order_feedback(tailor_id);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     UUID NOT NULL REFERENCES users(id),
  referee_id      UUID NOT NULL REFERENCES users(id),
  referral_code   VARCHAR(20) NOT NULL,
  order_id        UUID REFERENCES orders(id), -- order that triggered reward
  reward_amount   DECIMAL(10,2),
  reward_given    BOOLEAN DEFAULT FALSE,
  reward_given_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS / DISCOUNT CODES
-- ============================================================
CREATE TABLE coupons (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                VARCHAR(50) UNIQUE NOT NULL,
  description         TEXT,
  discount_type       VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value      DECIMAL(10,2) NOT NULL,
  min_order_amount    DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),        -- cap for percentage discounts
  usage_limit         INTEGER,              -- NULL = unlimited
  used_count          INTEGER DEFAULT 0,
  per_user_limit      INTEGER DEFAULT 1,
  valid_from          TIMESTAMPTZ NOT NULL,
  valid_until         TIMESTAMPTZ,
  is_active           BOOLEAN DEFAULT TRUE,
  applicable_to       JSONB DEFAULT '{}',   -- restrict to specific garment types, users
  created_by          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = TRUE;

-- ============================================================
-- COUPON USAGE LOG
-- ============================================================
CREATE TABLE coupon_usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  order_id    UUID NOT NULL REFERENCES orders(id),
  discount_applied DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT LINK PARSE LOG (for link parser feature)
-- ============================================================
CREATE TABLE product_parse_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  source_url  TEXT NOT NULL,
  parsed_data JSONB DEFAULT '{}',
  success     BOOLEAN DEFAULT FALSE,
  error       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI LOGS (for audit and improvement)
-- ============================================================
CREATE TABLE ai_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id),
  order_id        UUID REFERENCES orders(id),
  feature         VARCHAR(100),  -- 'measurement_validation', 'tailor_assignment', 'chatbot'
  input_data      JSONB,
  output_data     JSONB,
  model_used      VARCHAR(100),
  tokens_used     INTEGER,
  latency_ms      INTEGER,
  success         BOOLEAN DEFAULT TRUE,
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_feature ON ai_logs(feature, created_at DESC);

-- ============================================================
-- AUDIT LOG (Security)
-- ============================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(200) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- SYSTEM SETTINGS (Key-Value Config)
-- ============================================================
CREATE TABLE system_settings (
  key         VARCHAR(200) PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','addresses','measurement_profiles','orders',
    'payments','tailor_profiles','deliveries','order_feedback',
    'coupons','style_configurations','products'
  ])
  LOOP
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END $$;
```

---

## 5. BACKEND STRUCTURE

```
/backend
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── index.ts              # Centralized config (env vars)
│   │   ├── database.ts           # Prisma client
│   │   ├── redis.ts              # Redis client (Upstash)
│   │   └── constants.ts          # App-wide constants
│   │
│   ├── modules/                  # Domain modules
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.test.ts
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.validator.ts
│   │   │   └── users.test.ts
│   │   ├── measurements/
│   │   │   ├── measurements.routes.ts
│   │   │   ├── measurements.controller.ts
│   │   │   ├── measurements.service.ts
│   │   │   ├── measurements.validator.ts
│   │   │   └── measurements.test.ts
│   │   ├── orders/
│   │   │   ├── orders.routes.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── orders.validator.ts
│   │   │   ├── orders.events.ts      # EventEmitter for order state machine
│   │   │   └── orders.test.ts
│   │   ├── payments/
│   │   │   ├── payments.routes.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── paddle.service.ts
│   │   │   ├── jazzcash.service.ts
│   │   │   ├── easypaisa.service.ts
│   │   │   └── payments.test.ts
│   │   ├── tailors/
│   │   │   ├── tailors.routes.ts
│   │   │   ├── tailors.controller.ts
│   │   │   ├── tailors.service.ts
│   │   │   └── tailors.test.ts
│   │   ├── qc/
│   │   │   ├── qc.routes.ts
│   │   │   ├── qc.controller.ts
│   │   │   ├── qc.service.ts
│   │   │   └── qc.test.ts
│   │   ├── delivery/
│   │   │   ├── delivery.routes.ts
│   │   │   ├── delivery.controller.ts
│   │   │   ├── delivery.service.ts
│   │   │   ├── tcs.service.ts        # TCS API wrapper
│   │   │   └── delivery.test.ts
│   │   ├── products/
│   │   │   ├── products.routes.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── link-parser.service.ts # Product link scraper
│   │   │   └── products.test.ts
│   │   ├── ai/
│   │   │   ├── ai.routes.ts
│   │   │   ├── measurement-validator.service.ts
│   │   │   ├── tailor-matcher.service.ts
│   │   │   ├── chatbot.service.ts
│   │   │   ├── style-recommender.service.ts
│   │   │   └── ai.test.ts
│   │   ├── notifications/
│   │   │   ├── notifications.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   └── templates/           # Notification templates
│   │   ├── admin/
│   │   │   ├── admin.routes.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── admin.test.ts
│   │   └── uploads/
│   │       ├── uploads.routes.ts
│   │       ├── uploads.controller.ts
│   │       └── cloudinary.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT verification
│   │   ├── rbac.middleware.ts        # Role-based access control
│   │   ├── rateLimit.middleware.ts   # Route-level rate limiting
│   │   ├── validate.middleware.ts    # Zod validation wrapper
│   │   ├── errorHandler.middleware.ts # Global error handler
│   │   ├── requestLogger.middleware.ts
│   │   ├── helmet.middleware.ts      # Security headers
│   │   ├── cors.middleware.ts
│   │   └── audit.middleware.ts      # Audit log writer
│   │
│   ├── shared/
│   │   ├── types/                   # Shared TypeScript types
│   │   ├── utils/
│   │   │   ├── crypto.utils.ts      # Hash, encrypt, decrypt
│   │   │   ├── token.utils.ts       # JWT generation/verification
│   │   │   ├── pagination.utils.ts
│   │   │   ├── response.utils.ts    # Standardized API responses
│   │   │   └── sanitize.utils.ts    # Input sanitization
│   │   └── errors/
│   │       ├── AppError.ts
│   │       ├── AuthError.ts
│   │       └── ValidationError.ts
│   │
│   ├── jobs/                        # BullMQ background jobs
│   │   ├── queues.ts                # Queue definitions
│   │   ├── order-assignment.job.ts  # Auto-assign tailors
│   │   ├── notification.job.ts      # Send queued notifications
│   │   ├── deadline-monitor.job.ts  # Alert on approaching deadlines
│   │   ├── delivery-sync.job.ts     # Sync TCS tracking status
│   │   └── analytics.job.ts         # Compute daily analytics
│   │
│   ├── realtime/
│   │   ├── socket.ts                # Socket.io setup
│   │   └── events.ts                # Event definitions
│   │
│   └── testing/
│       ├── route-validator.ts       # AUTO ROUTE TESTING SYSTEM
│       ├── seed.ts                  # Test data seeder
│       └── fixtures/                # Test fixtures
│
├── prisma/
│   ├── schema.prisma                # Prisma schema
│   └── migrations/                  # DB migrations
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.test
├── docker-compose.yml               # Local dev with PostgreSQL + Redis
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. FRONTEND STRUCTURE

```
/frontend
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify-otp/page.tsx
│   │   ├── (customer)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── new-order/
│   │   │   │   ├── page.tsx          # Step 1: Paste product link
│   │   │   │   ├── measurement/page.tsx  # Step 2: Guided measurement
│   │   │   │   ├── style/page.tsx        # Step 3: Style preferences
│   │   │   │   ├── review/page.tsx       # Step 4: Review order
│   │   │   │   └── payment/page.tsx      # Step 5: Payment
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Orders list
│   │   │   │   └── [id]/page.tsx     # Order tracking detail
│   │   │   ├── measurements/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── tailors/page.tsx
│   │   │   ├── qc/page.tsx
│   │   │   ├── delivery/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── (tailor)/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── orders/[id]/page.tsx
│   │   ├── (qc)/
│   │   │   └── inspection/[id]/page.tsx
│   │   └── api/                      # Next.js API routes (BFF layer)
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── measurement-studio/       # Guided measurement flow
│   │   │   ├── MeasurementStudio.tsx
│   │   │   ├── BodyPartStep.tsx
│   │   │   ├── VideoGuide.tsx
│   │   │   ├── MeasurementInput.tsx
│   │   │   └── ValidationFeedback.tsx
│   │   ├── order-tracking/
│   │   │   ├── OrderTimeline.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── admin/
│   │   └── shared/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   ├── useMeasurements.ts
│   │   └── useSocket.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── orderStore.ts
│   │   └── measurementStore.ts
│   │
│   ├── lib/
│   │   ├── api.ts                    # Axios/fetch wrapper
│   │   ├── validations.ts            # Zod schemas
│   │   └── utils.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 7. API DESIGN & COMPLETE ENDPOINT MAP

### Base URL: `/api/v1`

### Authentication
```
POST   /auth/send-otp              # Send OTP to phone
POST   /auth/verify-otp            # Verify OTP, get tokens
POST   /auth/login                 # Email/password login
POST   /auth/refresh               # Refresh access token
POST   /auth/logout                # Revoke refresh token
POST   /auth/logout-all            # Revoke all sessions
GET    /auth/me                    # Current user info
```

### Users
```
GET    /users/profile              # Get own profile
PATCH  /users/profile              # Update profile
POST   /users/profile/image        # Upload profile image
GET    /users/addresses            # List addresses
POST   /users/addresses            # Add address
PUT    /users/addresses/:id        # Update address
DELETE /users/addresses/:id        # Delete address
PATCH  /users/addresses/:id/default # Set default address
```

### Measurements
```
GET    /measurements               # List measurement profiles
POST   /measurements               # Create profile
GET    /measurements/:id           # Get specific profile
PUT    /measurements/:id           # Update profile
DELETE /measurements/:id           # Soft delete
PATCH  /measurements/:id/default   # Set as default
POST   /measurements/validate-ai   # AI validation
```

### Products
```
POST   /products/parse-link        # Parse product URL
GET    /products/:id               # Get product details
```

### Orders
```
POST   /orders                     # Create order
GET    /orders                     # List customer orders
GET    /orders/:id                 # Get order detail
GET    /orders/:id/tracking        # Get live tracking
POST   /orders/:id/cancel          # Cancel order
POST   /orders/:id/feedback        # Submit feedback
```

### Payments
```
POST   /payments/initiate          # Create payment session
POST   /payments/paddle/webhook    # Paddle webhook
POST   /payments/jazzcash/webhook  # JazzCash webhook
POST   /payments/easypaisa/webhook # EasyPaisa webhook
POST   /payments/cod/confirm       # Confirm COD collection
GET    /payments/:orderId          # Get payment status
```

### Admin — Orders
```
GET    /admin/orders               # List all orders (filters, pagination)
GET    /admin/orders/:id           # Order detail
PATCH  /admin/orders/:id/assign    # Assign to tailor
PATCH  /admin/orders/:id/priority  # Set priority
PATCH  /admin/orders/:id/notes     # Admin notes
PATCH  /admin/orders/:id/status    # Manual status override
```

### Admin — Tailors
```
GET    /admin/tailors              # List tailors + workload
POST   /admin/tailors              # Add tailor
GET    /admin/tailors/:id          # Tailor detail
PATCH  /admin/tailors/:id          # Update tailor profile
PATCH  /admin/tailors/:id/availability # Toggle availability
GET    /admin/tailors/:id/orders   # Tailor's orders
```

### QC
```
GET    /qc/pending                 # Orders pending QC
GET    /qc/:orderId                # QC detail for order
POST   /qc/:orderId/inspect        # Submit QC result
GET    /qc/history                 # QC history
```

### Delivery
```
GET    /delivery/pending           # Orders pending dispatch
POST   /delivery/:orderId/dispatch # Generate TCS booking
PATCH  /delivery/:orderId/status   # Update delivery status
POST   /delivery/:orderId/pod      # Upload proof of delivery
GET    /delivery/agent/assigned    # Agent's deliveries
```

### Admin Analytics
```
GET    /admin/analytics/overview         # Dashboard KPIs
GET    /admin/analytics/orders-by-status
GET    /admin/analytics/revenue
GET    /admin/analytics/tailor-performance
GET    /admin/analytics/delivery-stats
```

### AI
```
POST   /ai/chat                    # Chatbot endpoint
POST   /ai/recommend-style         # Style recommendations
```

---

## 8. SECURITY ARCHITECTURE

### 8.1 Authentication & Authorization
```
Layer 1: Cloudflare WAF (DDoS, bot protection, geo-block)
Layer 2: Rate limiting per IP + per user (Redis-backed)
Layer 3: JWT (Access Token: 15min) + Refresh Token (7 days, rotated)
Layer 4: OTP verification for phone (all new accounts)
Layer 5: RBAC (Role-Based Access Control) on every protected route
Layer 6: Input validation (Zod) before any business logic
```

### 8.2 JWT Implementation
```typescript
// Access Token: short-lived, stateless
{
  sub: userId,
  role: userRole,
  jti: uniqueId,  // for potential blacklisting
  iat: issuedAt,
  exp: 15min
}

// Refresh Token: long-lived, stored as hash in DB
// Rotation: every use issues a new refresh token
// Revocation: on logout, delete from DB
// Stored in: httpOnly, Secure, SameSite=Strict cookie
```

### 8.3 Security Headers (Helmet.js)
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 8.4 Rate Limiting Strategy
```
/auth/send-otp:        5 requests / 10 minutes / IP
/auth/verify-otp:      3 attempts / OTP / phone
/auth/login:           10 requests / 15 minutes / IP
General API:           100 requests / minute / user
Admin API:             200 requests / minute / user
Webhooks:              Whitelist Paddle/TCS IPs only
```

### 8.5 Input Security
- All inputs sanitized with DOMPurify (frontend) + custom sanitizer (backend)
- SQL injection: impossible with Prisma's parameterized queries
- XSS: CSP headers + output encoding
- File uploads: MIME type validation + file size limits + Cloudinary signed uploads
- SSRF prevention: Product link parser uses allowlist of known domains

### 8.6 Payment Security
- Webhook signature verification for all payment providers
- No card data touches our servers (Paddle handles PCI compliance)
- All payment amounts verified server-side against order total
- Double-payment prevention via idempotency keys

### 8.7 Data Protection
- PII fields (phone, email) encrypted at rest using pgcrypto
- Measurement data treated as sensitive — logged access in audit_logs
- HTTPS enforced everywhere, no HTTP
- Environment variables never committed to git
- Secrets management: Doppler or direct Railway environment variables

---

## 9. AI INTEGRATION POINTS

### 9.1 Measurement Validation AI
```
Trigger: After customer submits measurements
Model: OpenAI GPT-4o (or custom fine-tuned model)
Input: All measurement values + garment type + height (if provided)
Output: {
  isValid: boolean,
  confidence: 0.0-1.0,
  flags: [{ field, issue, suggestion }],
  correctedSuggestions: { ... }
}
Purpose: Prevent obviously wrong measurements (chest 150cm, waist 20cm)
```

### 9.2 Smart Tailor Assignment Algorithm
```
Trigger: Order payment confirmed
Logic:
  1. Filter tailors by: is_available, specialization matches garment_type
  2. Score each tailor by: current_load / max_capacity, quality_score, 
     avg_completion_time, specialization match
  3. Consider deadline: urgent orders → senior/master tailors
  4. AI tiebreaker: historical performance on similar fabric/style
Output: Recommended tailor + reasoning
Fallback: Admin manual assignment if no tailor scores above threshold
```

### 9.3 AI Chatbot (WhatsApp + Web)
```
Trigger: Customer message on WhatsApp Business / chat widget
Handles: Order status queries, measurement help, FAQ, complaint triage
Escalation: Auto-escalate to human agent if: complaint, refund request, 
            unresolved after 2 turns
Model: OpenAI GPT-4o with function calling
Tools available to AI: {getOrderStatus, getMeasurementHelp, getTrackingInfo}
```

### 9.4 Style Recommender
```
Trigger: Step 3 of order placement (style selection)
Input: Garment type, occasion, fabric type, customer purchase history
Output: Top 3 style configurations with visual examples
```

### 9.5 QC Assist (Future)
```
Trigger: QC inspector uploads garment photos
Model: Vision model (GPT-4V or custom)
Output: Flag potential issues (uneven hemline, loose seam, collar alignment)
Purpose: Assist inspector, not replace
```

---

## 10. PAYMENT INTEGRATION (PADDLE)

### Why Paddle?
- Merchant of Record (handles tax compliance, global payments)
- Better for Pakistani startups accepting international payments
- No complex PCI DSS compliance needed
- Works alongside JazzCash/EasyPaisa for domestic users

### Payment Flow
```
1. Customer selects payment method
2. If Paddle:
   a. Backend creates Paddle checkout session
   b. Frontend loads Paddle.js overlay
   c. Customer enters card details (handled by Paddle, not us)
   d. Paddle sends webhook to /payments/paddle/webhook
   e. Backend verifies webhook signature
   f. Order status updated to 'payment_confirmed'

3. If JazzCash/EasyPaisa:
   a. Backend generates payment hash
   b. Customer redirected to gateway
   c. Webhook received on return
   d. Signature verified
   e. Order status updated

4. If COD:
   a. Order marked 'payment_confirmed' immediately
   b. COD flag set, amount stored
   c. Delivery agent marks 'cod_collected' on delivery
```

### Webhook Security
```typescript
// Verify Paddle webhook
const isValid = paddle.webhooks.isSignatureValid({
  rawBody: req.rawBody,     // Must use raw body, not parsed JSON
  headers: req.headers,
  secretKey: process.env.PADDLE_WEBHOOK_SECRET
});
if (!isValid) return res.status(401).send('Invalid signature');
```

---

## 11. AUTOMATED TESTING SYSTEM

### 11.1 Route Validator (Core Innovation)
Every endpoint in the application is registered in a central route manifest. A single command or button press runs validation across ALL routes.

```typescript
// src/testing/route-validator.ts

interface RouteTest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  auth?: { role: string; token?: string };
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  query?: Record<string, string>;
  expectedStatus: number;
  expectedFields?: string[];     // Fields that must exist in response
  shouldFail?: boolean;          // Test that security is working
  description: string;
}

// Routes are auto-discovered from the module router files
// Plus manually registered edge cases
export const routeTests: RouteTest[] = [
  {
    method: 'POST',
    path: '/auth/send-otp',
    body: { phone: '+923001234567' },
    expectedStatus: 200,
    description: 'Send OTP to valid phone'
  },
  {
    method: 'POST',
    path: '/auth/send-otp',
    body: { phone: 'invalid' },
    expectedStatus: 422,
    shouldFail: true,
    description: 'Reject invalid phone format'
  },
  {
    method: 'GET',
    path: '/measurements',
    auth: { role: 'customer' },
    expectedStatus: 200,
    description: 'Customer can list measurements'
  },
  {
    method: 'GET',
    path: '/admin/orders',
    auth: { role: 'customer' },  // Wrong role
    expectedStatus: 403,
    shouldFail: true,
    description: 'Customer cannot access admin orders'
  },
  // ... 100+ tests auto-generated from route manifest
];

// Run all tests: npm run test:routes
// Output: Pass/Fail for each route, summary report, exit 1 on failure
```

### 11.2 Test Script (One Command)
```bash
npm run test:routes      # Validate all API routes
npm run test:unit        # Jest unit tests
npm run test:integration # Integration tests
npm run test:security    # Security-specific tests
npm run test:all         # Full suite
```

### 11.3 Test Coverage Targets
| Area | Target |
|------|--------|
| Route validation | 100% of routes |
| Service layer | 80%+ |
| Auth flows | 100% |
| Payment webhooks | 100% |
| Security checks | 100% |

---

## 12. DEPLOYMENT STRATEGY

### Phase 1: Free Tier (Launch)
```
Frontend:   Vercel (free)           → app.stitchly.pk
Backend:    Railway.app (free tier) → api.stitchly.pk
Database:   Neon.tech (free)        → PostgreSQL, 3GB storage
Redis:      Upstash (free)          → 10K commands/day
Media:      Cloudinary (free)       → 25GB storage
Email:      Resend (free)           → 3000 emails/month
Monitoring: Better Stack (free)     → Uptime + logging

Domain: Buy pk domain (~$5/year)
SSL: Cloudflare (free)
CDN: Cloudflare (free)

Total Monthly Cost: ~$0 (domain cost is one-time)
```

### Phase 2: Growth (2K–10K orders/month)
```
Backend:    Railway Pro ($20/month)
Database:   Neon Pro ($19/month) or Supabase Pro ($25/month)
Redis:      Upstash Pay-as-you-go (~$10-20/month)
Cloudinary: Growth ($89/month) or stay on free
Email:      Resend Pro ($20/month)
WhatsApp:   Meta Business ($0.005/message)

Estimated: $150-250/month
```

### Phase 3: Scale (50K–500K orders/month)
```
Backend:    AWS ECS (Fargate) with auto-scaling
Database:   AWS RDS PostgreSQL (Multi-AZ, read replicas)
Redis:      AWS ElastiCache
Search:     Elasticsearch (for product/order search)
CDN:        CloudFront
Media:      AWS S3 + CloudFront
Queue:      AWS SQS (replace BullMQ)
Monitoring: Datadog / New Relic

Estimated: $2,000–8,000/month depending on load
```

---

## 13. SCALING PLAN (500K CLIENTS)

### Database Scaling
```
Current (0-10K orders): Single PostgreSQL instance (Neon)
10K-100K orders:
  → Add read replica for analytics queries
  → Partition orders table by created_at (monthly)
  → Index tuning based on slow query logs

100K-500K orders:
  → Orders table: range partition by year/month
  → Separate analytics database (read-only replica)
  → Connection pooling: PgBouncer
  → Archival: orders older than 2 years to cold storage
```

### Backend Scaling
```
Current: Single Node.js process on Railway
10K+ orders:
  → Horizontal scaling: 2-3 Railway instances (load balanced)
  → Sticky sessions for Socket.io (Redis adapter)
  → BullMQ workers on separate instances

100K+ orders:
  → Extract high-traffic modules to dedicated services:
    * Notification Service (high volume)
    * AI Service (GPU instances)
    * Order Processing Service
  → API Gateway (Kong or AWS API Gateway)
  → Service discovery (Consul or AWS Service Map)
```

### Caching Strategy
```
L1: In-memory cache (Node.js process memory) — hot config data
L2: Redis — user sessions, rate limits, order status, product data
L3: CDN (Cloudflare) — static assets, measurement tutorial videos
L4: Database — indexes + materialized views for analytics
```

### Queue Architecture at Scale
```
Current: BullMQ on single Redis instance
At scale:
  → Separate Redis instances per queue type
  → Dead letter queues for failed jobs
  → Job retry with exponential backoff
  → Alerting on queue depth (> 1000 pending jobs)
```

---

## 14. MONITORING & OBSERVABILITY

### Metrics to Track
```
Business:
  - Orders/hour, Orders/day
  - Payment success rate
  - Average order fulfilment time
  - QC rejection rate
  - Tailor utilization rate
  - Customer NPS

Technical:
  - API response time (P50, P95, P99)
  - Error rate per endpoint
  - Queue depth (BullMQ)
  - Database query performance
  - Redis hit rate
  - Failed job count
```

### Alerting Rules
```
CRITICAL (PagerDuty/SMS):
  - API error rate > 5% for 2min
  - Database connection failures
  - Payment webhook failures
  - Server memory > 90%

WARNING (Slack):
  - Slow API response (P95 > 2s)
  - Queue depth > 500 jobs
  - Failed notifications > 10/hour
  - QC rejection rate > 30%
```

---

## 15. CI/CD PIPELINE

```yaml
# .github/workflows/main.yml
# On every push to main:

1. Code Quality:
   - ESLint + Prettier check
   - TypeScript type checking
   - Prisma schema validation

2. Security Scan:
   - npm audit (dependency vulnerabilities)
   - Semgrep (code security patterns)
   - Secret scanning (no API keys in code)

3. Testing:
   - Unit tests (Jest)
   - Route validation (custom test suite)
   - Integration tests (test database)

4. Build:
   - Docker image build
   - Size check

5. Deploy (on main branch only):
   - Run DB migrations (prisma migrate deploy)
   - Deploy to Railway/Vercel
   - Health check (wait for 200 on /health)
   - Smoke test (5 critical routes)
   - Rollback if smoke test fails
```

---

*Architecture Version: 1.0 | Platform: Centralized Custom Tailoring | Scale Target: 500K clients*
