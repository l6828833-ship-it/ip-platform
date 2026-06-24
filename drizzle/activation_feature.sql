-- ============================================================
-- Activation Apps + Points + Dashboard Messages feature
-- Run this in Supabase -> SQL Editor (safe to run once).
-- ============================================================

-- New columns on existing tables
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activationPoints" integer DEFAULT 0 NOT NULL;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "activationPoints" integer DEFAULT 0 NOT NULL;

-- Enums
DO $$ BEGIN
  CREATE TYPE "activation_status" AS ENUM ('pending', 'activated', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "dashboard_message_style" AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Apps
CREATE TABLE IF NOT EXISTS "apps" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "iconUrl" text,
  "description" text,
  "instructions" text,
  "instructionsLink" text,
  "pointsCost" integer DEFAULT 1 NOT NULL,
  "fields" json,
  "isActive" boolean DEFAULT true NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Activation requests
CREATE TABLE IF NOT EXISTS "activationRequests" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "appId" integer NOT NULL,
  "appTitle" varchar(255) NOT NULL,
  "formData" json,
  "pointsSpent" integer DEFAULT 0 NOT NULL,
  "status" "activation_status" DEFAULT 'pending' NOT NULL,
  "adminNotes" text,
  "processedBy" integer,
  "processedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Dashboard messages
CREATE TABLE IF NOT EXISTS "dashboardMessages" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255),
  "body" text NOT NULL,
  "style" "dashboard_message_style" DEFAULT 'info' NOT NULL,
  "userId" integer,
  "isDismissible" boolean DEFAULT true NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Message dismissals
CREATE TABLE IF NOT EXISTS "dashboardMessageDismissals" (
  "id" serial PRIMARY KEY NOT NULL,
  "messageId" integer NOT NULL,
  "userId" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
