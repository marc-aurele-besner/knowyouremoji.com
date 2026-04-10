#!/usr/bin/env bun
/**
 * Import JSON data to Supabase
 *
 * Imports all emoji and combo data from JSON files into the Supabase database.
 * This script is used for Phase 2 migration from static JSON to database.
 *
 * Usage: bun run scripts/import-to-supabase.ts
 */

import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import type { Emoji } from '../src/types/emoji';
import type { EmojiCombo } from '../src/types/combo';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// ============================================
// LOAD DATA FROM JSON FILES
// ============================================

function loadEmojisFromDirectory(dir: string): Emoji[] {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const emojis: Emoji[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const emoji = JSON.parse(content) as Emoji;
      emojis.push(emoji);
    } catch (error) {
      console.error(`Error loading emoji ${file}:`, error);
    }
  }

  return emojis;
}

function loadCombosFromDirectory(dir: string): EmojiCombo[] {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const combos: EmojiCombo[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const combo = JSON.parse(content) as EmojiCombo;
      combos.push(combo);
    } catch (error) {
      console.error(`Error loading combo ${file}:`, error);
    }
  }

  return combos;
}

// ============================================
// IMPORT EMOJIS
// ============================================

async function importEmojis(emojis: Emoji[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const emoji of emojis) {
    try {
      // Insert main emoji record
      await sql`
        INSERT INTO emojis (
          slug, unicode, character, name, short_name, category, subcategory,
          unicode_version, base_meaning, tldr, seo_title, seo_description,
          skin_tone_variations, related_combos
        ) VALUES (
          ${emoji.slug},
          ${emoji.unicode},
          ${emoji.character},
          ${emoji.name},
          ${emoji.shortName ?? null},
          ${emoji.category},
          ${emoji.subcategory ?? null},
          ${emoji.unicodeVersion ?? null},
          ${emoji.baseMeaning},
          ${emoji.tldr ?? null},
          ${emoji.seoTitle ?? null},
          ${emoji.seoDescription ?? null},
          ${JSON.stringify(emoji.skinToneVariations ?? [])},
          ${JSON.stringify(emoji.relatedCombos ?? [])}
        )
        ON CONFLICT (slug) DO UPDATE SET
          unicode = EXCLUDED.unicode,
          character = EXCLUDED.character,
          name = EXCLUDED.name,
          short_name = EXCLUDED.short_name,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          unicode_version = EXCLUDED.unicode_version,
          base_meaning = EXCLUDED.base_meaning,
          tldr = EXCLUDED.tldr,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          skin_tone_variations = EXCLUDED.skin_tone_variations,
          related_combos = EXCLUDED.related_combos,
          updated_at = NOW()
      `;

      // Insert context meanings
      for (const cm of emoji.contextMeanings ?? []) {
        await sql`
          INSERT INTO emoji_context_meanings (emoji_slug, context, meaning, example, risk_level)
          VALUES (${emoji.slug}, ${cm.context}, ${cm.meaning}, ${cm.example}, ${cm.riskLevel})
          ON CONFLICT DO NOTHING
        `;
      }

      // Insert platform notes
      for (const pn of emoji.platformNotes ?? []) {
        await sql`
          INSERT INTO emoji_platform_notes (emoji_slug, platform, note)
          VALUES (${emoji.slug}, ${pn.platform}, ${pn.note})
          ON CONFLICT DO NOTHING
        `;
      }

      // Insert generational notes
      for (const gn of emoji.generationalNotes ?? []) {
        await sql`
          INSERT INTO emoji_generational_notes (emoji_slug, generation, note)
          VALUES (${emoji.slug}, ${gn.generation}, ${gn.note})
          ON CONFLICT DO NOTHING
        `;
      }

      success++;
    } catch (error) {
      console.error(`Failed to import emoji ${emoji.slug}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

// ============================================
// IMPORT COMBOS
// ============================================

async function importCombos(combos: EmojiCombo[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const combo of combos) {
    try {
      // Insert main combo record
      await sql`
        INSERT INTO combos (
          slug, character, name, category, base_meaning, tldr,
          seo_title, seo_description
        ) VALUES (
          ${combo.slug},
          ${combo.combo},
          ${combo.name},
          ${combo.category},
          ${combo.meaning},
          ${combo.description ?? null},
          ${combo.seoTitle ?? null},
          ${combo.seoDescription ?? null}
        )
        ON CONFLICT (slug) DO UPDATE SET
          character = EXCLUDED.character,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          base_meaning = EXCLUDED.base_meaning,
          tldr = EXCLUDED.tldr,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          updated_at = NOW()
      `;

      // Insert combo emojis (junction table)
      for (let i = 0; i < combo.emojis.length; i++) {
        await sql`
          INSERT INTO combo_emojis (combo_slug, emoji_unicode, position)
          VALUES (${combo.slug}, ${combo.emojis[i]}, ${i})
          ON CONFLICT DO NOTHING
        `;
      }

      // Insert combo context meanings (parse from examples array)
      // The combo JSON has examples: string[] but the table has context, meaning, example, risk_level
      // We'll use the main meaning and each example as a separate entry
      if (combo.examples && combo.examples.length > 0) {
        for (const example of combo.examples) {
          await sql`
            INSERT INTO combo_context_meanings (combo_slug, context, meaning, example, risk_level)
            VALUES (${combo.slug}, 'SLANG', ${combo.meaning}, ${example}, 'LOW')
            ON CONFLICT DO NOTHING
          `;
        }
      }

      // Insert combo tags as platform notes (since there's no dedicated tags table)
      // Using DISCORD as a generic platform for tags/metadata
      if (combo.tags && combo.tags.length > 0) {
        for (const tag of combo.tags) {
          await sql`
            INSERT INTO combo_platform_notes (combo_slug, platform, note)
            VALUES (${combo.slug}, 'DISCORD', ${'tag: ' + tag})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      success++;
    } catch (error) {
      console.error(`Failed to import combo ${combo.slug}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
  console.log('🚀 Starting Supabase import...\n');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
  const combosDir = path.join(process.cwd(), 'src', 'data', 'combos');

  console.log('📂 Loading emoji data...');
  const emojis = loadEmojisFromDirectory(emojisDir);
  console.log(`   Found ${emojis.length} emojis\n`);

  console.log('📂 Loading combo data...');
  const combos = loadCombosFromDirectory(combosDir);
  console.log(`   Found ${combos.length} combos\n`);

  if (emojis.length === 0 && combos.length === 0) {
    console.log('⚠️  No data found to import');
    process.exit(1);
  }

  // Import emojis
  if (emojis.length > 0) {
    console.log('📥 Importing emojis...');
    const emojiResult = await importEmojis(emojis);
    console.log(`   ✅ Imported ${emojiResult.success} emojis, ${emojiResult.failed} failed\n`);
  }

  // Import combos
  if (combos.length > 0) {
    console.log('📥 Importing combos...');
    const comboResult = await importCombos(combos);
    console.log(`   ✅ Imported ${comboResult.success} combos, ${comboResult.failed} failed\n`);
  }

  console.log('✨ Import complete!');
}

main().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
