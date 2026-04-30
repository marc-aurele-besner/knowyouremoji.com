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

    it('should find emojis by shortName', async () => {
      const { searchEmojis, getEmojiBySlug } = await import('../../../src/lib/emoji-data');
      const skull = getEmojiBySlug('skull');
      if (skull) {
        const results = searchEmojis(skull.shortName);
        expect(results.some((e) => e.slug === 'skull')).toBe(true);
      }
    });

    it('should find emojis by slug', async () => {
      const { searchEmojis } = await import('../../../src/lib/emoji-data');
      const results = searchEmojis('skull');
      expect(results.some((e) => e.slug === 'skull')).toBe(true);
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

  describe('cache behavior', () => {
    it('should reuse cached data on subsequent calls', async () => {
      const { clearEmojiCache, getAllEmojis } = await import('../../../src/lib/emoji-data');

      // Clear cache first
      clearEmojiCache();

      // First call loads from disk
      const emojis1 = getAllEmojis();

      // Second call should return same reference (cached)
      const emojis2 = getAllEmojis();

      // Both should have the same data
      expect(emojis1.length).toBe(emojis2.length);
      expect(emojis1).toBe(emojis2);
    });

    it('should load fresh data after cache clear', async () => {
      const { clearEmojiCache, getAllEmojis, getEmojiBySlug } =
        await import('../../../src/lib/emoji-data');

      // First load
      const emojis1 = getAllEmojis();
      const skull1 = getEmojiBySlug('skull');

      // Clear and reload
      clearEmojiCache();

      const emojis2 = getAllEmojis();
      const skull2 = getEmojiBySlug('skull');

      // Data should be equivalent but not the same reference
      expect(emojis1.length).toBe(emojis2.length);
      expect(emojis1).not.toBe(emojis2);
      expect(skull1?.slug).toBe(skull2?.slug);
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

describe('platform utilities', () => {
  describe('getAllPlatforms', () => {
    it('should return all 7 platforms', async () => {
      const { getAllPlatforms } = await import('../../../src/lib/emoji-data');
      const platforms = getAllPlatforms();
      expect(platforms).toContain('IMESSAGE');
      expect(platforms).toContain('INSTAGRAM');
      expect(platforms).toContain('TIKTOK');
      expect(platforms).toContain('WHATSAPP');
      expect(platforms).toContain('SLACK');
      expect(platforms).toContain('DISCORD');
      expect(platforms).toContain('TWITTER');
      expect(platforms.length).toBe(7);
    });
  });

  describe('getPlatformDisplayName', () => {
    it('should return correct display names', async () => {
      const { getPlatformDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getPlatformDisplayName('IMESSAGE')).toBe('iMessage');
      expect(getPlatformDisplayName('INSTAGRAM')).toBe('Instagram');
      expect(getPlatformDisplayName('TIKTOK')).toBe('TikTok');
      expect(getPlatformDisplayName('WHATSAPP')).toBe('WhatsApp');
      expect(getPlatformDisplayName('SLACK')).toBe('Slack');
      expect(getPlatformDisplayName('DISCORD')).toBe('Discord');
      expect(getPlatformDisplayName('TWITTER')).toBe('Twitter/X');
    });

    it('should return original string for unknown platforms', async () => {
      const { getPlatformDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getPlatformDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getPlatformDescription', () => {
    it('should return descriptions for valid platforms', async () => {
      const { getPlatformDescription } = await import('../../../src/lib/emoji-data');
      const desc = getPlatformDescription('TIKTOK');
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });

    it('should return fallback for unknown platforms', async () => {
      const { getPlatformDescription } = await import('../../../src/lib/emoji-data');
      const desc = getPlatformDescription('unknown');
      expect(desc).toContain('unknown');
    });
  });

  describe('getEmojisWithPlatformNotes', () => {
    it('should return emojis that have notes for a platform', async () => {
      const { getEmojisWithPlatformNotes } = await import('../../../src/lib/emoji-data');
      const emojis = getEmojisWithPlatformNotes('TIKTOK');
      expect(Array.isArray(emojis)).toBe(true);
      emojis.forEach((emoji) => {
        const hasTikTokNote = emoji.platformNotes.some((n) => n.platform === 'TIKTOK');
        expect(hasTikTokNote).toBe(true);
      });
    });

    it('should return different results for different platforms', async () => {
      const { getEmojisWithPlatformNotes } = await import('../../../src/lib/emoji-data');
      const tiktokEmojis = getEmojisWithPlatformNotes('TIKTOK');
      const slackEmojis = getEmojisWithPlatformNotes('SLACK');
      expect(tiktokEmojis).not.toEqual(slackEmojis);
    });
  });

  describe('getEmojiSummariesByPlatform', () => {
    it('should return emoji summaries for a platform', async () => {
      const { getEmojiSummariesByPlatform } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummariesByPlatform('TIKTOK');
      expect(Array.isArray(summaries)).toBe(true);
      if (summaries.length > 0) {
        const summary = summaries[0];
        expect(summary).toHaveProperty('slug');
        expect(summary).toHaveProperty('character');
        expect(summary).toHaveProperty('name');
        expect(summary).not.toHaveProperty('platformNotes');
      }
    });
  });

  describe('getPlatformInfo', () => {
    it('should return info for a valid platform', async () => {
      const { getPlatformInfo } = await import('../../../src/lib/emoji-data');
      const info = getPlatformInfo('TIKTOK');
      expect(info.slug).toBe('TIKTOK');
      expect(info.displayName).toBe('TikTok');
      expect(info.description.length).toBeGreaterThan(0);
      expect(info.emojiCount).toBeGreaterThan(0);
    });
  });

  describe('getAllPlatformInfo', () => {
    it('should return info for all platforms', async () => {
      const { getAllPlatformInfo } = await import('../../../src/lib/emoji-data');
      const info = getAllPlatformInfo();
      expect(info.length).toBe(7);
    });

    it('should be sorted by emoji count descending', async () => {
      const { getAllPlatformInfo } = await import('../../../src/lib/emoji-data');
      const info = getAllPlatformInfo();
      for (let i = 1; i < info.length; i++) {
        expect(info[i - 1].emojiCount).toBeGreaterThanOrEqual(info[i].emojiCount);
      }
    });
  });
});

describe('generation utilities', () => {
  describe('getAllGenerations', () => {
    it('should return all 4 generations', async () => {
      const { getAllGenerations } = await import('../../../src/lib/emoji-data');
      const generations = getAllGenerations();
      expect(generations).toContain('GEN_Z');
      expect(generations).toContain('MILLENNIAL');
      expect(generations).toContain('GEN_X');
      expect(generations).toContain('BOOMER');
      expect(generations.length).toBe(4);
    });
  });

  describe('getGenerationDisplayName', () => {
    it('should return correct display names', async () => {
      const { getGenerationDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getGenerationDisplayName('GEN_Z')).toBe('Gen Z');
      expect(getGenerationDisplayName('MILLENNIAL')).toBe('Millennial');
      expect(getGenerationDisplayName('GEN_X')).toBe('Gen X');
      expect(getGenerationDisplayName('BOOMER')).toBe('Boomer');
    });

    it('should return original string for unknown generations', async () => {
      const { getGenerationDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getGenerationDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getGenerationDescription', () => {
    it('should return descriptions for valid generations', async () => {
      const { getGenerationDescription } = await import('../../../src/lib/emoji-data');
      const desc = getGenerationDescription('GEN_Z');
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });

    it('should return fallback for unknown generations', async () => {
      const { getGenerationDescription } = await import('../../../src/lib/emoji-data');
      const desc = getGenerationDescription('unknown');
      expect(desc).toContain('unknown');
    });
  });

  describe('getEmojisWithGenerationNotes', () => {
    it('should return emojis that have notes for a generation', async () => {
      const { getEmojisWithGenerationNotes } = await import('../../../src/lib/emoji-data');
      const emojis = getEmojisWithGenerationNotes('GEN_Z');
      expect(Array.isArray(emojis)).toBe(true);
      emojis.forEach((emoji) => {
        const hasGenZNote = emoji.generationalNotes.some((n) => n.generation === 'GEN_Z');
        expect(hasGenZNote).toBe(true);
      });
    });
  });

  describe('getEmojiSummariesByGeneration', () => {
    it('should return emoji summaries for a generation', async () => {
      const { getEmojiSummariesByGeneration } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummariesByGeneration('GEN_Z');
      expect(Array.isArray(summaries)).toBe(true);
      if (summaries.length > 0) {
        const summary = summaries[0];
        expect(summary).toHaveProperty('slug');
        expect(summary).toHaveProperty('character');
        expect(summary).toHaveProperty('name');
        expect(summary).not.toHaveProperty('generationalNotes');
      }
    });
  });

  describe('getGenerationInfo', () => {
    it('should return info for a valid generation', async () => {
      const { getGenerationInfo } = await import('../../../src/lib/emoji-data');
      const info = getGenerationInfo('GEN_Z');
      expect(info.slug).toBe('GEN_Z');
      expect(info.displayName).toBe('Gen Z');
      expect(info.description.length).toBeGreaterThan(0);
      expect(info.emojiCount).toBeGreaterThan(0);
    });
  });

  describe('getAllGenerationInfo', () => {
    it('should return info for all generations', async () => {
      const { getAllGenerationInfo } = await import('../../../src/lib/emoji-data');
      const info = getAllGenerationInfo();
      expect(info.length).toBe(4);
    });
  });
});

describe('context utilities', () => {
  describe('getAllContextTypes', () => {
    it('should return all 7 context types', async () => {
      const { getAllContextTypes } = await import('../../../src/lib/emoji-data');
      const contexts = getAllContextTypes();
      expect(contexts).toContain('LITERAL');
      expect(contexts).toContain('SLANG');
      expect(contexts).toContain('IRONIC');
      expect(contexts).toContain('PASSIVE_AGGRESSIVE');
      expect(contexts).toContain('DATING');
      expect(contexts).toContain('WORK');
      expect(contexts).toContain('RED_FLAG');
      expect(contexts.length).toBe(7);
    });
  });

  describe('getPageableContextTypes', () => {
    it('should return 6 context types (excluding LITERAL)', async () => {
      const { getPageableContextTypes } = await import('../../../src/lib/emoji-data');
      const contexts = getPageableContextTypes();
      expect(contexts).not.toContain('LITERAL');
      expect(contexts).toContain('SLANG');
      expect(contexts).toContain('DATING');
      expect(contexts).toContain('WORK');
      expect(contexts.length).toBe(6);
    });
  });

  describe('getContextDisplayName', () => {
    it('should return correct display names', async () => {
      const { getContextDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getContextDisplayName('SLANG')).toBe('Slang');
      expect(getContextDisplayName('DATING')).toBe('Dating');
      expect(getContextDisplayName('WORK')).toBe('Work');
      expect(getContextDisplayName('IRONIC')).toBe('Ironic');
      expect(getContextDisplayName('PASSIVE_AGGRESSIVE')).toBe('Passive-Aggressive');
      expect(getContextDisplayName('RED_FLAG')).toBe('Red Flag');
    });

    it('should return original string for unknown contexts', async () => {
      const { getContextDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getContextDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getContextDescription', () => {
    it('should return descriptions for valid contexts', async () => {
      const { getContextDescription } = await import('../../../src/lib/emoji-data');
      const desc = getContextDescription('SLANG');
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });

    it('should return fallback for unknown contexts', async () => {
      const { getContextDescription } = await import('../../../src/lib/emoji-data');
      const desc = getContextDescription('unknown');
      expect(desc).toContain('unknown');
    });
  });

  describe('getEmojisByContext', () => {
    it('should return emojis that have meanings for a context', async () => {
      const { getEmojisByContext } = await import('../../../src/lib/emoji-data');
      const emojis = getEmojisByContext('SLANG');
      expect(Array.isArray(emojis)).toBe(true);
      emojis.forEach((emoji) => {
        const hasSlangContext = emoji.contextMeanings.some((m) => m.context === 'SLANG');
        expect(hasSlangContext).toBe(true);
      });
    });

    it('should return different results for different contexts', async () => {
      const { getEmojisByContext } = await import('../../../src/lib/emoji-data');
      const slangEmojis = getEmojisByContext('SLANG');
      const datingEmojis = getEmojisByContext('DATING');
      expect(slangEmojis).not.toEqual(datingEmojis);
    });
  });

  describe('getEmojiSummariesByContext', () => {
    it('should return emoji summaries for a context', async () => {
      const { getEmojiSummariesByContext } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummariesByContext('SLANG');
      expect(Array.isArray(summaries)).toBe(true);
      if (summaries.length > 0) {
        const summary = summaries[0];
        expect(summary).toHaveProperty('slug');
        expect(summary).toHaveProperty('character');
        expect(summary).toHaveProperty('name');
        expect(summary).not.toHaveProperty('contextMeanings');
      }
    });
  });

  describe('getContextInfo', () => {
    it('should return info for a valid context', async () => {
      const { getContextInfo } = await import('../../../src/lib/emoji-data');
      const info = getContextInfo('SLANG');
      expect(info.slug).toBe('SLANG');
      expect(info.displayName).toBe('Slang');
      expect(info.description.length).toBeGreaterThan(0);
      expect(info.emojiCount).toBeGreaterThan(0);
    });
  });

  describe('getAllContextInfo', () => {
    it('should return info for all pageable contexts', async () => {
      const { getAllContextInfo } = await import('../../../src/lib/emoji-data');
      const info = getAllContextInfo();
      expect(info.length).toBe(6);
    });

    it('should be sorted by emoji count descending', async () => {
      const { getAllContextInfo } = await import('../../../src/lib/emoji-data');
      const info = getAllContextInfo();
      for (let i = 1; i < info.length; i++) {
        expect(info[i - 1].emojiCount).toBeGreaterThanOrEqual(info[i].emojiCount);
      }
    });
  });
});
