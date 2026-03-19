-- Migration: 2026-03-19 Schema Updates
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Add final_score column to picks table
ALTER TABLE picks ADD COLUMN IF NOT EXISTS final_score text;

-- 2. Add 'void' to picks result constraint
-- First drop old constraint, then recreate with void
ALTER TABLE picks DROP CONSTRAINT IF EXISTS picks_result_check;
ALTER TABLE picks ADD CONSTRAINT picks_result_check CHECK (result IN ('pending', 'won', 'lost', 'void'));

-- 3. Add premium_since column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_since timestamptz;

-- 4. Backfill premium_since for existing premium users
UPDATE profiles SET premium_since = created_at WHERE role = 'premium' AND premium_since IS NULL;
