-- Migration: Create interpretations table for user history
-- Run against your Neon Postgres database.

CREATE TABLE IF NOT EXISTS interpretations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  interpretation text NOT NULL,
  emoji_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interpretations_user_id ON interpretations(user_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_created_at ON interpretations(created_at DESC);
