/**
 * Admin analytics queries.
 *
 * Server-side data access for the admin analytics dashboard (ANAL-005).
 * Reads aggregated emoji page-view counts from Neon and joins them with the
 * static emoji catalog so admins can see what users actually look at.
 *
 * All functions are safe to call when DATABASE_URL is not configured — they
 * return zeroed/empty results so the dashboard still renders the underlying
 * catalog without popularity data.
 *
 * Each accessor accepts an optional `summaries` argument so callers (and
 * unit tests) can supply a pre-built catalog instead of paying for the
 * `getEmojiSummaries()` filesystem read on every call. When omitted, the
 * real loader is used.
 */

import { getNeonSql } from '@/lib/neon';
import { getEmojiSummaries } from '@/lib/emoji-data';
import type { EmojiSummary } from '@/types/emoji';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

const DEFAULT_TOP_LIMIT = 10;
const DEFAULT_BOTTOM_LIMIT = 10;

function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && SLUG_PATTERN.test(slug);
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Summary metrics for the admin dashboard.
 */
export interface AnalyticsOverview {
  /** Sum of all view counts across every tracked slug */
  totalViews: number;
  /** Number of distinct emoji slugs that have at least one recorded view */
  trackedEmojis: number;
  /** Number of emojis in the static catalog */
  catalogSize: number;
  /** Emoji slug with the highest view count (null if no views yet) */
  topSlug: string | null;
  /** Top slug's view count (0 when there are no views) */
  topViews: number;
  /** Sum of views recorded in the trailing 7-day window (best-effort) */
  viewsLast7Days: number;
  /** Sum of views recorded in the trailing 30-day window (best-effort) */
  viewsLast30Days: number;
  /** ISO timestamp of the most recent view update, if any */
  lastUpdatedAt: string | null;
}

interface RawOverviewRow {
  total_views: string | number | null;
  tracked: string | number | null;
  top_slug: string | null;
  top_views: string | number | null;
  last_updated_at: string | Date | null;
  views_last_7: string | number | null;
  views_last_30: string | number | null;
}

/**
 * Load high-level analytics metrics for the admin overview cards.
 *
 * Returns zeroed values when the database is unavailable so the dashboard
 * still renders.
 *
 * @param summaries Optional catalog override; defaults to `getEmojiSummaries()`.
 */
export async function getAnalyticsOverview(
  summaries: EmojiSummary[] = getEmojiSummaries()
): Promise<AnalyticsOverview> {
  const catalogSize = summaries.length;

  const empty: AnalyticsOverview = {
    totalViews: 0,
    trackedEmojis: 0,
    catalogSize,
    topSlug: null,
    topViews: 0,
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    lastUpdatedAt: null,
  };

  const sql = getNeonSql();
  if (!sql) {
    return empty;
  }

  try {
    const rows = (await sql`
      SELECT
        COALESCE(SUM(view_count), 0)::bigint AS total_views,
        COUNT(*)::bigint AS tracked,
        (
          SELECT slug FROM emoji_page_views
          ORDER BY view_count DESC, slug ASC
          LIMIT 1
        ) AS top_slug,
        (
          SELECT view_count FROM emoji_page_views
          ORDER BY view_count DESC, slug ASC
          LIMIT 1
        ) AS top_views,
        MAX(updated_at) AS last_updated_at,
        COALESCE(SUM(CASE WHEN updated_at >= now() - INTERVAL '7 days' THEN view_count ELSE 0 END), 0)::bigint AS views_last_7,
        COALESCE(SUM(CASE WHEN updated_at >= now() - INTERVAL '30 days' THEN view_count ELSE 0 END), 0)::bigint AS views_last_30
      FROM emoji_page_views
    `) as RawOverviewRow[];

    const row = rows[0];
    if (!row) {
      return empty;
    }

    return {
      totalViews: asNumber(row.total_views),
      trackedEmojis: asNumber(row.tracked),
      catalogSize,
      topSlug: isValidSlug(row.top_slug) ? row.top_slug : null,
      topViews: asNumber(row.top_views),
      viewsLast7Days: asNumber(row.views_last_7),
      viewsLast30Days: asNumber(row.views_last_30),
      lastUpdatedAt: row.last_updated_at
        ? row.last_updated_at instanceof Date
          ? row.last_updated_at.toISOString()
          : new Date(row.last_updated_at).toISOString()
        : null,
    };
  } catch (err) {
    console.error('[analytics-queries] Failed to load overview:', err);
    return empty;
  }
}

/**
 * Popularity entry returned to the admin dashboard.
 */
export interface PopularityEntry {
  slug: string;
  views: number;
  /** ISO timestamp of last view increment, if any */
  lastViewedAt: string | null;
}

interface RawPopularityRow {
  slug: string;
  view_count: string | number;
  updated_at: string | Date | null;
}

function attachSummary(
  rows: PopularityEntry[],
  summaries: EmojiSummary[]
): (PopularityEntry & { emoji: EmojiSummary | null })[] {
  const bySlug = new Map(summaries.map((s) => [s.slug, s]));
  return rows.map((row) => ({
    ...row,
    emoji: bySlug.get(row.slug) ?? null,
  }));
}

function rawRowsToEntries(rows: RawPopularityRow[]): PopularityEntry[] {
  return rows
    .filter((row) => isValidSlug(row.slug))
    .map((row) => ({
      slug: row.slug,
      views: asNumber(row.view_count),
      lastViewedAt: row.updated_at
        ? row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date(row.updated_at).toISOString()
        : null,
    }));
}

/**
 * Top emojis by view count.
 *
 * Returns up to `limit` rows; falls back to an empty list (the catalog-only
 * table on the page handles the empty case). Slugs that don't match the
 * canonical pattern are skipped.
 *
 * @param limit Maximum number of rows to return.
 * @param summaries Optional catalog override; defaults to `getEmojiSummaries()`.
 */
export async function getTopEmojisByViews(
  limit: number = DEFAULT_TOP_LIMIT,
  summaries: EmojiSummary[] = getEmojiSummaries()
): Promise<(PopularityEntry & { emoji: EmojiSummary | null })[]> {
  if (limit <= 0) return [];

  const sql = getNeonSql();
  if (!sql) return [];

  try {
    const rows = (await sql`
      SELECT slug, view_count, updated_at
      FROM emoji_page_views
      ORDER BY view_count DESC, slug ASC
      LIMIT ${limit}
    `) as RawPopularityRow[];

    return attachSummary(rawRowsToEntries(rows), summaries);
  } catch (err) {
    console.error('[analytics-queries] Failed to load top emojis:', err);
    return [];
  }
}

/**
 * Emojis with the fewest views (still tracked).
 *
 * Useful for spotting content that might need promotion or pruning.
 *
 * @param limit Maximum number of rows to return.
 * @param summaries Optional catalog override; defaults to `getEmojiSummaries()`.
 */
export async function getLeastViewedTrackedEmojis(
  limit: number = DEFAULT_BOTTOM_LIMIT,
  summaries: EmojiSummary[] = getEmojiSummaries()
): Promise<(PopularityEntry & { emoji: EmojiSummary | null })[]> {
  if (limit <= 0) return [];

  const sql = getNeonSql();
  if (!sql) return [];

  try {
    const rows = (await sql`
      SELECT slug, view_count, updated_at
      FROM emoji_page_views
      ORDER BY view_count ASC, slug ASC
      LIMIT ${limit}
    `) as RawPopularityRow[];

    return attachSummary(rawRowsToEntries(rows), summaries);
  } catch (err) {
    console.error('[analytics-queries] Failed to load least-viewed emojis:', err);
    return [];
  }
}

/**
 * Every catalog emoji joined with its view count.
 *
 * Returns catalog emojis in static order when the database is unavailable.
 * The result is always at most `catalogSize` entries.
 *
 * @param summaries Optional catalog override; defaults to `getEmojiSummaries()`.
 */
export async function getAllEmojiViewCounts(
  summaries: EmojiSummary[] = getEmojiSummaries()
): Promise<(PopularityEntry & { emoji: EmojiSummary })[]> {
  if (summaries.length === 0) return [];

  const sql = getNeonSql();
  if (!sql) {
    return summaries.map((emoji) => ({
      slug: emoji.slug,
      views: 0,
      lastViewedAt: null,
      emoji,
    }));
  }

  try {
    const rows = (await sql`
      SELECT slug, view_count, updated_at
      FROM emoji_page_views
    `) as RawPopularityRow[];

    const viewsBySlug = new Map<string, PopularityEntry>();
    for (const row of rawRowsToEntries(rows)) {
      viewsBySlug.set(row.slug, row);
    }

    return summaries.map((emoji) => {
      const tracked = viewsBySlug.get(emoji.slug);
      return {
        slug: emoji.slug,
        views: tracked?.views ?? 0,
        lastViewedAt: tracked?.lastViewedAt ?? null,
        emoji,
      };
    });
  } catch (err) {
    console.error('[analytics-queries] Failed to load all emoji view counts:', err);
    return summaries.map((emoji) => ({
      slug: emoji.slug,
      views: 0,
      lastViewedAt: null,
      emoji,
    }));
  }
}
