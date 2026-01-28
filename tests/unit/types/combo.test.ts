import { describe, it, expect } from 'bun:test';
import type {
  EmojiCombo,
  EmojiComboSummary,
  EmojiComboCategoryName,
  EmojiComboSearchResult,
  EmojiComboCollection,
  EmojiComboValidationResult,
  EmojiComboDraft,
} from '../../../src/types/combo';

describe('combo types', () => {
  describe('EmojiComboCategoryName', () => {
    it('should accept all valid combo category names', () => {
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
      expect(categories).toHaveLength(11);
    });
  });

  describe('EmojiCombo', () => {
    it('should create valid EmojiCombo object with all required properties', () => {
      const combo: EmojiCombo = {
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
      expect(combo.slug).toBe('skull-laughing');
      expect(combo.combo).toBe('💀😂');
      expect(combo.emojis).toHaveLength(2);
      expect(combo.category).toBe('humor');
    });

    it('should allow optional relatedCombos', () => {
      const combo: EmojiCombo = {
        slug: 'skull-laughing',
        combo: '💀😂',
        emojis: ['skull', 'face-with-tears-of-joy'],
        name: 'Dead Laughing',
        description: 'Extremely funny expression',
        meaning: 'Something is hilarious',
        examples: ['That video 💀😂'],
        category: 'humor',
        seoTitle: 'Dead Laughing Combo',
        seoDescription: 'What does 💀😂 mean?',
        relatedCombos: ['crying-laughing-skull', 'skull-fire'],
      };
      expect(combo.relatedCombos).toHaveLength(2);
    });

    it('should allow optional tags', () => {
      const combo: EmojiCombo = {
        slug: 'skull-laughing',
        combo: '💀😂',
        emojis: ['skull', 'face-with-tears-of-joy'],
        name: 'Dead Laughing',
        description: 'Extremely funny expression',
        meaning: 'Something is hilarious',
        examples: ['That video 💀😂'],
        category: 'humor',
        seoTitle: 'Dead Laughing Combo',
        seoDescription: 'What does 💀😂 mean?',
        tags: ['funny', 'laughter', 'death', 'humor'],
      };
      expect(combo.tags).toHaveLength(4);
    });

    it('should allow optional popularity score', () => {
      const combo: EmojiCombo = {
        slug: 'skull-laughing',
        combo: '💀😂',
        emojis: ['skull', 'face-with-tears-of-joy'],
        name: 'Dead Laughing',
        description: 'Extremely funny expression',
        meaning: 'Something is hilarious',
        examples: ['That video 💀😂'],
        category: 'humor',
        seoTitle: 'Dead Laughing Combo',
        seoDescription: 'What does 💀😂 mean?',
        popularity: 95,
      };
      expect(combo.popularity).toBe(95);
    });
  });

  describe('EmojiComboSummary', () => {
    it('should create valid EmojiComboSummary object', () => {
      const summary: EmojiComboSummary = {
        slug: 'skull-laughing',
        combo: '💀😂',
        name: 'Dead Laughing',
        meaning: 'Something is extremely funny',
        category: 'humor',
      };
      expect(summary.slug).toBe('skull-laughing');
      expect(summary.combo).toBe('💀😂');
    });
  });

  describe('EmojiComboSearchResult', () => {
    it('should create valid EmojiComboSearchResult with score and matched field', () => {
      const result: EmojiComboSearchResult = {
        slug: 'skull-laughing',
        combo: '💀😂',
        name: 'Dead Laughing',
        meaning: 'Something is extremely funny',
        category: 'humor',
        score: 0.92,
        matchedField: 'name',
      };
      expect(result.score).toBe(0.92);
      expect(result.matchedField).toBe('name');
    });

    it('should allow optional matchHighlight', () => {
      const result: EmojiComboSearchResult = {
        slug: 'skull-laughing',
        combo: '💀😂',
        name: 'Dead Laughing',
        meaning: 'Something is extremely funny',
        category: 'humor',
        score: 0.92,
        matchedField: 'name',
        matchHighlight: '<mark>Dead</mark> Laughing',
      };
      expect(result.matchHighlight).toBe('<mark>Dead</mark> Laughing');
    });
  });

  describe('EmojiComboCollection', () => {
    it('should create valid EmojiComboCollection object', () => {
      const collection: EmojiComboCollection = {
        name: 'Humor Combos',
        description: 'Emoji combinations for expressing laughter and humor',
        combos: [
          {
            slug: 'skull-laughing',
            combo: '💀😂',
            name: 'Dead Laughing',
            meaning: 'Something is extremely funny',
            category: 'humor',
          },
        ],
        total: 1,
      };
      expect(collection.name).toBe('Humor Combos');
      expect(collection.total).toBe(1);
    });
  });

  describe('EmojiComboValidationResult', () => {
    it('should create valid EmojiComboValidationResult for valid combo', () => {
      const validResult: EmojiComboValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };
      expect(validResult.valid).toBe(true);
    });

    it('should allow errors and warnings arrays', () => {
      const invalidResult: EmojiComboValidationResult = {
        valid: false,
        errors: ['Missing required field: combo'],
        warnings: ['Category might be incorrect'],
      };
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toHaveLength(1);
      expect(invalidResult.warnings).toHaveLength(1);
    });
  });

  describe('EmojiComboDraft', () => {
    it('should require minimal fields for draft', () => {
      const draft: EmojiComboDraft = {
        combo: '💀😂',
        slug: 'skull-laughing',
        name: 'Dead Laughing',
      };
      expect(draft.combo).toBe('💀😂');
      expect(draft.slug).toBe('skull-laughing');
      expect(draft.name).toBe('Dead Laughing');
    });

    it('should allow partial additional fields', () => {
      const draft: EmojiComboDraft = {
        combo: '💀😂',
        slug: 'skull-laughing',
        name: 'Dead Laughing',
        category: 'humor',
        meaning: 'Something is extremely funny',
      };
      expect(draft.category).toBe('humor');
    });
  });
});
