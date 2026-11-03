/**
 * Writes `src/data/emoji-aliases.json`: one canonical page per emoji glyph.
 *
 * Why this exists
 * ---------------
 * The catalog publishes several slugs for the same character (`100` and
 * `hundred-points` for 💯, four slugs for 😈, ...). Every one of them was an
 * indexable page with the same title pattern and no cross-canonical, so the
 * site handed search engines two to four URLs per glyph (issue #482).
 *
 * The map this script writes names, for every slug that duplicates another
 * page's glyph, the slug that owns the glyph. The rest of the site reads it:
 * alias pages are noindexed with a canonical to the owner, they are left out
 * of the sitemap, and `next.config.ts` redirects them to the owner.
 *
 * How the owner is picked
 * -----------------------
 * First hit wins:
 *   1. the slug that carries the skin-tone family, so the tone pages and
 *      the tone swatches stay on the page that is served;
 *   2. the slug an editorial guide links to most (`content/guides/*.md`);
 *   3. the slug that spells the emoji's own name (`hundred-points` for
 *      "Hundred Points"), which is the closest thing the catalog has to the
 *      CLDR name;
 *   4. the slug the comparison pages and combos reference most;
 *   5. the shorter slug, then the alphabetically first one.
 *
 * An owner already recorded in the map is kept as long as it still shares
 * the glyph, so a hand-picked owner survives a re-run. Slugs listed in
 * `MISLABELED_EMOJI_SLUGS` (`src/lib/emoji-aliases.ts`) name a different
 * emoji than the one their page shows, so they are never made aliases.
 *
 * Usage:
 *   bun run generate:emoji-aliases
 */

import fs from 'fs';
import path from 'path';

import { getAllEmojis, normalizeEmojiCharacter } from '../src/lib/emoji-data';
import { MISLABELED_EMOJI_SLUGS } from '../src/lib/emoji-aliases';
import type { Emoji } from '../src/types/emoji';

const ROOT = process.cwd();
const ALIASES_FILE = path.join(ROOT, 'src', 'data', 'emoji-aliases.json');
const GUIDES_DIR = path.join(ROOT, 'content', 'guides');
const COMBOS_DIR = path.join(ROOT, 'src', 'data', 'combos');
const COMPARISONS_FILE = path.join(ROOT, 'src', 'data', 'comparisons', 'index.json');

/** Turn a display name into the slug it would have (`Twelve O'Clock` → `twelve-oclock`). */
export function slugifyEmojiName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function countSlugs(slugs: Iterable<string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const slug of slugs) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  return counts;
}

function guideLinkCounts(): Map<string, number> {
  if (!fs.existsSync(GUIDES_DIR)) return new Map();
  const text = fs
    .readdirSync(GUIDES_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => fs.readFileSync(path.join(GUIDES_DIR, name), 'utf-8'))
    .join('\n');
  return countSlugs([...text.matchAll(/\/emoji\/([a-z0-9-]+)/g)].map((match) => match[1]));
}

function dataReferenceCounts(): Map<string, number> {
  const slugs: string[] = [];
  if (fs.existsSync(COMBOS_DIR)) {
    for (const name of fs.readdirSync(COMBOS_DIR).filter((file) => file.endsWith('.json'))) {
      const combo = JSON.parse(fs.readFileSync(path.join(COMBOS_DIR, name), 'utf-8'));
      if (Array.isArray(combo.emojis)) slugs.push(...combo.emojis);
    }
  }
  if (fs.existsSync(COMPARISONS_FILE)) {
    const comparisons = JSON.parse(fs.readFileSync(COMPARISONS_FILE, 'utf-8')) as Array<{
      emoji1Slug: string;
      emoji2Slug: string;
    }>;
    for (const comparison of comparisons) slugs.push(comparison.emoji1Slug, comparison.emoji2Slug);
  }
  return countSlugs(slugs);
}

function readExistingAliases(): Record<string, string> {
  if (!fs.existsSync(ALIASES_FILE)) return {};
  return JSON.parse(fs.readFileSync(ALIASES_FILE, 'utf-8')) as Record<string, string>;
}

/** Pick the slug that owns a glyph shared by several pages. */
export function pickCanonical(
  group: Emoji[],
  guideLinks: Map<string, number>,
  dataRefs: Map<string, number>,
  previousCanonical?: string
): Emoji {
  const kept = group.find((emoji) => emoji.slug === previousCanonical);
  if (kept) return kept;

  const score = (emoji: Emoji): number[] => [
    emoji.skinToneVariations?.length ? 1 : 0,
    guideLinks.get(emoji.slug) ?? 0,
    slugifyEmojiName(emoji.name) === emoji.slug ? 1 : 0,
    dataRefs.get(emoji.slug) ?? 0,
    -emoji.slug.length,
  ];

  return [...group].sort((a, b) => {
    const left = score(a);
    const right = score(b);
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return right[i] - left[i];
    }
    return a.slug.localeCompare(b.slug);
  })[0];
}

export function buildEmojiAliases(): Record<string, string> {
  const guideLinks = guideLinkCounts();
  const dataRefs = dataReferenceCounts();
  const previous = readExistingAliases();
  const previousCanonicals = new Set(Object.values(previous));

  // Skin-tone variants already canonicalize to their base page.
  const mislabeled = new Set(MISLABELED_EMOJI_SLUGS);
  const groups = new Map<string, Emoji[]>();
  const candidates = getAllEmojis().filter(
    (record) => !record.skinToneBase && !mislabeled.has(record.slug)
  );
  for (const emoji of candidates) {
    const key = normalizeEmojiCharacter(emoji.character);
    groups.set(key, [...(groups.get(key) ?? []), emoji]);
  }

  const aliases: Record<string, string> = {};
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const previousCanonical = group.find((emoji) => previousCanonicals.has(emoji.slug))?.slug;
    const canonical = pickCanonical(group, guideLinks, dataRefs, previousCanonical);
    for (const emoji of group) {
      if (emoji.slug !== canonical.slug) aliases[emoji.slug] = canonical.slug;
    }
  }

  return Object.fromEntries(Object.entries(aliases).sort(([a], [b]) => a.localeCompare(b)));
}

if (import.meta.main) {
  const aliases = buildEmojiAliases();
  fs.writeFileSync(ALIASES_FILE, `${JSON.stringify(aliases, null, 2)}\n`);
  const owners = new Set(Object.values(aliases)).size;
  console.log(
    `Wrote ${Object.keys(aliases).length} alias slug(s) for ${owners} glyph(s) to ${path.relative(ROOT, ALIASES_FILE)}`
  );
}
