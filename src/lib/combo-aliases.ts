/**
 * One canonical page per emoji combo glyph.
 *
 * The combo catalog publishes the same drawing under several slugs — 🌈☁️
 * lives at `rainbow-cloud`, `rainbow-cloud-happy` and `rainbow-cloud-v2`;
 * 🍔🍟 lives at `burger-fries`, `burger-fries-v2` and `hamburger-fries-v3`.
 * 106 pages were a second address for a glyph another page already
 * explained. They competed with each other in search, and 54 of them
 * shared a title with their twin, so a search engine could not tell which
 * one was the real page.
 *
 * This module maps every duplicate slug to the slug that owns the glyph.
 * The owners are noindexed with a canonical to the owner
 * (`src/lib/seo-policy.ts`), left out of the sitemap
 * (`src/lib/sitemap-entries.ts`), and redirected to the owner
 * (`next.config.ts`) — the same treatment the emoji catalog already gets
 * through `src/lib/emoji-aliases.ts`.
 *
 * This module is imported by `next.config.ts`, so it uses relative imports
 * only and reads the JSON files directly.
 */

import fs from 'fs';
import path from 'path';

/** The parts of a combo record this module needs. */
interface ComboGlyphRecord {
  slug: string;
  combo: string;
}

/**
 * Trailing version markers used by the content generators, e.g.
 * `rainbow-cloud-v2`, `medal-sparkles-2`, `hamburger-fries-v3`.
 */
const VERSION_SUFFIX = /-(?:v\d+|\d+)$/;

/**
 * Read the slug and glyph of every combo record.
 */
function loadComboGlyphs(): ComboGlyphRecord[] {
  const directory = path.join(process.cwd(), 'src', 'data', 'combos');
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const raw = fs.readFileSync(path.join(directory, name), 'utf-8');
      const record = JSON.parse(raw) as ComboGlyphRecord;
      return { slug: record.slug, combo: record.combo };
    });
}

/**
 * Pick the slug that owns a glyph.
 *
 * The rule is deliberately simple and mechanical so the outcome can be
 * reviewed by reading the map:
 *
 * 1. A slug without a trailing version marker beats one with it, so
 *    `rainbow-cloud` owns 🌈☁️ rather than `rainbow-cloud-v2`.
 * 2. The shorter slug wins, so `sun-sparkles-v2` loses to
 *    `sunrise-sparkles`.
 * 3. Alphabetical order breaks any remaining tie, so the result never
 *    depends on the order the files happen to be read in.
 */
function pickOwner(slugs: string[]): string {
  return [...slugs].sort((a, b) => {
    const aVersioned = VERSION_SUFFIX.test(a) ? 1 : 0;
    const bVersioned = VERSION_SUFFIX.test(b) ? 1 : 0;
    if (aVersioned !== bVersioned) return aVersioned - bVersioned;
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  })[0];
}

/**
 * Build the alias map: duplicate slug → slug that owns the glyph.
 */
function buildAliasMap(): Record<string, string> {
  const byGlyph = new Map<string, string[]>();

  for (const record of loadComboGlyphs()) {
    if (!record.combo) continue;
    const slugs = byGlyph.get(record.combo) ?? [];
    slugs.push(record.slug);
    byGlyph.set(record.combo, slugs);
  }

  const aliases: Record<string, string> = {};
  for (const slugs of byGlyph.values()) {
    if (slugs.length < 2) continue;
    const owner = pickOwner(slugs);
    for (const slug of slugs) {
      if (slug !== owner) aliases[slug] = owner;
    }
  }

  return aliases;
}

/** Alias slug → slug of the page that owns the glyph. */
export const COMBO_ALIASES: Readonly<Record<string, string>> = buildAliasMap();

/** Whether the slug duplicates another page's glyph. */
export function isComboAlias(slug: string): boolean {
  return Object.hasOwn(COMBO_ALIASES, slug);
}

/** The slug of the page that owns this slug's glyph (the slug itself when it is not an alias). */
export function getCanonicalComboSlug(slug: string): string {
  return isComboAlias(slug) ? COMBO_ALIASES[slug] : slug;
}
