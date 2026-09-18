import { describe, expect, test, beforeEach, afterEach, spyOn } from 'bun:test';
import * as emojiData from '../../../src/lib/emoji-data';
import * as comboData from '../../../src/lib/combo-data';
import * as guideData from '../../../src/lib/guide-data';
import * as comparisonData from '../../../src/lib/comparison-data';
import type { Emoji } from '../../../src/types/emoji';
import type { EmojiCombo } from '../../../src/types/combo';
import type { EmojiComparison } from '../../../src/types/comparison';

const mockEmojis: Emoji[] = [
  {
    unicode: '1F480',
    slug: 'skull',
    character: '�',
    name: 'Skull',
    shortName: 'skull',
    category: 'faces',
    unicodeVersion: '6.0',
    baseMeaning: 'A human skull',
    tldr: 'Dying of laughter',
    contextMeanings: [
      {
        context: 'SLANG',
        meaning: 'React to something very funny',
        example: 'That joke 💀',
        riskLevel: 'LOW',
      },
    ],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: 'Skull Emoji Meaning',
    seoDescription: 'Learn what skull emoji means',
    contentUpdatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    unicode: '1F44B-1F3FD',
    slug: 'wave-medium',
    character: '👋🏽',
    name: 'Wave Medium',
    shortName: 'wave-medium',
    category: 'people',
    unicodeVersion: '14.0',
    baseMeaning: 'A waving hand',
    tldr: 'Wave with medium skin tone',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: 'Wave Medium Skin Tone',
    seoDescription: 'Wave medium',
    skinToneBase: 'wave',
  },
];

const mockCombos: EmojiCombo[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Skull Laughing',
    meaning: 'Something very funny',
    description: 'Used when something is extremely funny',
    category: 'humor',
    emojis: ['skull'],
    examples: ['That thread 💀😂'],
    tags: ['funny'],
    seoTitle: 'Skull Laughing Combo',
    seoDescription: 'Skull laughing combo meaning',
    contentUpdatedAt: '2026-08-02T00:00:00.000Z',
    contentTier: 'standard',
  },
  {
    slug: 'thin-combo',
    combo: '🙂🙂',
    name: 'Thin',
    meaning: 'A thin combo',
    description: 'Description',
    category: 'other',
    emojis: ['slightly-smiling-face'],
    examples: ['Hi 🙂🙂'],
    tags: [],
    seoTitle: 'Thin Combo',
    seoDescription: 'Thin combo',
    contentTier: 'thin',
  },
];

const mockComparisons: EmojiComparison[] = [
  {
    slug: 'skull-vs-joy',
    emoji1Slug: 'skull',
    emoji2Slug: 'joy',
    seoTitle: 'Skull vs Joy',
    seoDescription: 'Compare',
    comparisonPoints: [],
  },
];

describe('sitemap-entries', () => {
  let getAllEmojisSpy: ReturnType<typeof spyOn>;
  let getAllCategoriesSpy: ReturnType<typeof spyOn>;
  let getAllPlatformsSpy: ReturnType<typeof spyOn>;
  let getAllGenerationsSpy: ReturnType<typeof spyOn>;
  let getPageableContextTypesSpy: ReturnType<typeof spyOn>;
  let getAllCombosSpy: ReturnType<typeof spyOn>;
  let getAllComboCategoriesSpy: ReturnType<typeof spyOn>;
  let getPublishedGuideSummariesSpy: ReturnType<typeof spyOn>;
  let getAllComparisonsSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    emojiData.clearEmojiCache();
    comboData.clearComboCache();
    guideData.clearGuideCache();
    comparisonData.clearComparisonCache();

    getAllEmojisSpy = spyOn(emojiData, 'getAllEmojis').mockReturnValue(mockEmojis);
    getAllCategoriesSpy = spyOn(emojiData, 'getAllCategories').mockReturnValue(['faces', 'people']);
    getAllPlatformsSpy = spyOn(emojiData, 'getAllPlatforms').mockReturnValue(['IMESSAGE'] as never);
    getAllGenerationsSpy = spyOn(emojiData, 'getAllGenerations').mockReturnValue([
      'GEN_Z',
    ] as never);
    getPageableContextTypesSpy = spyOn(emojiData, 'getPageableContextTypes').mockReturnValue([
      'SLANG',
    ] as never);
    getAllCombosSpy = spyOn(comboData, 'getAllCombos').mockReturnValue(mockCombos);
    getAllComboCategoriesSpy = spyOn(comboData, 'getAllComboCategories').mockReturnValue([
      'humor',
      'other',
    ]);
    getPublishedGuideSummariesSpy = spyOn(guideData, 'getPublishedGuideSummaries').mockReturnValue(
      []
    );
    getAllComparisonsSpy = spyOn(comparisonData, 'getAllComparisons').mockReturnValue(
      mockComparisons
    );
  });

  afterEach(() => {
    getAllEmojisSpy.mockRestore();
    getAllCategoriesSpy.mockRestore();
    getAllPlatformsSpy.mockRestore();
    getAllGenerationsSpy.mockRestore();
    getPageableContextTypesSpy.mockRestore();
    getAllCombosSpy.mockRestore();
    getAllComboCategoriesSpy.mockRestore();
    getPublishedGuideSummariesSpy.mockRestore();
    getAllComparisonsSpy.mockRestore();
  });

  describe('buildStaticSitemapEntries', () => {
    test('emits the trust and hub static paths', async () => {
      const { buildStaticSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildStaticSitemapEntries();
      const urls = entries.map((entry) => entry.url);

      for (const path of [
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
      ]) {
        expect(urls.some((url) => url.endsWith(path))).toBe(true);
      }

      // /guides is owned by buildGuideSitemapEntries, not the static builder.
      expect(urls.some((url) => url.endsWith('/guides'))).toBe(false);
    });

    test('homepage is priority 1.0 with daily changeFrequency', async () => {
      const { buildStaticSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildStaticSitemapEntries();
      const home = entries.find((entry) => entry.url.endsWith('/'));
      expect(home?.priority).toBe(1.0);
      expect(home?.changeFrequency).toBe('daily');
    });
  });

  describe('buildEmojiSitemapEntries', () => {
    test.each([undefined, 'not-a-date'])('omits unknown or invalid dates (%s)', async (date) => {
      getAllEmojisSpy.mockReturnValue([{ ...mockEmojis[0], contentUpdatedAt: date }]);
      const { buildEmojiSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildEmojiSitemapEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0]).not.toHaveProperty('lastModified');
    });

    test('excludes skin-tone variant emojis', async () => {
      const { buildEmojiSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildEmojiSitemapEntries();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.includes('/emoji/wave-medium'))).toBe(false);
    });

    test('uses contentUpdatedAt for lastModified when present', async () => {
      const { buildEmojiSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildEmojiSitemapEntries();
      const skull = entries.find((entry) => entry.url.endsWith('/emoji/skull'));
      expect(skull?.lastModified).toBeInstanceOf(Date);
      expect((skull?.lastModified as Date).toISOString()).toBe('2026-08-01T00:00:00.000Z');
    });

    test('gives deep emoji a higher priority than standard', async () => {
      const { buildEmojiSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildEmojiSitemapEntries();
      const skull = entries.find((entry) => entry.url.endsWith('/emoji/skull'));
      // skull has contextMeanings, so it falls back to standard (no explicit tier)
      expect(skull?.priority).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('buildComboSitemapEntries', () => {
    test('matches page indexing for inferred tiers and editorial overrides', async () => {
      const { getComboIndexingDecision } = await import('../../../src/lib/seo-policy');
      const { buildComboSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const base = { ...mockCombos[0], contentTier: undefined };
      const combos: EmojiCombo[] = [
        { ...base, slug: 'unclassified-stub' },
        { ...base, slug: 'empty-long-form', longForm: {} },
        { ...base, slug: 'inferred-deep', longForm: { overview: 'Original editorial overview.' } },
        {
          ...base,
          slug: 'inferred-standard',
          conversationExamples: [
            {
              setting: 'friends',
              message: 'That joke 💀😂',
              interpretation: 'Laughing with friends.',
            },
          ],
        },
        { ...base, slug: 'explicit-standard', contentTier: 'standard' },
        { ...base, slug: 'explicit-deep', contentTier: 'deep' },
        {
          ...base,
          slug: 'explicit-thin',
          contentTier: 'thin',
          longForm: { overview: 'Draft content.' },
        },
      ];
      getAllCombosSpy.mockReturnValue(combos);
      const entries = buildComboSitemapEntries();
      expect(entries).toHaveLength(4);
      for (const combo of combos) {
        const entry = entries.find(({ url }) => url.endsWith(`/combo/${combo.slug}`));
        expect(Boolean(entry)).toBe(getComboIndexingDecision(combo, `/combo/${combo.slug}`).index);
      }
      expect(entries.find(({ url }) => url.endsWith('/inferred-deep'))?.priority).toBe(0.85);
      expect(entries.find(({ url }) => url.endsWith('/inferred-standard'))?.priority).toBe(0.75);
    });

    test('excludes thin-tier combos', async () => {
      const { buildComboSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildComboSitemapEntries();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.includes('/combo/thin-combo'))).toBe(false);
    });

    test('uses contentUpdatedAt for lastModified', async () => {
      const { buildComboSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildComboSitemapEntries();
      const skull = entries.find((entry) => entry.url.endsWith('/combo/skull-laughing'));
      expect(skull?.lastModified).toBeInstanceOf(Date);
      expect((skull?.lastModified as Date).toISOString()).toBe('2026-08-02T00:00:00.000Z');
    });
  });

  describe('buildCategorySitemapEntries', () => {
    test('excludes unsupported category labels whose routes return 404', async () => {
      getAllCategoriesSpy.mockReturnValue(['faces', 'People & Body', 'smileys-emotion']);
      const { buildCategorySitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildCategorySitemapEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].url).toEndWith('/emoji/category/faces');
    });

    test('emits one entry per emoji category', async () => {
      const { buildCategorySitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildCategorySitemapEntries();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.endsWith('/emoji/category/faces'))).toBe(true);
      expect(urls.some((url) => url.endsWith('/emoji/category/people'))).toBe(true);
    });
  });

  describe('buildComboCategorySitemapEntries', () => {
    test('excludes unsupported combo categories whose routes return 404', async () => {
      getAllComboCategoriesSpy.mockReturnValue(['humor', 'unsupported']);
      const { buildComboCategorySitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildComboCategorySitemapEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].url).toEndWith('/combo/category/humor');
    });

    test('emits one entry per combo category', async () => {
      const { buildComboCategorySitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildComboCategorySitemapEntries();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.endsWith('/combo/category/humor'))).toBe(true);
    });
  });

  describe('buildFacetSitemapEntries', () => {
    test('emits platform, generation, and context hubs', async () => {
      const { buildFacetSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildFacetSitemapEntries();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.endsWith('/emoji/platform/IMESSAGE'))).toBe(true);
      expect(urls.some((url) => url.endsWith('/emoji/generation/GEN_Z'))).toBe(true);
      expect(urls.some((url) => url.endsWith('/emoji/context/SLANG'))).toBe(true);
    });
  });

  describe('buildCompareSitemapEntries', () => {
    test('emits compare pages in canonical order only', async () => {
      const { buildCompareSitemapEntries } = await import('../../../src/lib/sitemap-entries');
      const entries = buildCompareSitemapEntries();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.endsWith('/compare/skull/joy'))).toBe(true);
    });
  });

  describe('buildSitemap', () => {
    test('has no duplicate URLs', async () => {
      const { buildSitemap } = await import('../../../src/lib/sitemap-entries');
      const entries = buildSitemap();
      const urls = entries.map((entry) => entry.url);
      const uniqueUrls = [...new Set(urls)];
      expect(urls.length).toBe(uniqueUrls.length);
    });

    test('does not include any thin/skin-tone URLs', async () => {
      const { buildSitemap } = await import('../../../src/lib/sitemap-entries');
      const entries = buildSitemap();
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.includes('/emoji/wave-medium'))).toBe(false);
      expect(urls.some((url) => url.includes('/combo/thin-combo'))).toBe(false);
    });
  });
});
