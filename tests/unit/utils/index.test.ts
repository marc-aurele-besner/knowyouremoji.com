import { describe, it, expect } from 'bun:test';
import * as TestUtils from '../../utils';

describe('test utils index', () => {
  describe('exports', () => {
    it('should export emoji factory functions', () => {
      expect(typeof TestUtils.createEmoji).toBe('function');
      expect(typeof TestUtils.createEmojiSummary).toBe('function');
      expect(typeof TestUtils.createContextMeaning).toBe('function');
      expect(typeof TestUtils.createPlatformNote).toBe('function');
      expect(typeof TestUtils.createGenerationalNote).toBe('function');
      expect(typeof TestUtils.createEmojiWarning).toBe('function');
      expect(typeof TestUtils.createMultipleEmojis).toBe('function');
      expect(typeof TestUtils.createMultipleEmojiSummaries).toBe('function');
    });

    it('should export combo factory functions', () => {
      expect(typeof TestUtils.createEmojiCombo).toBe('function');
      expect(typeof TestUtils.createEmojiComboSummary).toBe('function');
      expect(typeof TestUtils.createMultipleCombos).toBe('function');
      expect(typeof TestUtils.createMultipleComboSummaries).toBe('function');
    });

    it('should export interpreter factory functions', () => {
      expect(typeof TestUtils.createInterpretRequest).toBe('function');
      expect(typeof TestUtils.createInterpretationResult).toBe('function');
      expect(typeof TestUtils.createDetectedEmoji).toBe('function');
      expect(typeof TestUtils.createInterpretationMetrics).toBe('function');
      expect(typeof TestUtils.createRedFlag).toBe('function');
      expect(typeof TestUtils.createMultipleDetectedEmojis).toBe('function');
      expect(typeof TestUtils.createMultipleRedFlags).toBe('function');
    });

    it('should export request helper functions', () => {
      expect(typeof TestUtils.createNextRequest).toBe('function');
      expect(typeof TestUtils.parseResponse).toBe('function');
      expect(typeof TestUtils.createHeaders).toBe('function');
    });

    it('should export validation helper functions', () => {
      expect(typeof TestUtils.isValidEmoji).toBe('function');
      expect(typeof TestUtils.isValidEmojiSummary).toBe('function');
      expect(typeof TestUtils.isValidEmojiCombo).toBe('function');
      expect(typeof TestUtils.isValidEmojiComboSummary).toBe('function');
      expect(typeof TestUtils.isValidInterpretRequest).toBe('function');
      expect(typeof TestUtils.isValidInterpretationResult).toBe('function');
      expect(typeof TestUtils.assertValidEmoji).toBe('function');
      expect(typeof TestUtils.assertValidEmojiSummary).toBe('function');
      expect(typeof TestUtils.assertValidEmojiCombo).toBe('function');
      expect(typeof TestUtils.assertValidInterpretRequest).toBe('function');
      expect(typeof TestUtils.assertValidInterpretationResult).toBe('function');
    });

    it('should export emoji fixtures', () => {
      expect(TestUtils.SKULL_EMOJI).toBeDefined();
      expect(TestUtils.FIRE_EMOJI).toBeDefined();
      expect(TestUtils.HEART_EMOJI).toBeDefined();
      expect(TestUtils.ALL_EMOJI_FIXTURES).toBeDefined();
      expect(TestUtils.EMOJI_SUMMARIES).toBeDefined();
      expect(typeof TestUtils.getRandomEmojiFixture).toBe('function');
      expect(typeof TestUtils.getEmojiFixtureBySlug).toBe('function');
    });

    it('should export combo fixtures', () => {
      expect(TestUtils.SKULL_LAUGHING_COMBO).toBeDefined();
      expect(TestUtils.FIRE_HUNDRED_COMBO).toBeDefined();
      expect(TestUtils.ALL_COMBO_FIXTURES).toBeDefined();
      expect(TestUtils.COMBO_SUMMARIES).toBeDefined();
      expect(typeof TestUtils.getRandomComboFixture).toBe('function');
      expect(typeof TestUtils.getComboFixtureBySlug).toBe('function');
    });

    it('should export message fixtures', () => {
      expect(TestUtils.VALID_INTERPRET_REQUESTS).toBeDefined();
      expect(TestUtils.INVALID_INTERPRET_REQUESTS).toBeDefined();
      expect(TestUtils.EDGE_CASE_MESSAGES).toBeDefined();
      expect(TestUtils.MESSAGES_BY_PLATFORM).toBeDefined();
      expect(TestUtils.MESSAGES_BY_CONTEXT).toBeDefined();
      expect(typeof TestUtils.getRandomValidRequest).toBe('function');
      expect(typeof TestUtils.getRandomInvalidRequest).toBe('function');
    });
  });

  describe('integration', () => {
    it('should create and validate an emoji', () => {
      const emoji = TestUtils.createEmoji({ slug: 'test-emoji' });
      expect(TestUtils.isValidEmoji(emoji)).toBe(true);
      TestUtils.assertValidEmoji(emoji);
    });

    it('should create and validate a combo', () => {
      const combo = TestUtils.createEmojiCombo({ slug: 'test-combo' });
      expect(TestUtils.isValidEmojiCombo(combo)).toBe(true);
      TestUtils.assertValidEmojiCombo(combo);
    });

    it('should create and validate an interpret request', () => {
      const request = TestUtils.createInterpretRequest();
      expect(TestUtils.isValidInterpretRequest(request)).toBe(true);
      TestUtils.assertValidInterpretRequest(request);
    });

    it('should create and validate an interpretation result', () => {
      const result = TestUtils.createInterpretationResult();
      expect(TestUtils.isValidInterpretationResult(result)).toBe(true);
      TestUtils.assertValidInterpretationResult(result);
    });

    it('should work with fixtures and validation', () => {
      expect(TestUtils.isValidEmoji(TestUtils.SKULL_EMOJI)).toBe(true);
      expect(TestUtils.isValidEmojiCombo(TestUtils.SKULL_LAUGHING_COMBO)).toBe(true);
    });
  });
});
