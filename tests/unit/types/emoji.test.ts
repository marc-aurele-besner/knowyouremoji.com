import { describe, it, expect } from 'bun:test';
import type {
  Emoji,
  EmojiSummary,
  ContextMeaning,
  PlatformNote,
  GenerationalNote,
  EmojiWarning,
  ContextType,
  RiskLevel,
  Platform,
  Generation,
  WarningSeverity,
  EmojiCodepoint,
  EmojiSlug,
  EmojiCategoryName,
  EmojiCategoryDisplayName,
  UnicodeVersion,
  EmojiSearchResult,
  EmojiCollection,
  EmojiCategoryWithEmojis,
  EmojiValidationResult,
  EmojiDraft,
} from '../../../src/types/emoji';

describe('emoji types', () => {
  describe('basic types', () => {
    it('should accept valid EmojiCodepoint format', () => {
      const codepoint: EmojiCodepoint = '1F480';
      expect(codepoint).toBe('1F480');
    });

    it('should accept valid EmojiSlug format', () => {
      const slug: EmojiSlug = 'skull';
      expect(slug).toBe('skull');
    });

    it('should accept valid EmojiCategoryName values', () => {
      const category: EmojiCategoryName = 'faces';
      expect(category).toBe('faces');
    });

    it('should accept valid EmojiCategoryDisplayName values', () => {
      const displayName: EmojiCategoryDisplayName = 'Smileys & Faces';
      expect(displayName).toBe('Smileys & Faces');
    });

    it('should accept valid UnicodeVersion values', () => {
      const version: UnicodeVersion = '6.0';
      expect(version).toBe('6.0');
    });
  });

  describe('ContextType', () => {
    it('should accept all valid context types', () => {
      const contexts: ContextType[] = [
        'LITERAL',
        'SLANG',
        'IRONIC',
        'PASSIVE_AGGRESSIVE',
        'DATING',
        'WORK',
        'RED_FLAG',
      ];
      expect(contexts).toHaveLength(7);
    });
  });

  describe('RiskLevel', () => {
    it('should accept all valid risk levels', () => {
      const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
      expect(levels).toHaveLength(3);
    });
  });

  describe('Platform', () => {
    it('should accept all valid platforms', () => {
      const platforms: Platform[] = [
        'IMESSAGE',
        'INSTAGRAM',
        'TIKTOK',
        'WHATSAPP',
        'SLACK',
        'DISCORD',
        'TWITTER',
      ];
      expect(platforms).toHaveLength(7);
    });
  });

  describe('Generation', () => {
    it('should accept all valid generations', () => {
      const generations: Generation[] = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];
      expect(generations).toHaveLength(4);
    });
  });

  describe('WarningSeverity', () => {
    it('should accept all valid severity levels', () => {
      const severities: WarningSeverity[] = ['LOW', 'MEDIUM', 'HIGH'];
      expect(severities).toHaveLength(3);
    });
  });

  describe('ContextMeaning', () => {
    it('should create valid ContextMeaning object', () => {
      const contextMeaning: ContextMeaning = {
        context: 'SLANG',
        meaning: "Something is extremely funny - 'I'm dead' from laughing.",
        example: 'That meme 💀💀💀',
        riskLevel: 'LOW',
      };
      expect(contextMeaning.context).toBe('SLANG');
      expect(contextMeaning.riskLevel).toBe('LOW');
    });
  });

  describe('PlatformNote', () => {
    it('should create valid PlatformNote object', () => {
      const platformNote: PlatformNote = {
        platform: 'TIKTOK',
        note: 'Very common in comments to indicate something is hilarious.',
      };
      expect(platformNote.platform).toBe('TIKTOK');
    });
  });

  describe('GenerationalNote', () => {
    it('should create valid GenerationalNote object', () => {
      const generationalNote: GenerationalNote = {
        generation: 'GEN_Z',
        note: "Almost exclusively means 'I'm dead (from laughing)'.",
      };
      expect(generationalNote.generation).toBe('GEN_Z');
    });
  });

  describe('EmojiWarning', () => {
    it('should create valid EmojiWarning object', () => {
      const warning: EmojiWarning = {
        title: 'Context matters',
        description: 'Can be misinterpreted as morbid by older generations.',
        severity: 'LOW',
      };
      expect(warning.severity).toBe('LOW');
    });
  });

  describe('Emoji', () => {
    it('should create valid Emoji object with all required properties', () => {
      const emoji: Emoji = {
        unicode: '1F480',
        slug: 'skull',
        character: '💀',
        name: 'Skull',
        shortName: 'skull',
        category: 'faces',
        unicodeVersion: '6.0',
        baseMeaning: 'A human skull, often used to represent death or danger.',
        tldr: "Usually means 'that's so funny I'm dead' or ironic disbelief, not death.",
        contextMeanings: [],
        platformNotes: [],
        generationalNotes: [],
        warnings: [],
        relatedCombos: [],
        seoTitle: '💀 Skull Emoji Meaning',
        seoDescription: 'Learn what the skull emoji really means.',
      };
      expect(emoji.slug).toBe('skull');
      expect(emoji.character).toBe('💀');
    });

    it('should allow optional subcategory', () => {
      const emoji: Emoji = {
        unicode: '1F480',
        slug: 'skull',
        character: '💀',
        name: 'Skull',
        shortName: 'skull',
        category: 'faces',
        subcategory: 'face-negative',
        unicodeVersion: '6.0',
        baseMeaning: 'A human skull.',
        tldr: 'Means laughing.',
        contextMeanings: [],
        platformNotes: [],
        generationalNotes: [],
        warnings: [],
        relatedCombos: [],
        seoTitle: 'Skull Emoji',
        seoDescription: 'Skull emoji meaning.',
      };
      expect(emoji.subcategory).toBe('face-negative');
    });
  });

  describe('EmojiSummary', () => {
    it('should create valid EmojiSummary object', () => {
      const summary: EmojiSummary = {
        slug: 'skull',
        character: '💀',
        name: 'Skull',
        category: 'faces',
        tldr: "Usually means 'I'm dead' from laughing.",
      };
      expect(summary.slug).toBe('skull');
    });
  });

  describe('EmojiSearchResult', () => {
    it('should create valid EmojiSearchResult with score and matched field', () => {
      const result: EmojiSearchResult = {
        slug: 'skull',
        character: '💀',
        name: 'Skull',
        category: 'faces',
        tldr: "Usually means 'I'm dead' from laughing.",
        score: 0.95,
        matchedField: 'name',
      };
      expect(result.score).toBe(0.95);
      expect(result.matchedField).toBe('name');
    });

    it('should allow optional matchHighlight', () => {
      const result: EmojiSearchResult = {
        slug: 'skull',
        character: '💀',
        name: 'Skull',
        category: 'faces',
        tldr: "Usually means 'I'm dead' from laughing.",
        score: 0.95,
        matchedField: 'name',
        matchHighlight: '<mark>Skull</mark>',
      };
      expect(result.matchHighlight).toBe('<mark>Skull</mark>');
    });
  });

  describe('EmojiCollection', () => {
    it('should create valid EmojiCollection object', () => {
      const collection: EmojiCollection = {
        name: 'Popular Faces',
        description: 'Most commonly used face emojis',
        emojis: [
          {
            slug: 'skull',
            character: '💀',
            name: 'Skull',
            category: 'faces',
            tldr: 'Laughing so hard',
          },
        ],
        total: 1,
      };
      expect(collection.name).toBe('Popular Faces');
      expect(collection.total).toBe(1);
    });
  });

  describe('EmojiCategoryWithEmojis', () => {
    it('should create valid EmojiCategoryWithEmojis object', () => {
      const category: EmojiCategoryWithEmojis = {
        slug: 'faces',
        displayName: 'Smileys & Faces',
        description: 'Emoji faces for expressing emotions',
        subcategories: ['face-positive', 'face-negative'],
        emojiCount: 150,
        featuredEmojis: [
          {
            slug: 'skull',
            character: '💀',
            name: 'Skull',
            category: 'faces',
            tldr: 'Laughing so hard',
          },
        ],
      };
      expect(category.slug).toBe('faces');
      expect(category.emojiCount).toBe(150);
    });
  });

  describe('EmojiValidationResult', () => {
    it('should create valid EmojiValidationResult object', () => {
      const validResult: EmojiValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };
      expect(validResult.valid).toBe(true);
    });

    it('should allow errors and warnings arrays', () => {
      const invalidResult: EmojiValidationResult = {
        valid: false,
        errors: ['Missing required field: name'],
        warnings: ['Category might be incorrect'],
      };
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toHaveLength(1);
      expect(invalidResult.warnings).toHaveLength(1);
    });
  });

  describe('EmojiDraft', () => {
    it('should require minimal fields for draft', () => {
      const draft: EmojiDraft = {
        character: '🔥',
        slug: 'fire',
        name: 'Fire',
      };
      expect(draft.character).toBe('🔥');
      expect(draft.slug).toBe('fire');
      expect(draft.name).toBe('Fire');
    });

    it('should allow partial additional fields', () => {
      const draft: EmojiDraft = {
        character: '🔥',
        slug: 'fire',
        name: 'Fire',
        category: 'symbols',
        tldr: 'Something is hot or trending',
      };
      expect(draft.category).toBe('symbols');
    });
  });
});
