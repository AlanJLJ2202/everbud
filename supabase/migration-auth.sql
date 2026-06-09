-- Migration: Add user_id and proper RLS policies
-- Run this AFTER the initial schema if you have existing data
-- Run in Supabase SQL Editor

-- 1. Add user_id column to all tables
ALTER TABLE plants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE care_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE germinations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE death_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Drop the old open policies
DROP POLICY IF EXISTS "Allow all on plants" ON plants;
DROP POLICY IF EXISTS "Allow all on care_logs" ON care_logs;
DROP POLICY IF EXISTS "Allow all on germinations" ON germinations;
DROP POLICY IF EXISTS "Allow all on death_logs" ON death_logs;

-- 3. Create per-user RLS policies
-- Plants
CREATE POLICY "Users can view own plants" ON plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON plants
  FOR DELETE USING (auth.uid() = user_id);

-- Care logs
CREATE POLICY "Users can view own care_logs" ON care_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care_logs" ON care_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care_logs" ON care_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care_logs" ON care_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Germinations
CREATE POLICY "Users can view own germinations" ON germinations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own germinations" ON germinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own germinations" ON germinations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own germinations" ON germinations
  FOR DELETE USING (auth.uid() = user_id);

-- Death logs
CREATE POLICY "Users can view own death_logs" ON death_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own death_logs" ON death_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own death_logs" ON death_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own death_logs" ON death_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_care_logs_user_id ON care_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_germinations_user_id ON germinations(user_id);
CREATE INDEX IF NOT EXISTS idx_death_logs_user_id ON death_logs(user_id);

-- NOTE: If you have existing data without user_id, assign it to your user:
-- UPDATE plants SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE care_logs SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE germinations SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE death_logs SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- Then set user_id to NOT NULL:
-- ALTER TABLE plants ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE care_logs ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE germinations ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE death_logs ALTER COLUMN user_id SET NOT NULL;
