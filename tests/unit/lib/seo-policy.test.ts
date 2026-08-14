import { describe, expect, test } from 'bun:test';
import {
  decisionToRobots,
  getIndexingDecision,
  getComboIndexingDecision,
  resolveComboContentTier,
  resolveContentTier,
} from '../../../src/lib/seo-policy';
import { createEmoji } from '../../utils/factories/emoji.factory';
import { createContextMeaning } from '../../utils/factories/emoji.factory';
import { createEmojiCombo } from '../../utils/factories/combo.factory';

describe('seo-policy', () => {
  describe('resolveContentTier', () => {
    test('returns explicit contentTier when set', () => {
      expect(resolveContentTier(createEmoji({ contentTier: 'deep' }))).toBe('deep');
      expect(resolveContentTier(createEmoji({ contentTier: 'standard' }))).toBe('standard');
      expect(resolveContentTier(createEmoji({ contentTier: 'thin' }))).toBe('thin');
    });

    test('treats skin-tone variants as thin', () => {
      const variant = createEmoji({
        skinToneBase: 'wave',
        skinToneModifier: 'medium-dark',
        contextMeanings: [createContextMeaning()],
      });
      expect(resolveContentTier(variant)).toBe('thin');
    });

    test('treats stub JSON as thin', () => {
      // All arrays empty, no longForm, no conversationExamples → stub
      const stub = createEmoji();
      expect(resolveContentTier(stub)).toBe('thin');
    });

    test('promotes page with context meanings to standard', () => {
      const standard = createEmoji({
        contextMeanings: [createContextMeaning()],
      });
      expect(resolveContentTier(standard)).toBe('standard');
    });

    test('promotes page with long-form content to standard', () => {
      const standard = createEmoji({
        longForm: { overview: 'A long overview paragraph...' },
      });
      expect(resolveContentTier(standard)).toBe('standard');
    });

    test('promotes page with conversation examples to standard', () => {
      const standard = createEmoji({
        conversationExamples: [
          {
            setting: 'friends',
            message: 'lol 💀',
            interpretation: 'reacting to a joke',
          },
        ],
      });
      expect(resolveContentTier(standard)).toBe('standard');
    });

    test('promotes page with platform notes to standard', () => {
      const standard = createEmoji({
        platformNotes: [{ platform: 'TIKTOK', note: 'Common in comment sections' }],
      });
      expect(resolveContentTier(standard)).toBe('standard');
    });
  });

  describe('getIndexingDecision', () => {
    test('skin-tone variant → noindex + canonical to base', () => {
      const variant = createEmoji({
        slug: 'wave-medium-dark',
        skinToneBase: 'wave',
        skinToneModifier: 'medium-dark',
      });
      const decision = getIndexingDecision(
        variant,
        'https://knowyouremoji.com/emoji/wave-medium-dark',
        'https://knowyouremoji.com/emoji/wave'
      );

      expect(decision.index).toBe(false);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe('https://knowyouremoji.com/emoji/wave');
      expect(decision.reason).toContain('skin-tone');
    });

    test('thin stub → noindex, follow, self canonical', () => {
      const stub = createEmoji();
      const url = 'https://knowyouremoji.com/emoji/test-stub';
      const decision = getIndexingDecision(stub, url);

      expect(decision.index).toBe(false);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe(url);
      expect(decision.reason).toContain('thin');
    });

    test('standard page → index, follow, self canonical', () => {
      const standard = createEmoji({
        contextMeanings: [createContextMeaning()],
      });
      const url = 'https://knowyouremoji.com/emoji/standard';
      const decision = getIndexingDecision(standard, url);

      expect(decision.index).toBe(true);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe(url);
    });

    test('deep page → index, follow, self canonical', () => {
      const deep = createEmoji({ contentTier: 'deep' });
      const url = 'https://knowyouremoji.com/emoji/deep';
      const decision = getIndexingDecision(deep, url);

      expect(decision.index).toBe(true);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe(url);
      expect(decision.reason).toContain('deep');
    });

    test('skin-tone variant with no base URL falls back to noindex + self', () => {
      const variant = createEmoji({
        slug: 'wave-medium-dark',
        skinToneBase: 'wave',
      });
      const url = 'https://knowyouremoji.com/emoji/wave-medium-dark';
      const decision = getIndexingDecision(variant, url);

      expect(decision.index).toBe(false);
      expect(decision.follow).toBe(true);
      // Falls back to self canonical when base URL missing
      expect(decision.canonical).toBe(url);
    });
  });

  describe('decisionToRobots', () => {
    test('preserves index/follow in Next.js robots shape', () => {
      const decision = getIndexingDecision(
        createEmoji({ contentTier: 'standard' }),
        'https://x.test/y'
      );
      const robots = decisionToRobots(decision);

      expect(robots.index).toBe(true);
      expect(robots.follow).toBe(true);
      expect(robots.googleBot?.index).toBe(true);
      expect(robots.googleBot?.follow).toBe(true);
      expect(robots.googleBot?.['max-video-preview']).toBe(-1);
      expect(robots.googleBot?.['max-image-preview']).toBe('large');
      expect(robots.googleBot?.['max-snippet']).toBe(-1);
    });

    test('propagates noindex through googleBot override', () => {
      const decision = getIndexingDecision(createEmoji(), 'https://x.test/y');
      const robots = decisionToRobots(decision);

      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
      expect(robots.googleBot?.index).toBe(false);
      expect(robots.googleBot?.follow).toBe(true);
    });
  });

  describe('resolveComboContentTier', () => {
    test('returns explicit contentTier when set', () => {
      expect(resolveComboContentTier(createEmojiCombo({ contentTier: 'deep' }))).toBe('deep');
      expect(resolveComboContentTier(createEmojiCombo({ contentTier: 'standard' }))).toBe(
        'standard'
      );
      expect(resolveComboContentTier(createEmojiCombo({ contentTier: 'thin' }))).toBe('thin');
    });

    test('promotes combo with longForm to deep', () => {
      const combo = createEmojiCombo({
        longForm: { overview: 'A two-paragraph overview of how this combo is used.' },
      });
      expect(resolveComboContentTier(combo)).toBe('deep');
    });

    test('promotes combo with conversation examples to standard', () => {
      const combo = createEmojiCombo({
        conversationExamples: [
          {
            setting: 'friends',
            message: 'lol 💀😂',
            interpretation: 'reacting to a joke',
          },
        ],
      });
      expect(resolveComboContentTier(combo)).toBe('standard');
    });

    test('treats bare-bones combo as thin', () => {
      expect(resolveComboContentTier(createEmojiCombo())).toBe('thin');
    });
  });

  describe('getComboIndexingDecision', () => {
    test('thin combo → noindex, follow, self canonical', () => {
      const combo = createEmojiCombo({ contentTier: 'thin' });
      const url = 'https://knowyouremoji.com/combo/thin-combo';
      const decision = getComboIndexingDecision(combo, url);

      expect(decision.index).toBe(false);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe(url);
      expect(decision.reason).toContain('thin');
    });

    test('standard combo → index, follow, self canonical', () => {
      const combo = createEmojiCombo({ contentTier: 'standard' });
      const url = 'https://knowyouremoji.com/combo/standard-combo';
      const decision = getComboIndexingDecision(combo, url);

      expect(decision.index).toBe(true);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe(url);
    });

    test('deep combo → index, follow, self canonical', () => {
      const combo = createEmojiCombo({ contentTier: 'deep' });
      const url = 'https://knowyouremoji.com/combo/deep-combo';
      const decision = getComboIndexingDecision(combo, url);

      expect(decision.index).toBe(true);
      expect(decision.follow).toBe(true);
      expect(decision.canonical).toBe(url);
      expect(decision.reason).toContain('deep');
    });

    test('bare-bones combo (no contentTier) → noindex by default', () => {
      const combo = createEmojiCombo();
      const url = 'https://knowyouremoji.com/combo/bare-combo';
      const decision = getComboIndexingDecision(combo, url);

      expect(decision.index).toBe(false);
      expect(decision.follow).toBe(true);
    });
  });
});
