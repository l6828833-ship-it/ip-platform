-- ============================================================
-- Cryptomus crypto payment tracking on orders
-- Run this in Supabase -> SQL Editor (safe to run once).
-- ============================================================

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cryptomusUuid" varchar(255);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cryptomusStatus" varchar(50);
