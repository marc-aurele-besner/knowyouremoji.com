-- Migration: Create emojis and combos tables for Phase 2
-- Migrate from JSON files to Supabase database
-- Run against your Neon Postgres database.

-- ============ EMOJIS TABLE ============

CREATE TABLE IF NOT EXISTS emojis (
  slug TEXT PRIMARY KEY,
  unicode TEXT NOT NULL,
  character TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  unicode_version TEXT,
  base_meaning TEXT NOT NULL,
  tldr TEXT,
  seo_title TEXT,
  seo_description TEXT,
  skin_tone_variations JSONB DEFAULT '[]'::jsonb,
  related_combos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emojis_unicode ON emojis(unicode);
CREATE INDEX IF NOT EXISTS idx_emojis_category ON emojis(category);
CREATE INDEX IF NOT EXISTS idx_emojis_name ON emojis(name);

-- ============ CONTEXT MEANINGS TABLE ============

CREATE TABLE IF NOT EXISTS emoji_context_meanings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji_slug TEXT NOT NULL REFERENCES emojis(slug) ON DELETE CASCADE,
  context TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  risk_level TEXT DEFAULT 'LOW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_context_meanings_emoji_slug ON emoji_context_meanings(emoji_slug);

-- ============ PLATFORM NOTES TABLE ============

CREATE TABLE IF NOT EXISTS emoji_platform_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji_slug TEXT NOT NULL REFERENCES emojis(slug) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_notes_emoji_slug ON emoji_platform_notes(emoji_slug);

-- ============ GENERATIONAL NOTES TABLE ============

CREATE TABLE IF NOT EXISTS emoji_generational_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji_slug TEXT NOT NULL REFERENCES emojis(slug) ON DELETE CASCADE,
  generation TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generational_notes_emoji_slug ON emoji_generational_notes(emoji_slug);

-- ============ COMBOS TABLE ============

CREATE TABLE IF NOT EXISTS combos (
  slug TEXT PRIMARY KEY,
  character TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_meaning TEXT NOT NULL,
  tldr TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_combos_category ON combos(category);
CREATE INDEX IF NOT EXISTS idx_combos_name ON combos(name);

-- ============ COMBO EMOJIS (junction table) ============

CREATE TABLE IF NOT EXISTS combo_emojis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_slug TEXT NOT NULL REFERENCES combos(slug) ON DELETE CASCADE,
  emoji_unicode TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_combo_emojis_combo_slug ON combo_emojis(combo_slug);
CREATE INDEX IF NOT EXISTS idx_combo_emojis_emoji_unicode ON combo_emojis(emoji_unicode);

-- ============ COMBO CONTEXT MEANINGS TABLE ============

CREATE TABLE IF NOT EXISTS combo_context_meanings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_slug TEXT NOT NULL REFERENCES combos(slug) ON DELETE CASCADE,
  context TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  risk_level TEXT DEFAULT 'LOW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_combo_context_meanings_combo_slug ON combo_context_meanings(combo_slug);

-- ============ COMBO PLATFORM NOTES TABLE ============

CREATE TABLE IF NOT EXISTS combo_platform_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_slug TEXT NOT NULL REFERENCES combos(slug) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_combo_platform_notes_combo_slug ON combo_platform_notes(combo_slug);

-- ============ COMBO GENERATIONAL NOTES TABLE ============

CREATE TABLE IF NOT EXISTS combo_generational_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_slug TEXT NOT NULL REFERENCES combos(slug) ON DELETE CASCADE,
  generation TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_combo_generational_notes_combo_slug ON combo_generational_notes(combo_slug);

-- ============ AUTO-UPDATE UPDATED_AT TRIGGER ============

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER emojis_updated_at
  BEFORE UPDATE ON emojis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER combos_updated_at
  BEFORE UPDATE ON combos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
