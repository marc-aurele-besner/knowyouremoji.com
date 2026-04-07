-- Migration: Create emoji_page_views table for tracking emoji detail page popularity
-- Run against your Neon Postgres database before deploying the popularity feature.

CREATE TABLE IF NOT EXISTS emoji_page_views (
  slug text PRIMARY KEY,
  view_count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
