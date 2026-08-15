/**
 * Sitemap entry builders for KnowYourEmoji.
 *
 * Centralizes the rules for *what should be in the sitemap*, in alignment
 * with `src/lib/seo-policy.ts`. Goals:
 *
 * 1. Only emit URLs we want indexed (no skin-tone variants, no `thin`
 *    emoji/combo pages, no auth/dashboard/admin/api).
 * 2. Surface high-value static/hub URLs so crawlers discover the trust
 *    surface (about, contact, pricing, privacy, terms, search, etc.).
 * 3. Use content-derived `lastModified` (prefer `contentUpdatedAt`,
 *    then published/updated metadata) instead of "now" so recency
 *    signals in Search Console are meaningful.
 * 4. Differentiate priority so deep editorial and guide URLs win over
 *    stub directory URLs.
 *
 * @see issue #355 (SEO-P1-001 sitemap / robots / thin-page alignment)
 */

import type { MetadataRoute } from 'next';
import type { Emoji, ContentTier } from '@/types/emoji';
import type { EmojiCombo } from '@/types/combo';
import { getAllEmojis, getAllCategories } from '@/lib/emoji-data';
import { getAllCombos, getAllComboCategories } from '@/lib/combo-data';
import { getAllPlatforms, getAllGenerations, getPageableContextTypes } from '@/lib/emoji-data';
import { getAllComparisons } from '@/lib/comparison-data';
import { getPublishedGuideSummaries } from '@/lib/guide-data';
import { resolveContentTier } from '@/lib/seo-policy';
import { getSiteUrl } from '@/lib/metadata';

/**
 * Priority tiers used in the sitemap. Soft signals for crawlers — keep
 * editorial content ahead of directory / aggregation surfaces.
 */
export const SITEMAP_PRIORITIES = {
  HOMEPAGE: 1.0,
  INTERPRETER: 0.9,
  GUIDES_INDEX: 0.9,
  GUIDE_PAGE: 0.85,
  DEEP_EMOJI: 0.85,
  DEEP_COMBO: 0.85,
  STANDARD_EMOJI: 0.75,
  STANDARD_COMBO: 0.75,
  HUB_PAGE: 0.7,
  TRUST_PAGE: 0.6,
  CATEGORY_PAGE: 0.6,
  COMPARE_PAGE: 0.6,
  TOOLS_PAGE: 0.7,
} as const;

/**
 * Static pages that should always appear in the sitemap. Order is
 * preserved in the emitted sitemap — keep trust pages first. The
 * `/guides` index is *not* listed here because `buildGuideSitemapEntries`
 * owns both the index and the per-guide entries.
 */
export const SITEMAP_STATIC_PATHS = [
  '/',
  '/interpreter',
  '/about',
  '/contact',
  '/pricing',
  '/privacy',
  '/terms',
  '/search',
  '/emoji',
  '/combo',
] as const;

/**
 * Per-entry change frequency. Conservative defaults; guides move slower
 * than editorial emoji pages.
 */
export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

/**
 * Build a single `MetadataRoute.Sitemap` entry with a real date. Falls
 * back to `fallback` when `isoDate` is missing or invalid, so we never
 * ship `Invalid Date`.
 */
function buildEntry(
  url: string,
  isoDate: string | undefined,
  options: {
    changeFrequency?: SitemapChangeFrequency;
    priority?: number;
    fallback?: Date;
  } = {}
): MetadataRoute.Sitemap[number] {
  let lastModified: Date = options.fallback ?? new Date();
  if (isoDate) {
    const parsed = new Date(isoDate);
    if (!Number.isNaN(parsed.getTime())) {
      lastModified = parsed;
    }
  }
  const entry: MetadataRoute.Sitemap[number] = { url, lastModified };
  if (options.changeFrequency) entry.changeFrequency = options.changeFrequency;
  if (options.priority !== undefined) entry.priority = options.priority;
  return entry;
}

/**
 * Build the static-page entries that always appear in the sitemap
 * (homepage, trust pages, hubs, search, guides index).
 *
 * `lastModified` for the homepage is intentionally `now` so it shows
 * crawl recency. Trust/legal pages move slowly.
 */
export function buildStaticSitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  return [
    // Homepage — daily crawl hint.
    buildEntry(`${baseUrl}/`, undefined, {
      changeFrequency: 'daily',
      priority: SITEMAP_PRIORITIES.HOMEPAGE,
      fallback: now,
    }),
    // Interpreter — core tool surface, refresh weekly.
    buildEntry(`${baseUrl}/interpreter`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.INTERPRETER,
    }),
    // Trust + hub pages — discoverable but move slowly.
    buildEntry(`${baseUrl}/about`, undefined, {
      changeFrequency: 'monthly',
      priority: SITEMAP_PRIORITIES.TRUST_PAGE,
    }),
    buildEntry(`${baseUrl}/contact`, undefined, {
      changeFrequency: 'monthly',
      priority: SITEMAP_PRIORITIES.TRUST_PAGE,
    }),
    buildEntry(`${baseUrl}/pricing`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.TOOLS_PAGE,
    }),
    buildEntry(`${baseUrl}/privacy`, undefined, {
      changeFrequency: 'yearly',
      priority: SITEMAP_PRIORITIES.TRUST_PAGE,
    }),
    buildEntry(`${baseUrl}/terms`, undefined, {
      changeFrequency: 'yearly',
      priority: SITEMAP_PRIORITIES.TRUST_PAGE,
    }),
    buildEntry(`${baseUrl}/search`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.TOOLS_PAGE,
    }),
    buildEntry(`${baseUrl}/emoji`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.HUB_PAGE,
    }),
    buildEntry(`${baseUrl}/combo`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.HUB_PAGE,
    }),
    // `/guides` is emitted by `buildGuideSitemapEntries` so the index
    // page and per-guide pages share a single source of truth.
  ];
}

/**
 * Build sitemap entries for all *indexable* emoji pages. Excludes:
 * - Skin-tone variants (they canonicalize to the base).
 * - `thin` content (per `resolveContentTier`).
 *
 * `lastModified` prefers `contentUpdatedAt` so the date tracks editorial
 * changes, not build time.
 */
export function buildEmojiSitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const emojis = getAllEmojis();

  return emojis
    .filter((emoji: Emoji) => !emoji.skinToneBase)
    .filter((emoji: Emoji) => resolveContentTier(emoji) !== 'thin')
    .map((emoji: Emoji) => {
      const tier: ContentTier = emoji.contentTier ?? resolveContentTier(emoji);
      const priority =
        tier === 'deep' ? SITEMAP_PRIORITIES.DEEP_EMOJI : SITEMAP_PRIORITIES.STANDARD_EMOJI;
      return buildEntry(`${baseUrl}/emoji/${emoji.slug}`, emoji.contentUpdatedAt, {
        changeFrequency: 'weekly',
        priority,
      });
    });
}

/**
 * Build sitemap entries for combo pages. Excludes `thin` combos.
 * `lastModified` prefers `contentUpdatedAt`.
 */
export function buildComboSitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const combos = getAllCombos();

  return combos
    .filter((combo: EmojiCombo) => combo.contentTier !== 'thin')
    .map((combo: EmojiCombo) => {
      const tier = combo.contentTier ?? 'standard';
      const priority =
        tier === 'deep' ? SITEMAP_PRIORITIES.DEEP_COMBO : SITEMAP_PRIORITIES.STANDARD_COMBO;
      return buildEntry(`${baseUrl}/combo/${combo.slug}`, combo.contentUpdatedAt, {
        changeFrequency: 'weekly',
        priority,
      });
    });
}

/**
 * Build sitemap entries for emoji category hubs.
 */
export function buildCategorySitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const categories = getAllCategories();

  return categories.map((category: string) =>
    buildEntry(`${baseUrl}/emoji/category/${category}`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.CATEGORY_PAGE,
    })
  );
}

/**
 * Build sitemap entries for combo category hubs.
 */
export function buildComboCategorySitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const categories = getAllComboCategories();

  return categories.map((category: string) =>
    buildEntry(`${baseUrl}/combo/category/${category}`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.CATEGORY_PAGE,
    })
  );
}

/**
 * Build sitemap entries for platform, generation, and context hubs.
 */
export function buildFacetSitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const platform of getAllPlatforms()) {
    entries.push(
      buildEntry(`${baseUrl}/emoji/platform/${platform}`, undefined, {
        changeFrequency: 'weekly',
        priority: SITEMAP_PRIORITIES.HUB_PAGE,
      })
    );
  }

  for (const generation of getAllGenerations()) {
    entries.push(
      buildEntry(`${baseUrl}/emoji/generation/${generation}`, undefined, {
        changeFrequency: 'weekly',
        priority: SITEMAP_PRIORITIES.HUB_PAGE,
      })
    );
  }

  for (const context of getPageableContextTypes()) {
    entries.push(
      buildEntry(`${baseUrl}/emoji/context/${context}`, undefined, {
        changeFrequency: 'weekly',
        priority: SITEMAP_PRIORITIES.HUB_PAGE,
      })
    );
  }

  return entries;
}

/**
 * Build sitemap entries for comparison pages in canonical order only.
 * Comparison slugs are stored as `${emoji1Slug}-${emoji2Slug}`; we
 * always emit the canonical pair to avoid duplicate entries.
 */
export function buildCompareSitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const comparisons = getAllComparisons();

  return comparisons.map((comparison) =>
    buildEntry(`${baseUrl}/compare/${comparison.emoji1Slug}/${comparison.emoji2Slug}`, undefined, {
      changeFrequency: 'monthly',
      priority: SITEMAP_PRIORITIES.COMPARE_PAGE,
    })
  );
}

/**
 * Build sitemap entries for published guides. `lastModified` uses the
 * guide's `updatedAt || publishedAt` so the date reflects editorial
 * activity.
 */
export function buildGuideSitemapEntries(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const summaries = getPublishedGuideSummaries();

  return [
    buildEntry(`${baseUrl}/guides`, undefined, {
      changeFrequency: 'weekly',
      priority: SITEMAP_PRIORITIES.GUIDES_INDEX,
    }),
    ...summaries.map((guide) =>
      buildEntry(`${baseUrl}/guides/${guide.slug}`, guide.updatedAt || guide.publishedAt, {
        changeFrequency: 'monthly',
        priority: SITEMAP_PRIORITIES.GUIDE_PAGE,
      })
    ),
  ];
}

/**
 * Build the full sitemap by composing all the per-surface builders.
 * Order is stable so the generated XML is deterministic across builds.
 */
export function buildSitemap(): MetadataRoute.Sitemap {
  return [
    ...buildStaticSitemapEntries(),
    ...buildEmojiSitemapEntries(),
    ...buildComboSitemapEntries(),
    ...buildCategorySitemapEntries(),
    ...buildComboCategorySitemapEntries(),
    ...buildFacetSitemapEntries(),
    ...buildCompareSitemapEntries(),
    ...buildGuideSitemapEntries(),
  ];
}
