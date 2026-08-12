import { describe, it, expect, beforeEach, spyOn, afterEach } from 'bun:test';
import * as emojiData from '../../../src/lib/emoji-data';
import * as comboData from '../../../src/lib/combo-data';
import * as guideData from '../../../src/lib/guide-data';

// Mock data
const mockEmojis = [
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
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: 'Skull Emoji Meaning',
    seoDescription: 'Learn what skull emoji means',
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
];

const mockCombos = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Skull Laughing',
    meaning: 'Something very funny',
    description: 'Used when something is extremely funny',
    category: 'reactions' as const,
    emojis: ['skull', 'face-with-tears-of-joy'],
    tags: ['funny', 'laughing'],
  },
];

const mockCategories = ['faces', 'people'];

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

describe('sitemap', () => {
  let getAllEmojiSlugsSpy: ReturnType<typeof spyOn>;
  let getAllComboSlugsSpy: ReturnType<typeof spyOn>;
  let getAllCategoriesSpy: ReturnType<typeof spyOn>;
  let getPublishedGuideSummariesSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Clear caches before each test
    emojiData.clearEmojiCache();
    comboData.clearComboCache();
    guideData.clearGuideCache();

    // Set up spies with mock data
    getAllEmojiSlugsSpy = spyOn(emojiData, 'getAllEmojiSlugs').mockReturnValue(
      mockEmojis.map((e) => e.slug)
    );
    getAllComboSlugsSpy = spyOn(comboData, 'getAllComboSlugs').mockReturnValue(
      mockCombos.map((c) => c.slug)
    );
    getAllCategoriesSpy = spyOn(emojiData, 'getAllCategories').mockReturnValue(mockCategories);
    getPublishedGuideSummariesSpy = spyOn(guideData, 'getPublishedGuideSummaries').mockReturnValue(
      mockGuideSummaries
    );
  });

  afterEach(() => {
    // Restore all spies
    getAllEmojiSlugsSpy.mockRestore();
    getAllComboSlugsSpy.mockRestore();
    getAllCategoriesSpy.mockRestore();
    getPublishedGuideSummariesSpy.mockRestore();
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

      // Check homepage
      const homepage = result.find((entry) => entry.url.endsWith('/'));
      expect(homepage).toBeDefined();
      expect(homepage?.priority).toBe(1.0);
      expect(homepage?.changeFrequency).toBe('daily');

      // Check interpreter page
      const interpreter = result.find((entry) => entry.url.endsWith('/interpreter'));
      expect(interpreter).toBeDefined();
      expect(interpreter?.priority).toBe(0.9);
      expect(interpreter?.changeFrequency).toBe('weekly');
    });

    it('should include emoji pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      // Check emoji pages
      const skullPage = result.find((entry) => entry.url.includes('/emoji/skull'));
      expect(skullPage).toBeDefined();
      expect(skullPage?.priority).toBe(0.8);
      expect(skullPage?.changeFrequency).toBe('weekly');

      const joyPage = result.find((entry) => entry.url.includes('/emoji/face-with-tears-of-joy'));
      expect(joyPage).toBeDefined();
    });

    it('should include combo pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      // Check combo pages
      const comboPage = result.find((entry) => entry.url.includes('/combo/skull-laughing'));
      expect(comboPage).toBeDefined();
      expect(comboPage?.priority).toBe(0.7);
      expect(comboPage?.changeFrequency).toBe('weekly');
    });

    it('should include category pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      // Check category pages
      const facesCategory = result.find((entry) => entry.url.includes('/emoji/category/faces'));
      expect(facesCategory).toBeDefined();
      expect(facesCategory?.priority).toBe(0.7);
      expect(facesCategory?.changeFrequency).toBe('weekly');

      const peopleCategory = result.find((entry) => entry.url.includes('/emoji/category/people'));
      expect(peopleCategory).toBeDefined();
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

      // All URLs should start with the configured base URL
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
      expect(guidesIndex?.priority).toBe(0.8);
      expect(guidesIndex?.changeFrequency).toBe('weekly');
    });

    it('should include individual guide pages', async () => {
      const { default: sitemap } = await import('../../../src/app/sitemap');
      const result = await sitemap();

      const guidePage = result.find((entry) =>
        entry.url.includes('/guides/what-does-skull-mean-in-texting')
      );
      expect(guidePage).toBeDefined();
      expect(guidePage?.priority).toBe(0.8);
      expect(guidePage?.changeFrequency).toBe('monthly');
      expect(guidePage?.lastModified instanceof Date).toBe(true);
    });
  });
});
