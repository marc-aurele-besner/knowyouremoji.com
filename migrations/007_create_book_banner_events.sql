-- Migration: Create book_banner_events table for tracking book banner views and clicks
-- Run against your Neon Postgres database before deploying the book banner tracking feature.
--
-- One row per event (append-only) so views and clicks can be charted over time.

CREATE TABLE IF NOT EXISTS book_banner_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('view', 'click')),
  banner text NOT NULL,
  page_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_banner_events_created_at_idx
  ON book_banner_events (created_at);
