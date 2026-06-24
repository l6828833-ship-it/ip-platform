-- ============================================================
-- Points per connection on plan pricing
-- Run this in Supabase -> SQL Editor (safe to run once).
-- ============================================================

ALTER TABLE "planPricing" ADD COLUMN IF NOT EXISTS "points" integer DEFAULT 0 NOT NULL;
