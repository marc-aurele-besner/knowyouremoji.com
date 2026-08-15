import { describe, it, expect, beforeEach, spyOn, afterEach } from 'bun:test';
import * as emojiData from '../../../src/lib/emoji-data';
import * as comboData from '../../../src/lib/combo-data';
import * as guideData from '../../../src/lib/guide-data';
import * as comparisonData from '../../../src/lib/comparison-data';
import type { Emoji } from '../../../src/types/emoji';
import type { EmojiCombo, EmojiComboCategoryName } from '../../../src/types/combo';
import type { EmojiComparison } from '../../../src/types/comparison';

// Mock data
const mockEmojis: Emoji[] = [
  {
    unicode: '1F480',
    slug: 'skull',
    character: '💀',
    name: 'Skull',
    shortName: 'skull',
    category: 'faces',
    subcategory: 'face-negative',
    unicodeVersion: '6.0',
    baseMeaning: 'A human skull',
    tldr: "Usually means 'that's so funny I'm dead'",
    contextMeanings: [
      {
        context: 'SLANG',
        meaning: 'Used to react to something very funny',
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
    unicode: '1F602',
    slug: 'face-with-tears-of-joy',
    character: '😂',
    name: 'Face with Tears of Joy',
    shortName: 'joy',
    category: 'faces',
    subcategory: 'face-smiling',
    unicodeVersion: '6.0',
    baseMeaning: 'A laughing face',
    tldr: 'Means something is funny',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: 'Joy Emoji Meaning',
    seoDescription: 'Learn what joy emoji means',
  },
  // Skin-tone variant — should be excluded from sitemap.
  {
    unicode: '1F44B-1F3FD',
    slug: 'wave-medium',
    character: '👋🏽',
    name: 'Waving Hand Medium Skin Tone',
    shortName: 'wave-medium',
    category: 'people',
    unicodeVersion: '14.0',
    baseMeaning: 'A waving hand with medium skin tone',
    tldr: 'Wave with medium skin tone',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: 'Wave Medium Skin Tone Emoji',
    seoDescription: 'Learn what the medium-skin-tone wave emoji means',
    skinToneBase: 'wave',
  },
  // Stub emoji — should be excluded (no contentTier override → resolveContentTier = thin).
  {
    unicode: '1F000',
    slug: 'stub-emoji',
    character: '�',
    name: 'Stub',
    shortName: 'stub',
    category: 'symbols',
    unicodeVersion: '1.0',
    baseMeaning: 'Stub',
    tldr: 'Stub',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: 'Stub',
    seoDescription: 'Stub',
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
    emojis: ['skull', 'face-with-tears-of-joy'],
    examples: ['That thread 💀😂', 'Dead 💀😂'],
    tags: ['funny', 'laughing'],
    seoTitle: '💀😂 Skull Laughing Combo Meaning',
    seoDescription: 'What does 💀😂 mean?',
    contentUpdatedAt: '2026-08-02T00:00:00.000Z',
  },
  {
    slug: 'thin-combo',
    combo: '🙂🙂',
    name: 'Thin Combo',
    meaning: 'A thin combo',
    description: 'Description',
    category: 'other',
    emojis: ['slightly-smiling-face'],
    examples: ['Hi 🙂🙂'],
    tags: [],
    seoTitle: 'Thin Combo Meaning',
    seoDescription: 'Thin combo description',
    contentTier: 'thin',
  },
];

const mockCategories = ['faces', 'people'];

const mockComboCategories = ['humor', 'other'];

const mockGuideSummaries = [
  {
    slug: 'what-does-skull-mean-in-texting',
    title: 'What does 💀 mean in texting in 2026?',
    description: 'A complete guide to the skull emoji.',
    heroEmoji: '💀',
    tags: ['gen-z', 'slang'],
    publishedAt: '2026-08-12T00:00:00.000Z',
    updatedAt: '2026-08-12T00:00:00.000Z',
    readingTimeMinutes: 7,
    author: 'KnowYourEmoji Editorial',
    relatedEmojis: ['skull'],
    relatedCombos: ['skull-laughing'],
    seoTitle: 'What does 💀 mean in texting?',
    seoDescription: 'The skull emoji decoded for 2026.',
  },
];

const mockComparisons: EmojiComparison[] = [
  {
    slug: 'skull-vs-face-with-tears-of-joy',
    emoji1Slug: 'skull',
    emoji2Slug: 'face-with-tears-of-joy',
    seoTitle: 'Skull vs Joy',
    seoDescription: 'Comparison',
    comparisonPoints: [],
  },
];

describe('sitemap', () => {
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
    // Clear caches before each test
    emojiData.clearEmojiCache();
    comboData.clearComboCache();
    guideData.clearGuideCache();
    comparisonData.clearComparisonCache();

    // Set up spies with mock data
    getAllEmojisSpy = spyOn(emojiData, 'getAllEmojis').mockReturnValue(mockEmojis);
    getAllCategoriesSpy = spyOn(emojiData, 'getAllCategories').mockReturnValue(mockCategories);
    getAllPlatformsSpy = spyOn(emojiData, 'getAllPlatforms').mockReturnValue([
      'IMESSAGE',
      'INSTAGRAM',
    ] as never);
    getAllGenerationsSpy = spyOn(emojiData, 'getAllGenerations').mockReturnValue([
      'GEN_Z',
      'MILLENNIAL',
    ] as never);
    getPageableContextTypesSpy = spyOn(emojiData, 'getPageableContextTypes').mockReturnValue([
      'SLANG',
      'DATING',
    ] as never);
    getAllCombosSpy = spyOn(comboData, 'getAllCombos').mockReturnValue(mockCombos);
    getAllComboCategoriesSpy = spyOn(comboData, 'getAllComboCategories').mockReturnValue(
      mockComboCategories as EmojiComboCategoryName[]
    );
    getPublishedGuideSummariesSpy = spyOn(guideData, 'getPublishedGuideSummaries').mockReturnValue(
      mockGuideSummaries
    );
    getAllComparisonsSpy = spyOn(comparisonData, 'getAllComparisons').mockReturnValue(
      mockComparisons
    );
  });

  afterEach(() => {
    // Restore all spies
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

  describe('sitemap function', () => {
    it('should return an array of sitemap entries', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include static pages with correct priorities', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const homepage = result.find((entry) => entry.url.endsWith('/'));
      expect(homepage).toBeDefined();
      expect(homepage?.priority).toBe(1.0);
      expect(homepage?.changeFrequency).toBe('daily');

      const interpreter = result.find((entry) => entry.url.endsWith('/interpreter'));
      expect(interpreter).toBeDefined();
      expect(interpreter?.priority).toBe(0.9);
      expect(interpreter?.changeFrequency).toBe('weekly');
    });

    it('should include about/contact/pricing/privacy/terms/search/emoji/combo hubs', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      for (const path of [
        '/about',
        '/contact',
        '/pricing',
        '/privacy',
        '/terms',
        '/search',
        '/emoji',
        '/combo',
      ]) {
        const entry = result.find((e) => e.url.endsWith(path));
        expect(entry).toBeDefined();
      }
    });

    it('should include emoji pages for indexable emojis', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const skullPage = result.find((entry) => entry.url.includes('/emoji/skull'));
      expect(skullPage).toBeDefined();
      expect(skullPage?.priority).toBeGreaterThanOrEqual(0.7);
      expect(skullPage?.changeFrequency).toBe('weekly');
    });

    it('should exclude skin-tone variant emoji URLs', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const skinTonePage = result.find((entry) => entry.url.includes('/emoji/wave-medium'));
      expect(skinTonePage).toBeUndefined();
    });

    it('should exclude stub/thin emoji URLs without explicit contentTier', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const stubPage = result.find((entry) => entry.url.includes('/emoji/stub-emoji'));
      expect(stubPage).toBeUndefined();
    });

    it('should include combo pages for indexable combos', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const comboPage = result.find((entry) => entry.url.includes('/combo/skull-laughing'));
      expect(comboPage).toBeDefined();
      expect(comboPage?.priority).toBeGreaterThanOrEqual(0.7);
    });

    it('should exclude thin-tier combo URLs', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const thinPage = result.find((entry) => entry.url.includes('/combo/thin-combo'));
      expect(thinPage).toBeUndefined();
    });

    it('should include category pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const facesCategory = result.find((entry) => entry.url.includes('/emoji/category/faces'));
      expect(facesCategory).toBeDefined();
      expect(facesCategory?.priority).toBeLessThanOrEqual(0.7);

      const peopleCategory = result.find((entry) => entry.url.includes('/emoji/category/people'));
      expect(peopleCategory).toBeDefined();
    });

    it('should include combo category pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const humorCategory = result.find((entry) => entry.url.includes('/combo/category/humor'));
      expect(humorCategory).toBeDefined();
    });

    it('should include facet hubs (platform, generation, context)', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      expect(result.find((e) => e.url.endsWith('/emoji/platform/IMESSAGE'))).toBeDefined();
      expect(result.find((e) => e.url.endsWith('/emoji/platform/INSTAGRAM'))).toBeDefined();
      expect(result.find((e) => e.url.endsWith('/emoji/generation/GEN_Z'))).toBeDefined();
      expect(result.find((e) => e.url.endsWith('/emoji/context/SLANG'))).toBeDefined();
    });

    it('should include compare pages in canonical order', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const compare = result.find((entry) =>
        entry.url.endsWith('/compare/skull/face-with-tears-of-joy')
      );
      expect(compare).toBeDefined();
    });

    it('should have lastModified dates on all entries', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.lastModified).toBeDefined();
        expect(entry.lastModified instanceof Date).toBe(true);
      });
    });

    it('should use correct base URL', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.url).toMatch(/^https?:\/\//);
      });
    });

    it('should not have duplicate URLs', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const urls = result.map((entry) => entry.url);
      const uniqueUrls = [...new Set(urls)];
      expect(urls.length).toBe(uniqueUrls.length);
    });

    it('should include the guides index page', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const guidesIndex = result.find((entry) => entry.url.endsWith('/guides'));
      expect(guidesIndex).toBeDefined();
      expect(guidesIndex?.priority).toBe(0.9);
      expect(guidesIndex?.changeFrequency).toBe('weekly');
    });

    it('should include individual guide pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const guidePage = result.find((entry) =>
        entry.url.includes('/guides/what-does-skull-mean-in-texting')
      );
      expect(guidePage).toBeDefined();
      expect(guidePage?.priority).toBe(0.85);
      expect(guidePage?.changeFrequency).toBe('monthly');
      expect(guidePage?.lastModified instanceof Date).toBe(true);
    });

    it('should not include private surfaces (api/dashboard/admin/auth)', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const urls = result.map((entry) => entry.url);
      expect(urls.some((url) => url.includes('/api/'))).toBe(false);
      expect(urls.some((url) => url.includes('/dashboard'))).toBe(false);
      expect(urls.some((url) => url.includes('/admin'))).toBe(false);
      expect(urls.some((url) => url.includes('/login'))).toBe(false);
    });
  });
});
