-- Additive migration: Multi-Unit / Workshop Delegation & Unit Stock Approval
DO $$ BEGIN
  CREATE TYPE "StockApprovalStatus" AS ENUM ('approved', 'pending', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "tailoring_units" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "name" VARCHAR(200) NOT NULL,
  "location" VARCHAR(300) NOT NULL,
  "city" VARCHAR(100) NOT NULL DEFAULT 'Lahore',
  "manager_id" UUID NOT NULL,
  "max_daily_capacity" INTEGER NOT NULL DEFAULT 10,
  "has_stock_access" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tailoring_units_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tailoring_units_manager_id_key" UNIQUE ("manager_id"),
  CONSTRAINT "tailoring_units_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "tailoring_units_is_active_idx" ON "tailoring_units"("is_active");

ALTER TABLE "tailor_profiles" ADD COLUMN IF NOT EXISTS "unit_id" UUID;
CREATE INDEX IF NOT EXISTS "tailor_profiles_unit_id_idx" ON "tailor_profiles"("unit_id");
DO $$ BEGIN
  ALTER TABLE "tailor_profiles" ADD CONSTRAINT "tailor_profiles_unit_id_fkey"
    FOREIGN KEY ("unit_id") REFERENCES "tailoring_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "assigned_unit_id" UUID;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "assigned_unit_at" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS "orders_assigned_unit_id_idx" ON "orders"("assigned_unit_id");
DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_unit_id_fkey"
    FOREIGN KEY ("assigned_unit_id") REFERENCES "tailoring_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "unit_id" UUID;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "approval_status" "StockApprovalStatus" NOT NULL DEFAULT 'approved';
CREATE INDEX IF NOT EXISTS "products_unit_id_idx" ON "products"("unit_id");
CREATE INDEX IF NOT EXISTS "products_approval_status_idx" ON "products"("approval_status");
DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_unit_id_fkey"
    FOREIGN KEY ("unit_id") REFERENCES "tailoring_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
