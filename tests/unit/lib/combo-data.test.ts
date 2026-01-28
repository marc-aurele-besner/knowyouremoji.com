import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import type { EmojiCombo, EmojiComboCategoryName } from '../../../src/types/combo';
import fs from 'fs';

// Mock combo data for testing
const mockCombo: EmojiCombo = {
  slug: 'skull-laughing',
  combo: '💀😂',
  emojis: ['skull', 'face-with-tears-of-joy'],
  name: 'Dead Laughing',
  description:
    "The ultimate expression of finding something hilarious - combining 'I'm dead' with tears of joy.",
  meaning:
    "Something is so funny that one skull isn't enough to express how dead you are from laughing.",
  examples: ["That video 💀😂 I can't breathe", '💀😂💀😂 this thread is killing me'],
  category: 'humor',
  seoTitle: '💀😂 Dead Laughing Combo Meaning',
  seoDescription:
    'What does 💀😂 mean? The skull and laughing emoji combo explained. Used when something is extremely funny.',
};

// Import clearComboCache for test cleanup
let clearComboCache: () => void;

beforeEach(async () => {
  const comboDataModule = await import('../../../src/lib/combo-data');
  clearComboCache = comboDataModule.clearComboCache;
  clearComboCache();
});

describe('combo-data', () => {
  describe('getAllCombos', () => {
    it('should return an array of combos', async () => {
      const { getAllCombos } = await import('../../../src/lib/combo-data');
      const combos = getAllCombos();
      expect(Array.isArray(combos)).toBe(true);
    });

    it('should return combos with required properties', async () => {
      const { getAllCombos } = await import('../../../src/lib/combo-data');
      const combos = getAllCombos();

      if (combos.length > 0) {
        const combo = combos[0];
        expect(combo).toHaveProperty('slug');
        expect(combo).toHaveProperty('combo');
        expect(combo).toHaveProperty('emojis');
        expect(combo).toHaveProperty('name');
        expect(combo).toHaveProperty('description');
        expect(combo).toHaveProperty('meaning');
        expect(combo).toHaveProperty('examples');
        expect(combo).toHaveProperty('category');
        expect(combo).toHaveProperty('seoTitle');
        expect(combo).toHaveProperty('seoDescription');
      }
    });
  });

  describe('getComboBySlug', () => {
    it('should return combo when slug exists', async () => {
      const { getComboBySlug } = await import('../../../src/lib/combo-data');
      const combo = getComboBySlug('skull-laughing');
      expect(combo).toBeDefined();
      expect(combo?.combo).toBe('💀😂');
      expect(combo?.slug).toBe('skull-laughing');
    });

    it('should return undefined for non-existent slug', async () => {
      const { getComboBySlug } = await import('../../../src/lib/combo-data');
      const combo = getComboBySlug('non-existent-combo');
      expect(combo).toBeUndefined();
    });
  });

  describe('getCombosByCategory', () => {
    it('should return combos filtered by category', async () => {
      const { getCombosByCategory } = await import('../../../src/lib/combo-data');
      const humorCombos = getCombosByCategory('humor');
      expect(Array.isArray(humorCombos)).toBe(true);

      // All returned combos should have the same category
      humorCombos.forEach((combo) => {
        expect(combo.category).toBe('humor');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const { getCombosByCategory } = await import('../../../src/lib/combo-data');
      const combos = getCombosByCategory('non-existent-category' as EmojiComboCategoryName);
      expect(combos).toEqual([]);
    });
  });

  describe('getAllComboCategories', () => {
    it('should return unique categories', async () => {
      const { getAllComboCategories } = await import('../../../src/lib/combo-data');
      const categories = getAllComboCategories();
      expect(Array.isArray(categories)).toBe(true);

      // Check for uniqueness
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });
  });

  describe('searchCombos', () => {
    it('should find combos by name', async () => {
      const { searchCombos } = await import('../../../src/lib/combo-data');
      const results = searchCombos('dead');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });

    it('should find combos by combo string', async () => {
      const { searchCombos } = await import('../../../src/lib/combo-data');
      const results = searchCombos('💀😂');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.combo === '💀😂')).toBe(true);
    });

    it('should find combos by meaning', async () => {
      const { searchCombos } = await import('../../../src/lib/combo-data');
      const results = searchCombos('funny');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', async () => {
      const { searchCombos } = await import('../../../src/lib/combo-data');
      const resultsLower = searchCombos('dead');
      const resultsUpper = searchCombos('DEAD');
      expect(resultsLower.length).toBe(resultsUpper.length);
    });

    it('should return empty array for no matches', async () => {
      const { searchCombos } = await import('../../../src/lib/combo-data');
      const results = searchCombos('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getComboCount', () => {
    it('should return the total number of combos', async () => {
      const { getComboCount, getAllCombos } = await import('../../../src/lib/combo-data');
      const count = getComboCount();
      const combos = getAllCombos();
      expect(count).toBe(combos.length);
    });
  });

  describe('getComboSummaries', () => {
    it('should return combo summaries with required properties', async () => {
      const { getComboSummaries } = await import('../../../src/lib/combo-data');
      const summaries = getComboSummaries();
      expect(Array.isArray(summaries)).toBe(true);

      if (summaries.length > 0) {
        const summary = summaries[0];
        expect(summary).toHaveProperty('slug');
        expect(summary).toHaveProperty('combo');
        expect(summary).toHaveProperty('name');
        expect(summary).toHaveProperty('meaning');
        expect(summary).toHaveProperty('category');
        // Should NOT have full combo properties
        expect(summary).not.toHaveProperty('description');
        expect(summary).not.toHaveProperty('examples');
        expect(summary).not.toHaveProperty('seoTitle');
      }
    });

    it('should return correct data for skull-laughing combo', async () => {
      const { getComboSummaries } = await import('../../../src/lib/combo-data');
      const summaries = getComboSummaries();
      const skullSummary = summaries.find((s) => s.slug === 'skull-laughing');
      expect(skullSummary).toBeDefined();
      expect(skullSummary?.combo).toBe('💀😂');
      expect(skullSummary?.name).toBe('Dead Laughing');
    });
  });

  describe('getAllComboSlugs', () => {
    it('should return an array of slugs', async () => {
      const { getAllComboSlugs } = await import('../../../src/lib/combo-data');
      const slugs = getAllComboSlugs();
      expect(Array.isArray(slugs)).toBe(true);
    });

    it('should include skull-laughing slug', async () => {
      const { getAllComboSlugs } = await import('../../../src/lib/combo-data');
      const slugs = getAllComboSlugs();
      expect(slugs).toContain('skull-laughing');
    });

    it('should return same count as getAllCombos', async () => {
      const { getAllComboSlugs, getAllCombos } = await import('../../../src/lib/combo-data');
      const slugs = getAllComboSlugs();
      const combos = getAllCombos();
      expect(slugs.length).toBe(combos.length);
    });
  });

  describe('clearComboCache', () => {
    it('should clear the cache and allow reload', async () => {
      const { clearComboCache, getAllCombos } = await import('../../../src/lib/combo-data');

      // First load
      const combos1 = getAllCombos();
      expect(combos1.length).toBeGreaterThan(0);

      // Clear cache
      clearComboCache();

      // Second load should work the same
      const combos2 = getAllCombos();
      expect(combos2.length).toBe(combos1.length);
    });
  });

  describe('missing directory handling', () => {
    it('should return empty array when combo directory does not exist', async () => {
      const { clearComboCache, getAllCombos } = await import('../../../src/lib/combo-data');

      // Clear the cache first
      clearComboCache();

      // Mock fs.existsSync to return false
      const existsSyncSpy = spyOn(fs, 'existsSync').mockReturnValue(false);

      const combos = getAllCombos();
      expect(combos).toEqual([]);

      // Restore the original function
      existsSyncSpy.mockRestore();

      // Clear cache to reset for other tests
      clearComboCache();
    });
  });

  describe('getRelatedCombos', () => {
    it('should return combos from the same category', async () => {
      const { getRelatedCombos, getComboBySlug } = await import('../../../src/lib/combo-data');
      const combo = getComboBySlug('skull-laughing');
      if (!combo) throw new Error('Skull-laughing combo not found');

      const related = getRelatedCombos(combo.slug, 4);
      expect(Array.isArray(related)).toBe(true);

      // All related combos should be in the same category as skull-laughing
      related.forEach((c) => {
        expect(c.category).toBe('humor');
      });
    });

    it('should not include the current combo in results', async () => {
      const { getRelatedCombos } = await import('../../../src/lib/combo-data');
      const related = getRelatedCombos('skull-laughing', 10);

      // skull-laughing should not be in its own related combos
      expect(related.some((c) => c.slug === 'skull-laughing')).toBe(false);
    });

    it('should limit the number of results', async () => {
      const { getRelatedCombos } = await import('../../../src/lib/combo-data');
      const related = getRelatedCombos('skull-laughing', 3);

      expect(related.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for non-existent combo', async () => {
      const { getRelatedCombos } = await import('../../../src/lib/combo-data');
      const related = getRelatedCombos('non-existent-combo', 4);

      expect(related).toEqual([]);
    });

    it('should use default limit of 6 when not specified', async () => {
      const { getRelatedCombos } = await import('../../../src/lib/combo-data');
      const related = getRelatedCombos('skull-laughing');

      expect(related.length).toBeLessThanOrEqual(6);
    });

    it('should return EmojiComboSummary objects', async () => {
      const { getRelatedCombos } = await import('../../../src/lib/combo-data');
      const related = getRelatedCombos('skull-laughing', 2);

      if (related.length > 0) {
        const combo = related[0];
        expect(combo).toHaveProperty('slug');
        expect(combo).toHaveProperty('combo');
        expect(combo).toHaveProperty('name');
        expect(combo).toHaveProperty('meaning');
        expect(combo).toHaveProperty('category');
        // Should NOT have full combo properties
        expect(combo).not.toHaveProperty('description');
        expect(combo).not.toHaveProperty('examples');
        expect(combo).not.toHaveProperty('seoTitle');
      }
    });
  });

  describe('getCombosByEmoji', () => {
    it('should return combos containing the specified emoji', async () => {
      const { getCombosByEmoji } = await import('../../../src/lib/combo-data');
      const results = getCombosByEmoji('skull');

      expect(Array.isArray(results)).toBe(true);
      // All results should contain skull in their emojis array
      results.forEach((combo) => {
        expect(combo.emojis).toContain('skull');
      });
    });

    it('should return empty array for non-existent emoji', async () => {
      const { getCombosByEmoji } = await import('../../../src/lib/combo-data');
      const results = getCombosByEmoji('non-existent-emoji');
      expect(results).toEqual([]);
    });

    it('should return skull-laughing when searching for skull', async () => {
      const { getCombosByEmoji } = await import('../../../src/lib/combo-data');
      const results = getCombosByEmoji('skull');
      expect(results.some((c) => c.slug === 'skull-laughing')).toBe(true);
    });
  });

  describe('getComboSummariesByCategory', () => {
    it('should return combo summaries for a specific category', async () => {
      const { getComboSummariesByCategory } = await import('../../../src/lib/combo-data');
      const summaries = getComboSummariesByCategory('humor');

      expect(Array.isArray(summaries)).toBe(true);

      // All returned summaries should have the same category
      summaries.forEach((summary) => {
        expect(summary.category).toBe('humor');
      });

      // Should have summary properties, not full combo properties
      if (summaries.length > 0) {
        const summary = summaries[0];
        expect(summary).toHaveProperty('slug');
        expect(summary).toHaveProperty('combo');
        expect(summary).toHaveProperty('name');
        expect(summary).toHaveProperty('meaning');
        expect(summary).toHaveProperty('category');
        expect(summary).not.toHaveProperty('description');
        expect(summary).not.toHaveProperty('examples');
      }
    });

    it('should return empty array for non-existent category', async () => {
      const { getComboSummariesByCategory } = await import('../../../src/lib/combo-data');
      const summaries = getComboSummariesByCategory(
        'non-existent-category' as EmojiComboCategoryName
      );
      expect(summaries).toEqual([]);
    });
  });
});

describe('combo types', () => {
  it('should have valid category types', () => {
    const validCategories: EmojiComboCategoryName[] = [
      'humor',
      'flirting',
      'sarcasm',
      'celebration',
      'emotion',
      'reaction',
      'relationship',
      'work',
      'food',
      'travel',
      'other',
    ];
    expect(mockCombo.category).toBe('humor');
    expect(validCategories).toContain(mockCombo.category);
  });

  it('should have emojis array with valid slug references', () => {
    expect(Array.isArray(mockCombo.emojis)).toBe(true);
    expect(mockCombo.emojis.length).toBeGreaterThan(0);
    mockCombo.emojis.forEach((slug) => {
      expect(typeof slug).toBe('string');
    });
  });

  it('should have examples array', () => {
    expect(Array.isArray(mockCombo.examples)).toBe(true);
    expect(mockCombo.examples.length).toBeGreaterThan(0);
  });
});
