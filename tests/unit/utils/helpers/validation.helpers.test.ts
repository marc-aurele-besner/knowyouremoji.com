import { describe, it, expect } from 'bun:test';
import {
  isValidEmoji,
  isValidEmojiSummary,
  isValidEmojiCombo,
  isValidEmojiComboSummary,
  isValidInterpretRequest,
  isValidInterpretationResult,
  assertValidEmoji,
  assertValidEmojiSummary,
  assertValidEmojiCombo,
  assertValidInterpretRequest,
  assertValidInterpretationResult,
} from '../../../utils/helpers/validation.helpers';
import { createEmoji, createEmojiSummary } from '../../../utils/factories/emoji.factory';
import { createEmojiCombo, createEmojiComboSummary } from '../../../utils/factories/combo.factory';
import {
  createInterpretRequest,
  createInterpretationResult,
} from '../../../utils/factories/interpreter.factory';

describe('validation.helpers', () => {
  describe('isValidEmoji', () => {
    it('should return true for valid Emoji', () => {
      const emoji = createEmoji();
      expect(isValidEmoji(emoji)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidEmoji(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidEmoji(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isValidEmoji('string')).toBe(false);
      expect(isValidEmoji(123)).toBe(false);
      expect(isValidEmoji([])).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidEmoji({ slug: 'test' })).toBe(false);
      expect(isValidEmoji({ character: '😀' })).toBe(false);
      expect(isValidEmoji({ name: 'test', slug: 'test' })).toBe(false);
    });

    it('should return false for invalid field types', () => {
      const emoji = createEmoji();
      expect(isValidEmoji({ ...emoji, contextMeanings: 'not-array' })).toBe(false);
      expect(isValidEmoji({ ...emoji, warnings: 'not-array' })).toBe(false);
    });
  });

  describe('isValidEmojiSummary', () => {
    it('should return true for valid EmojiSummary', () => {
      const summary = createEmojiSummary();
      expect(isValidEmojiSummary(summary)).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(isValidEmojiSummary(null)).toBe(false);
      expect(isValidEmojiSummary(undefined)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidEmojiSummary({ slug: 'test' })).toBe(false);
      expect(isValidEmojiSummary({ slug: 'test', character: '😀' })).toBe(false);
    });
  });

  describe('isValidEmojiCombo', () => {
    it('should return true for valid EmojiCombo', () => {
      const combo = createEmojiCombo();
      expect(isValidEmojiCombo(combo)).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(isValidEmojiCombo(null)).toBe(false);
      expect(isValidEmojiCombo(undefined)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidEmojiCombo({ slug: 'test' })).toBe(false);
      expect(isValidEmojiCombo({ slug: 'test', combo: '😀😀' })).toBe(false);
    });

    it('should return false for invalid field types', () => {
      const combo = createEmojiCombo();
      expect(isValidEmojiCombo({ ...combo, emojis: 'not-array' })).toBe(false);
      expect(isValidEmojiCombo({ ...combo, examples: 'not-array' })).toBe(false);
    });
  });

  describe('isValidEmojiComboSummary', () => {
    it('should return true for valid EmojiComboSummary', () => {
      const summary = createEmojiComboSummary();
      expect(isValidEmojiComboSummary(summary)).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(isValidEmojiComboSummary(null)).toBe(false);
      expect(isValidEmojiComboSummary(undefined)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidEmojiComboSummary({ slug: 'test' })).toBe(false);
    });
  });

  describe('isValidInterpretRequest', () => {
    it('should return true for valid InterpretRequest', () => {
      const request = createInterpretRequest();
      expect(isValidInterpretRequest(request)).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(isValidInterpretRequest(null)).toBe(false);
      expect(isValidInterpretRequest(undefined)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidInterpretRequest({ message: 'test 😀' })).toBe(false);
      expect(isValidInterpretRequest({ message: 'test 😀', platform: 'SLACK' })).toBe(false);
    });

    it('should return false for invalid message length', () => {
      expect(
        isValidInterpretRequest({ message: 'short 😀', platform: 'SLACK', context: 'FRIEND' })
      ).toBe(false);
    });
  });

  describe('isValidInterpretationResult', () => {
    it('should return true for valid InterpretationResult', () => {
      const result = createInterpretationResult();
      expect(isValidInterpretationResult(result)).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(isValidInterpretationResult(null)).toBe(false);
      expect(isValidInterpretationResult(undefined)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidInterpretationResult({ id: 'test' })).toBe(false);
      expect(isValidInterpretationResult({ id: 'test', message: 'test' })).toBe(false);
    });

    it('should return false for invalid field types', () => {
      const result = createInterpretationResult();
      expect(isValidInterpretationResult({ ...result, emojis: 'not-array' })).toBe(false);
      expect(isValidInterpretationResult({ ...result, redFlags: 'not-array' })).toBe(false);
    });
  });

  describe('assertValidEmoji', () => {
    it('should not throw for valid Emoji', () => {
      const emoji = createEmoji();
      expect(() => assertValidEmoji(emoji)).not.toThrow();
    });

    it('should throw for invalid Emoji', () => {
      expect(() => assertValidEmoji(null)).toThrow();
      expect(() => assertValidEmoji({ slug: 'test' })).toThrow();
    });

    it('should include helpful error message', () => {
      expect(() => assertValidEmoji(null)).toThrow('Invalid Emoji');
    });
  });

  describe('assertValidEmojiSummary', () => {
    it('should not throw for valid EmojiSummary', () => {
      const summary = createEmojiSummary();
      expect(() => assertValidEmojiSummary(summary)).not.toThrow();
    });

    it('should throw for invalid EmojiSummary', () => {
      expect(() => assertValidEmojiSummary(null)).toThrow();
      expect(() => assertValidEmojiSummary({ slug: 'test' })).toThrow();
    });
  });

  describe('assertValidEmojiCombo', () => {
    it('should not throw for valid EmojiCombo', () => {
      const combo = createEmojiCombo();
      expect(() => assertValidEmojiCombo(combo)).not.toThrow();
    });

    it('should throw for invalid EmojiCombo', () => {
      expect(() => assertValidEmojiCombo(null)).toThrow();
      expect(() => assertValidEmojiCombo({ slug: 'test' })).toThrow();
    });
  });

  describe('assertValidInterpretRequest', () => {
    it('should not throw for valid InterpretRequest', () => {
      const request = createInterpretRequest();
      expect(() => assertValidInterpretRequest(request)).not.toThrow();
    });

    it('should throw for invalid InterpretRequest', () => {
      expect(() => assertValidInterpretRequest(null)).toThrow();
      expect(() => assertValidInterpretRequest({ message: 'short' })).toThrow();
    });
  });

  describe('assertValidInterpretationResult', () => {
    it('should not throw for valid InterpretationResult', () => {
      const result = createInterpretationResult();
      expect(() => assertValidInterpretationResult(result)).not.toThrow();
    });

    it('should throw for invalid InterpretationResult', () => {
      expect(() => assertValidInterpretationResult(null)).toThrow();
      expect(() => assertValidInterpretationResult({ id: 'test' })).toThrow();
    });
  });
});
