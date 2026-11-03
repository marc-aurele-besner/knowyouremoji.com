/**
 * Resolves the emoji grid shown on the homepage.
 *
 * `emoji_page_views` only stores an all-time `view_count` per slug (no dated rows), so the
 * ranking it gives is "most viewed", never a weekly trend. When Neon is not configured, fails,
 * or does not have enough rows to fill the grid, a hand-picked list is used instead of padding
 * the ranking with whatever comes next in the catalog.
 */

import type { EmojiSummary } from '@/types/emoji';
import { getNeonSql } from '@/lib/neon';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * Emojis we would defend as a starting point for a new visitor: the ones whose real-world
 * meaning differs most from their Unicode name.
 */
export const CURATED_HOME_EMOJI_SLUGS = [
  'skull',
  'loudly-crying-face',
  'folded-hands',
  'eyes',
  'melting-face',
  'fire',
  'face-with-tears-of-joy',
  'red-heart',
  'sparkles',
  'face-holding-back-tears',
  'thinking-face',
  'upside-down-face',
] as const;

/** Where the homepage emoji list came from, so the heading can describe it truthfully. */
export type HomeEmojiSource = 'most-viewed' | 'curated';

export interface HomeEmojiSelection {
  source: HomeEmojiSource;
  emojis: EmojiSummary[];
}

function curatedSelection(limit: number, bySlug: Map<string, EmojiSummary>): HomeEmojiSelection {
  const emojis = CURATED_HOME_EMOJI_SLUGS.map((slug) => bySlug.get(slug))
    .filter((s): s is EmojiSummary => s != null)
    .slice(0, limit);
  return { source: 'curated', emojis };
}

/**
 * Returns up to `limit` emojis for the homepage grid.
 *
 * Uses all-time Neon view counts (`source: 'most-viewed'`) only when they fill every slot;
 * otherwise returns the curated list (`source: 'curated'`). The two are never mixed.
 */
export async function getHomeEmojiSelection(
  limit: number,
  allSummaries: EmojiSummary[]
): Promise<HomeEmojiSelection> {
  if (limit <= 0) {
    return { source: 'curated', emojis: [] };
  }

  const sql = getNeonSql();
  const bySlug = new Map(allSummaries.map((s) => [s.slug, s]));

  if (!sql) {
    return curatedSelection(limit, bySlug);
  }

  try {
    const rows = (await sql`
      SELECT slug, view_count
      FROM emoji_page_views
      WHERE view_count > 0
      ORDER BY view_count DESC, slug ASC
      LIMIT ${limit * 2}
    `) as { slug: string; view_count: string | number }[];

    const popular: EmojiSummary[] = [];

    for (const row of rows) {
      if (popular.length >= limit) break;
      if (!SLUG_PATTERN.test(row.slug)) continue;
      const summary = bySlug.get(row.slug);
      if (summary) {
        popular.push(summary);
      }
    }

    if (popular.length < limit) {
      return curatedSelection(limit, bySlug);
    }

    return { source: 'most-viewed', emojis: popular };
  } catch (err) {
    console.error('[emoji-popularity] Failed to load most viewed emojis, using curated list:', err);
    return curatedSelection(limit, bySlug);
  }
}
