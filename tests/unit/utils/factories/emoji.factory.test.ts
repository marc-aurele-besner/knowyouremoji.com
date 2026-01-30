import { describe, it, expect } from 'bun:test';
import {
  createEmoji,
  createEmojiSummary,
  createContextMeaning,
  createPlatformNote,
  createGenerationalNote,
  createEmojiWarning,
  createMultipleEmojis,
  createMultipleEmojiSummaries,
} from '../../../utils/factories/emoji.factory';
import type {
  ContextType,
  RiskLevel,
  Platform,
  Generation,
  WarningSeverity,
} from '../../../../src/types/emoji';

describe('emoji.factory', () => {
  describe('createEmoji', () => {
    it('should create a valid Emoji with default values', () => {
      const emoji = createEmoji();

      expect(emoji.unicode).toBeDefined();
      expect(emoji.slug).toBeDefined();
      expect(emoji.character).toBeDefined();
      expect(emoji.name).toBeDefined();
      expect(emoji.shortName).toBeDefined();
      expect(emoji.category).toBeDefined();
      expect(emoji.unicodeVersion).toBeDefined();
      expect(emoji.baseMeaning).toBeDefined();
      expect(emoji.tldr).toBeDefined();
      expect(Array.isArray(emoji.contextMeanings)).toBe(true);
      expect(Array.isArray(emoji.platformNotes)).toBe(true);
      expect(Array.isArray(emoji.generationalNotes)).toBe(true);
      expect(Array.isArray(emoji.warnings)).toBe(true);
      expect(Array.isArray(emoji.relatedCombos)).toBe(true);
      expect(emoji.seoTitle).toBeDefined();
      expect(emoji.seoDescription).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const emoji = createEmoji({
        slug: 'custom-slug',
        character: '🎉',
        name: 'Custom Emoji',
      });

      expect(emoji.slug).toBe('custom-slug');
      expect(emoji.character).toBe('🎉');
      expect(emoji.name).toBe('Custom Emoji');
    });

    it('should allow setting optional fields', () => {
      const emoji = createEmoji({
        subcategory: 'test-subcategory',
        skinToneVariations: ['emoji-light', 'emoji-dark'],
        skinToneBase: 'base-emoji',
        skinToneModifier: 'medium',
      });

      expect(emoji.subcategory).toBe('test-subcategory');
      expect(emoji.skinToneVariations).toEqual(['emoji-light', 'emoji-dark']);
      expect(emoji.skinToneBase).toBe('base-emoji');
      expect(emoji.skinToneModifier).toBe('medium');
    });

    it('should create unique slugs for different calls', () => {
      const emoji1 = createEmoji();
      const emoji2 = createEmoji();

      expect(emoji1.slug).not.toBe(emoji2.slug);
    });
  });

  describe('createEmojiSummary', () => {
    it('should create a valid EmojiSummary with default values', () => {
      const summary = createEmojiSummary();

      expect(summary.slug).toBeDefined();
      expect(summary.character).toBeDefined();
      expect(summary.name).toBeDefined();
      expect(summary.category).toBeDefined();
      expect(summary.tldr).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const summary = createEmojiSummary({
        slug: 'fire',
        character: '🔥',
        name: 'Fire',
        category: 'symbols',
        tldr: 'Hot or impressive',
      });

      expect(summary.slug).toBe('fire');
      expect(summary.character).toBe('🔥');
      expect(summary.name).toBe('Fire');
      expect(summary.category).toBe('symbols');
      expect(summary.tldr).toBe('Hot or impressive');
    });
  });

  describe('createContextMeaning', () => {
    it('should create a valid ContextMeaning with default values', () => {
      const meaning = createContextMeaning();

      expect(meaning.context).toBeDefined();
      expect(meaning.meaning).toBeDefined();
      expect(meaning.example).toBeDefined();
      expect(meaning.riskLevel).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const meaning = createContextMeaning({
        context: 'IRONIC',
        meaning: 'Indicates sarcasm',
        riskLevel: 'HIGH',
      });

      expect(meaning.context).toBe('IRONIC');
      expect(meaning.meaning).toBe('Indicates sarcasm');
      expect(meaning.riskLevel).toBe('HIGH');
    });

    it('should accept all valid context types', () => {
      const contextTypes: ContextType[] = [
        'LITERAL',
        'SLANG',
        'IRONIC',
        'PASSIVE_AGGRESSIVE',
        'DATING',
        'WORK',
        'RED_FLAG',
      ];

      contextTypes.forEach((context) => {
        const meaning = createContextMeaning({ context });
        expect(meaning.context).toBe(context);
      });
    });

    it('should accept all valid risk levels', () => {
      const riskLevels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

      riskLevels.forEach((riskLevel) => {
        const meaning = createContextMeaning({ riskLevel });
        expect(meaning.riskLevel).toBe(riskLevel);
      });
    });
  });

  describe('createPlatformNote', () => {
    it('should create a valid PlatformNote with default values', () => {
      const note = createPlatformNote();

      expect(note.platform).toBeDefined();
      expect(note.note).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const note = createPlatformNote({
        platform: 'SLACK',
        note: 'Custom reaction in Slack',
      });

      expect(note.platform).toBe('SLACK');
      expect(note.note).toBe('Custom reaction in Slack');
    });

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

      platforms.forEach((platform) => {
        const note = createPlatformNote({ platform });
        expect(note.platform).toBe(platform);
      });
    });
  });

  describe('createGenerationalNote', () => {
    it('should create a valid GenerationalNote with default values', () => {
      const note = createGenerationalNote();

      expect(note.generation).toBeDefined();
      expect(note.note).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const note = createGenerationalNote({
        generation: 'GEN_Z',
        note: 'Gen Z uses this ironically',
      });

      expect(note.generation).toBe('GEN_Z');
      expect(note.note).toBe('Gen Z uses this ironically');
    });

    it('should accept all valid generations', () => {
      const generations: Generation[] = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];

      generations.forEach((generation) => {
        const note = createGenerationalNote({ generation });
        expect(note.generation).toBe(generation);
      });
    });
  });

  describe('createEmojiWarning', () => {
    it('should create a valid EmojiWarning with default values', () => {
      const warning = createEmojiWarning();

      expect(warning.title).toBeDefined();
      expect(warning.description).toBeDefined();
      expect(warning.severity).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const warning = createEmojiWarning({
        title: 'Context Sensitive',
        description: 'Meaning varies greatly by context',
        severity: 'HIGH',
      });

      expect(warning.title).toBe('Context Sensitive');
      expect(warning.description).toBe('Meaning varies greatly by context');
      expect(warning.severity).toBe('HIGH');
    });

    it('should accept all valid severity levels', () => {
      const severities: WarningSeverity[] = ['LOW', 'MEDIUM', 'HIGH'];

      severities.forEach((severity) => {
        const warning = createEmojiWarning({ severity });
        expect(warning.severity).toBe(severity);
      });
    });
  });

  describe('createMultipleEmojis', () => {
    it('should create the specified number of emojis', () => {
      const emojis = createMultipleEmojis(5);

      expect(emojis).toHaveLength(5);
      emojis.forEach((emoji) => {
        expect(emoji.slug).toBeDefined();
        expect(emoji.character).toBeDefined();
      });
    });

    it('should create emojis with unique slugs', () => {
      const emojis = createMultipleEmojis(10);
      const slugs = emojis.map((e) => e.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(10);
    });

    it('should apply overrides to all emojis', () => {
      const emojis = createMultipleEmojis(3, { category: 'faces' });

      emojis.forEach((emoji) => {
        expect(emoji.category).toBe('faces');
      });
    });

    it('should return empty array for count of 0', () => {
      const emojis = createMultipleEmojis(0);

      expect(emojis).toHaveLength(0);
    });
  });

  describe('createMultipleEmojiSummaries', () => {
    it('should create the specified number of emoji summaries', () => {
      const summaries = createMultipleEmojiSummaries(5);

      expect(summaries).toHaveLength(5);
      summaries.forEach((summary) => {
        expect(summary.slug).toBeDefined();
        expect(summary.character).toBeDefined();
      });
    });

    it('should create summaries with unique slugs', () => {
      const summaries = createMultipleEmojiSummaries(10);
      const slugs = summaries.map((s) => s.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(10);
    });

    it('should apply overrides to all summaries', () => {
      const summaries = createMultipleEmojiSummaries(3, { category: 'animals' });

      summaries.forEach((summary) => {
        expect(summary.category).toBe('animals');
      });
    });
  });
});
