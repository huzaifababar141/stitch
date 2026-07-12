-- ================================================================
-- CENTRALIZED CUSTOM TAILORING & DELIVERY PLATFORM
-- Complete Database Schema — PostgreSQL 16
-- Version: 1.0
-- ================================================================
-- Design Principles:
--   • UUID PKs (prevents enumeration attacks)
--   • Soft deletes on all user-facing tables
--   • Audit trail via order_status_history + audit_logs
--   • Immutable order snapshots (measurements, addresses, prices)
--   • All money in DECIMAL(10,2), all times in TIMESTAMPTZ
--   • Indexes pre-planned for all common query patterns
--   • JSONB for flexible metadata without losing relational integrity
-- ================================================================

-- ================================================================
-- EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- Trigram fuzzy search

-- ================================================================
-- ENUMS
-- ================================================================

CREATE TYPE user_role AS ENUM (
  'customer',
  'admin',
  'tailor',
  'qc_inspector',
  'delivery_agent',
  'super_admin'
);

CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

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
  'out_for_delivery',
  'delivered',
  'return_requested',
  'returned',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
  'disputed'
);

CREATE TYPE payment_method AS ENUM (
  'paddle',
  'jazzcash',
  'easypaisa',
  'bank_transfer',
  'cod'
);

CREATE TYPE qc_result AS ENUM (
  'approved',
  'rejected',
  'needs_minor_fix'
);

CREATE TYPE delivery_status AS ENUM (
  'pending',
  'ready_for_pickup',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed_attempt',
  'returned_to_sender'
);

CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'whatsapp',
  'push',
  'in_app'
);

CREATE TYPE notification_status AS ENUM (
  'pending',
  'queued',
  'sent',
  'delivered',
  'read',
  'failed'
);

CREATE TYPE tailor_skill_level AS ENUM (
  'junior',
  'mid',
  'senior',
  'master'
);

CREATE TYPE garment_type AS ENUM (
  'kameez',
  'trouser',
  'dupatta',
  'kurta',
  'shalwar',
  'full_suit',
  'kameez_only',
  'trouser_only',
  'other'
);

CREATE TYPE fabric_type AS ENUM (
  'cotton',
  'lawn',
  'chiffon',
  'silk',
  'linen',
  'khaddar',
  'karandi',
  'organza',
  'georgette',
  'other'
);

CREATE TYPE coupon_type AS ENUM (
  'percentage',
  'fixed_amount',
  'free_delivery'
);

-- ================================================================
-- UTILITY FUNCTION: Auto-update updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TABLE: users
-- ================================================================
CREATE TABLE users (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               VARCHAR(255)  UNIQUE,
  phone               VARCHAR(20)   UNIQUE NOT NULL,
  phone_verified      BOOLEAN       NOT NULL DEFAULT FALSE,
  email_verified      BOOLEAN       NOT NULL DEFAULT FALSE,
  password_hash       TEXT,
  role                user_role     NOT NULL DEFAULT 'customer',
  first_name          VARCHAR(100)  NOT NULL,
  last_name           VARCHAR(100),
  gender              gender,
  date_of_birth       DATE,
  profile_image_url   TEXT,
  is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
  is_blocked          BOOLEAN       NOT NULL DEFAULT FALSE,
  block_reason        TEXT,
  blocked_at          TIMESTAMPTZ,
  blocked_by          UUID          REFERENCES users(id),
  last_login_at       TIMESTAMPTZ,
  last_login_ip       INET,
  failed_login_count  INTEGER       NOT NULL DEFAULT 0,
  locked_until        TIMESTAMPTZ,
  referral_code       VARCHAR(20)   UNIQUE,
  referred_by         UUID          REFERENCES users(id),
  metadata            JSONB         NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_users_phone         ON users(phone)         WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email         ON users(email)         WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role          ON users(role)          WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX idx_users_referred_by   ON users(referred_by)   WHERE referred_by IS NOT NULL;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: auth_tokens (Refresh Tokens — stored as hash)
-- ================================================================
CREATE TABLE auth_tokens (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT        NOT NULL UNIQUE,  -- bcrypt hash of the actual token
  family        UUID        NOT NULL DEFAULT uuid_generate_v4(), -- Detect token reuse
  device_info   JSONB       NOT NULL DEFAULT '{}',  -- {browser, os, device_type, device_id}
  ip_address    INET,
  is_revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
  revoked_at    TIMESTAMPTZ,
  revoke_reason VARCHAR(100),
  expires_at    TIMESTAMPTZ NOT NULL,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user_id   ON auth_tokens(user_id)    WHERE is_revoked = FALSE;
CREATE INDEX idx_auth_tokens_hash      ON auth_tokens(token_hash);
CREATE INDEX idx_auth_tokens_family    ON auth_tokens(family);
CREATE INDEX idx_auth_tokens_expires   ON auth_tokens(expires_at)  WHERE is_revoked = FALSE;

-- ================================================================
-- TABLE: otp_codes
-- ================================================================
CREATE TABLE otp_codes (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        REFERENCES users(id) ON DELETE CASCADE,
  phone         VARCHAR(20),
  email         VARCHAR(255),
  code_hash     TEXT        NOT NULL,   -- Hash of OTP, never store raw
  purpose       VARCHAR(50) NOT NULL,   -- 'phone_verify','login','password_reset','order_confirm'
  attempts      INTEGER     NOT NULL DEFAULT 0,
  max_attempts  INTEGER     NOT NULL DEFAULT 3,
  is_used       BOOLEAN     NOT NULL DEFAULT FALSE,
  used_at       TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_phone   ON otp_codes(phone, purpose)         WHERE is_used = FALSE AND expires_at > NOW();
CREATE INDEX idx_otp_user_id ON otp_codes(user_id, purpose)       WHERE is_used = FALSE;

-- ================================================================
-- TABLE: addresses
-- ================================================================
CREATE TABLE addresses (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           VARCHAR(50),             -- 'Home', 'Office', 'Parents'
  full_name       VARCHAR(200)  NOT NULL,
  phone           VARCHAR(20)   NOT NULL,
  address_line1   TEXT          NOT NULL,
  address_line2   TEXT,
  landmark        TEXT,
  city            VARCHAR(100)  NOT NULL,
  province        VARCHAR(100)  NOT NULL,
  postal_code     VARCHAR(20),
  country         VARCHAR(100)  NOT NULL DEFAULT 'Pakistan',
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  is_default      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- Ensure only one default address per user
CREATE UNIQUE INDEX idx_addresses_one_default
  ON addresses(user_id)
  WHERE is_default = TRUE AND deleted_at IS NULL;

-- ================================================================
-- TABLE: measurement_profiles
-- ================================================================
CREATE TABLE measurement_profiles (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label                 VARCHAR(100)  NOT NULL DEFAULT 'My Measurements',
  is_default            BOOLEAN       NOT NULL DEFAULT FALSE,

  -- All measurements stored in centimeters (cm), DECIMAL for precision
  -- Upper body
  chest                 DECIMAL(5,2),
  waist                 DECIMAL(5,2),
  hips                  DECIMAL(5,2),
  shoulder_width        DECIMAL(5,2),
  back_length           DECIMAL(5,2),
  front_length          DECIMAL(5,2),
  sleeve_length         DECIMAL(5,2),
  armhole               DECIMAL(5,2),
  bicep                 DECIMAL(5,2),
  wrist                 DECIMAL(5,2),
  neck_circumference    DECIMAL(5,2),

  -- Lower body
  trouser_length        DECIMAL(5,2),
  thigh                 DECIMAL(5,2),
  knee                  DECIMAL(5,2),
  calf                  DECIMAL(5,2),
  ankle                 DECIMAL(5,2),
  trouser_waist         DECIMAL(5,2),
  seat                  DECIMAL(5,2),  -- seat/hip for trouser

  -- Style-related measurements
  kameez_length         DECIMAL(5,2),
  gala_depth            DECIMAL(4,2),  -- neckline depth in cm

  -- AI Validation
  ai_validation_score   DECIMAL(3,2),  -- 0.00–1.00 confidence score
  ai_flags              JSONB          NOT NULL DEFAULT '[]',  -- [{field, issue, suggestion}]
  ai_validated_at       TIMESTAMPTZ,

  -- Supporting materials
  photo_urls            JSONB          NOT NULL DEFAULT '[]',
  notes                 TEXT,

  -- Versioning (for measurement history)
  version               INTEGER        NOT NULL DEFAULT 1,
  previous_version_id   UUID           REFERENCES measurement_profiles(id),

  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_measurements_user_id ON measurement_profiles(user_id) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_measurements_one_default
  ON measurement_profiles(user_id)
  WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE TRIGGER trg_measurements_updated_at
  BEFORE UPDATE ON measurement_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: style_configurations
-- ================================================================
CREATE TABLE style_configurations (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID          REFERENCES users(id) ON DELETE SET NULL,
  label                 VARCHAR(100),
  garment_type          garment_type  NOT NULL,

  -- Kameez / Shirt styles
  gala_style            VARCHAR(100),  -- 'round','v-neck','boat','tulip','high-neck','collar'
  sleeve_style          VARCHAR(100),  -- 'straight','bell','puff','sleeveless','3/4'
  sleeve_hem_style      VARCHAR(100),  -- 'plain','scallop','lace','embroidered'
  kameez_hem_style      VARCHAR(100),  -- 'straight','curved','high-low','fish-cut'
  side_cut_style        VARCHAR(100),  -- 'straight','angrakha','A-line','princess'
  back_style            VARCHAR(100),  -- 'plain','open','lace-insert'

  -- Trouser styles
  trouser_style         VARCHAR(100),  -- 'straight','patiala','tulip','wide-leg','cigarette'
  trouser_hem_style     VARCHAR(100),  -- 'plain','lace','embroidered'

  -- Additional preferences
  pocket_preference     VARCHAR(50),   -- 'none','side','hidden'
  lining_required       BOOLEAN        NOT NULL DEFAULT FALSE,
  lining_color          VARCHAR(50),
  
  -- Embroidery preferences
  embroidery_on_gala    BOOLEAN        NOT NULL DEFAULT FALSE,
  embroidery_on_sleeve  BOOLEAN        NOT NULL DEFAULT FALSE,
  embroidery_notes      TEXT,
  
  special_instructions  TEXT,
  reference_images      JSONB          NOT NULL DEFAULT '[]',

  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_style_configs_user_id ON style_configurations(user_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_style_configs_updated_at
  BEFORE UPDATE ON style_configurations
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: products (from link parser)
-- ================================================================
CREATE TABLE products (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url        TEXT,
  normalized_url    TEXT,          -- Cleaned URL for deduplication
  name              VARCHAR(500),
  brand             VARCHAR(200),
  description       TEXT,
  images            JSONB          NOT NULL DEFAULT '[]',
  fabric_type       fabric_type,
  garment_type      garment_type   DEFAULT 'full_suit',
  color_tags        TEXT[],
  price_original    DECIMAL(10,2), -- Original price from source
  currency_original VARCHAR(10),
  is_active         BOOLEAN        NOT NULL DEFAULT TRUE,
  parse_source      VARCHAR(100),  -- 'khaadi', 'alkaram', 'gul_ahmed', 'manual'
  parsed_at         TIMESTAMPTZ,
  parse_metadata    JSONB          NOT NULL DEFAULT '{}',
  created_by        UUID           REFERENCES users(id),
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_source_url ON products(normalized_url) WHERE normalized_url IS NOT NULL;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- SEQUENCE: order_number
-- ================================================================
CREATE SEQUENCE order_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE;

-- ================================================================
-- TABLE: orders (Core Business Table)
-- ================================================================
CREATE TABLE orders (
  id                          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number                VARCHAR(30)   UNIQUE NOT NULL,  -- Auto-generated: STL-2025-000001

  -- Customer
  customer_id                 UUID          NOT NULL REFERENCES users(id),

  -- Product info
  product_id                  UUID          REFERENCES products(id),
  garment_type                garment_type  NOT NULL,

  -- Immutable snapshots (critical: never change after order placed)
  measurement_profile_id      UUID          REFERENCES measurement_profiles(id),
  measurement_snapshot        JSONB         NOT NULL,  -- Full copy at time of order
  style_config_id             UUID          REFERENCES style_configurations(id),
  style_snapshot              JSONB         NOT NULL,  -- Full copy at time of order
  product_snapshot            JSONB         NOT NULL DEFAULT '{}', -- Product details copy

  -- Tailor assignment
  assigned_tailor_id          UUID          REFERENCES users(id),
  assigned_at                 TIMESTAMPTZ,
  assignment_reason           TEXT,         -- Why this tailor was chosen

  -- Deadlines
  stitching_deadline          TIMESTAMPTZ,
  estimated_completion        DATE,

  -- QC
  qc_inspector_id             UUID          REFERENCES users(id),
  qc_result                   qc_result,
  qc_inspected_at             TIMESTAMPTZ,
  qc_notes                    TEXT,
  qc_images                   JSONB         NOT NULL DEFAULT '[]',
  qc_retry_count              INTEGER       NOT NULL DEFAULT 0,

  -- Delivery
  delivery_address_id         UUID          REFERENCES addresses(id),
  delivery_address_snapshot   JSONB         NOT NULL,  -- Immutable copy
  estimated_delivery_date     DATE,

  -- Status
  status                      order_status  NOT NULL DEFAULT 'pending_payment',
  priority_level              SMALLINT      NOT NULL DEFAULT 0, -- 0=normal, 1=high, 2=urgent

  -- Financial (all in PKR by default)
  currency                    VARCHAR(3)    NOT NULL DEFAULT 'PKR',
  stitching_fee               DECIMAL(10,2) NOT NULL,
  delivery_fee                DECIMAL(10,2) NOT NULL DEFAULT 0,
  addon_fee                   DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount             DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_id                   UUID          REFERENCES coupons(id),
  total_amount                DECIMAL(10,2) NOT NULL,
  
  -- COD
  is_cod                      BOOLEAN       NOT NULL DEFAULT FALSE,
  cod_collected               BOOLEAN       NOT NULL DEFAULT FALSE,
  cod_collected_at            TIMESTAMPTZ,
  cod_collected_by            UUID          REFERENCES users(id),

  -- Admin
  admin_notes                 TEXT,
  internal_notes              TEXT,         -- Only visible to staff

  -- Cancellation
  cancelled_at                TIMESTAMPTZ,
  cancellation_reason         TEXT,
  cancelled_by                UUID          REFERENCES users(id),

  -- Refund
  refunded_at                 TIMESTAMPTZ,
  refund_amount               DECIMAL(10,2),
  refund_reason               TEXT,

  metadata                    JSONB         NOT NULL DEFAULT '{}',
  created_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at                  TIMESTAMPTZ
);

-- Order number auto-generation
CREATE OR REPLACE FUNCTION fn_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'STL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number_gen
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION fn_generate_order_number();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE INDEX idx_orders_customer_id       ON orders(customer_id)                             WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status            ON orders(status)                                  WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_tailor_id         ON orders(assigned_tailor_id)                      WHERE deleted_at IS NULL AND assigned_tailor_id IS NOT NULL;
CREATE INDEX idx_orders_number            ON orders(order_number);
CREATE INDEX idx_orders_created_at        ON orders(created_at DESC)                         WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status_created    ON orders(status, created_at DESC)                 WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_qc_inspector      ON orders(qc_inspector_id, status)                 WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_priority          ON orders(priority_level DESC, created_at ASC)      WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_stitching_deadline ON orders(stitching_deadline ASC)                 WHERE deleted_at IS NULL AND status = 'in_stitching';

-- ================================================================
-- TABLE: order_status_history (Immutable audit trail)
-- ================================================================
CREATE TABLE order_status_history (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   order_status,
  to_status     order_status  NOT NULL,
  changed_by    UUID          REFERENCES users(id),
  trigger_type  VARCHAR(50)   NOT NULL DEFAULT 'manual', -- 'manual','system','webhook','ai'
  notes         TEXT,
  metadata      JSONB         NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_status_hist_order ON order_status_history(order_id, created_at DESC);

-- ================================================================
-- TABLE: coupons
-- ================================================================
CREATE TABLE coupons (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                  VARCHAR(50)   UNIQUE NOT NULL,
  description           TEXT,
  discount_type         coupon_type   NOT NULL DEFAULT 'percentage',
  discount_value        DECIMAL(10,2) NOT NULL,
  min_order_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount_amount   DECIMAL(10,2),   -- Cap for percentage discounts
  usage_limit           INTEGER,          -- NULL = unlimited
  used_count            INTEGER       NOT NULL DEFAULT 0,
  per_user_limit        INTEGER       NOT NULL DEFAULT 1,
  valid_from            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  valid_until           TIMESTAMPTZ,
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
  applicable_garments   garment_type[],   -- NULL = all garments
  applicable_users      UUID[],           -- NULL = all users
  created_by            UUID          REFERENCES users(id),
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code    ON coupons(code)      WHERE is_active = TRUE;
CREATE INDEX idx_coupons_valid   ON coupons(valid_from, valid_until) WHERE is_active = TRUE;

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: coupon_usage
-- ================================================================
CREATE TABLE coupon_usage (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id         UUID          NOT NULL REFERENCES coupons(id),
  user_id           UUID          NOT NULL REFERENCES users(id),
  order_id          UUID          NOT NULL REFERENCES orders(id),
  discount_applied  DECIMAL(10,2) NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(coupon_id, order_id)  -- one coupon per order
);

CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user   ON coupon_usage(user_id, coupon_id);

-- ================================================================
-- TABLE: payments
-- ================================================================
CREATE TABLE payments (
  id                        UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                  UUID            NOT NULL REFERENCES orders(id),
  customer_id               UUID            NOT NULL REFERENCES users(id),

  method                    payment_method  NOT NULL,
  status                    payment_status  NOT NULL DEFAULT 'pending',
  amount                    DECIMAL(10,2)   NOT NULL,
  currency                  VARCHAR(3)      NOT NULL DEFAULT 'PKR',

  -- Idempotency
  idempotency_key           VARCHAR(200)    UNIQUE,

  -- Gateway references
  gateway_transaction_id    VARCHAR(500),
  gateway_order_id          VARCHAR(500),
  gateway_response          JSONB           NOT NULL DEFAULT '{}',  -- Full raw response
  gateway_webhook_data      JSONB           NOT NULL DEFAULT '{}',  -- Webhook payload

  -- Paddle specific
  paddle_customer_id        VARCHAR(200),
  paddle_subscription_id    VARCHAR(200),
  paddle_checkout_id        VARCHAR(200),

  -- Timeline
  initiated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ,
  failed_at                 TIMESTAMPTZ,
  failure_reason            TEXT,
  failure_code              VARCHAR(100),

  -- Refunds
  refund_amount             DECIMAL(10,2)   NOT NULL DEFAULT 0,
  refunded_at               TIMESTAMPTZ,
  refund_reason             TEXT,
  refund_gateway_id         VARCHAR(500),

  -- COD only
  cod_collected             BOOLEAN         NOT NULL DEFAULT FALSE,
  cod_collected_at          TIMESTAMPTZ,
  cod_collected_by          UUID            REFERENCES users(id),

  metadata                  JSONB           NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id    ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_gateway_txn ON payments(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX idx_payments_status      ON payments(status, created_at DESC);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: tailor_profiles (Extension of users for tailors)
-- ================================================================
CREATE TABLE tailor_profiles (
  id                        UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID              UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id               VARCHAR(50)       UNIQUE,
  skill_level               tailor_skill_level NOT NULL DEFAULT 'junior',
  specializations           garment_type[]    NOT NULL DEFAULT '{}',  -- What they're good at
  
  -- Capacity management
  max_daily_capacity        INTEGER           NOT NULL DEFAULT 3,
  current_active_orders     INTEGER           NOT NULL DEFAULT 0,
  
  -- Performance metrics
  total_orders_completed    INTEGER           NOT NULL DEFAULT 0,
  total_orders_rejected_qc  INTEGER           NOT NULL DEFAULT 0,
  avg_completion_hours      DECIMAL(6,2),
  quality_score             DECIMAL(3,2)      NOT NULL DEFAULT 0.00,  -- 0.00–5.00, avg from feedback
  on_time_rate              DECIMAL(5,4)      NOT NULL DEFAULT 0.0000, -- 0.0–1.0
  
  -- Availability
  is_available              BOOLEAN           NOT NULL DEFAULT TRUE,
  unavailable_from          TIMESTAMPTZ,
  unavailable_until         TIMESTAMPTZ,
  availability_notes        TEXT,
  
  -- Employment
  joined_at                 DATE,
  salary_type               VARCHAR(20),      -- 'per_piece', 'monthly'
  
  metadata                  JSONB             NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tailor_profiles_user_id   ON tailor_profiles(user_id);
CREATE INDEX idx_tailor_profiles_available ON tailor_profiles(is_available, current_active_orders)
  WHERE is_available = TRUE;

CREATE TRIGGER trg_tailor_profiles_updated_at
  BEFORE UPDATE ON tailor_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: deliveries
-- ================================================================
CREATE TABLE deliveries (
  id                    UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID              UNIQUE NOT NULL REFERENCES orders(id),
  delivery_agent_id     UUID              REFERENCES users(id),
  
  -- Courier info
  courier_name          VARCHAR(100)      NOT NULL DEFAULT 'TCS',
  tracking_number       VARCHAR(200)      UNIQUE,
  tracking_url          TEXT,
  
  -- Status
  status                delivery_status   NOT NULL DEFAULT 'pending',
  
  -- Timeline
  booked_at             TIMESTAMPTZ,
  picked_up_at          TIMESTAMPTZ,
  estimated_delivery    TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  
  -- Proof of Delivery
  pod_image_url         TEXT,
  pod_signature_url     TEXT,
  pod_notes             TEXT,
  pod_collected_by      VARCHAR(200),     -- Name of person who received
  
  -- Attempts
  attempt_count         INTEGER           NOT NULL DEFAULT 0,
  last_attempt_at       TIMESTAMPTZ,
  failed_reason         TEXT,
  
  -- TCS API response
  courier_booking_id    VARCHAR(200),
  courier_response      JSONB             NOT NULL DEFAULT '{}',
  
  metadata              JSONB             NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_order_id   ON deliveries(order_id);
CREATE INDEX idx_deliveries_tracking   ON deliveries(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX idx_deliveries_agent      ON deliveries(delivery_agent_id) WHERE delivery_agent_id IS NOT NULL;
CREATE INDEX idx_deliveries_status     ON deliveries(status);

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: delivery_status_history
-- ================================================================
CREATE TABLE delivery_status_history (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id     UUID              NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status          delivery_status   NOT NULL,
  location_name   TEXT,
  location_city   VARCHAR(100),
  notes           TEXT,
  recorded_by     UUID              REFERENCES users(id),
  source          VARCHAR(50)       NOT NULL DEFAULT 'manual', -- 'manual','tcs_webhook','system'
  courier_data    JSONB             NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_del_status_hist_delivery ON delivery_status_history(delivery_id, created_at DESC);

-- ================================================================
-- TABLE: notifications
-- ================================================================
CREATE TABLE notifications (
  id                UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id          UUID                  REFERENCES orders(id),
  channel           notification_channel  NOT NULL,
  status            notification_status   NOT NULL DEFAULT 'pending',
  template_key      VARCHAR(100),  -- e.g., 'order_placed', 'qc_approved', 'delivery_dispatched'
  subject           TEXT,
  body              TEXT          NOT NULL,
  metadata          JSONB         NOT NULL DEFAULT '{}',  -- {to_phone, to_email, provider_id, provider_response}
  scheduled_at      TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  read_at           TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_reason    TEXT,
  retry_count       INTEGER       NOT NULL DEFAULT 0,
  max_retries       INTEGER       NOT NULL DEFAULT 3,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id      ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status       ON notifications(status, scheduled_at)      WHERE status IN ('pending', 'queued');
CREATE INDEX idx_notifications_order_id     ON notifications(order_id)                  WHERE order_id IS NOT NULL;
CREATE INDEX idx_notifications_unread       ON notifications(user_id, read_at)          WHERE channel = 'in_app' AND read_at IS NULL;

-- ================================================================
-- TABLE: order_feedback
-- ================================================================
CREATE TABLE order_feedback (
  id                UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID      UNIQUE NOT NULL REFERENCES orders(id),
  customer_id       UUID      NOT NULL REFERENCES users(id),
  tailor_id         UUID      REFERENCES users(id),

  -- Star ratings 1-5
  overall_rating    SMALLINT  CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating    SMALLINT  CHECK (quality_rating BETWEEN 1 AND 5),
  delivery_rating   SMALLINT  CHECK (delivery_rating BETWEEN 1 AND 5),
  fit_rating        SMALLINT  CHECK (fit_rating BETWEEN 1 AND 5),
  measurement_rating SMALLINT CHECK (measurement_rating BETWEEN 1 AND 5),

  comment           TEXT,
  images            JSONB     NOT NULL DEFAULT '[]',
  is_public         BOOLEAN   NOT NULL DEFAULT TRUE,
  is_verified       BOOLEAN   NOT NULL DEFAULT TRUE,  -- Verified purchase

  -- Admin response
  admin_response    TEXT,
  admin_id          UUID      REFERENCES users(id),
  admin_responded_at TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_order_id    ON order_feedback(order_id);
CREATE INDEX idx_feedback_tailor_id   ON order_feedback(tailor_id)    WHERE tailor_id IS NOT NULL;
CREATE INDEX idx_feedback_public      ON order_feedback(overall_rating DESC, created_at DESC) WHERE is_public = TRUE;

CREATE TRIGGER trg_feedback_updated_at
  BEFORE UPDATE ON order_feedback
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- TABLE: referrals
-- ================================================================
CREATE TABLE referrals (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id       UUID          NOT NULL REFERENCES users(id),
  referee_id        UUID          UNIQUE NOT NULL REFERENCES users(id),  -- One referral per user
  referral_code     VARCHAR(20)   NOT NULL,
  qualifying_order_id UUID        REFERENCES orders(id),  -- First order that triggers reward
  reward_type       VARCHAR(50)   NOT NULL DEFAULT 'discount',  -- 'discount', 'cash', 'free_delivery'
  reward_amount     DECIMAL(10,2),
  reward_given      BOOLEAN       NOT NULL DEFAULT FALSE,
  reward_given_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee  ON referrals(referee_id);

-- ================================================================
-- TABLE: product_parse_logs
-- ================================================================
CREATE TABLE product_parse_logs (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          REFERENCES users(id),
  source_url      TEXT          NOT NULL,
  parsed_product_id UUID        REFERENCES products(id),
  success         BOOLEAN       NOT NULL DEFAULT FALSE,
  error_code      VARCHAR(100),
  error_message   TEXT,
  parse_duration_ms INTEGER,
  ip_address      INET,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parse_logs_user_id ON product_parse_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_parse_logs_created ON product_parse_logs(created_at DESC);

-- ================================================================
-- TABLE: ai_logs (AI usage tracking and audit)
-- ================================================================
CREATE TABLE ai_logs (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          REFERENCES users(id),
  order_id        UUID          REFERENCES orders(id),
  feature         VARCHAR(100)  NOT NULL,  -- 'measurement_validation','tailor_assignment','chatbot','style_recommendation'
  model_used      VARCHAR(100),
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  total_cost_usd  DECIMAL(8,6),
  latency_ms      INTEGER,
  success         BOOLEAN       NOT NULL DEFAULT TRUE,
  error_code      VARCHAR(100),
  error_message   TEXT,
  -- Don't store actual input/output in production (privacy)
  -- Only store in dev/staging or anonymized metadata
  metadata        JSONB         NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_feature    ON ai_logs(feature, created_at DESC);
CREATE INDEX idx_ai_logs_user_id    ON ai_logs(user_id) WHERE user_id IS NOT NULL;

-- ================================================================
-- TABLE: audit_logs (Security audit trail — append only)
-- ================================================================
CREATE TABLE audit_logs (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          REFERENCES users(id),
  action        VARCHAR(200)  NOT NULL,  -- 'USER_LOGIN', 'ORDER_STATUS_CHANGED', 'PAYMENT_INITIATED'
  entity_type   VARCHAR(100),            -- 'orders', 'users', 'payments'
  entity_id     UUID,
  old_data      JSONB,                   -- Sanitized (remove sensitive fields)
  new_data      JSONB,
  ip_address    INET,
  user_agent    TEXT,
  session_id    UUID,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  -- NO updated_at, NO deleted_at — audit logs are immutable
);

CREATE INDEX idx_audit_user_id  ON audit_logs(user_id,    created_at DESC);
CREATE INDEX idx_audit_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action   ON audit_logs(action,     created_at DESC);
CREATE INDEX idx_audit_created  ON audit_logs(created_at DESC);

-- ================================================================
-- TABLE: system_settings (Key-Value Config)
-- ================================================================
CREATE TABLE system_settings (
  key           VARCHAR(200)  PRIMARY KEY,
  value         JSONB         NOT NULL,
  description   TEXT,
  is_public     BOOLEAN       NOT NULL DEFAULT FALSE,  -- Can customer-facing API read this?
  updated_by    UUID          REFERENCES users(id),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Initial settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
  ('stitching_base_fee', '{"pkr": 800}', 'Base stitching fee in PKR', false),
  ('delivery_fee_local', '{"pkr": 150}', 'Local delivery fee', true),
  ('delivery_fee_national', '{"pkr": 300}', 'National delivery fee', true),
  ('max_cod_amount', '{"pkr": 10000}', 'Maximum order amount for COD', false),
  ('eid_mode', '{"enabled": false, "deadline_message": ""}', 'Eid surge settings', true),
  ('measurement_studio_steps', '{"steps": ["chest","waist","hips","shoulder","sleeve","kameez_length","trouser"]}', 'Measurement studio step order', true),
  ('ai_validation_threshold', '{"min_confidence": 0.7}', 'Min AI confidence to auto-approve measurements', false),
  ('tailor_assignment_mode', '{"mode": "auto"}', 'auto or manual tailor assignment', false);

-- ================================================================
-- VIEWS (For common queries)
-- ================================================================

-- Active order summary with related data
CREATE OR REPLACE VIEW v_active_orders AS
SELECT
  o.id,
  o.order_number,
  o.status,
  o.priority_level,
  o.garment_type,
  o.total_amount,
  o.is_cod,
  o.stitching_deadline,
  o.created_at,
  -- Customer
  c.first_name || ' ' || COALESCE(c.last_name, '') AS customer_name,
  c.phone AS customer_phone,
  -- Tailor
  t.first_name || ' ' || COALESCE(t.last_name, '') AS tailor_name,
  tp.skill_level AS tailor_skill_level,
  tp.current_active_orders AS tailor_current_load,
  -- Delivery
  d.tracking_number,
  d.status AS delivery_status
FROM orders o
JOIN users c ON o.customer_id = c.id
LEFT JOIN users t ON o.assigned_tailor_id = t.id
LEFT JOIN tailor_profiles tp ON t.id = tp.user_id
LEFT JOIN deliveries d ON o.id = d.order_id
WHERE o.deleted_at IS NULL
  AND o.status NOT IN ('delivered', 'cancelled', 'refunded', 'returned');

-- Tailor workload dashboard
CREATE OR REPLACE VIEW v_tailor_workload AS
SELECT
  u.id,
  u.first_name || ' ' || COALESCE(u.last_name, '') AS name,
  tp.skill_level,
  tp.specializations,
  tp.max_daily_capacity,
  tp.current_active_orders,
  ROUND((tp.current_active_orders::DECIMAL / NULLIF(tp.max_daily_capacity, 0)) * 100, 1) AS utilization_pct,
  tp.quality_score,
  tp.on_time_rate,
  tp.is_available,
  -- Active orders by status
  COUNT(CASE WHEN o.status = 'assigned' THEN 1 END) AS orders_assigned,
  COUNT(CASE WHEN o.status = 'in_stitching' THEN 1 END) AS orders_in_stitching,
  COUNT(CASE WHEN o.status = 'stitching_complete' THEN 1 END) AS orders_completed_today
FROM users u
JOIN tailor_profiles tp ON u.id = tp.user_id
LEFT JOIN orders o ON u.id = o.assigned_tailor_id AND o.status IN ('assigned','in_stitching','stitching_complete')
WHERE u.role = 'tailor' AND u.deleted_at IS NULL
GROUP BY u.id, u.first_name, u.last_name, tp.skill_level, tp.specializations, 
         tp.max_daily_capacity, tp.current_active_orders, tp.quality_score, 
         tp.on_time_rate, tp.is_available;

-- ================================================================
-- PARTITIONING PLAN (Apply when orders table exceeds 500K rows)
-- ================================================================
/*
  Future partitioning strategy — DO NOT apply at launch:

  ALTER TABLE orders RENAME TO orders_unpartitioned;

  CREATE TABLE orders (
    LIKE orders_unpartitioned INCLUDING ALL
  ) PARTITION BY RANGE (created_at);

  CREATE TABLE orders_2025 PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

  CREATE TABLE orders_2026 PARTITION OF orders
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
  
  -- Add to quarterly maintenance job
*/

-- ================================================================
-- SCHEMA COMPLETE
-- Version: 1.0
-- Tables: 20 | Views: 2 | Sequences: 1 | Triggers: 12+
-- ================================================================
