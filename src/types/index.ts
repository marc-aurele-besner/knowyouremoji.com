/**
 * Type exports for KnowYourEmoji
 */

export type {
  // Basic types
  EmojiCodepoint,
  EmojiSlug,
  EmojiCategoryName,
  EmojiCategoryDisplayName,
  UnicodeVersion,
  // Context types
  ContextType,
  RiskLevel,
  Platform,
  Generation,
  WarningSeverity,
  RelationshipContext,
  // Interface types
  ContextMeaning,
  PlatformNote,
  GenerationalNote,
  EmojiWarning,
  Emoji,
  EmojiSummary,
  // Collection types
  EmojiSearchResult,
  EmojiCollection,
  EmojiCategoryWithEmojis,
  // Utility types
  EmojiValidationResult,
  EmojiDraft,
  // Interpreter types
  InterpretRequest,
  DetectedEmoji,
  InterpretationMetrics,
  RedFlag,
  InterpretationResult,
  InterpretErrorResponse,
  // Response tone suggestion types (Phase 2)
  ResponseToneType,
  ResponseToneTypeInfo,
  SuggestedResponseTone,
  ToneSuggestionRating,
  InterpretationResultWithTones,
} from './emoji';

export type {
  // Basic types
  EmojiComboSlug,
  EmojiComboCategoryName,
  // Interface types
  EmojiCombo,
  EmojiComboSummary,
  // Collection types
  EmojiComboSearchResult,
  EmojiComboCollection,
  // Utility types
  EmojiComboValidationResult,
  EmojiComboDraft,
} from './combo';
