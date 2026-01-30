import { describe, it, expect } from 'bun:test';
import {
  createEmojiCombo,
  createEmojiComboSummary,
  createMultipleCombos,
  createMultipleComboSummaries,
} from '../../../utils/factories/combo.factory';
import type { EmojiComboCategoryName } from '../../../../src/types/combo';

describe('combo.factory', () => {
  describe('createEmojiCombo', () => {
    it('should create a valid EmojiCombo with default values', () => {
      const combo = createEmojiCombo();

      expect(combo.slug).toBeDefined();
      expect(combo.combo).toBeDefined();
      expect(Array.isArray(combo.emojis)).toBe(true);
      expect(combo.name).toBeDefined();
      expect(combo.description).toBeDefined();
      expect(combo.meaning).toBeDefined();
      expect(Array.isArray(combo.examples)).toBe(true);
      expect(combo.category).toBeDefined();
      expect(combo.seoTitle).toBeDefined();
      expect(combo.seoDescription).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const combo = createEmojiCombo({
        slug: 'custom-combo',
        combo: '🔥💯',
        name: 'Fire Hundred',
      });

      expect(combo.slug).toBe('custom-combo');
      expect(combo.combo).toBe('🔥💯');
      expect(combo.name).toBe('Fire Hundred');
    });

    it('should allow setting optional fields', () => {
      const combo = createEmojiCombo({
        relatedCombos: ['combo-1', 'combo-2'],
        tags: ['hot', 'impressive'],
        popularity: 85,
      });

      expect(combo.relatedCombos).toEqual(['combo-1', 'combo-2']);
      expect(combo.tags).toEqual(['hot', 'impressive']);
      expect(combo.popularity).toBe(85);
    });

    it('should create unique slugs for different calls', () => {
      const combo1 = createEmojiCombo();
      const combo2 = createEmojiCombo();

      expect(combo1.slug).not.toBe(combo2.slug);
    });

    it('should accept all valid category names', () => {
      const categories: EmojiComboCategoryName[] = [
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

      categories.forEach((category) => {
        const combo = createEmojiCombo({ category });
        expect(combo.category).toBe(category);
      });
    });
  });

  describe('createEmojiComboSummary', () => {
    it('should create a valid EmojiComboSummary with default values', () => {
      const summary = createEmojiComboSummary();

      expect(summary.slug).toBeDefined();
      expect(summary.combo).toBeDefined();
      expect(summary.name).toBeDefined();
      expect(summary.meaning).toBeDefined();
      expect(summary.category).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const summary = createEmojiComboSummary({
        slug: 'skull-laughing',
        combo: '💀😂',
        name: 'Dead Laughing',
        meaning: 'Laughing so hard I died',
        category: 'humor',
      });

      expect(summary.slug).toBe('skull-laughing');
      expect(summary.combo).toBe('💀😂');
      expect(summary.name).toBe('Dead Laughing');
      expect(summary.meaning).toBe('Laughing so hard I died');
      expect(summary.category).toBe('humor');
    });
  });

  describe('createMultipleCombos', () => {
    it('should create the specified number of combos', () => {
      const combos = createMultipleCombos(5);

      expect(combos).toHaveLength(5);
      combos.forEach((combo) => {
        expect(combo.slug).toBeDefined();
        expect(combo.combo).toBeDefined();
      });
    });

    it('should create combos with unique slugs', () => {
      const combos = createMultipleCombos(10);
      const slugs = combos.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(10);
    });

    it('should apply overrides to all combos', () => {
      const combos = createMultipleCombos(3, { category: 'humor' });

      combos.forEach((combo) => {
        expect(combo.category).toBe('humor');
      });
    });

    it('should return empty array for count of 0', () => {
      const combos = createMultipleCombos(0);

      expect(combos).toHaveLength(0);
    });
  });

  describe('createMultipleComboSummaries', () => {
    it('should create the specified number of combo summaries', () => {
      const summaries = createMultipleComboSummaries(5);

      expect(summaries).toHaveLength(5);
      summaries.forEach((summary) => {
        expect(summary.slug).toBeDefined();
        expect(summary.combo).toBeDefined();
      });
    });

    it('should create summaries with unique slugs', () => {
      const summaries = createMultipleComboSummaries(10);
      const slugs = summaries.map((s) => s.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(10);
    });

    it('should apply overrides to all summaries', () => {
      const summaries = createMultipleComboSummaries(3, { category: 'flirting' });

      summaries.forEach((summary) => {
        expect(summary.category).toBe('flirting');
      });
    });
  });
});
