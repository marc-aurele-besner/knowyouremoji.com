import { describe, it, expect, afterEach, mock } from 'bun:test';
import type { EmojiSummary } from '@/types/emoji';

// We deliberately do NOT use `mock.module('@/lib/emoji-data', ...)` here:
// in bun, file-scope module mocks leak across test files in the same process,
// which would clobber `emoji-data.test.ts` (causing e.g. the skull-emoji
// assertion to fail because the real catalog is replaced with this sample).
// Instead, every accessor in `@/lib/analytics-queries` accepts an optional
// `summaries` override, which we exercise here.

const sampleSummaries: EmojiSummary[] = [
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'travel', tldr: 'hot' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'love' },
  { slug: 'smile', character: '😀', name: 'Grinning Face', category: 'faces', tldr: 'happy' },
];

const defaultSqlImpl = async (strings: TemplateStringsArray): Promise<unknown[]> => {
  const head = strings[0] ?? '';
  if (head.includes('SUM(view_count)')) {
    return [
      {
        total_views: '150',
        tracked: '2',
        top_slug: 'fire',
        top_views: '120',
        last_updated_at: new Date('2026-08-01T12:00:00Z'),
        views_last_7: '50',
        views_last_30: '150',
      },
    ];
  }
  if (head.includes('ORDER BY view_count DESC')) {
    return [
      { slug: 'fire', view_count: '120', updated_at: new Date('2026-08-01T12:00:00Z') },
      { slug: 'heart', view_count: '30', updated_at: new Date('2026-07-25T08:00:00Z') },
    ];
  }
  if (head.includes('ORDER BY view_count ASC')) {
    return [
      { slug: 'heart', view_count: '30', updated_at: new Date('2026-07-25T08:00:00Z') },
      { slug: 'fire', view_count: '120', updated_at: new Date('2026-08-01T12:00:00Z') },
    ];
  }
  if (head.includes('FROM emoji_page_views') && !head.includes('ORDER BY')) {
    return [
      { slug: 'fire', view_count: '120', updated_at: new Date('2026-08-01T12:00:00Z') },
      { slug: 'heart', view_count: '30', updated_at: new Date('2026-07-25T08:00:00Z') },
    ];
  }
  return [];
};

const mockSql = mock(defaultSqlImpl);

// Only mock Neon — the data layer we genuinely want to substitute. The
// emoji-data module is imported untouched so `emoji-data.test.ts` keeps
// seeing the real catalog.
mock.module('@/lib/neon', () => ({
  getNeonSql: () =>
    process.env.DATABASE_URL ? (mockSql as unknown as import('@/lib/neon').NeonSql) : null,
}));

describe('analytics-queries', () => {
  afterEach(() => {
    Reflect.deleteProperty(process.env, 'DATABASE_URL');
    mockSql.mockClear();
    mockSql.mockImplementation(defaultSqlImpl);
  });

  describe('getAnalyticsOverview', () => {
    it('returns zeroed values when DATABASE_URL is unset', async () => {
      Reflect.deleteProperty(process.env, 'DATABASE_URL');
      const { getAnalyticsOverview } = await import('@/lib/analytics-queries');
      const result = await getAnalyticsOverview(sampleSummaries);
      expect(result.totalViews).toBe(0);
      expect(result.trackedEmojis).toBe(0);
      expect(result.catalogSize).toBe(sampleSummaries.length);
      expect(result.topSlug).toBeNull();
      expect(result.topViews).toBe(0);
      expect(result.viewsLast7Days).toBe(0);
      expect(result.viewsLast30Days).toBe(0);
      expect(result.lastUpdatedAt).toBeNull();
    });

    it('parses overview metrics from Neon', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getAnalyticsOverview } = await import('@/lib/analytics-queries');
      const result = await getAnalyticsOverview(sampleSummaries);
      expect(result.totalViews).toBe(150);
      expect(result.trackedEmojis).toBe(2);
      expect(result.catalogSize).toBe(sampleSummaries.length);
      expect(result.topSlug).toBe('fire');
      expect(result.topViews).toBe(120);
      expect(result.viewsLast7Days).toBe(50);
      expect(result.viewsLast30Days).toBe(150);
      expect(result.lastUpdatedAt).toBe('2026-08-01T12:00:00.000Z');
    });

    it('returns zeroed values when Neon throws', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const origErr = console.error;
      console.error = () => {};
      mockSql.mockImplementation(async () => {
        throw new Error('boom');
      });
      try {
        const { getAnalyticsOverview } = await import('@/lib/analytics-queries');
        const result = await getAnalyticsOverview(sampleSummaries);
        expect(result.totalViews).toBe(0);
        expect(result.trackedEmojis).toBe(0);
        expect(result.topSlug).toBeNull();
      } finally {
        console.error = origErr;
      }
    });

    it('rejects invalid top slug', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      mockSql.mockImplementation(async (strings) => {
        const head = strings[0] ?? '';
        if (head.includes('SUM(view_count)')) {
          return [
            {
              total_views: '5',
              tracked: '1',
              top_slug: 'bad slug!',
              top_views: '5',
              last_updated_at: null,
              views_last_7: '5',
              views_last_30: '5',
            },
          ];
        }
        return [];
      });
      const { getAnalyticsOverview } = await import('@/lib/analytics-queries');
      const result = await getAnalyticsOverview(sampleSummaries);
      expect(result.totalViews).toBe(5);
      expect(result.topSlug).toBeNull();
      expect(result.topViews).toBe(5);
    });
  });

  describe('getTopEmojisByViews', () => {
    it('returns catalog-resolved entries in popularity order', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getTopEmojisByViews } = await import('@/lib/analytics-queries');
      const result = await getTopEmojisByViews(5, sampleSummaries);
      expect(result).toHaveLength(2);
      expect(result[0]?.slug).toBe('fire');
      expect(result[0]?.views).toBe(120);
      expect(result[0]?.emoji?.name).toBe('Fire');
      expect(result[1]?.slug).toBe('heart');
      expect(result[1]?.views).toBe(30);
    });

    it('returns an empty array when DATABASE_URL is unset', async () => {
      Reflect.deleteProperty(process.env, 'DATABASE_URL');
      const { getTopEmojisByViews } = await import('@/lib/analytics-queries');
      const result = await getTopEmojisByViews(5, sampleSummaries);
      expect(result).toEqual([]);
    });

    it('returns an empty array when limit <= 0', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getTopEmojisByViews } = await import('@/lib/analytics-queries');
      expect(await getTopEmojisByViews(0, sampleSummaries)).toEqual([]);
      expect(await getTopEmojisByViews(-1, sampleSummaries)).toEqual([]);
    });

    it('skips rows with invalid slugs', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      mockSql.mockImplementation(async (strings) => {
        const head = strings[0] ?? '';
        if (head.includes('ORDER BY view_count DESC')) {
          return [
            { slug: 'BAD!', view_count: 999, updated_at: null },
            { slug: 'fire', view_count: '5', updated_at: null },
          ];
        }
        return [];
      });
      const { getTopEmojisByViews } = await import('@/lib/analytics-queries');
      const result = await getTopEmojisByViews(5, sampleSummaries);
      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe('fire');
    });

    it('returns empty array when Neon throws', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const origErr = console.error;
      console.error = () => {};
      mockSql.mockImplementation(async () => {
        throw new Error('boom');
      });
      try {
        const { getTopEmojisByViews } = await import('@/lib/analytics-queries');
        const result = await getTopEmojisByViews(5, sampleSummaries);
        expect(result).toEqual([]);
      } finally {
        console.error = origErr;
      }
    });
  });

  describe('getLeastViewedTrackedEmojis', () => {
    it('returns catalog-resolved entries sorted ascending', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getLeastViewedTrackedEmojis } = await import('@/lib/analytics-queries');
      const result = await getLeastViewedTrackedEmojis(5, sampleSummaries);
      expect(result.map((r) => r.slug)).toEqual(['heart', 'fire']);
      expect(result[0]?.views).toBe(30);
    });

    it('returns empty array when limit <= 0', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getLeastViewedTrackedEmojis } = await import('@/lib/analytics-queries');
      expect(await getLeastViewedTrackedEmojis(0, sampleSummaries)).toEqual([]);
    });

    it('returns empty array when DATABASE_URL is unset', async () => {
      Reflect.deleteProperty(process.env, 'DATABASE_URL');
      const { getLeastViewedTrackedEmojis } = await import('@/lib/analytics-queries');
      expect(await getLeastViewedTrackedEmojis(5, sampleSummaries)).toEqual([]);
    });
  });

  describe('getAllEmojiViewCounts', () => {
    it('returns catalog emojis with zero views when DB is unset', async () => {
      Reflect.deleteProperty(process.env, 'DATABASE_URL');
      const { getAllEmojiViewCounts } = await import('@/lib/analytics-queries');
      const result = await getAllEmojiViewCounts(sampleSummaries);
      expect(result).toHaveLength(sampleSummaries.length);
      expect(result.every((entry) => entry.views === 0)).toBe(true);
      expect(result.every((entry) => entry.lastViewedAt === null)).toBe(true);
      expect(result.every((entry) => entry.emoji !== undefined)).toBe(true);
    });

    it('joins view counts with catalog by slug', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getAllEmojiViewCounts } = await import('@/lib/analytics-queries');
      const result = await getAllEmojiViewCounts(sampleSummaries);
      const bySlug = new Map(result.map((r) => [r.slug, r]));
      expect(bySlug.get('fire')?.views).toBe(120);
      expect(bySlug.get('heart')?.views).toBe(30);
      // No DB row for "smile" — should default to 0
      expect(bySlug.get('smile')?.views).toBe(0);
      expect(bySlug.get('smile')?.lastViewedAt).toBeNull();
    });

    it('falls back to zeroed catalog when Neon throws', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const origErr = console.error;
      console.error = () => {};
      mockSql.mockImplementation(async () => {
        throw new Error('boom');
      });
      try {
        const { getAllEmojiViewCounts } = await import('@/lib/analytics-queries');
        const result = await getAllEmojiViewCounts(sampleSummaries);
        expect(result).toHaveLength(sampleSummaries.length);
        expect(result.every((entry) => entry.views === 0)).toBe(true);
      } finally {
        console.error = origErr;
      }
    });

    it('returns empty array when catalog is empty', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getAllEmojiViewCounts } = await import('@/lib/analytics-queries');
      const result = await getAllEmojiViewCounts([]);
      expect(result).toEqual([]);
    });
  });

  describe('getBookBannerStats', () => {
    const bookBannerSqlImpl = async (strings: TemplateStringsArray): Promise<unknown[]> => {
      const query = strings.join('?');
      if (query.includes('generate_series')) {
        return [
          { day: '2026-10-14', views: '40', clicks: '2' },
          { day: new Date('2026-10-15T00:00:00Z'), views: 10, clicks: null },
        ];
      }
      if (query.includes('GROUP BY banner')) {
        return [
          { banner: 'book-cover-01', views: '700', clicks: '21' },
          { banner: 'book-cover-02', views: '500', clicks: '15' },
        ];
      }
      return [];
    };

    it('returns empty stats when DATABASE_URL is unset', async () => {
      const { getBookBannerStats } = await import('@/lib/analytics-queries');
      const result = await getBookBannerStats();
      expect(result).toEqual({ totals: { views: 0, clicks: 0 }, daily: [], byBanner: [] });
      expect(mockSql).not.toHaveBeenCalled();
    });

    it('returns empty stats for a non-positive window', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const { getBookBannerStats } = await import('@/lib/analytics-queries');
      const result = await getBookBannerStats(0);
      expect(result.daily).toEqual([]);
      expect(mockSql).not.toHaveBeenCalled();
    });

    it('returns daily series, per-banner counts, and totals', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      mockSql.mockImplementation(bookBannerSqlImpl);
      const { getBookBannerStats } = await import('@/lib/analytics-queries');
      const result = await getBookBannerStats(2);
      expect(result.daily).toEqual([
        { day: '2026-10-14', views: 40, clicks: 2 },
        { day: '2026-10-15', views: 10, clicks: 0 },
      ]);
      expect(result.byBanner).toEqual([
        { banner: 'book-cover-01', views: 700, clicks: 21 },
        { banner: 'book-cover-02', views: 500, clicks: 15 },
      ]);
      expect(result.totals).toEqual({ views: 1200, clicks: 36 });
    });

    it('passes the window size to the daily query', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      mockSql.mockImplementation(bookBannerSqlImpl);
      const { getBookBannerStats } = await import('@/lib/analytics-queries');
      await getBookBannerStats(30);
      const dailyCall = mockSql.mock.calls.find((call) =>
        (call[0] as TemplateStringsArray).join('?').includes('generate_series')
      ) as unknown[] | undefined;
      expect(dailyCall?.slice(1)).toEqual([29]);
    });

    it('returns empty stats when Neon throws', async () => {
      process.env.DATABASE_URL = 'postgresql://test';
      const origErr = console.error;
      console.error = () => {};
      mockSql.mockImplementation(async () => {
        throw new Error('boom');
      });
      try {
        const { getBookBannerStats } = await import('@/lib/analytics-queries');
        const result = await getBookBannerStats();
        expect(result).toEqual({ totals: { views: 0, clicks: 0 }, daily: [], byBanner: [] });
      } finally {
        console.error = origErr;
      }
    });
  });
});
