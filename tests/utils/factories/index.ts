/**
 * Test factories - re-exports all mock factory functions
 */

export {
  createEmoji,
  createEmojiSummary,
  createContextMeaning,
  createPlatformNote,
  createGenerationalNote,
  createEmojiWarning,
  createMultipleEmojis,
  createMultipleEmojiSummaries,
} from './emoji.factory';

export {
  createEmojiCombo,
  createEmojiComboSummary,
  createMultipleCombos,
  createMultipleComboSummaries,
} from './combo.factory';

export {
  createInterpretRequest,
  createInterpretationResult,
  createDetectedEmoji,
  createInterpretationMetrics,
  createRedFlag,
  createMultipleDetectedEmojis,
  createMultipleRedFlags,
} from './interpreter.factory';
