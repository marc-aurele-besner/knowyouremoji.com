/**
 * Resolves popular emoji for the homepage based on Neon page-view counts.
 */

import type { EmojiSummary } from '@/types/emoji';
import { getNeonSql } from '@/lib/neon';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function summaryMapFromList(summaries: EmojiSummary[]): Map<string, EmojiSummary> {
  return new Map(summaries.map((s) => [s.slug, s]));
}

/**
 * Returns up to `limit` emoji summaries for the homepage: Neon popularity order when configured,
 * filled from static catalog order for any remaining slots.
 */
export async function getPopularEmojiSummariesForHome(
  limit: number,
  allSummaries: EmojiSummary[]
): Promise<EmojiSummary[]> {
  if (limit <= 0) {
    return [];
  }

  const sql = getNeonSql();
  const bySlug = summaryMapFromList(allSummaries);

  if (!sql) {
    return allSummaries.slice(0, limit);
  }

  try {
    const rows = (await sql`
      SELECT slug, view_count
      FROM emoji_page_views
      ORDER BY view_count DESC, slug ASC
      LIMIT ${limit * 2}
    `) as { slug: string; view_count: string | number }[];

    const popular: EmojiSummary[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (popular.length >= limit) break;
      if (!SLUG_PATTERN.test(row.slug)) continue;
      const summary = bySlug.get(row.slug);
      if (summary) {
        popular.push(summary);
        seen.add(row.slug);
      }
    }

    if (popular.length < limit) {
      for (const s of allSummaries) {
        if (popular.length >= limit) break;
        if (!seen.has(s.slug)) {
          popular.push(s);
          seen.add(s.slug);
        }
      }
    }

    return popular.slice(0, limit);
  } catch (err) {
    console.error('[emoji-popularity] Failed to load popular emojis, using catalog order:', err);
    return allSummaries.slice(0, limit);
  }
}
