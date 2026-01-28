import { describe, it, expect, beforeEach } from 'bun:test';
import { clearEmojiCache } from '../../../src/lib/emoji-data';

// Clear cache before each test to ensure clean state
beforeEach(() => {
  clearEmojiCache();
});

describe('category-data utilities', () => {
  describe('getCategoryDisplayName', () => {
    it('should return display name for faces category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('faces')).toBe('Smileys & Faces');
    });

    it('should return display name for people category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('people')).toBe('People & Body');
    });

    it('should return display name for animals category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('animals')).toBe('Animals & Nature');
    });

    it('should return display name for food category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('food')).toBe('Food & Drink');
    });

    it('should return display name for travel category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('travel')).toBe('Travel & Places');
    });

    it('should return display name for activities category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('activities')).toBe('Activities');
    });

    it('should return display name for objects category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('objects')).toBe('Objects');
    });

    it('should return display name for symbols category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('symbols')).toBe('Symbols');
    });

    it('should return display name for flags category', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('flags')).toBe('Flags');
    });

    it('should capitalize unknown categories', async () => {
      const { getCategoryDisplayName } = await import('../../../src/lib/emoji-data');
      expect(getCategoryDisplayName('unknown')).toBe('Unknown');
    });
  });

  describe('getCategoryDescription', () => {
    it('should return description for faces category', async () => {
      const { getCategoryDescription } = await import('../../../src/lib/emoji-data');
      const description = getCategoryDescription('faces');
      expect(description).toContain('smileys');
    });

    it('should return description for people category', async () => {
      const { getCategoryDescription } = await import('../../../src/lib/emoji-data');
      const description = getCategoryDescription('people');
      expect(description).toContain('people');
    });

    it('should return generic description for unknown category', async () => {
      const { getCategoryDescription } = await import('../../../src/lib/emoji-data');
      const description = getCategoryDescription('unknown');
      expect(description).toContain('unknown');
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', async () => {
      const { isValidCategory } = await import('../../../src/lib/emoji-data');
      expect(isValidCategory('faces')).toBe(true);
      expect(isValidCategory('people')).toBe(true);
      expect(isValidCategory('animals')).toBe(true);
      expect(isValidCategory('food')).toBe(true);
      expect(isValidCategory('travel')).toBe(true);
      expect(isValidCategory('activities')).toBe(true);
      expect(isValidCategory('objects')).toBe(true);
      expect(isValidCategory('symbols')).toBe(true);
      expect(isValidCategory('flags')).toBe(true);
    });

    it('should return false for invalid categories', async () => {
      const { isValidCategory } = await import('../../../src/lib/emoji-data');
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory('FACES')).toBe(false);
    });
  });

  describe('getCategoryInfo', () => {
    it('should return complete category info', async () => {
      const { getCategoryInfo } = await import('../../../src/lib/emoji-data');
      const info = getCategoryInfo('faces');
      expect(info).not.toBeNull();
      expect(info).toHaveProperty('slug', 'faces');
      expect(info).toHaveProperty('displayName', 'Smileys & Faces');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('emojiCount');
      expect(info!.emojiCount).toBeGreaterThan(0);
    });

    it('should return null for invalid category', async () => {
      const { getCategoryInfo } = await import('../../../src/lib/emoji-data');
      const info = getCategoryInfo('invalid');
      expect(info).toBeNull();
    });
  });

  describe('getAllCategoryInfo', () => {
    it('should return info for all categories with emojis', async () => {
      const { getAllCategoryInfo } = await import('../../../src/lib/emoji-data');
      const categories = getAllCategoryInfo();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Each category should have required properties
      categories.forEach((cat) => {
        expect(cat).toHaveProperty('slug');
        expect(cat).toHaveProperty('displayName');
        expect(cat).toHaveProperty('description');
        expect(cat).toHaveProperty('emojiCount');
      });
    });

    it('should be sorted by emoji count descending', async () => {
      const { getAllCategoryInfo } = await import('../../../src/lib/emoji-data');
      const categories = getAllCategoryInfo();

      for (let i = 1; i < categories.length; i++) {
        expect(categories[i - 1].emojiCount).toBeGreaterThanOrEqual(categories[i].emojiCount);
      }
    });
  });

  describe('getEmojiSummariesByCategory', () => {
    it('should return emoji summaries for a valid category', async () => {
      const { getEmojiSummariesByCategory } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummariesByCategory('faces');
      expect(Array.isArray(summaries)).toBe(true);
      expect(summaries.length).toBeGreaterThan(0);

      // All summaries should be from the faces category
      summaries.forEach((summary) => {
        expect(summary.category).toBe('faces');
      });

      // Each summary should have required properties
      const summary = summaries[0];
      expect(summary).toHaveProperty('slug');
      expect(summary).toHaveProperty('character');
      expect(summary).toHaveProperty('name');
      expect(summary).toHaveProperty('category');
      expect(summary).toHaveProperty('tldr');
    });

    it('should return empty array for invalid category', async () => {
      const { getEmojiSummariesByCategory } = await import('../../../src/lib/emoji-data');
      const summaries = getEmojiSummariesByCategory('invalid');
      expect(summaries).toEqual([]);
    });
  });
});
