/**
 * Tracks emoji detail page views in Neon and resolves popular emoji for the homepage.
 */

import { after } from 'next/server';
import type { EmojiSummary } from '@/types/emoji';
import { getNeonSql, type NeonSql } from '@/lib/neon';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

let schemaReady: Promise<void> | undefined;

function ensureEmojiPopularitySchema(sql: NeonSql): Promise<void> {
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS emoji_page_views (
      slug text PRIMARY KEY,
      view_count bigint NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `.then(() => undefined);
  return schemaReady;
}

/**
 * Record a page view for an emoji slug (non-blocking via Next.js `after`).
 * No-ops when DATABASE_URL is missing or slug is invalid.
 *
 * Skips during `next build` static generation: `after()` requires a request scope and throws
 * otherwise, and prerender passes must not count as real traffic.
 */
export async function recordEmojiPageView(slug: string): Promise<void> {
  if (!SLUG_PATTERN.test(slug)) {
    return;
  }
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  const sql = getNeonSql();
  if (!sql) {
    return;
  }

  try {
    after(async () => {
      try {
        await ensureEmojiPopularitySchema(sql);
        await sql`
          INSERT INTO emoji_page_views (slug, view_count, updated_at)
          VALUES (${slug}, 1, now())
          ON CONFLICT (slug) DO UPDATE SET
            view_count = emoji_page_views.view_count + 1,
            updated_at = now()
        `;
      } catch (err) {
        console.error('[emoji-popularity] Failed to record emoji page view:', err);
      }
    });
  } catch {
    // No request scope (e.g. some static contexts) — do not fail the render
  }
}

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
    await ensureEmojiPopularitySchema(sql);
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
