/**
 * Test utilities module
 *
 * Provides mock factories, test helpers, and fixtures for writing tests.
 *
 * Usage:
 * ```typescript
 * import { createEmoji, isValidEmoji, SKULL_EMOJI } from '../utils';
 * ```
 */

// Mock factories
export {
  createEmoji,
  createEmojiSummary,
  createContextMeaning,
  createPlatformNote,
  createGenerationalNote,
  createEmojiWarning,
  createMultipleEmojis,
  createMultipleEmojiSummaries,
  createEmojiCombo,
  createEmojiComboSummary,
  createMultipleCombos,
  createMultipleComboSummaries,
  createInterpretRequest,
  createInterpretationResult,
  createDetectedEmoji,
  createInterpretationMetrics,
  createRedFlag,
  createMultipleDetectedEmojis,
  createMultipleRedFlags,
} from './factories';

// Test helpers
export {
  createNextRequest,
  parseResponse,
  createHeaders,
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
} from './helpers';

// Fixtures
export {
  SKULL_EMOJI,
  FIRE_EMOJI,
  HEART_EMOJI,
  THUMBS_UP_EMOJI,
  FACE_WITH_TEARS_EMOJI,
  MINIMAL_EMOJI,
  FULL_EMOJI,
  SKIN_TONE_BASE_EMOJI,
  SKIN_TONE_VARIATION_EMOJI,
  ALL_EMOJI_FIXTURES,
  EMOJI_SUMMARIES,
  getRandomEmojiFixture,
  getEmojiFixtureBySlug,
  SKULL_LAUGHING_COMBO,
  FIRE_HUNDRED_COMBO,
  HEART_EYES_COMBO,
  MINIMAL_COMBO,
  FULL_COMBO,
  ALL_COMBO_FIXTURES,
  COMBO_SUMMARIES,
  getRandomComboFixture,
  getComboFixtureBySlug,
  VALID_INTERPRET_REQUESTS,
  INVALID_INTERPRET_REQUESTS,
  EDGE_CASE_MESSAGES,
  MESSAGES_WITH_MULTIPLE_EMOJIS,
  MESSAGES_BY_PLATFORM,
  MESSAGES_BY_CONTEXT,
  getRandomValidRequest,
  getRandomInvalidRequest,
} from './fixtures';
