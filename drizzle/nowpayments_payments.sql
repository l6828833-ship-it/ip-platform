-- ============================================================
-- NowPayments crypto payment tracking on orders
-- Run this in Supabase -> SQL Editor (safe to run once).
-- ============================================================

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "nowpaymentsPaymentId" varchar(255);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "nowpaymentsStatus" varchar(50);
