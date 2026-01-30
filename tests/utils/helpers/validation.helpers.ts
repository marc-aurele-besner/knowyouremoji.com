/**
 * Validation test helpers
 *
 * Utilities for validating test data matches expected shapes.
 */

import type {
  Emoji,
  EmojiSummary,
  InterpretRequest,
  InterpretationResult,
} from '../../../src/types/emoji';
import type { EmojiCombo, EmojiComboSummary } from '../../../src/types/combo';

/**
 * Check if an object is a valid Emoji
 */
export function isValidEmoji(obj: unknown): obj is Emoji {
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  const emoji = obj as Record<string, unknown>;

  // Check required string fields
  const requiredStringFields = [
    'unicode',
    'slug',
    'character',
    'name',
    'shortName',
    'category',
    'unicodeVersion',
    'baseMeaning',
    'tldr',
    'seoTitle',
    'seoDescription',
  ];

  for (const field of requiredStringFields) {
    if (typeof emoji[field] !== 'string') {
      return false;
    }
  }

  // Check required array fields
  const requiredArrayFields = [
    'contextMeanings',
    'platformNotes',
    'generationalNotes',
    'warnings',
    'relatedCombos',
  ];

  for (const field of requiredArrayFields) {
    if (!Array.isArray(emoji[field])) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an object is a valid EmojiSummary
 */
export function isValidEmojiSummary(obj: unknown): obj is EmojiSummary {
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  const summary = obj as Record<string, unknown>;

  const requiredFields = ['slug', 'character', 'name', 'category', 'tldr'];

  for (const field of requiredFields) {
    if (typeof summary[field] !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Check if an object is a valid EmojiCombo
 */
export function isValidEmojiCombo(obj: unknown): obj is EmojiCombo {
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  const combo = obj as Record<string, unknown>;

  // Check required string fields
  const requiredStringFields = [
    'slug',
    'combo',
    'name',
    'description',
    'meaning',
    'category',
    'seoTitle',
    'seoDescription',
  ];

  for (const field of requiredStringFields) {
    if (typeof combo[field] !== 'string') {
      return false;
    }
  }

  // Check required array fields
  if (!Array.isArray(combo.emojis) || !Array.isArray(combo.examples)) {
    return false;
  }

  return true;
}

/**
 * Check if an object is a valid EmojiComboSummary
 */
export function isValidEmojiComboSummary(obj: unknown): obj is EmojiComboSummary {
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  const summary = obj as Record<string, unknown>;

  const requiredFields = ['slug', 'combo', 'name', 'meaning', 'category'];

  for (const field of requiredFields) {
    if (typeof summary[field] !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Check if an object is a valid InterpretRequest
 */
export function isValidInterpretRequest(obj: unknown): obj is InterpretRequest {
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  const request = obj as Record<string, unknown>;

  // Check required fields
  if (typeof request.message !== 'string') return false;
  if (typeof request.platform !== 'string') return false;
  if (typeof request.context !== 'string') return false;

  // Check message length (10-1000 chars)
  if (request.message.length < 10 || request.message.length > 1000) {
    return false;
  }

  return true;
}

/**
 * Check if an object is a valid InterpretationResult
 */
export function isValidInterpretationResult(obj: unknown): obj is InterpretationResult {
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  const result = obj as Record<string, unknown>;

  // Check required string fields
  const requiredStringFields = ['id', 'message', 'interpretation', 'timestamp'];

  for (const field of requiredStringFields) {
    if (typeof result[field] !== 'string') {
      return false;
    }
  }

  // Check required array fields
  if (!Array.isArray(result.emojis) || !Array.isArray(result.redFlags)) {
    return false;
  }

  // Check metrics object
  if (typeof result.metrics !== 'object' || result.metrics === null) {
    return false;
  }

  return true;
}

/**
 * Assert that an object is a valid Emoji, throwing if not
 */
export function assertValidEmoji(obj: unknown): asserts obj is Emoji {
  if (!isValidEmoji(obj)) {
    throw new Error('Invalid Emoji: object does not match Emoji shape');
  }
}

/**
 * Assert that an object is a valid EmojiSummary, throwing if not
 */
export function assertValidEmojiSummary(obj: unknown): asserts obj is EmojiSummary {
  if (!isValidEmojiSummary(obj)) {
    throw new Error('Invalid EmojiSummary: object does not match EmojiSummary shape');
  }
}

/**
 * Assert that an object is a valid EmojiCombo, throwing if not
 */
export function assertValidEmojiCombo(obj: unknown): asserts obj is EmojiCombo {
  if (!isValidEmojiCombo(obj)) {
    throw new Error('Invalid EmojiCombo: object does not match EmojiCombo shape');
  }
}

/**
 * Assert that an object is a valid InterpretRequest, throwing if not
 */
export function assertValidInterpretRequest(obj: unknown): asserts obj is InterpretRequest {
  if (!isValidInterpretRequest(obj)) {
    throw new Error('Invalid InterpretRequest: object does not match InterpretRequest shape');
  }
}

/**
 * Assert that an object is a valid InterpretationResult, throwing if not
 */
export function assertValidInterpretationResult(obj: unknown): asserts obj is InterpretationResult {
  if (!isValidInterpretationResult(obj)) {
    throw new Error(
      'Invalid InterpretationResult: object does not match InterpretationResult shape'
    );
  }
}
