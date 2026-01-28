import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import type { Emoji } from '../../../src/types/emoji';
import { clearEmojiCache } from '../../../src/lib/emoji-data';
import fs from 'fs';

// Clear cache before each test to ensure clean state
beforeEach(() => {
  clearEmojiCache();
});

// Mock emoji data for type validation tests
const mockSkullEmoji: Emoji = {
  unicode: '1F480',
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  shortName: 'skull',
  category: 'faces',
  subcategory: 'face-negative',
  unicodeVersion: '6.0',
  baseMeaning: 'A human skull, often used to represent death or danger.',
  tldr: "Usually means 'that's so funny I'm dead' or ironic disbelief, not death.",
  contextMeanings: [
    {
      context: 'SLANG',
      meaning: "Something is extremely funny - 'I'm dead' from laughing.",
      example: 'That meme 💀💀💀',
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [
    {
      platform: 'TIKTOK',
      note: 'Very common in comments to indicate something is hilarious.',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: "Almost exclusively means 'I'm dead (from laughing)'.",
    },
  ],
  warnings: [
    {
      title: 'Context matters',
      description: 'Can be misinterpreted as morbid by older generations.',
      severity: 'LOW',
    },
  ],
  relatedCombos: ['skull-laughing'],
  seoTitle: '💀 Skull Emoji Meaning - What Does 💀 Really Mean?',
  seoDescription:
    "Learn what the skull emoji 💀 really means in modern texting. Usually means 'I'm dead' from laughing, not actual death.",
};

describe('emoji-data', () => {
  describe('getAllEmojis', () => {
    it('should return an array of emojis', async () => {
      const { getAllEmojis } = await import('../../../src/lib/emoji-data');
      const emojis = getAllEmojis();
      expect(Array.isArray(emojis)).toBe(true);
    });

    it('should return emojis with required properties', async () => {
      const { getAllEmojis } = await import('../../../src/lib/emoji-data');
      const emojis = getAllEmojis();

      if (emojis.length > 0) {
        const emoji = emojis[0];
        expect(emoji).toHaveProperty('unicode');
        expect(emoji).toHaveProperty('slug');
        expect(emoji).toHaveProperty('character');
        expect(emoji).toHaveProperty('name');
        expect(emoji).toHaveProperty('category');
        expect(emoji).toHaveProperty('baseMeaning');
        expect(emoji).toHaveProperty('tldr');
        expect(emoji).toHaveProperty('contextMeanings');
      }
    });
  });

  describe('getEmojiBySlug', () => {
    it('should return emoji when slug exists', async () => {
      const { getEmojiBySlug } = await import('../../../src/lib/emoji-data');
      const skull = getEmojiBySlug('skull');
      expect(skull).toBeDefined();
      expect(skull?.character).toBe('💀');
      expect(skull?.slug).toBe('skull');
    });

    it('should return undefined for non-existent slug', async () => {
      const { getEmojiBySlug } = await import('../../../src/lib/emoji-data');
      const emoji = getEmojiBySlug('non-existent-emoji');
      expect(emoji).toBeUndefined();
    });
  });

  describe('getEmojisByCategory', () => {
    it('should return emojis filtered by category', async () => {
      const { getEmojisByCategory } = await import('../../../src/lib/emoji-data');
      const facesEmojis = getEmojisByCategory('faces');
      expect(Array.isArray(facesEmojis)).toBe(true);

      // All returned emojis should have the same category
      facesEmojis.forEach((emoji) => {
        expect(emoji.category).toBe('faces');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const { getEmojisByCategory } = await import('../../../src/lib/emoji-data');
      const emojis = getEmojisByCategory('non-existent-category');
      expect(emojis).toEqual([]);
    });
  });

  describe('getAllCategories', () => {
    it('should return unique categories', async () => {
      const { getAllCategories } = await import('../../../src/lib/emoji-data');
      const categories = getAllCategories();
      expect(Array.isArray(categories)).toBe(true);

      // Check for uniqueness
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });
  });

  describe('searchEmojis', () => {
    it('should find emojis by name', async () => {
      const { searchEmojis } = await import('../../../src/lib/emoji-data');
      const results = searchEmojis('skull');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((e) => e.slug === 'skull')).toBe(true);
    });

    it('should find emojis by character', async () => {
      const { searchEmojis } = await import('../../../src/lib/emoji-data');
      const results = searchEmojis('💀');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((e) => e.character === '💀')).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const { searchEmojis } = await import('../../../src/lib/emoji-data');
      const resultsLower = searchEmojis('skull');
      const resultsUpper = searchEmojis('SKULL');
      expect(resultsLower.length).toBe(resultsUpper.length);
    });

    it('should return empty array for no matches', async () => {
      const { searchEmojis } = await import('../../../src/lib/emoji-data');
      const results = searchEmojis('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getEmojiCount', () => {
    it('should return the total number of emojis', async () => {
      const { getEmojiCount, getAllEmojis } = await import('../../../src/lib/emoji-data');
      const count = getEmojiCount();
      const emojis = getAllEmojis();
      expect(count).toBe(emojis.length);
    });
  });

  describe('getEmojiSummaries', () => {
    it('should return emoji summaries with required properties', async () => {
      const { getEmojiSummaries } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummaries();
      expect(Array.isArray(summaries)).toBe(true);

      if (summaries.length > 0) {
        const summary = summaries[0];
        expect(summary).toHaveProperty('slug');
        expect(summary).toHaveProperty('character');
        expect(summary).toHaveProperty('name');
        expect(summary).toHaveProperty('category');
        expect(summary).toHaveProperty('tldr');
      }
    });

    it('should return correct data for skull emoji', async () => {
      const { getEmojiSummaries } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummaries();
      const skullSummary = summaries.find((s) => s.slug === 'skull');
      expect(skullSummary).toBeDefined();
      expect(skullSummary?.character).toBe('💀');
      expect(skullSummary?.name).toBe('Skull');
    });
  });

  describe('getAllEmojiSlugs', () => {
    it('should return an array of slugs', async () => {
      const { getAllEmojiSlugs } = await import('../../../src/lib/emoji-data');
      const slugs = getAllEmojiSlugs();
      expect(Array.isArray(slugs)).toBe(true);
    });

    it('should include skull slug', async () => {
      const { getAllEmojiSlugs } = await import('../../../src/lib/emoji-data');
      const slugs = getAllEmojiSlugs();
      expect(slugs).toContain('skull');
    });

    it('should return same count as getAllEmojis', async () => {
      const { getAllEmojiSlugs, getAllEmojis } = await import('../../../src/lib/emoji-data');
      const slugs = getAllEmojiSlugs();
      const emojis = getAllEmojis();
      expect(slugs.length).toBe(emojis.length);
    });
  });

  describe('clearEmojiCache', () => {
    it('should clear the cache and allow reload', async () => {
      const { clearEmojiCache, getAllEmojis } = await import('../../../src/lib/emoji-data');

      // First load
      const emojis1 = getAllEmojis();
      expect(emojis1.length).toBeGreaterThan(0);

      // Clear cache
      clearEmojiCache();

      // Second load should work the same
      const emojis2 = getAllEmojis();
      expect(emojis2.length).toBe(emojis1.length);
    });
  });

  describe('missing directory handling', () => {
    it('should return empty array when emoji directory does not exist', async () => {
      const { clearEmojiCache, getAllEmojis } = await import('../../../src/lib/emoji-data');

      // Clear the cache first
      clearEmojiCache();

      // Mock fs.existsSync to return false
      const existsSyncSpy = spyOn(fs, 'existsSync').mockReturnValue(false);

      const emojis = getAllEmojis();
      expect(emojis).toEqual([]);

      // Restore the original function
      existsSyncSpy.mockRestore();

      // Clear cache to reset for other tests
      clearEmojiCache();
    });
  });
});

describe('getRelatedEmojis', () => {
  it('should return emojis from the same category', async () => {
    const { getRelatedEmojis, getEmojiBySlug } = await import('../../../src/lib/emoji-data');
    const skull = getEmojiBySlug('skull');
    if (!skull) throw new Error('Skull emoji not found');

    const related = getRelatedEmojis(skull.slug, 4);
    expect(Array.isArray(related)).toBe(true);

    // All related emojis should be in the same category as skull
    related.forEach((emoji) => {
      expect(emoji.category).toBe('faces');
    });
  });

  it('should not include the current emoji in results', async () => {
    const { getRelatedEmojis } = await import('../../../src/lib/emoji-data');
    const related = getRelatedEmojis('skull', 10);

    // Skull should not be in its own related emojis
    expect(related.some((e) => e.slug === 'skull')).toBe(false);
  });

  it('should limit the number of results', async () => {
    const { getRelatedEmojis } = await import('../../../src/lib/emoji-data');
    const related = getRelatedEmojis('skull', 3);

    expect(related.length).toBeLessThanOrEqual(3);
  });

  it('should return empty array for non-existent emoji', async () => {
    const { getRelatedEmojis } = await import('../../../src/lib/emoji-data');
    const related = getRelatedEmojis('non-existent-emoji', 4);

    expect(related).toEqual([]);
  });

  it('should use default limit of 6 when not specified', async () => {
    const { getRelatedEmojis } = await import('../../../src/lib/emoji-data');
    const related = getRelatedEmojis('skull');

    expect(related.length).toBeLessThanOrEqual(6);
  });

  it('should return EmojiSummary objects', async () => {
    const { getRelatedEmojis } = await import('../../../src/lib/emoji-data');
    const related = getRelatedEmojis('skull', 2);

    if (related.length > 0) {
      const emoji = related[0];
      expect(emoji).toHaveProperty('slug');
      expect(emoji).toHaveProperty('character');
      expect(emoji).toHaveProperty('name');
      expect(emoji).toHaveProperty('category');
      expect(emoji).toHaveProperty('tldr');
      // Should NOT have full emoji properties
      expect(emoji).not.toHaveProperty('unicode');
      expect(emoji).not.toHaveProperty('contextMeanings');
    }
  });
});

describe('emoji types', () => {
  it('should have valid context types', () => {
    const validContexts = [
      'LITERAL',
      'SLANG',
      'IRONIC',
      'PASSIVE_AGGRESSIVE',
      'DATING',
      'WORK',
      'RED_FLAG',
    ];
    expect(mockSkullEmoji.contextMeanings[0].context).toBe('SLANG');
    expect(validContexts).toContain(mockSkullEmoji.contextMeanings[0].context);
  });

  it('should have valid risk levels', () => {
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
    expect(mockSkullEmoji.contextMeanings[0].riskLevel).toBe('LOW');
    expect(validRiskLevels).toContain(mockSkullEmoji.contextMeanings[0].riskLevel);
  });

  it('should have valid platform types', () => {
    const validPlatforms = [
      'IMESSAGE',
      'INSTAGRAM',
      'TIKTOK',
      'WHATSAPP',
      'SLACK',
      'DISCORD',
      'TWITTER',
    ];
    expect(mockSkullEmoji.platformNotes[0].platform).toBe('TIKTOK');
    expect(validPlatforms).toContain(mockSkullEmoji.platformNotes[0].platform);
  });

  it('should have valid generation types', () => {
    const validGenerations = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];
    expect(mockSkullEmoji.generationalNotes[0].generation).toBe('GEN_Z');
    expect(validGenerations).toContain(mockSkullEmoji.generationalNotes[0].generation);
  });

  it('should have valid warning severity levels', () => {
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH'];
    expect(mockSkullEmoji.warnings[0].severity).toBe('LOW');
    expect(validSeverities).toContain(mockSkullEmoji.warnings[0].severity);
  });
});
